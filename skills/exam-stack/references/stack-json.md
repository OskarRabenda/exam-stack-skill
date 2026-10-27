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
