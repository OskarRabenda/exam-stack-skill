#!/usr/bin/env node
// Turn the per-sub-question tally of past papers into the frequency ranking.
// The agent decides what each sub-question *is* (its task type); this script only does the counting,
// so the same tally always gives the same ranking.
//
// Usage: node tally.mjs <tally.csv|tally.json> [--minutes minutes.json] [--md out.md] [--json out.json]
//
// Tally rows (CSV with a header row, or a JSON array of objects):
//   paper       which exam, e.g. "Exam 2023" (a 4-digit year in the name is used for "last seen")
//   q           question number on the paper, e.g. "5a"
//   pts         points of this sub-question
//   task        task type id or name, e.g. "T7" or "EEA inverse"   (same skill = same task)
//   kind        calculation | explain | recall | proof | multiple-choice | true-false
//   paperTotal  (optional) the paper's total points; otherwise the sum of its rows is used
//
// minutes.json (optional): { "T7": 35, "T3": 15, … } — rough minutes to learn the task and do one exercise.
// With it, tasks are ordered by expected points per hour of study; without it, by expected points per paper.
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const src = args.find((a, i) => !a.startsWith("--") && !(args[i - 1] || "").startsWith("--"));
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
if (!src) { console.error("usage: node tally.mjs <tally.csv|tally.json> [--minutes minutes.json] [--md out.md] [--json out.json]"); process.exit(2); }

function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; continue; }
    if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); cell = ""; if (row.some((x) => x.trim() !== "")) rows.push(row); row = []; }
    else cell += c;
  }
  row.push(cell); if (row.some((x) => x.trim() !== "")) rows.push(row);
  const head = rows.shift().map((h) => h.trim());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const raw = readFileSync(src, "utf8");
const rows = src.toLowerCase().endsWith(".json") ? JSON.parse(raw) : parseCSV(raw);
const minutes = opt("--minutes") ? JSON.parse(readFileSync(opt("--minutes"), "utf8")) : null;

const errors = [];
rows.forEach((r, i) => {
  for (const k of ["paper", "pts", "task"]) if (r[k] === undefined || r[k] === "") errors.push(`row ${i + 2}: missing ${k}`);
  if (r.pts !== undefined && !Number.isFinite(+r.pts)) errors.push(`row ${i + 2}: pts is not a number (${r.pts})`);
});
if (errors.length) { console.error("Tally has errors:\n  - " + errors.join("\n  - ")); process.exit(1); }

// ---- papers ----
const papers = [...new Set(rows.map((r) => r.paper))];
const N = papers.length;
const year = (p) => { const m = String(p).match(/(19|20)\d{2}/g); return m ? +m[m.length - 1] : null; };
const paperTotal = Object.fromEntries(papers.map((p) => {
  const rs = rows.filter((r) => r.paper === p);
  const given = Math.max(0, ...rs.map((r) => +r.paperTotal || 0));
  return [p, given || rs.reduce((s, r) => s + +r.pts, 0)];
}));

// ---- tasks ----
const tasks = {};
for (const r of rows) {
  const t = (tasks[r.task] ||= { task: r.task, perPaper: {}, kinds: new Set(), questions: [] });
  t.perPaper[r.paper] = (t.perPaper[r.paper] || 0) + +r.pts;
  if (r.kind) t.kinds.add(r.kind);
  t.questions.push(`${r.paper} ${r.q ?? ""}`.trim());
}
const out = Object.values(tasks).map((t) => {
  const on = Object.keys(t.perPaper);
  const pts = on.map((p) => t.perPaper[p]);
  // normalize every paper to 100 points so papers with different totals weigh the same
  const norm = on.reduce((s, p) => s + (100 * t.perPaper[p]) / paperTotal[p], 0);
  const expected = norm / N; // expected points per (100-point) paper
  const years = on.map(year).filter(Boolean);
  const min = minutes ? +minutes[t.task] || null : null;
  return {
    task: t.task,
    papers: `${on.length}/${N}`,
    papersOn: on.length,
    typicalPts: Math.min(...pts) === Math.max(...pts) ? `${pts[0]}` : `${Math.min(...pts)}–${Math.max(...pts)}`,
    sharePct: +(norm / N).toFixed(1),
    expectedPerPaper: +expected.toFixed(1),
    lastSeen: years.length ? Math.max(...years) : null,
    kinds: [...t.kinds],
    minutes: min,
    ptsPerHour: min ? +((expected * 60) / min).toFixed(1) : null,
    questions: t.questions,
  };
});
out.sort((a, b) => (minutes ? (b.ptsPerHour ?? -1) - (a.ptsPerHour ?? -1) : 0) || b.expectedPerPaper - a.expectedPerPaper || b.papersOn - a.papersOn);

// ---- report ----
const newest = Math.max(...papers.map(year).filter(Boolean), 0) || null;
const cols = ["#", "Task", "Papers", "Typical pts", "Share of all pts", "Last seen", "Kind", ...(minutes ? ["Min", "Pts per hour"] : [])];
const md = [
  `Papers used (${N}): ${papers.join(", ")}`,
  "",
  `| ${cols.join(" | ")} |`,
  `|${cols.map(() => "---").join("|")}|`,
  ...out.map((t, i) => `| ${[i + 1, t.task, t.papers, t.typicalPts, t.sharePct + "%", t.lastSeen ?? "–", t.kinds.join(", ") || "–", ...(minutes ? [t.minutes ?? "–", t.ptsPerHour ?? "–"] : [])].join(" | ")} |`),
].join("\n");
console.log(md);
const notes = [];
if (N < 4) notes.push(`only ${N} paper(s): the ranking is weak. This skill is meant for a large pool of past papers.`);
const stale = newest ? out.filter((t) => t.lastSeen && newest - t.lastSeen >= 3) : [];
if (stale.length) notes.push(`not seen in the last 3 years (topic dropped, or due to return?): ${stale.map((t) => t.task).join(", ")}`);
if (minutes) { const miss = out.filter((t) => t.minutes == null).map((t) => t.task); if (miss.length) notes.push(`no minutes for: ${miss.join(", ")}`); }
if (notes.length) console.log("\nNotes:\n  - " + notes.join("\n  - "));

if (opt("--md")) writeFileSync(opt("--md"), md + (notes.length ? "\n\nNotes:\n- " + notes.join("\n- ") : "") + "\n");
if (opt("--json")) writeFileSync(opt("--json"), JSON.stringify({ papers, paperTotal, tasks: out }, null, 2));
