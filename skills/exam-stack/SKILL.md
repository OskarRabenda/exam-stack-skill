---
name: exam-stack
description: Turn a large pool of past written exams into a prioritized, interactive study page (an "exam stack"). It counts which question types recur across the papers, ranks them by points for the time they take, and gives each one a solving recipe, what graders give points for, and real past-exam questions with the answer directly under every part, a tickable rubric for self-scoring, and rounds the student can restart. Use this whenever a student has many past exam papers and wants to prepare from them, asks what keeps coming back on an exam, wants a study plan, practice set or priority list for a written exam, or shares a folder of past papers, solutions or rubrics and asks for help studying, even if they never say "stack".
---

# Exam stack

An exam stack is one HTML page that answers a student's question: *with the time I have left, what should I practise, in what order, with which real exam questions, and how will it be graded?*

It shows how the exam is graded, then a ranked list of **task cards**. A task is one recurring *kind* of question ("compute an inverse with the extended Euclidean algorithm", "True/False on definitions", "explain why TCP needs a three-way handshake"). Each card holds:

- why it sits at this rank
- **what graders reward** on this kind of question
- a short **recipe** for answering it
- real past-exam questions where **every part has its answer directly under it**, with a **rubric checklist** the student ticks to score themselves

Cards move to a Done pile and can always be put back. **Restart the stack** starts a new round (all cards, or only those scored under 70%), and earlier rounds stay in the history.

The value is in two things a student can't easily do alone: **an honest ranking** counted from many papers, and **trustworthy answers with the real point split**. Spend your effort there. The page is a template.

## Scope

- **Written exams only**, with a **large pool of past papers** (as a rule of thumb, at least 4; more is better). The ranking is a count, and a count over two papers isn't one.
- Not for oral exams, lab or practical exams, take-home projects, or courses with no past papers. If that's the situation, say so and stop rather than building something that looks authoritative but isn't.

## Phases

### 0. Gate: is there a pool?
List the past papers you can find (and their solutions or rubrics). If there are fewer than about 4 written papers, tell the user the ranking would be guesswork and ask whether they can find more before going on.

### 1. Gather and ask
Find these before asking anything; they're usually in the folder the user points you to:
- the past papers, plus official solutions, rubrics and grading notes
- lecture notes, to write recipes in the course's own notation
- the student's cheat sheet, if one is allowed (recipes must match it word for word)
- the exam date and time, and the student's coursework points if the pass rule depends on them

Then ask, in one batch, only what you couldn't find: how much study time is left (a rough number is fine), which topics they already know, and confirm that exercises come only from real past papers.

### 2. Exam profile: how is it graded?
Read the cover pages and instructions of the papers and write down how the exam is graded: duration, total points, allowed aids, sections with **minimum scores**, **negative marking**, **choice questions**, answering rules ("justify every answer") and the pass rule. These change the strategy, not just the header. A section minimum can force a low-value card up, negative marking needs a "when to leave it blank" line, and a closed-book exam means recipes must be memorized. Read `references/exam-profile.md`.

### 3. Tally and rank
Go through every paper, sub-question by sub-question, and record a tally row: paper, question number, points, **task type** (the skill being tested, not the chapter), and **kind** (calculation, explain, recall, proof, multiple-choice, true-false). Whenever a rubric or solution shows how points were split, note that too; you'll need it in phase 5.

Then let the script do the counting:

```bash
node <skill-dir>/scripts/tally.mjs tally.csv --minutes minutes.json --md recurring-exam-questions.md
```

It reports, per task: papers it appeared on, typical points, share of all points (papers normalized to 100), the year last seen, and, with rough minutes per task, expected points per hour. Read `references/frequency-research.md` for the tally format and edge cases.

Use the table to set the stack order, then adjust it by judgment where the profile demands (section minimums, prerequisites a task builds on, topics that recently dropped out of the syllabus). Aim for roughly 12–20 tasks. Fewer and cards get too broad for one recipe; more and the student can't finish. Minutes are a rough estimate; don't spend time refining them.

Save `recurring-exam-questions.md` in the user's folder. The student will reread it.

### 4. Write the cards
For each task, set `kind`, `why`, `graders` and `recipe` (and `after` if it builds on another task).

- **`graders`, what graders reward:** 1–3 sentences on what earns and loses points on *this kind* of question, from official rubrics where they exist and otherwise from patterns across the papers' solutions. For example: "Each division step must be verified; a correct inverse without the checks loses 3 of 10." This is often the most useful line on the card.
- **Recipe:** 3–6 numbered steps the student follows *in the exam*, in the course's notation, including the trap that costs points. If the student has a cheat sheet, copy its text exactly and set `ref`. If they're allowed one but don't have one, offer to write it first and derive the recipes from it.
- **Kind-specific:** true-false and multiple-choice cards need a recipe for deciding *and* for when to leave it blank (if wrong answers cost points). Explain and proof cards need an answer *structure* (what a full-marks answer contains), since there is no calculation to follow.

### 5. Exercises: answers under every part
Per task, pick **2–4 real past-paper questions**, newest first, varied across years. For each one:

1. **Split it into parts exactly as the paper does.** Every sub-question, every True/False statement, every multiple-choice item is its own part with its own answer directly beneath it. A block of 16 True/False statements is one exercise with 16 parts. A shared stem (definitions, a given table, a figure) goes in `intro`. This matters: a student checks one answer at a time, and answers collected at the end are unusable.
2. **Transcribe faithfully**, including hints, given tables and figures (save figures as image files and reference them; the build inlines them).
3. **Write the solution** in the style the grader rewards (justification lines, intermediate steps), and for true-false / multiple-choice give the short `answer` plus a one-line reason.
4. **Write the rubric** whenever you have the information: one item per thing the grader gives points for, with its points, marked `official` (from a rubric or grading notes) or `inferred` (your reading of how this course grades). Any part worth more than 1 point should have at least an inferred rubric. Read `references/grading.md`.
5. **Verify and label the source** (`verified`):
   - `official`: taken from an official solution
   - `recomputed`: every number checked with a quick script
   - `reasoned`: an explanation or argument that can't be recomputed

   A wrong answer teaches a mistake the night before the exam. Recompute every calculation. For `reasoned` answers, check them against the lecture notes and keep them short and sourced.

For a big course, split phases 3–5 across subagents (e.g. one per part of the course). Give each one the task list, the paper paths and `references/stack-json.md`, have it verify its own numbers, then spot-check their output yourself.

### 6. Build and check
Write everything to one `stack.json` (format and full example: `references/stack-json.md`, `assets/example-stack.json`), then:

```bash
node <skill-dir>/scripts/build.mjs path/to/stack.json path/to/exam-stack.html
```

The build validates the data, inlines images, makes math HTML-safe and embeds everything in `assets/template.html`. Fix every error, and read the warnings. "Question and solution both hold a list" almost always means statements that should be separate parts. "No rubric" means the grading information is missing.

Open the page and check: the profile reads right, the top card opens, the math renders, every part's answer opens right under it, ticking rubric items updates the score, restart works, and it fits a phone screen.

**Deliver it** in the most durable way available. Publish it as a hosted page if you can (e.g. a claude.ai Artifact; declare per-user storage if offered, since the template syncs progress through `claude.use("db")` / `claude.use("user")` when available). Otherwise save `exam-stack.html` in the user's folder. It works as a local file, with progress kept in the browser.

### 7. Wrap up
- Keep `stack.json`, `tally.csv`, the built page and `recurring-exam-questions.md` in the user's folder. Changes later are an edit to `stack.json` plus a rebuild.
- Give a **rough** expected score: the share of points the cards cover × a realistic success rate (say 75–85% for practised tasks), turned into a grade using the profile's pass rule. Say how far down the stack the student must get to pass with a margin. Present it as an estimate that assumes the next paper looks like the past ones, not a promise.

## Principles

- **Real exam questions only.** Never invent exercises in the exam's style unless the student asks, and then label them clearly.
- **Every answer sits under its own question.**
- **Make grading explicit.** If you know what graders give points for, it goes on the card (`graders`) and on the part (`rubric`), labelled official or inferred.
- **Nothing is deleted.** Done cards go to the pile, restarts keep the history, and a card the student wants gone goes to the pile.
- **Verified over complete.** Two verified exercises beat four unchecked ones; say which answers are reasoned rather than recomputed.
- **The student's material is authoritative.** Their cheat sheet and the course's notation win over yours.

## Updating an existing stack
Edit `stack.json` and rebuild; never hand-edit the built HTML. Keep task `id`s and exercise `id`s stable, since saved progress is keyed by them. Add new exercises with new ids rather than reusing old ones. If the stack was published as a hosted page, republish to the same address so the student's link and progress survive.
