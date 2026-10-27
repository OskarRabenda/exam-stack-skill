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
