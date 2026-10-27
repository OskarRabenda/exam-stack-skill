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
