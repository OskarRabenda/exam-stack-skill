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
