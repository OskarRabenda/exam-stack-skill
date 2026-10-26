#!/usr/bin/env node
// Build the exam stack page: merge stack.json into assets/template.html.
// Usage: node build.mjs <stack.json> [out.html]      (default out: exam-stack.html next to stack.json)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const [src, outArg] = process.argv.slice(2);
if (!src) {
  console.error("usage: node build.mjs <stack.json> [out.html]");
  process.exit(2);
}
const here = dirname(fileURLToPath(import.meta.url));
const templatePath = join(here, "..", "assets", "template.html");
const out = outArg ? resolve(outArg) : join(dirname(resolve(src)), "exam-stack.html");

const stack = JSON.parse(readFileSync(src, "utf8"));
const errors = [], warnings = [];

// A raw "<" inside \( … \) or \[ … \] gets parsed as an HTML tag by innerHTML, which silently eats the
// rest of the formula. Escape it so authors can write math naturally.
const MATH = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
let escaped = 0;
const fixMath = (s) => typeof s !== "string" ? s : s.replace(MATH, (m) => m.replace(/</g, () => (escaped++, "&lt;")));

// ---- validate ----
const course = stack.course || {};
if (!course.name && !course.code) errors.push("course.name or course.code is required");
if (course.examStart && isNaN(new Date(course.examStart).getTime())) errors.push(`course.examStart is not a valid date: ${course.examStart}`);
if (!course.studyMinutes) warnings.push("course.studyMinutes not set: no cut line will be drawn");

const tasks = Array.isArray(stack.tasks) ? stack.tasks : [];
if (!tasks.length) errors.push("tasks[] is empty");
const ids = new Set();
for (const [i, t] of tasks.entries()) {
  const where = `tasks[${i}]${t.id ? ` (${t.id})` : ""}`;
  if (!t.id) errors.push(`${where}: missing id`);
  else if (ids.has(t.id)) errors.push(`${where}: duplicate id`);
  else ids.add(t.id);
  if (!t.title) errors.push(`${where}: missing title`);
  if (t.ease && !["easy", "med", "hard"].includes(t.ease)) errors.push(`${where}: ease must be easy | med | hard`);
  if (t.min != null && !(Number.isFinite(t.min) && t.min > 0)) errors.push(`${where}: min must be a positive number`);
  if (!t.recipe || !t.recipe.length) warnings.push(`${where}: no recipe steps`);
  t.recipe = (t.recipe || []).map(fixMath);
  t.why = fixMath(t.why);
}

const exercises = stack.exercises || {};
let exCount = 0;
for (const [id, list] of Object.entries(exercises)) {
  if (!ids.has(id)) errors.push(`exercises.${id}: no task with that id`);
  if (!Array.isArray(list)) { errors.push(`exercises.${id}: must be an array`); continue; }
  for (const [i, x] of list.entries()) {
    exCount++;
    if (!x.paper) warnings.push(`exercises.${id}[${i}]: missing paper (which exam it came from)`);
    if (!x.question) errors.push(`exercises.${id}[${i}]: missing question`);
    if (!x.solution) errors.push(`exercises.${id}[${i}]: missing solution`);
    x.question = fixMath(x.question);
    x.solution = fixMath(x.solution);
  }
}
for (const t of tasks) if (!(exercises[t.id] || []).length) warnings.push(`${t.id}: no exercises`);

if (errors.length) {
  console.error("Build failed:\n  - " + errors.join("\n  - "));
  process.exit(1);
}

// ---- merge ----
// JSON inside <script>: escape "</" so a solution can never close the tag early.
const json = JSON.stringify(stack).replace(/<\//g, "<\\/");
const template = readFileSync(templatePath, "utf8");
if (!template.includes("/*__STACK__*/")) { console.error("template.html has no /*__STACK__*/ placeholder"); process.exit(1); }
writeFileSync(out, template.replace("/*__STACK__*/", () => json));

const minutes = tasks.reduce((s, t) => s + (t.min || 0), 0);
console.log(`Built ${out}`);
console.log(`  tasks: ${tasks.length}, exercises: ${exCount}, total ≈ ${Math.round(minutes / 6) / 10} h` +
  (course.studyMinutes ? `, budget ${Math.round(course.studyMinutes / 6) / 10} h` : "") +
  (escaped ? `, escaped ${escaped} "<" in math` : ""));
if (warnings.length) console.log("  warnings:\n    - " + warnings.join("\n    - "));
