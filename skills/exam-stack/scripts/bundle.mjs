#!/usr/bin/env node
// Write exam-stack-all-in-one.md at the repo root: SKILL.md, the references and the page template in one file.
// It's for chats that can't open links: the student saves this one file and attaches it instead.
// Usage: node bundle.mjs            (run again whenever SKILL.md, a reference or the template changes)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(skill, "..", "..");
const read = (p) => readFileSync(join(skill, p), "utf8").replace(/\r\n/g, "\n").trim();
const fence = (body, lang) => { const ticks = "`".repeat(Math.max(3, ...[...body.matchAll(/`+/g)].map((m) => m[0].length + 1))); return `${ticks}${lang}\n${body}\n${ticks}`; };

const refs = readdirSync(join(skill, "references")).filter((f) => f.endsWith(".md")).sort();
const parts = [
  "# exam-stack: everything in one file",
  "",
  "This file holds the whole exam-stack skill for a chat that can't open links: the instructions (SKILL.md), every reference file, and the page template. Follow SKILL.md below. Wherever it says to read `references/…` or to use `assets/template.html`, use the matching section further down in this file instead of a link, and build the page by hand as described under \"Running from a link\".",
  "",
  "---",
  "",
  "## FILE: SKILL.md",
  "",
  read("SKILL.md"),
  ...refs.flatMap((f) => ["", "---", "", `## FILE: references/${f}`, "", read(`references/${f}`)]),
  "",
  "---",
  "",
  "## FILE: assets/template.html",
  "",
  "Put the stack data in place of `/*__STACK__*/` (see SKILL.md, \"Building\").",
  "",
  fence(read("assets/template.html"), "html"),
  "",
];
const out = join(root, "exam-stack-all-in-one.md");
writeFileSync(out, parts.join("\n"));
console.log(`Wrote ${out} (${Math.round(parts.join("\n").length / 1024)} KB, ${refs.length} references)`);
