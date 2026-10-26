---
name: exam-stack
description: Turn a course's past exams into a prioritized, interactive study page (an "exam stack"). It finds which question types recur on every paper, ranks them by points per hour of study, and gives each one a short solving recipe plus real past-exam questions with verified worked solutions, self-grading buttons and saved progress. Use this whenever a student wants to prepare for an exam from past papers, asks what keeps coming back on an exam, wants a study plan, practice set or priority list for a test, has limited time before an exam and wants to maximize points, or shares a folder of past exams, solutions or lecture notes and asks for help studying, even if they never say "stack".
---

# Exam stack

An exam stack is a single HTML page that answers one question for a student: *with the time I have left, what should I practise, in what order, and with which real exam questions?*

It has a header (exam countdown, tasks done, time left in the stack) and a ranked list of **task cards**. A task is one recurring *kind* of exam question, for example "compute an inverse with the extended Euclidean algorithm" or "derive the MLE of a distribution". Each card holds:

- why it sits at this rank (how often it appears and what it's worth)
- a 3–6 step **recipe** for solving it
- 1–4 **real past-exam questions** with worked solutions and the point split
- "I got it right" / "Not yet" buttons per question, and "Mark done" for the card

Done cards move to a Done pile and can always be put back. A line in the list shows where the student's time budget runs out.

The value comes from two things the student can't easily do alone: **the ranking**, which comes from counting what actually appears on past papers, and **trustworthy solutions**, which are verified, not guessed. Spend your effort there. The page itself is a template.

## Workflow

### 1. Gather the inputs, then ask what's missing

Look for these before asking anything. They're often in the folder the user points you to.

| Input | Why it matters |
|---|---|
| Past exam papers (as many years as exist), plus solutions or rubrics | The only source of exercises and of the frequency ranking |
| Lecture notes / course text | To write recipes in the course's own notation and terminology |
| Exam facts: date and time, length, total points, allowed aids (cheat sheet? calculator?) | Countdown, and how recipes should be phrased |
| Pass rule and the student's current coursework points | For the expected-score estimate at the end |
| The student's cheat sheet, if any | Recipes must match it word for word, so the student practises with the sheet they'll actually have |

Then ask, in one batch (use a question tool if available), only what you couldn't find:
- How much study time is left? This sets the cut line.
- Which topics do they already know well? Those cards drop down the list, or get one exercise each.
- Confirm that exercises come **only from real past exams**. Students trust this, and invented questions in the style of the exam are easy to get subtly wrong.

### 2. Frequency research: what keeps coming back

This step drives everything else, so be thorough.

1. Go through every past paper, sub-question by sub-question. For each one, record: paper/year, question number, points, topic, and the **task type** (the repeatable skill being tested, not the chapter).
2. Merge sub-questions that test the same skill under one task type, even when the wording or numbers differ.
3. Aggregate per task type:
   - **papers it appeared on** (e.g. 6/6)
   - **typical points** when it appears (e.g. 8–13)
   - **share of all points** across the papers
4. Write this up as `recurring-exam-questions.md` in the user's folder: a ranked table plus one line per task on what the question usually looks like. The student will reread it, and it justifies the order of the stack.

Read `references/frequency-research.md` for the table format and how to handle edge cases (papers with different total points, resits, renamed topics, optional questions).

### 3. Define and rank the tasks

Aim for **12–18 tasks**. Fewer and the cards get too broad to have one recipe. More and the student can't finish. For each task, set:

- `freq`: papers it appeared on
- `pts`: typical points
- `ease`: `easy` / `med` / `hard`, meaning how quickly a student at this level can learn to score on it
- `min`: realistic minutes to learn the recipe and do one exercise
- `why`: one sentence that tells the student why this card is at this rank

**Order by expected points per minute**, which is roughly (share of points × chance it appears) ÷ minutes. In practice: on every paper and quick goes first, big but long goes in the middle, rare or hard goes last. Small "free points" tasks (two-line answers that are always asked) belong near the top even though they're worth little, because they cost almost nothing. A rare question can still rank high if it's easy and big when it appears.

Set `course.studyMinutes` to the student's budget. The page draws the cut line where the cumulative minutes pass it.

### 4. Write the recipes

3–6 numbered steps per task. Write the steps a student follows **during the exam**, in the course's notation, not a theory summary. Good steps name the concrete action and the check: "Factor q − 1; for each distinct prime r compute x^{(q−1)/r}; all ≠ 1 ⇒ primitive". Include the trap that costs points, if there is one.

If the student has a cheat sheet, copy its text **exactly** and set `ref` to its label, so card and sheet never disagree. If they don't have one but are allowed one, offer to write the cheat sheet first and derive the recipes from it.

### 5. Collect the exercises and write verified solutions

Per task, pick **1–4 real exam questions**, newest first. Prefer variety (different years, different twists) over repeats.

For each exercise:
- Transcribe the question faithfully, including given hints, tables and the point value. Keep the paper's own numbering in `q`.
- Write a step-by-step solution in the style the grader rewards (justify each claim, show the intermediate steps the rubric checks), ending with the **point split**: the official rubric if it exists, otherwise your best inference, labelled "inferred".
- **Verify it.** Recompute every number with a short script (node or python), and check against the official solution or the exam PDF when available. A wrong solution on a card teaches the student a mistake the night before the exam, which is worse than no solution at all. If you can't verify something, say so in the solution.

For a large course, split the extraction across subagents (e.g. one per half of the course or per group of tasks). Give each one the task list, the paper paths and the exercise format, and have it verify its own numbers. Then spot-check their output yourself.

### 6. Build the page

Write everything into one `stack.json` (format and a full example in `references/stack-json.md`), then run the build script:

```bash
node <skill-dir>/scripts/build.mjs path/to/stack.json path/to/exam-stack.html
```

The script validates the data (unique ids, every exercise has a question and solution, a valid exam date), escapes `<` inside math so formulas survive HTML parsing, embeds the JSON safely in `assets/template.html`, and prints any warnings. Fix all errors, and read the warnings. "Task with no exercises" usually means a gap in step 5.

Math is written as `\( … \)` (inline) and `\[ … \]` (display) and rendered by MathJax. Plain HTML is allowed in questions and solutions (`<p>`, `<ol>`, `<table>`, `<strong>`).

Then **open the page and check it**: the top card opens, the math renders, solutions expand, buttons stick after a reload, and it works at phone width.

**Deliver it** in the most durable way the environment offers:
- If you can publish HTML as a hosted page (e.g. a claude.ai Artifact), publish it. If that host supports per-user storage, declare it: the template already syncs progress to `data/users/<uid>/stack` through `claude.use("db")` and `claude.use("user")` when they're available, and falls back to `localStorage` otherwise.
- Otherwise, save `exam-stack.html` in the user's folder. It works as a local file opened in any browser, with progress kept in that browser.

### 7. Wrap up

- **Back up** `stack.json`, the built page and `recurring-exam-questions.md` in the user's folder. The student will want to change it later, and a rebuild from `stack.json` takes seconds.
- Give an **expected-score estimate**: points covered by all cards (from the frequency research) × a realistic success rate (75–85% for practised tasks), plus a little partial credit elsewhere, converted to a final grade with the course's weights if known. Also say where the "minimum safe" cut is, i.e. how far down the stack the student must get to pass with a margin. Be honest that this assumes the next paper looks like the past ones.

## Principles

- **Real exam questions only.** Never invent exercises "in the style of" the exam unless the student explicitly asks, and then label them clearly.
- **Never delete a card.** Done means "moved to the pile", which keeps the record. If the student asks to remove one, move it to the pile.
- **Verified over complete.** A card with two verified exercises beats one with four unchecked ones.
- **Plain, step-by-step language.** Students use this under time pressure. Short steps, the course's notation, no lecture-style detours.
- **Keep the student's own material authoritative.** Their cheat sheet and their course's conventions win over your preferred notation.

## Updating an existing stack

When the student asks for a change (reorder, add a question, fix a solution, new time budget), edit `stack.json` and rebuild. Don't hand-edit the built HTML. Keep task `id`s stable, because saved progress is keyed by them. If the stack was published as a hosted page, republish to the same address so their progress and link survive.
