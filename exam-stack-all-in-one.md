# exam-stack: everything in one file

This file holds the whole exam-stack skill for a chat that can't open links: the instructions (SKILL.md), every reference file, and the page template. Follow SKILL.md below. Wherever it says to read `references/…` or to use `assets/template.html`, use the matching section further down in this file instead of a link, and build the page by hand as described under "Running from a link".

---

## FILE: SKILL.md

---
name: exam-stack
description: Turn a large pool of past written exams into a prioritized, interactive study page (an "exam stack"). It counts which question types recur across the papers, ranks them by points for the time they take, and gives each one a solving recipe, what graders give points for, and real past-exam questions with the answer directly under every part, a tickable rubric for self-scoring, and rounds the student can restart. Use this whenever a student has many past exam papers and wants to prepare from them, asks what keeps coming back on an exam, wants a study plan, practice set or priority list for a written exam, or shares a folder of past papers, solutions or rubrics and asks for help studying, even if they never say "stack".
---

# Exam stack

> **Use it without installing anything (Claude or ChatGPT website).** Start a new chat, attach your past exams (and solutions if you have them), and paste this:
>
> ```
> Use the "exam-stack" skill. Read its instructions and follow them step by step:
> https://raw.githubusercontent.com/OskarRabenda/exam-stack-skill/main/skills/exam-stack/SKILL.md
>
> My course: [course name]
> Exam date and time: [date, time]
> Study time I have: [about N hours]
> My past exams are attached.
> If you can't open that link, don't guess: tell me, and I'll attach the file instead.
> ```
>
> **If your AI says it can't open the link:** open <https://raw.githubusercontent.com/OskarRabenda/exam-stack-skill/main/exam-stack-all-in-one.md> in your browser, press **Ctrl+S** (Mac: **Cmd+S**) to save it, attach the saved file to the same chat, and write: *"Here is the file. Follow it."*

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

## Running from a link (Claude or ChatGPT in the browser, nothing installed)

If you were pointed at this file by URL, or were given `exam-stack-all-in-one.md` as an attachment, instead of having the skill installed, everything still works. (In the all-in-one file, every reference and the template are sections further down the same file, so use those instead of links.)
- **The other files** live next to this one. Open them by adding the path to `https://raw.githubusercontent.com/OskarRabenda/exam-stack-skill/main/skills/exam-stack/`, e.g. `…/references/stack-json.md` or `…/assets/template.html`. Read a reference when a phase tells you to.
- **Inputs** are the files attached to the chat instead of a folder. **Outputs** are files you hand back (a download, or an Artifact / canvas) instead of files saved to a folder.
- **Counting (phase 3):** run `scripts/tally.mjs` if you can run Node with internet access. Otherwise do the same count in Python or by hand: papers on, typical points, share of all points with every paper normalized to 100, year last seen.
- **Building (phase 6):** if you can run Node, fetch `scripts/build.mjs` and `assets/template.html` and run the build. If not, build it yourself:
  1. Fetch `assets/template.html`.
  2. Inside every `\( … \)` and `\[ … \]` in your data, replace `<` with `&lt;`.
  3. Serialize `stack.json` and replace `</` with `<\/`.
  4. Put the result in place of `/*__STACK__*/` in the template.
  5. Check yourself what the build would check: unique ids, every part has a question and an answer under it, and no True/False block bundled into one part.

  Images can't be inlined this way, so describe a figure in words or skip that exercise.
- **Delivering:** in Claude, publish the finished page as an HTML Artifact. In ChatGPT, give it as a downloadable `exam-stack.html`. The page loads its fonts and MathJax from the web, and keeps progress in the student's browser.

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

---

## FILE: references/exam-profile.md

# Exam profile: how the exam is graded

The profile goes in `course.profile` and is shown at the top of the page as "How this exam is graded". More importantly, it changes how you rank and write the cards. Collect it from the cover pages and instructions of the most recent papers (rules drift over the years, so the newest paper wins), the course guide, and any "exam information" announcements.

## What to extract

| Field | Look for | Why it matters |
|---|---|---|
| `duration`, `totalPoints` | cover page | Points per minute in the exam itself, and normalizing older papers with different totals |
| `aids` | "allowed", "permitted", "closed book" | Closed book: recipes and definitions must be memorized, so prefer short recipes and recall drills. Cheat sheet: recipes must match it. Calculator or not: whether a recipe can say "compute 37^4 mod 149" or must give a by-hand method |
| `sections` (name, points, minimum) | "Part A", "at least N points in…" | A minimum turns a section into a hard constraint. Make sure the stack covers enough of each section with a minimum *above the cut line*, even if its tasks score lower on value |
| `negativeMarking` | "−1 for a wrong answer", "2×(c−w)" | Guessing has a cost. Add a "leave it blank unless…" step to those cards; the page also scores a wrong answer as negative |
| `choice` | "answer 3 of the 4", "choose" | The student can skip one question type. Rank the ones they'd choose higher and say which to drop |
| `rules` | "justify", "show your work", "motivate", "a bare answer scores 0" | These belong in `graders` lines and rubrics across all cards |
| `passRule` | course guide, cover page | Needed for the expected-score estimate and the "minimum safe cut" |

Write values as short sentences a student can scan. Use the paper's own wording when it's clear.

## How it changes the stack

- **Section minimums:** after ranking by value, walk down to the cut line and add up points per section. If a section with a minimum is under-covered, move its best tasks above the line and say why in their `why`.
- **Negative marking:** the recipe for true-false / multiple-choice cards ends with a blank-or-answer rule. `graders` says what a wrong answer costs.
- **Choice questions:** mark the skippable task type in its `why` ("one of the 4 open questions may be skipped; this is the one to skip").
- **Closed book:** keep recipes to steps a student can memorize, and put definitions the exam asks for verbatim into the recipe of a recall card.
- **"Justify" rules:** most course-wide rules are better stated once in the profile and then made concrete per task in `graders` ("name the theorem you use").

## When the papers disagree

Rules can change between years (a new lecturer, a switch to digital exams). Use the most recent paper's rules for the profile. Mention notable changes in the `recurring-exam-questions.md` write-up, and weigh older papers' question types accordingly in the ranking.

---

## FILE: references/frequency-research.md

# Frequency research

The ranking is a count. You decide what each sub-question *is*, and `scripts/tally.mjs` does the arithmetic, so the same tally always gives the same ranking.

## 1. The tally sheet (`tally.csv`)

One row per sub-question, across all papers:

```csv
paper,q,pts,task,kind,paperTotal
Exam 2023,5a,4,T9 Irreducibility gcds,explain,100
Exam 2023,5b,2,T9 Irreducibility gcds,explain,100
Exam 2022,4a,2,T9 Irreducibility gcds,explain,100
Exam 2022,7b,2,T11 Legendre/Jacobi,calculation,100
```

| Column | Meaning |
|---|---|
| `paper` | Which exam. Put the year in the name ("Exam 2023", "Resit 2019") so "last seen" works |
| `q` | The paper's own numbering |
| `pts` | Points of this sub-question |
| `task` | The **task type**: the skill being tested. Two questions belong to the same task when one recipe answers both. Use the same spelling every time, ideally id + short name |
| `kind` | `calculation`, `explain`, `recall`, `proof`, `multiple-choice`, `true-false` |
| `paperTotal` | Optional. The paper's total points, if the rows don't add up to it (e.g. you skipped a bonus question) |

A True/False block of 16 statements worth 2 each is one row with 32 points (it's one task on that paper), not 16 rows.

**Choosing task boundaries** is the main judgment call:
- Split a chapter into several tasks when it's examined in clearly different ways ("compute an order" vs "count primitive elements").
- Merge differently worded questions that use the same recipe.
- Keep a rare hard question as its own task. It'll rank low, but students who finish the stack want it.

## 2. Run the count

```bash
node scripts/tally.mjs tally.csv --minutes minutes.json --md recurring-exam-questions.md --json tally.json
```

`minutes.json` maps each task to rough minutes to learn it and do one exercise: `{ "T9 Irreducibility gcds": 15, … }`. Rough is fine. With it, tasks are sorted by expected points per hour; without it, by expected points per paper.

The output table has, per task:
- **Papers** (x/N): how many papers it appeared on
- **Typical pts**: the range when it appears
- **Share of all pts**: its points ÷ all points, every paper normalized to 100
- **Last seen**: the newest year it appeared
- **Pts per hour**: expected points per paper × 60 ÷ minutes

The script also flags too few papers, and tasks not seen in the last 3 years.

## 3. From the table to the stack order

Start from the script's order, then adjust by judgment, and say why in the task's `why`:
- **Section minimums** from the exam profile (see `exam-profile.md`)
- **Prerequisites:** a task that builds on another goes after it (`after`)
- **Recency:** a task not seen for 3+ years may have left the syllabus. Check the current course guide before ranking it high. A task that only appears on recent papers may be new and here to stay
- **Free points:** tiny tasks that are on every paper (two-line answers) go near the top even with low points, because they cost almost nothing

## 4. Write-up for the student (`recurring-exam-questions.md`)

1. One paragraph: which papers were used, and caveats (a syllabus change, a missing year, unofficial solutions, a rule change such as negative marking introduced in 2022).
2. The ranked table from the script.
3. Per task: one or two lines on what the question usually looks like, quoting typical phrasing.
4. An "always on the paper" list: the tasks at N/N. Students use it as a last-minute checklist.

## Edge cases

- **Resits and alternative versions** count as papers. Mark them in the name ("Resit 2021") so you can see if they differ systematically.
- **Changed syllabus:** leave out questions on material no longer taught, and say what you left out.
- **Choice questions** ("answer 3 of 4"): tally them, and note the choice in the profile so the ranking can treat one as skippable.
- **Different totals per paper:** fine, the script normalizes to 100. Set `paperTotal` if your rows don't cover the whole paper.

---

## FILE: references/grading.md

# Grading: rubrics, "what graders reward", and answer sources

A student who gets the final answer right but skips the lines the grader checks loses points without knowing it. The page fixes that by showing, under every answer, **what points are given for**, and letting the student tick what they actually wrote. That only works if the rubrics are honest. This file covers how to write them.

## Where grading information comes from (best first)

1. **Official rubrics or grading notes** (e.g. "1 pt for the table, 2 pts for the verification").
2. **Official worked solutions** with point annotations in the margin.
3. **Point values on the paper itself.** A sub-question worth 3 points that asks for three things is usually one point each.
4. **Instructions** on the cover ("a bare answer scores 0", "missing verification costs points").
5. **Patterns across papers.** The same kind of question graded the same way every year.

Items from 1–2 are `official`. Items you build from 3–5 are `inferred`. Never present an inferred rubric as official.

## Writing rubric items

- One item per thing a grader can independently give or withhold points for: a step, a check, a conclusion, a stated reason.
- Phrase each item as **what must be on the paper**, so the student can tick it honestly: "Each division verified (q·b + r = a)", not "Correct method".
- Points per item must add up to the part's points. The build warns when they don't.
- Separate the *result* from the *work*: "Final value 13" (1 pt) vs "Expansion with correct signs" (2 pts). Students over-credit themselves when these are merged.
- For explain or proof answers, list the elements a full-marks answer contains: the claim, the theorem or mechanism named, the link to the specific case, the conclusion.
- Keep items short; they're checkboxes, not paragraphs.

### Example (EEA inverse, 10 pts, from an official rubric)

| pts | item |
|---|---|
| 4 | EEA table with all rows (a, b, q, r, x, y) |
| 2 | Each division verified: q·b + r = a |
| 2 | Normalized by c⁻¹ when the gcd is a constant c ≠ 1 |
| 2 | Final check: g · g⁻¹ ≡ 1 written out |

## "What graders reward" (`graders` on the task)

Per task, 1–3 sentences that generalize the rubrics of that kind of question across the papers. They tell the student *before* they start what to make sure is on the paper:

- "The argument is worth as much as the computation: say what each gcd result implies."
- "Only the True/False mark is graded; a wrong one costs 2 points, so leave it blank unless you can name the rule."
- "A correct answer without the verification lines loses about a third of the points."

If you have no grading information at all for a task, leave `graders` out rather than writing generic advice ("show your work") that applies to everything.

## Answer sources (`verified` on each part)

| Value | Use when | What the student sees |
|---|---|---|
| `official` | The answer is taken from an official solution | "from the official solution" |
| `recomputed` | You computed it and checked every number with a script | "numbers recomputed and checked" |
| `reasoned` | It's an explanation, definition or argument with nothing to recompute | "reasoned answer, not checkable by computation; read it critically" |

For `reasoned` answers: check them against the lecture notes, keep them as short as a full-marks answer needs to be, and prefer the course's own wording. If you're unsure, say so in the solution rather than sounding certain.

## Parts and answers

- Split exercises into parts exactly as the paper numbers them. Every True/False statement and every multiple-choice item is its own part.
- For true-false and multiple-choice parts, set `answer` (e.g. "False", "C") and give a one-line reason in `solution`. The page offers Right / Wrong / Left blank, and scores a wrong answer negatively when the profile has negative marking.
- A part without a rubric falls back to "I got it" / "Not yet". Fine for 1-point recall items, not for anything bigger.

---

## FILE: references/stack-json.md

# stack.json format (v2)

One file holds everything the page shows. `scripts/build.mjs` validates it, inlines images, and embeds it in `assets/template.html`. A complete, buildable example is `assets/example-stack.json`; read it once before writing your own.

## Shape

```json
{
  "course": {
    "code": "MATH101",
    "name": "Linear Algebra",
    "examLabel": "Fri 12 Jun · 13:30",
    "examStart": "2027-06-12T13:30:00+02:00",
    "studyMinutes": 240,
    "profile": {
      "duration": "3 hours",
      "totalPoints": 100,
      "aids": "One handwritten A4 cheat sheet, simple calculator",
      "sections": [{ "name": "Part A: algebra", "points": 50, "minimum": 20 }],
      "negativeMarking": "True/False: +2 correct, −2 wrong, 0 blank",
      "choice": "Answer 4 of the 5 questions in part B",
      "rules": ["Justify every answer; a bare result scores 0"],
      "passRule": "Exam ≥ 5.0 and final grade ≥ 5.5"
    }
  },
  "tasks": [
    {
      "id": "T1",
      "title": "Determinant of a 3×3 matrix",
      "kind": "calculation",
      "section": "Part A: algebra",
      "freq": "5/5",
      "pts": "3–4",
      "ease": "easy",
      "min": 15,
      "why": "On every paper and pure routine.",
      "graders": ["The expansion with its signs is worth half the points, even if the value is wrong."],
      "after": [],
      "ref": "S1",
      "recipe": ["Pick the row with the most zeros.", "Expand with signs \\(+,-,+\\).", "Check the sign pattern before adding."]
    }
  ],
  "exercises": {
    "T1": [
      {
        "id": "2024-2",
        "paper": "Exam 2024",
        "q": "2",
        "pts": 6,
        "intro": "<p>Let \\(A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\).</p>",
        "parts": [
          {
            "label": "a",
            "pts": 2,
            "question": "<p>Compute \\(\\det A\\).</p>",
            "solution": "<p>\\(1\\cdot4-2\\cdot3=-2\\).</p>",
            "verified": "recomputed",
            "rubric": { "source": "official", "items": [ { "pts": 1, "text": "Correct formula ad − bc" }, { "pts": 1, "text": "Value −2" } ] }
          }
        ]
      }
    ]
  }
}
```

## `course`

| Field | Required | Meaning |
|---|---|---|
| `code`, `name` | at least one | Shown in the rail and header. `code` also keys saved progress, so keep it stable |
| `examLabel` | no | Free text, e.g. "Mon 26 Oct · 09:00" |
| `examStart` | no | ISO date-time with offset; drives the countdown |
| `studyMinutes` | no | Rough budget; the page draws a soft "about N hours" line. It is an estimate, not a plan, so don't fine-tune it |
| `profile` | strongly recommended | How the exam is graded (see `exam-profile.md`). Rendered as "How this exam is graded" at the top |

## `tasks[]`, in stack order (array order is the rank)

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable id (`T1`…). Progress is keyed by it; never renumber once a student started |
| `title` | yes | The question type as a student recognizes it on the paper. Plain text, one line |
| `kind` | yes | `calculation`, `explain`, `recall`, `proof`, `multiple-choice`, `true-false` or `mixed`. Decides verification and how the card drills |
| `section` | no | Name of the exam section it belongs to (must match a `profile.sections[].name`) |
| `freq`, `pts`, `ease`, `min` | no | From the tally: papers it was on (`"6/6"`), typical points (`"8–13"`), `easy`/`med`/`hard`, rough minutes |
| `why` | no | One sentence on why it sits at this rank. HTML and math allowed |
| `graders` | **yes when known** | What graders give points for on this kind of question, as short sentences. Shown above the recipe as "What graders reward" |
| `after` | no | Ids of tasks this one builds on. They must come earlier in the array; the card links to them |
| `ref` | no | Cheat-sheet label the recipe was copied from |
| `recipe` | no (warned) | Array of step strings. HTML and math allowed |

## `exercises` — keyed by task id, newest paper first

### Exercise

| Field | Required | Meaning |
|---|---|---|
| `id` | recommended | Stable id within the task, e.g. `"2023-5"`. Progress is keyed by it. If missing, the build derives one from `paper` + `q` |
| `paper` | yes | Which exam, e.g. `"Exam 2023"`, `"Resit 2019"` |
| `q`, `pts` | no | The paper's own question number and its points |
| `intro` | no | Shared stem shown once above the parts ("Let f = …", a given table, a figure) |
| `parts` | **yes** | One entry per thing the student answers. See below |

### Part — the unit that gets an answer directly below it

Every sub-question, every True/False statement, every multiple-choice item and every "show that" step the paper numbers separately is its **own part**. The page shows each part's answer directly under that part, so a paper with 16 True/False statements becomes one exercise with 16 parts, not one question with 16 answers in a block at the end. The build warns when a single part looks like it bundles several.

| Field | Required | Meaning |
|---|---|---|
| `label` | yes when >1 part | `"a"`, `"b"`, `"1"`, `"(iii)"`… |
| `pts` | no | Points for this part |
| `question` | yes | HTML. Transcribe faithfully, including hints and given data |
| `answer` | no | Short final answer shown first in bold (e.g. `"False"`, `"x ≡ 17 (mod 35)"`). Use it for True/False and multiple choice |
| `solution` | yes, unless `answer` says it all | HTML. Step by step, in the style the grader rewards |
| `verified` | yes | `"official"` (taken from an official solution), `"recomputed"` (numbers checked with a script) or `"reasoned"` (an argument nobody could recompute, so the student should read it critically) |
| `rubric` | **yes when known** | `{ "source": "official" \| "inferred", "items": [ { "pts": 2, "text": "…" } ] }`. Each item is one thing the grader gives points for. The student ticks what they wrote and gets a score |

Without a rubric, a part falls back to "I got it" / "Not yet" buttons. That is acceptable for 1-point recall items; for anything worth more, write at least an inferred rubric.

## Writing content

- **Math:** `\( … \)` inline and `\[ … \]` display (MathJax 3). In JSON every backslash is doubled. `<` inside math is escaped by the build.
- **HTML:** `<p>`, lists, `<table>`, `<strong>`, `<em>`, `<code>`, `<pre>`, `<br>`. No scripts or event handlers.
- **Images:** `<img src="figures/q3.png" alt="…">` with a path relative to `stack.json`. The build inlines them, so the page stays one file. Always write a real `alt`.
- Keep `title` short (one line on a phone). Put detail in `why`, `graders` and the recipe.

---

## FILE: assets/template.html

Put the stack data in place of `/*__STACK__*/` (see SKILL.md, "Building").

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Exam Stack</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300..700;1,300..700&family=Source+Sans+3:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
<style>
/* Margin-notes layout: the questions run in the main column; what graders reward and the recipe sit in a
   margin beside them and stay in view while you scroll. Serif for reading, a quiet sans for small labels. */
:root{
  --bg:#FFFFF8; --ink:#141414; --accent:#A00000; --on-accent:#fff;
  --surface:#FFFFFB; --tint:#F6F4EA; --soft:#4A4A46; --faint:#8A8A84; --line:#E2E0D6; --line-strong:#141414;
  --good:#2E6B3F; --warn:#8A5A12;
  --serif:"Crimson Pro","Crimson Text",Georgia,"Times New Roman",serif;
  --sans:"Source Sans 3","Source Sans Pro","Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;
  color-scheme:light;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){--bg:#151514;--ink:#ECEAE3;--accent:#E8857A;--on-accent:#151514;--surface:#1C1C1A;--tint:#22221F;--soft:#BDBBB3;--faint:#8C8A83;--line:#34332F;--line-strong:#ECEAE3;--good:#86C79A;--warn:#E2B36A;color-scheme:dark}
}
:root[data-theme="dark"]{--bg:#151514;--ink:#ECEAE3;--accent:#E8857A;--on-accent:#151514;--surface:#1C1C1A;--tint:#22221F;--soft:#BDBBB3;--faint:#8C8A83;--line:#34332F;--line-strong:#ECEAE3;--good:#86C79A;--warn:#E2B36A;color-scheme:dark}

*{box-sizing:border-box}
[hidden]{display:none!important}
html{scroll-behavior:smooth;scroll-padding-top:64px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--serif);font-size:19px;line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-underline-offset:3px}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px}
p{margin:0}
.note-label{font-family:var(--sans);font-weight:600;font-size:13px;color:var(--accent)}
.muted{font-family:var(--sans);font-size:14px;color:var(--faint)}

/* ---------- top bar ---------- */
.top{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px max(16px,4vw)}
.brand{font-family:var(--serif);font-weight:600;font-size:19px;color:var(--ink);text-decoration:none;white-space:nowrap}
.tools{display:flex;align-items:center;gap:14px;font-family:var(--sans);font-size:14.5px;color:var(--soft)}
.tools .prog{white-space:nowrap}
.tocwrap{position:relative}
.tocwrap>summary{list-style:none;cursor:pointer;color:var(--ink);font-weight:600;white-space:nowrap}
.tocwrap>summary::-webkit-details-marker{display:none}
.tocwrap>summary::after{content:" ▾";color:var(--faint)}
.tocpanel{position:absolute;right:0;top:calc(100% + 10px);width:min(420px,calc(100vw - 32px));max-height:min(70vh,640px);overflow-y:auto;background:var(--surface);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.12);padding:10px}
.toc{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.toc a{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:8px;align-items:baseline;padding:6px 8px;color:var(--ink);text-decoration:none;font-family:var(--serif);font-size:17px;line-height:1.3}
.toc a:hover{background:var(--tint)}
.toc .n{color:var(--faint);font-family:var(--sans);font-size:13px}
.toc .s{font-family:var(--sans);font-size:12px;color:var(--faint)}
.toc li.done a{color:var(--faint)}
.toc li.done .s{color:var(--good)}
.toc li.next .n{color:var(--accent);font-weight:700}
.toc .sep{font-family:var(--sans);font-size:12px;font-weight:600;color:var(--accent);padding:10px 8px 4px;border-top:1px solid var(--accent);margin-top:6px}
.linkbtn{font:inherit;background:none;border:0;padding:0;color:var(--accent);cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.themebtn{display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:transparent;color:var(--ink);cursor:pointer;transition:background .15s}
.themebtn:hover{background:var(--tint)}
.themebtn .sun{display:none}
.is-dark .themebtn .sun{display:block}
.is-dark .themebtn .moon{display:none}
@media (max-width:640px){.tools .prog{display:none}.tocpanel{position:fixed;left:12px;right:12px;top:56px;width:auto;max-height:calc(100vh - 72px)}}

/* ---------- one reading column: everything comes in order, top to bottom ---------- */
.page{max-width:1120px;margin:0 auto;padding:44px max(16px,4vw) 120px}
.page>header{max-width:760px}
h1{font-weight:400;font-style:italic;font-size:clamp(44px,6vw,64px);line-height:1.02;margin:0;letter-spacing:-.01em}
.lede{font-size:21px;color:var(--soft);margin-top:14px}
.stats{display:flex;flex-wrap:wrap;gap:12px 36px;margin-top:30px}
.stat{display:flex;flex-direction:column}
.stat .v{font-size:28px;line-height:1.15;font-variant-numeric:lining-nums tabular-nums}
.stat .k{font-family:var(--sans);font-size:14px;color:var(--faint)}
.save{margin-top:10px}

/* "How this exam is graded" stays folded until opened, so the first screen stays quiet */
.profile{margin-top:26px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.profile>summary{cursor:pointer;list-style:none;padding:12px 0;font-family:var(--sans);font-weight:600;font-size:15px;color:var(--accent)}
.profile>summary::-webkit-details-marker{display:none}
.profile>summary::before{content:"+ "}
.profile[open]>summary::before{content:"\2212  "}
.profile dl{margin:0 0 16px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 16px;font-size:18px}
.profile dt{font-family:var(--sans);font-weight:600;font-size:14.5px;color:var(--soft);padding-top:3px}
.profile dd{margin:0}
.profile dd ul{margin:0;padding-left:18px}
@media (max-width:560px){.profile dl{grid-template-columns:minmax(0,1fr)}.profile dd{margin-bottom:6px}}
.rule{border-top:2px solid var(--line-strong);margin-top:30px}

/* ---------- cards ---------- */
.stack{display:flex;flex-direction:column}
.card{border-bottom:1px solid var(--line)}
.head{width:100%;display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:14px;align-items:baseline;padding:20px 0;background:none;border:0;color:inherit;font:inherit;text-align:left;cursor:pointer}
.num{font-size:40px;line-height:1;color:var(--faint);font-variant-numeric:lining-nums}
.card.next .num{color:var(--accent)}
.card.done .num{color:var(--good);font-size:28px}
.head:hover .num{color:var(--ink)}
.ttl{display:flex;flex-direction:column;gap:4px;min-width:0}
.ttl b{font-weight:600;font-size:26px;line-height:1.2}
.card.done .ttl b{color:var(--soft);font-weight:500}
.meta{font-family:var(--sans);font-size:14px;color:var(--faint);display:flex;flex-wrap:wrap;gap:2px 10px}
.meta>span+span::before{content:"·";margin-right:10px}
.meta .freq{color:var(--accent);font-weight:600}
.meta .score{color:var(--good);font-weight:600}
.chev{font-family:var(--sans);font-size:14px;color:var(--faint)}
.card.next .chev{color:var(--accent);font-weight:600}

/* Everything reads in one column. The one exception is the recipe: it sits beside the questions and
   stays on screen while you scroll, so the steps are always at hand. */
.body{padding:0 0 40px;display:grid;grid-template-columns:minmax(0,1fr) 300px;column-gap:48px;row-gap:22px;
  grid-template-areas:"lead recipe" "graders recipe" "main recipe" "act recipe";grid-template-rows:auto auto auto 1fr}
.lead{grid-area:lead;display:flex;flex-direction:column;gap:10px}
.graders{grid-area:graders}
.problems{grid-area:main;display:flex;flex-direction:column;gap:30px;min-width:0}
.act{grid-area:act;margin-top:4px;align-self:start}
.recipe{grid-area:recipe;align-self:start;position:sticky;top:76px;max-height:calc(100vh - 96px);overflow-y:auto;scrollbar-width:thin;background:var(--tint);border-left:2px solid var(--accent);padding:12px 16px;font-size:17.5px}
.recipe ol,.graders ul{margin:8px 0 0;padding-left:22px;display:flex;flex-direction:column;gap:5px}
.recipe-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.recipe.hidden{background:transparent;padding:4px 16px}
.recipe.hidden ol{display:none}
.graders{padding-left:16px;border-left:2px solid var(--line)}
@media (max-width:1099px){
  .body{display:flex;flex-direction:column}
  .recipe{position:static;max-height:none;overflow:visible}
}

/* phones and narrow windows: a floating button brings up the recipe of the card you're reading */
.recipefab{position:fixed;right:16px;bottom:16px;z-index:20;font:600 14px var(--sans);padding:10px 16px;border-radius:999px;border:0;background:var(--accent);color:var(--on-accent);box-shadow:0 6px 18px rgba(0,0,0,.2);cursor:pointer}
.recipesheet{position:fixed;left:0;right:0;bottom:0;z-index:30;max-height:65vh;overflow-y:auto;background:var(--surface);border-top:2px solid var(--accent);box-shadow:0 -10px 30px rgba(0,0,0,.18);padding:16px max(16px,4vw) 24px}
.recipesheet ol{margin:8px 0 0;padding-left:22px;display:flex;flex-direction:column;gap:6px}
@media (min-width:1100px){.recipefab,.recipesheet{display:none!important}}
.why{color:var(--soft)}
.note{font-family:var(--sans);font-size:15px;color:var(--warn)}

/* ---------- problems ---------- */
.problem{min-width:0}
.src{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;font-family:var(--sans);font-weight:600;font-size:13.5px;color:var(--faint);border-top:2px solid var(--line-strong);padding-top:8px;margin-bottom:8px}
.intro{margin-bottom:4px}
.part{padding:14px 0 6px;display:flex;flex-direction:column;gap:8px;min-width:0}
.part+.part{border-top:1px solid var(--line)}
.qline{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:baseline}
.plabel{font-weight:700;color:var(--accent);white-space:nowrap}
.plabel small{display:block;font-family:var(--sans);font-weight:400;font-size:12px;color:var(--faint)}
.q,.sol,.intro{overflow-x:auto;overflow-y:hidden;padding-block:2px}
.q p+p,.sol p+p,.intro p+p{margin-top:8px}
.q img,.sol img,.intro img{max-width:100%;height:auto;display:block;margin:8px 0}
.problem table{border-collapse:collapse;margin:8px 0;font-variant-numeric:lining-nums tabular-nums}
.problem th,.problem td{border-bottom:1px solid var(--line);padding:4px 14px 4px 0;text-align:left;vertical-align:top}
.problem th{font-weight:600}
pre,code{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:.85em}
pre{background:var(--tint);padding:10px 12px;overflow-x:auto}

details.ans>summary{cursor:pointer;list-style:none;display:inline-flex;align-items:baseline;gap:6px;font-family:var(--sans);font-size:14.5px;font-weight:600;color:var(--accent)}
details.ans>summary::-webkit-details-marker{display:none}
details.ans>summary::before{content:"+";width:12px}
details.ans[open]>summary::before{content:"\2212"}
details.ans>summary .done-tag{color:var(--good)}
.ansbody{margin-top:10px;padding:4px 0 6px 18px;border-left:2px solid var(--accent);display:flex;flex-direction:column;gap:10px}
.final{font-weight:700}
.prov{font-family:var(--sans);font-size:13px;color:var(--faint)}
.prov.reasoned b{color:var(--warn);font-weight:600}
.rubric{display:flex;flex-direction:column;gap:5px;border-top:1px dashed var(--line);padding-top:10px}
.rubric label{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:8px;align-items:baseline;font-size:17.5px;cursor:pointer}
.rubric input{accent-color:var(--accent);margin:0;transform:translateY(2px)}
.rubric .p{font-family:var(--sans);font-size:13px;color:var(--faint);white-space:nowrap}
.rubric .tot{display:flex;justify-content:space-between;gap:8px;font-family:var(--sans);font-size:14px;font-weight:700}
.rubric .tot span{font-weight:400;color:var(--faint)}
.rubric .btn{align-self:flex-start}

.btn{font:600 14px var(--sans);padding:7px 14px;border-radius:3px;border:1px solid var(--line-strong);background:transparent;color:var(--ink);cursor:pointer;transition:background .15s,color .15s}
.btn:hover,.btn.on{background:var(--ink);color:var(--bg)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.btn.primary:hover{filter:brightness(1.1)}
.btn.small{padding:4px 10px;font-size:13px}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}

.cut{display:flex;align-items:center;gap:14px;padding:26px 0 8px;font-family:var(--sans);font-size:14px;font-weight:600;color:var(--accent)}
.cut::after{content:"";flex:1;border-top:1px solid var(--accent)}
.empty{padding:18px 0;color:var(--faint);font-style:italic}
.pilehead{font-weight:400;font-style:italic;font-size:32px;margin:56px 0 6px}
.history{font-family:var(--sans);font-size:14px;color:var(--faint);display:flex;flex-direction:column;gap:3px;margin-top:14px}
mjx-container{max-width:100%;overflow-x:auto;overflow-y:hidden}

dialog{border:1px solid var(--line-strong);background:var(--bg);color:var(--ink);padding:24px;max-width:440px;width:calc(100% - 32px)}
dialog::backdrop{background:rgba(0,0,0,.35)}
dialog h2{font-weight:400;font-style:italic;font-size:28px;margin:0 0 8px}
dialog p{color:var(--soft);margin-bottom:16px}
dialog .row{flex-direction:column;align-items:stretch}
</style>
</head>
<body>
<div class="top">
  <a class="brand" href="#top" id="brand">Exam Stack</a>
  <div class="tools">
    <span class="prog" id="barProg"></span>
    <details class="tocwrap" id="tocwrap">
      <summary>Contents</summary>
      <div class="tocpanel"><ol class="toc" id="toc"></ol></div>
    </details>
    <button class="linkbtn" type="button" id="restartBtn">Restart…</button>
    <button class="themebtn" type="button" id="themeBtn" aria-label="Switch to dark mode" title="Switch to dark mode">
      <svg class="moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      <svg class="sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
  </div>
</div>

<div class="page" id="top">
  <header>
    <h1>The exam stack</h1>
    <p class="lede" id="lede"></p>
    <section class="stats" aria-label="Progress">
      <div class="stat"><span class="v" id="sDone">0 / 0</span><span class="k">tasks done</span></div>
      <div class="stat"><span class="v" id="sRound">1</span><span class="k">round</span></div>
      <div class="stat"><span class="v" id="sTime">–</span><span class="k">left, roughly</span></div>
      <div class="stat"><span class="v" id="sExam">–</span><span class="k">until the exam</span></div>
    </section>
    <p class="save muted" id="saveNote">Progress is saved in this browser.</p>
    <details class="profile" id="profile" hidden>
      <summary>How this exam is graded</summary>
      <dl id="profDl"></dl>
    </details>
  </header>
  <div class="rule" aria-hidden="true"></div>

  <div class="stack" id="stack" aria-label="Task stack"></div>

  <h2 class="pilehead" id="pileH">Done this round</h2>
  <div class="stack" id="pile"></div>
  <div class="history" id="history"></div>
</div>

<button class="recipefab" type="button" id="recipeFab" hidden aria-controls="recipeSheet" aria-expanded="false">Recipe</button>
<div class="recipesheet" id="recipeSheet" role="dialog" aria-label="Recipe" hidden>
  <div class="recipe-head"><span class="note-label" id="sheetTitle">Recipe</span><button class="linkbtn" type="button" id="sheetClose">Close</button></div>
  <ol id="sheetList"></ol>
</div>

<dialog id="restartDlg" aria-labelledby="rdH">
  <h2 id="rdH">Start a new round?</h2>
  <p id="rdText">Your scores from this round are kept in the history. Nothing is deleted.</p>
  <div class="row">
    <button class="btn primary" type="button" id="rdAll">Restart every card</button>
    <button class="btn" type="button" id="rdWeak">Restart only cards under 70%</button>
    <button class="btn" type="button" id="rdCancel">Cancel</button>
  </div>
</dialog>

<!-- build.mjs replaces the placeholder below with the contents of stack.json -->
<script type="application/json" id="stack-data">/*__STACK__*/</script>
<script>
window.MathJax = { tex: { inlineMath: [["\\(","\\)"]], displayMath: [["\\[","\\]"]] }, svg: { fontCache: "global" }, startup: { typeset: false } };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js"></script>
<script>
(function(){
  let S = {};
  try { S = JSON.parse(document.getElementById("stack-data").textContent); } catch(e) { S = {}; }
  const C = S.course || {}, P = C.profile || null;
  const TASKS = S.tasks || [];
  const EX = S.exercises || {};
  const BUDGET = C.studyMinutes || 0;
  const EASE = {easy:"easy", med:"medium", hard:"hard"};
  const WEAK = 0.7;
  const byId = Object.fromEntries(TASKS.map(t => [t.id, t]));
  const rankOf = Object.fromEntries(TASKS.map((t, i) => [t.id, i + 1]));

  // ---------- state ----------
  // {v:2, round, status:{T1:"done"}, marks:{"T1|ex|a":{t:[0,2]} | {g:"got"|"again"}, open:{key:1}}, history:[{round, ended, done, score}]}
  const LS = "exam-stack-v2:" + (C.code || C.name || "course");
  let state = fresh();
  function fresh(){ return {v:2, round:1, status:{}, marks:{}, history:[]}; }
  function normalize(s){
    if (!s || typeof s !== "object") return fresh();
    return {v:2, round:s.round || 1, status:Object.assign({}, s.status), marks:Object.assign({}, s.marks), history:Array.isArray(s.history) ? s.history.slice() : []};
  }
  try { const s = JSON.parse(localStorage.getItem(LS) || "null"); if (s) state = normalize(s); } catch(e) {}
  let ref = null, saving = false, pending = false;
  function persist(){
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch(e) {}
    if (!ref) return;
    if (saving) { pending = true; return; }
    saving = true;
    ref.set(Object.assign({}, state, {updated: Date.now()}))
      .catch(() => setNote("Couldn't sync to your account right now; progress is kept in this browser."))
      .finally(() => { saving = false; if (pending) { pending = false; persist(); } });
  }
  function setNote(t){ const n = document.getElementById("saveNote"); if (n) n.textContent = t; }
  // Compare by content so a sync echo doesn't re-render and close open answers.
  function stable(o){ return JSON.stringify([o.round, sortObj(o.status), sortObj(o.marks), o.history]); }
  function sortObj(o){ return Object.keys(o || {}).sort().map(k => [k, o[k]]); }

  // ---------- scoring ----------
  const key = (t, x, p) => t.id + "|" + x.id + "|" + p.label;
  function partMax(p){ const it = p.rubric && p.rubric.items; return it && it.length ? it.reduce((s, i) => s + (+i.pts || 0), 0) : (+p.pts || 1); }
  function partScore(t, x, p){
    const m = state.marks[key(t, x, p)];
    if (!m) return null;
    const it = p.rubric && p.rubric.items;
    if (it && it.length) { if (!m.t) return null; return m.t.reduce((s, i) => s + (+(it[i] && it[i].pts) || 0), 0); }
    if (m.g === "got") return partMax(p);
    if (m.g === "again" || m.g === "blank") return 0;
    // with negative marking a wrong True/False or multiple-choice answer costs its points
    if (m.g === "wrong") return P && P.negativeMarking ? -partMax(p) : 0;
    return null;
  }
  function taskScore(t){
    let got = 0, max = 0, any = false;
    (EX[t.id] || []).forEach(x => (x.parts || []).forEach(p => { const s = partScore(t, x, p); if (s != null) { any = true; got += s; max += partMax(p); } }));
    return any && max ? got / max : null;
  }
  const pct = v => Math.round(v * 100) + "%";

  // ---------- helpers ----------
  function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function html(tag, cls, h){ const e = el(tag, cls); e.innerHTML = h; return e; }
  function typeset(node){
    // render() rebuilds the DOM, so a deferred typeset may hit a node that is gone; MathJax can't measure those.
    if (!node || !node.isConnected || !window.MathJax || !MathJax.typesetPromise) return;
    MathJax.typesetPromise([node]).catch(() => {});
  }
  const later = (n) => setTimeout(() => typeset(n), 0);
  function roughHours(m){ if (!m) return "done"; const h = m / 60; return h < 1 ? "< 1 h" : "≈ " + (Math.round(h * 2) / 2).toString().replace(".5", "½") + " h"; }
  const nextId = () => { const t = TASKS.find(t => state.status[t.id] !== "done"); return t ? t.id : null; };

  // ---------- static header ----------
  document.title = (C.code ? C.code + " · " : "") + "Exam Stack";
  document.getElementById("brand").textContent = (C.code || C.name || "Exam") + " Exam Stack";
  document.getElementById("lede").textContent = TASKS.length + " kinds of question that keep coming back on the past papers, in the order that earns the most points for your time. Each one has a recipe, what the graders give points for, and real exam questions with the answer right under every part.";
  if (P) {
    const dl = document.getElementById("profDl");
    const add = (k, v) => { if (v == null || v === "" || (Array.isArray(v) && !v.length)) return; dl.appendChild(el("dt", null, k)); const dd = el("dd"); if (Array.isArray(v)) { const ul = el("ul"); v.forEach(x => ul.appendChild(html("li", null, x))); dd.appendChild(ul); } else dd.innerHTML = v; dl.appendChild(dd); };
    add("Format", [P.duration, P.totalPoints != null ? P.totalPoints + " points" : null].filter(Boolean).join(", "));
    add("Allowed", P.aids);
    if (P.sections && P.sections.length) add("Sections", P.sections.map(s => s.name + (s.points != null ? " · " + s.points + " pts" : "") + (s.minimum != null ? " · <strong>minimum " + s.minimum + "</strong>" : "")));
    add("Wrong answers", P.negativeMarking);
    add("Choice", P.choice);
    add("Graders expect", P.rules);
    add("To pass", P.passRule);
    document.getElementById("profile").hidden = !dl.children.length;
  }

  // ---------- render ----------
  const open = new Set(), openAns = new Set();
  const RECIPES = "exam-stack-recipes";
  let recipesHidden = false;
  try { recipesHidden = localStorage.getItem(RECIPES) === "hidden"; } catch(e) {}
  function card(t, label, isNext){
    const done = state.status[t.id] === "done";
    const c = el("article", "card" + (isNext ? " next" : "") + (done ? " done" : ""));
    c.id = "card-" + t.id;
    const h = el("button", "head"); h.type = "button";
    h.setAttribute("aria-expanded", open.has(t.id) ? "true" : "false");
    h.appendChild(el("span", "num", label));
    const ttl = el("span", "ttl");
    ttl.appendChild(el("b", null, t.title));
    const meta = el("span", "meta");
    if (t.freq) meta.appendChild(el("span", "freq", "on " + t.freq + " papers"));
    if (t.pts) meta.appendChild(el("span", null, t.pts + " pts"));
    if (t.kind) meta.appendChild(el("span", null, t.kind.replace("-", "/")));
    if (t.ease) meta.appendChild(el("span", t.ease, EASE[t.ease] || t.ease));
    const sc = taskScore(t);
    if (sc != null) meta.appendChild(el("span", "score", "scored " + pct(sc)));
    ttl.appendChild(meta);
    h.appendChild(ttl);
    h.appendChild(el("span", "chev", open.has(t.id) ? "Close" : (isNext ? "Start" : "Open")));
    h.addEventListener("click", () => { open.has(t.id) ? open.delete(t.id) : open.add(t.id); render(); });
    c.appendChild(h);
    if (!open.has(t.id)) return c;

    // one column, in reading order: why → recipe → what graders reward → questions
    const b = el("div", "body");
    const lead = el("div", "lead");
    if (t.why) lead.appendChild(html("p", "why", t.why));
    const missing = (t.after || []).filter(id => byId[id] && state.status[id] !== "done");
    if (missing.length) {
      const n = el("p", "note");
      n.append("Builds on ");
      missing.forEach((id, i) => { if (i) n.append(", "); const a = el("a", null, "§" + rankOf[id] + " " + byId[id].title); a.href = "#card-" + id; a.addEventListener("click", () => { open.add(id); render(); }); n.appendChild(a); });
      n.append(". Do that first if it's new to you.");
      lead.appendChild(n);
    }
    if (lead.children.length) b.appendChild(lead);
    if (t.recipe && t.recipe.length) {
      // Hiding the recipe is one setting for every card, so a closed-book run can be practised without it.
      const r = el("div", "recipe" + (recipesHidden ? " hidden" : ""));
      const rh = el("div", "recipe-head");
      rh.appendChild(el("span", "note-label", "Recipe" + (t.ref ? " · cheat sheet " + t.ref : "")));
      const tg = el("button", "linkbtn", recipesHidden ? "Show recipe" : "Hide recipe"); tg.type = "button";
      tg.setAttribute("aria-expanded", recipesHidden ? "false" : "true");
      tg.addEventListener("click", () => { recipesHidden = !recipesHidden; try { localStorage.setItem(RECIPES, recipesHidden ? "hidden" : "shown"); } catch(e) {} render(); });
      rh.appendChild(tg);
      r.appendChild(rh);
      const ol = el("ol"); t.recipe.forEach(s => ol.appendChild(html("li", null, s))); r.appendChild(ol);
      b.appendChild(r);
    }
    if (t.graders && t.graders.length) {
      const g = el("div", "graders");
      g.appendChild(el("span", "note-label", "What graders reward"));
      const ul = el("ul"); t.graders.forEach(x => ul.appendChild(html("li", null, x))); g.appendChild(ul);
      b.appendChild(g);
    }

    const list = el("div", "problems");
    const exs = EX[t.id] || [];
    if (!exs.length) list.appendChild(el("p", "empty", "No past-exam question loaded for this task."));
    exs.forEach(x => list.appendChild(problem(t, x)));
    b.appendChild(list);

    const row = el("div", "row act");
    if (!done) {
      const m = el("button", "btn primary", "Mark done → move to the pile"); m.type = "button";
      m.addEventListener("click", () => { state.status[t.id] = "done"; open.delete(t.id); const nx = nextId(); if (nx) open.add(nx); persist(); render(); scrollTo(nx); });
      row.appendChild(m);
    } else {
      const u = el("button", "btn", "Put back on the stack"); u.type = "button";
      u.addEventListener("click", () => { delete state.status[t.id]; persist(); render(); });
      row.appendChild(u);
    }
    b.appendChild(row);
    c.appendChild(b);
    b.querySelectorAll(".why,.graders,.recipe,.intro,.q").forEach(later);
    return c;
  }

  function problem(t, x){
    const box = el("section", "problem");
    const src = el("div", "src");
    src.appendChild(el("span", null, [x.paper, x.q != null ? "Question " + x.q : null].filter(Boolean).join(" · ")));
    if (x.pts != null) src.appendChild(el("span", null, x.pts + " pts"));
    box.appendChild(src);
    if (x.intro) box.appendChild(html("div", "intro", x.intro));
    const parts = x.parts || [];
    parts.forEach(p => {
      const part = el("div", "part");
      const ql = el("div", "qline");
      if (parts.length > 1 || p.label) {
        const lab = el("span", "plabel", "(" + p.label + ")");
        if (p.pts != null) lab.appendChild(el("small", null, p.pts + " pt" + (p.pts == 1 ? "" : "s")));
        ql.appendChild(lab);
      } else ql.appendChild(el("span"));
      ql.appendChild(html("div", "q", p.question));
      part.appendChild(ql);
      part.appendChild(answer(t, x, p));
      box.appendChild(part);
    });
    return box;
  }

  function answer(t, x, p){
    const k = key(t, x, p);
    const d = el("details", "ans");
    const s = el("summary");
    s.append("Answer" + (p.label ? " (" + p.label + ")" : ""));
    const sc = partScore(t, x, p);
    if (sc != null) s.appendChild(el("span", "done-tag", "· " + sc + " / " + partMax(p)));
    d.appendChild(s);
    const body = el("div", "ansbody");
    if (p.answer) body.appendChild(html("p", "final", p.answer));
    if (p.solution) body.appendChild(html("div", "sol", p.solution));
    const PROV = {official:"from the official solution", recomputed:"numbers recomputed and checked", reasoned:"reasoned answer, not checkable by computation; read it critically"};
    if (p.verified) { const pv = el("p", "prov " + p.verified); pv.append("Source: "); pv.appendChild(el("b", null, PROV[p.verified] || p.verified)); body.appendChild(pv); }

    const it = p.rubric && p.rubric.items;
    if (it && it.length) {
      const r = el("div", "rubric");
      r.appendChild(el("span", "note-label", "Points are given for" + (p.rubric.source === "inferred" ? " (inferred, no official rubric)" : p.rubric.source === "official" ? " (official rubric)" : "")));
      const m = state.marks[k] || {};
      const ticked = new Set(m.t || []);
      it.forEach((item, i) => {
        const lab = el("label");
        const cb = el("input"); cb.type = "checkbox"; cb.checked = ticked.has(i);
        cb.addEventListener("change", () => {
          const cur = new Set((state.marks[k] && state.marks[k].t) || []);
          cb.checked ? cur.add(i) : cur.delete(i);
          state.marks[k] = {t: [...cur].sort((a, b) => a - b)};
          persist(); render();
        });
        lab.append(cb);
        lab.appendChild(html("span", null, item.text));
        lab.appendChild(el("span", "p", (+item.pts || 0) + " pt" + (item.pts == 1 ? "" : "s")));
        r.appendChild(lab);
      });
      const tot = el("div", "tot");
      tot.appendChild(el("span", null, "Tick what you actually wrote."));
      tot.append((sc != null ? sc : 0) + " / " + partMax(p));
      r.appendChild(tot);
      if (!m.t) {
        const z = el("button", "btn small", "I wrote none of these"); z.type = "button";
        z.addEventListener("click", () => { state.marks[k] = {t: []}; persist(); render(); });
        r.appendChild(z);
      }
      body.appendChild(r);
    } else {
      const row = el("div", "row");
      const m = state.marks[k] || {};
      const choice = ["true-false", "multiple-choice"].includes(t.kind);
      (choice ? [["got", "Right"], ["wrong", "Wrong"], ["blank", "Left blank"]] : [["got", "I got it"], ["again", "Not yet"]]).forEach(([v, txt]) => {
        const bt = el("button", "btn small" + (m.g === v ? " on" : ""), txt); bt.type = "button";
        bt.addEventListener("click", () => { state.marks[k] = {g: v}; persist(); render(); });
        row.appendChild(bt);
      });
      body.appendChild(row);
    }
    d.appendChild(body);
    if (openAns.has(k)) { d.open = true; later(body); }
    d.addEventListener("toggle", () => { if (d.open) { openAns.add(k); typeset(body); } else openAns.delete(k); });
    return d;
  }

  function render(){
    const stack = document.getElementById("stack"), pile = document.getElementById("pile"), toc = document.getElementById("toc");
    stack.textContent = ""; pile.textContent = ""; toc.textContent = "";
    const nx = nextId();
    let mins = 0, cut = false;
    TASKS.forEach(t => {
      const done = state.status[t.id] === "done";
      const li = el("li", (done ? "done" : "") + (t.id === nx ? " next" : ""));
      const a = el("a"); a.href = "#card-" + t.id;
      a.appendChild(el("span", "n", String(rankOf[t.id])));
      a.appendChild(el("span", "t", t.title));
      const sc = taskScore(t);
      a.appendChild(el("span", "s", done ? "✓" : (sc != null ? pct(sc) : "")));
      a.addEventListener("click", () => { open.add(t.id); document.getElementById("tocwrap").open = false; render(); });
      li.appendChild(a);
      if (done) { toc.appendChild(li); return; }
      if (BUDGET && !cut && mins + (t.min || 0) > BUDGET && mins > 0) {
        stack.appendChild(el("div", "cut", "Roughly " + roughHours(BUDGET).replace("≈ ", "") + " of work above this line"));
        const sep = el("li", "sep", "Beyond your time"); toc.appendChild(sep);
        cut = true;
      }
      mins += t.min || 0;
      toc.appendChild(li);
      stack.appendChild(card(t, String(rankOf[t.id]), t.id === nx));
    });
    if (!TASKS.some(t => state.status[t.id] !== "done")) stack.appendChild(el("div", "empty", "Stack cleared. Sit a full past paper under time pressure, or start a new round with Restart at the top."));
    const doneT = TASKS.filter(t => state.status[t.id] === "done");
    if (!doneT.length) pile.appendChild(el("div", "empty", "Cards you mark done land here. Open one any time to redo a question."));
    doneT.forEach(t => pile.appendChild(card(t, "✓", false)));

    const hist = document.getElementById("history"); hist.textContent = "";
    state.history.slice().reverse().forEach(h => hist.appendChild(el("span", null, "Round " + h.round + " · ended " + new Date(h.ended).toLocaleDateString() + " · " + h.done + " / " + TASKS.length + " cards done" + (h.score != null ? " · average " + pct(h.score) : ""))));

    const n = doneT.length, N = TASKS.length;
    document.getElementById("sDone").textContent = n + " / " + N;
    document.getElementById("barProg").textContent = n + " / " + N + " done · round " + state.round + " · " + roughHours(mins) + " left";
    document.getElementById("sRound").textContent = state.round;
    document.getElementById("sTime").textContent = roughHours(mins);
    updateFab();
  }

  function scrollTo(id){
    if (!id) return;
    const c = document.getElementById("card-" + id);
    if (c) c.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
  }

  // ---------- rounds ----------
  const dlg = document.getElementById("restartDlg");
  function restart(weakOnly){
    const scores = TASKS.map(taskScore).filter(v => v != null);
    state.history.push({round: state.round, ended: Date.now(), done: TASKS.filter(t => state.status[t.id] === "done").length, score: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null});
    const keep = {};
    if (weakOnly) TASKS.forEach(t => { const sc = taskScore(t); if (state.status[t.id] === "done" && sc != null && sc >= WEAK) keep[t.id] = "done"; });
    state.status = keep;
    // cards that stay done keep their scores; everything back on the stack starts clean
    state.marks = Object.fromEntries(Object.entries(state.marks).filter(([k]) => keep[k.split("|")[0]]));
    state.round += 1;
    open.clear(); openAns.clear();
    const nx = nextId(); if (nx) open.add(nx);
    persist(); render(); scrollTo(nx);
  }
  document.getElementById("restartBtn").addEventListener("click", () => { if (dlg.showModal) dlg.showModal(); else if (confirm("Start a new round with every card back on the stack?")) restart(false); });
  document.getElementById("rdAll").addEventListener("click", () => { dlg.close(); restart(false); });
  document.getElementById("rdWeak").addEventListener("click", () => { dlg.close(); restart(true); });
  document.getElementById("rdCancel").addEventListener("click", () => dlg.close());

  function examClock(){
    const t = document.getElementById("sExam");
    const exam = C.examStart ? new Date(C.examStart).getTime() : NaN;
    if (isNaN(exam)) { t.textContent = "–"; return; }
    const d = exam - Date.now();
    if (d <= 0) { t.textContent = "started"; return; }
    const hrs = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000);
    t.textContent = hrs >= 48 ? Math.floor(hrs / 24) + " days" : hrs + " h " + m + " min";
  }

  // ---------- light / dark ----------
  // Follows the system until the viewer picks one; the choice is remembered in this browser only.
  const THEME = "exam-stack-theme";
  const sysDark = matchMedia("(prefers-color-scheme: dark)");
  const themeBtn = document.getElementById("themeBtn");
  function applyTheme(){
    let pick = null;
    try { pick = localStorage.getItem(THEME); } catch(e) {}
    if (pick === "light" || pick === "dark") document.documentElement.dataset.theme = pick; else delete document.documentElement.dataset.theme;
    const dark = pick ? pick === "dark" : sysDark.matches;
    document.documentElement.classList.toggle("is-dark", dark);
    const label = dark ? "Switch to light mode" : "Switch to dark mode";
    themeBtn.setAttribute("aria-label", label); themeBtn.title = label;
  }
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.classList.contains("is-dark");
    try { localStorage.setItem(THEME, dark ? "light" : "dark"); } catch(e) {}
    if (!dark) document.documentElement.dataset.theme = "dark"; else document.documentElement.dataset.theme = "light";
    document.documentElement.classList.toggle("is-dark", !dark);
    const label = !dark ? "Switch to light mode" : "Switch to dark mode";
    themeBtn.setAttribute("aria-label", label); themeBtn.title = label;
  });
  sysDark.addEventListener ? sysDark.addEventListener("change", applyTheme) : sysDark.addListener(applyTheme);
  applyTheme();

  // ---------- recipe on narrow screens ----------
  // The floating button opens the recipe of the open card you're currently reading (the one under the middle of the screen).
  const fab = document.getElementById("recipeFab"), sheet = document.getElementById("recipeSheet");
  function openCardsWithRecipe(){ return TASKS.filter(t => open.has(t.id) && t.recipe && t.recipe.length && document.getElementById("card-" + t.id)); }
  function updateFab(){ fab.hidden = recipesHidden || !openCardsWithRecipe().length; if (fab.hidden) closeSheet(); }
  function currentCard(){
    const cards = openCardsWithRecipe();
    const mid = innerHeight / 2;
    let best = cards[0];
    for (const t of cards) { const r = document.getElementById("card-" + t.id).getBoundingClientRect(); if (r.top <= mid && r.bottom > 0) best = t; }
    return best;
  }
  function closeSheet(){ sheet.hidden = true; fab.setAttribute("aria-expanded", "false"); }
  fab.addEventListener("click", () => {
    if (!sheet.hidden) { closeSheet(); return; }
    const t = currentCard(); if (!t) return;
    document.getElementById("sheetTitle").textContent = "§" + rankOf[t.id] + " recipe" + (t.ref ? " · cheat sheet " + t.ref : "");
    const ol = document.getElementById("sheetList"); ol.textContent = "";
    t.recipe.forEach(s => ol.appendChild(html("li", null, s)));
    sheet.hidden = false; fab.setAttribute("aria-expanded", "true");
    typeset(sheet);
  });
  document.getElementById("sheetClose").addEventListener("click", closeSheet);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

  // the contents dropdown closes on a click outside it or on Escape
  const tw = document.getElementById("tocwrap");
  document.addEventListener("click", e => { if (tw.open && !tw.contains(e.target)) tw.open = false; });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && tw.open) { tw.open = false; tw.querySelector("summary").focus(); } });
  const first = nextId(); if (first) open.add(first);
  render(); examClock(); setInterval(examClock, 60000);
  if (window.MathJax && MathJax.startup && MathJax.startup.promise) MathJax.startup.promise.then(() => document.querySelectorAll(".why,.graders,.recipe,.intro,.q,.profile").forEach(typeset));

  // ---------- optional: sync across devices when hosted as a claude.ai Artifact with db + user ----------
  (async () => {
    if (!window.claude || !claude.use) return;
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    try { ref = db.doc("data/users/" + uid + "/stack"); } catch(e) { ref = null; return; }
    setNote("Progress syncs to your account, so it follows you between devices.");
    let firstSnap = true;
    ref.onSnapshot(snap => {
      if (snap.exists) {
        const remote = normalize(snap.data());
        if (firstSnap) {
          // merge anything done in this browser before sync started (same round only)
          const merged = remote.round === state.round ? normalize({round: remote.round, status: Object.assign({}, remote.status, state.status), marks: Object.assign({}, remote.marks, state.marks), history: remote.history.length >= state.history.length ? remote.history : state.history}) : (remote.round > state.round ? remote : state);
          const changed = stable(merged) !== stable(remote);
          state = merged; if (changed) persist(); render();
        } else if (stable(remote) !== stable(state)) {
          state = remote;
          try { localStorage.setItem(LS, JSON.stringify(state)); } catch(e) {}
          render();
        }
      } else if (firstSnap && (Object.keys(state.status).length || Object.keys(state.marks).length || state.history.length)) {
        persist();
      }
      firstSnap = false;
    }, () => { ref = null; setNote("Progress is saved in this browser."); });
  })();
})();
</script>
</body>
</html>
```
