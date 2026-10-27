#!/usr/bin/env node
// Build the exam stack page: validate stack.json, inline its images, and merge it into assets/template.html.
// Usage: node build.mjs <stack.json> [out.html]      (default out: exam-stack.html next to stack.json)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const [src, outArg] = process.argv.slice(2);
if (!src) {
  console.error("usage: node build.mjs <stack.json> [out.html]");
  process.exit(2);
}
const here = dirname(fileURLToPath(import.meta.url));
const templatePath = join(here, "..", "assets", "template.html");
const base = dirname(resolve(src));
const out = outArg ? resolve(outArg) : join(base, "exam-stack.html");

const stack = JSON.parse(readFileSync(src, "utf8"));
const errors = [], warnings = [];
const KINDS = ["calculation", "explain", "recall", "proof", "multiple-choice", "true-false", "mixed"];
const VERIFIED = ["official", "recomputed", "reasoned"];

// A raw "<" inside \( … \) or \[ … \] is parsed as an HTML tag by innerHTML, which silently eats the
// rest of the formula. Escape it so authors can write math naturally.
const MATH = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
let escaped = 0;
const fixMath = (s) => typeof s !== "string" ? s : s.replace(MATH, (m) => m.replace(/</g, () => (escaped++, "&lt;")));

// Inline <img src="relative/path"> as data URIs so the page stays a single file.
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp" };
let imgBytes = 0, imgCount = 0;
const inlineImages = (s, where) => typeof s !== "string" ? s : s.replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/gi, (m, a, url, z) => {
  if (/^(data:|https?:)/i.test(url)) return m;
  const file = resolve(base, url);
  const mime = MIME[extname(file).toLowerCase()];
  if (!existsSync(file)) { errors.push(`${where}: image not found: ${url}`); return m; }
  if (!mime) { errors.push(`${where}: unsupported image type: ${url}`); return m; }
  const buf = readFileSync(file);
  imgBytes += buf.length; imgCount++;
  return a + `data:${mime};base64,${buf.toString("base64")}` + z;
});
const altCheck = (s, where) => { if (typeof s === "string" && /<img\b(?![^>]*\balt="[^"]+")[^>]*>/i.test(s)) warnings.push(`${where}: <img> without a real alt text`); };
const clean = (s, where) => { altCheck(s, where); return inlineImages(fixMath(s), where); };
const count = (s, re) => (typeof s === "string" ? (s.match(re) || []).length : 0);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---- course ----
const course = stack.course || {};
if (!course.name && !course.code) errors.push("course.name or course.code is required");
if (course.examStart && isNaN(new Date(course.examStart).getTime())) errors.push(`course.examStart is not a valid date: ${course.examStart}`);
const profile = course.profile;
if (!profile) warnings.push("course.profile missing: the page won't show how the exam is graded (see references/exam-profile.md)");
const sectionNames = new Set(((profile && profile.sections) || []).map((s) => s.name));
if (profile) for (const k of ["negativeMarking", "choice", "passRule"]) if (typeof profile[k] === "string") profile[k] = fixMath(profile[k]);
if (profile && Array.isArray(profile.rules)) profile.rules = profile.rules.map(fixMath);

// ---- tasks ----
const tasks = Array.isArray(stack.tasks) ? stack.tasks : [];
if (!tasks.length) errors.push("tasks[] is empty");
const ids = new Map();
for (const [i, t] of tasks.entries()) {
  const where = `tasks[${i}]${t.id ? ` (${t.id})` : ""}`;
  if (!t.id) errors.push(`${where}: missing id`);
  else if (ids.has(t.id)) errors.push(`${where}: duplicate id`);
  else ids.set(t.id, i);
  if (!t.title) errors.push(`${where}: missing title`);
  if (!t.kind) warnings.push(`${where}: no kind (calculation, explain, recall, proof, multiple-choice, true-false, mixed)`);
  else if (!KINDS.includes(t.kind)) errors.push(`${where}: kind must be one of ${KINDS.join(", ")}`);
  if (t.ease && !["easy", "med", "hard"].includes(t.ease)) errors.push(`${where}: ease must be easy | med | hard`);
  if (t.min != null && !(Number.isFinite(t.min) && t.min > 0)) errors.push(`${where}: min must be a positive number`);
  if (t.section && sectionNames.size && !sectionNames.has(t.section)) warnings.push(`${where}: section "${t.section}" is not in course.profile.sections`);
  if (!t.recipe || !t.recipe.length) warnings.push(`${where}: no recipe steps`);
  if (!t.graders || !t.graders.length) warnings.push(`${where}: no "graders" lines (what graders give points for)`);
  t.recipe = (t.recipe || []).map((s) => clean(s, `${where}.recipe`));
  t.graders = (t.graders || []).map((s) => clean(s, `${where}.graders`));
  t.why = clean(t.why, `${where}.why`);
}
for (const [i, t] of tasks.entries()) for (const dep of t.after || []) {
  if (!ids.has(dep)) errors.push(`${t.id}.after: no task ${dep}`);
  else if (ids.get(dep) > i) errors.push(`${t.id}.after: ${dep} must come before ${t.id} in the stack`);
}

// ---- exercises ----
const exercises = stack.exercises || {};
const kindOf = Object.fromEntries(tasks.map((t) => [t.id, t.kind]));
let exCount = 0, partCount = 0, noRubric = 0, reasoned = 0;
for (const [tid, list] of Object.entries(exercises)) {
  if (!ids.has(tid)) errors.push(`exercises.${tid}: no task with that id`);
  if (!Array.isArray(list)) { errors.push(`exercises.${tid}: must be an array`); continue; }
  const exIds = new Set();
  for (const [i, x] of list.entries()) {
    const where = `exercises.${tid}[${i}]`;
    exCount++;
    if (!x.paper) errors.push(`${where}: missing paper (which exam it came from)`);
    // v1 compatibility: a single question/solution becomes one part.
    if (!x.parts && (x.question || x.solution)) {
      x.parts = [{ label: "", question: x.question, solution: x.solution, verified: x.verified }];
      delete x.question; delete x.solution;
      warnings.push(`${where}: old single question/solution format; split it into parts so each answer sits under its own question`);
    }
    if (!Array.isArray(x.parts) || !x.parts.length) { errors.push(`${where}: needs parts[]`); continue; }
    x.id = x.id ? String(x.id) : slug(`${x.paper}-${x.q ?? i}`);
    if (exIds.has(x.id)) { errors.push(`${where}: duplicate exercise id ${x.id}`); }
    exIds.add(x.id);
    x.intro = clean(x.intro, `${where}.intro`);
    const labels = new Set();
    for (const [j, p] of x.parts.entries()) {
      const pw = `${where}.parts[${j}]`;
      partCount++;
      p.label = p.label == null ? "" : String(p.label);
      if (x.parts.length > 1 && !p.label) errors.push(`${pw}: label required when an exercise has several parts`);
      if (labels.has(p.label)) errors.push(`${pw}: duplicate label "${p.label}"`);
      labels.add(p.label);
      if (!p.question) errors.push(`${pw}: missing question`);
      if (!p.solution && !p.answer) errors.push(`${pw}: needs a solution or an answer`);
      if (!p.verified) warnings.push(`${pw}: no "verified" (official | recomputed | reasoned)`);
      else if (!VERIFIED.includes(p.verified)) errors.push(`${pw}: verified must be one of ${VERIFIED.join(", ")}`);
      if (p.verified === "reasoned") reasoned++;
      if (p.rubric) {
        if (!Array.isArray(p.rubric.items) || !p.rubric.items.length) errors.push(`${pw}: rubric.items must be a non-empty array`);
        else for (const [k, it] of p.rubric.items.entries()) if (!it.text || !Number.isFinite(+it.pts)) errors.push(`${pw}.rubric.items[${k}]: needs text and numeric pts`);
        if (p.rubric.source && !["official", "inferred"].includes(p.rubric.source)) errors.push(`${pw}: rubric.source must be official | inferred`);
        const sum = (p.rubric.items || []).reduce((s, it) => s + (+it.pts || 0), 0);
        if (p.pts != null && sum && Math.abs(sum - p.pts) > 1e-9) warnings.push(`${pw}: rubric adds up to ${sum}, part is worth ${p.pts}`);
        p.rubric.items = (p.rubric.items || []).map((it) => ({ ...it, text: clean(it.text, `${pw}.rubric`) }));
      } else if ((+p.pts || 0) > 1 && !(p.answer && ["true-false", "multiple-choice"].includes(kindOf[tid]))) noRubric++;
      // One part should hold one thing to answer. A long list in the question *and* the solution usually
      // means several statements (e.g. a block of True/False) were bundled, which hides every answer at the end.
      // For True/False and multiple-choice this is never right, so it fails the build.
      if (count(p.question, /<li\b/gi) >= 3 && count(p.solution || p.answer, /<li\b/gi) >= 3) {
        const msg = `${pw}: question and solution both hold a list; give each statement or sub-question its own part so its answer sits right under it`;
        (["true-false", "multiple-choice"].includes(kindOf[tid]) ? errors : warnings).push(msg);
      }
      p.question = clean(p.question, `${pw}.question`);
      p.solution = clean(p.solution, `${pw}.solution`);
      p.answer = clean(p.answer, `${pw}.answer`);
    }
  }
}
for (const t of tasks) if (!(exercises[t.id] || []).length) warnings.push(`${t.id}: no exercises`);
if (imgBytes > 8e6) warnings.push(`images add ${(imgBytes / 1e6).toFixed(1)} MB; consider compressing them`);

if (errors.length) {
  console.error("Build failed:\n  - " + errors.join("\n  - "));
  process.exit(1);
}

// ---- merge ----
// JSON inside <script>: escape "</" so content can never close the tag early.
const json = JSON.stringify(stack).replace(/<\//g, "<\\/");
const template = readFileSync(templatePath, "utf8");
if (!template.includes("/*__STACK__*/")) { console.error("template.html has no /*__STACK__*/ placeholder"); process.exit(1); }
writeFileSync(out, template.replace("/*__STACK__*/", () => json));

const minutes = tasks.reduce((s, t) => s + (t.min || 0), 0);
console.log(`Built ${out}`);
console.log(`  tasks ${tasks.length} · exercises ${exCount} · parts ${partCount} · roughly ${Math.round(minutes / 30) / 2} h of work` +
  (imgCount ? ` · ${imgCount} image(s) inlined` : "") + (escaped ? ` · escaped ${escaped} "<" in math` : ""));
if (noRubric) console.log(`  ${noRubric} part(s) worth more than 1 point have no rubric: add at least an inferred one`);
if (reasoned) console.log(`  ${reasoned} part(s) marked "reasoned": double-check those explanations`);
if (warnings.length) console.log("  warnings:\n    - " + warnings.join("\n    - "));
