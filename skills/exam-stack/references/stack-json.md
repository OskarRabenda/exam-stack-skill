# stack.json format

One file holds everything the page shows. `scripts/build.mjs` validates it and embeds it in `assets/template.html`. A complete, buildable example is in `assets/example-stack.json`.

```json
{
  "course": {
    "code": "MATH101",
    "name": "Linear Algebra",
    "examLabel": "Fri 12 Jun · 13:30",
    "examStart": "2026-06-12T13:30:00+02:00",
    "studyMinutes": 240
  },
  "tasks": [
    {
      "id": "T1",
      "title": "Determinant of a 3×3 matrix",
      "freq": "5/5",
      "pts": "3–4",
      "ease": "easy",
      "min": 15,
      "why": "On every paper and pure routine: cofactor expansion along the row with the most zeros.",
      "ref": "S2",
      "recipe": [
        "Pick the row or column with the most zeros.",
        "Expand: \\(\\det A=\\sum_j (-1)^{i+j}a_{ij}M_{ij}\\).",
        "Check the sign pattern \\(+,-,+\\) before adding."
      ]
    }
  ],
  "exercises": {
    "T1": [
      {
        "paper": "Exam 2024",
        "q": "2a",
        "pts": 4,
        "question": "<p>Compute \\(\\det\\begin{pmatrix}1&2&0\\\\0&1&3\\\\2&0&1\\end{pmatrix}\\).</p>",
        "solution": "<ol><li>Expand along row 1: …</li></ol><p><em>Rubric (4):</em> 2 for the expansion, 2 for the value.</p>"
      }
    ]
  }
}
```

## Fields

### `course`
| Field | Required | Meaning |
|---|---|---|
| `code`, `name` | at least one | Shown in the header. `code` also keys the browser's saved progress, so keep it stable |
| `examLabel` | no | Free text after the course name, e.g. "Mon 26 Oct · 09:00" |
| `examStart` | no | ISO date-time with a timezone offset. Drives the "Until the exam" countdown |
| `studyMinutes` | no | The student's time budget. The page draws the cut line where cumulative `min` passes it |

### `tasks[]`, in stack order (the array order is the rank)
| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable id like `T1`. Saved progress is keyed by it, so never renumber after the student has started |
| `title` | yes | The question type, phrased the way a student recognizes it on the paper |
| `freq` | no | Papers it appeared on, e.g. `"6/6"` |
| `pts` | no | Typical points, e.g. `"8–13"` |
| `ease` | no | `easy`, `med` or `hard` |
| `min` | no | Minutes to learn the recipe plus do one exercise. Feeds the time stats and the cut line |
| `why` | no | One sentence: why this card is at this rank. HTML and math allowed |
| `ref` | no | Cheat-sheet label the recipe was copied from. Shown as "Recipe · cheat sheet <ref>" |
| `recipe` | no (warned) | Array of step strings. HTML and math allowed |

### `exercises`, keyed by task id
Each value is an array, newest paper first:

| Field | Required | Meaning |
|---|---|---|
| `paper` | yes (warned) | Which exam, e.g. `"Exam 2023"`, `"Resit 2019"` |
| `q` | no | The paper's own question number, e.g. `"5a + 5b"` |
| `pts` | no | Points on the paper |
| `question` | yes | HTML. Transcribe faithfully, including hints and given tables |
| `solution` | yes | HTML. Step-by-step, ends with the rubric / point split |

Progress per exercise is keyed by its **position** (`T1-0`, `T1-1`, …). If you insert exercises after the student has started, append them at the end so earlier marks stay attached to the right question.

## Writing content

- **Math:** `\( … \)` inline and `\[ … \]` display, rendered by MathJax 3. In JSON, every backslash is doubled (`\\(`, `\\frac`). You can write `<` inside math freely: the build escapes it.
- **HTML:** `<p>`, `<ol>/<ul>/<li>`, `<table>`, `<strong>`, `<em>`, `<br>` all render. Don't use scripts or inline event handlers.
- **Tables** inside questions (e.g. given powers or values) render with light row rules. Use `<th>` for the header row.
- Keep `title` short (one line on a phone). Put detail in `why` and the recipe.
