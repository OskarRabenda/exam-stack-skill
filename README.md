# exam-stack

An agent skill that turns a course's past exams into a **prioritized, interactive study page**.

It counts which question types come back on every paper, ranks them by points per hour of study, and gives each one:
- a short step-by-step solving recipe (matched to your cheat sheet, if you have one)
- real past-exam questions with verified, worked solutions and the point split
- "I got it right" / "Not yet" buttons, a "done" pile (cards are never deleted), and saved progress

A line in the list shows how far your remaining study time will get you, and at the end you get an expected-score estimate.

## Install

```bash
npx skills add OskarRabenda/exam-stack-skill
```

## Use

Point your agent at a folder with past exams (and ideally solutions, lecture notes and your cheat sheet) and say something like:

> I have the Algebra exam on Monday at 9 and about 5 hours to study. My past papers are in `~/courses/algebra/exams`. Build me an exam stack.

## What's inside

```
skills/exam-stack/
├── SKILL.md                         # the workflow
├── references/
│   ├── frequency-research.md        # how to count what recurs
│   └── stack-json.md                # data format for the page
├── scripts/build.mjs                # validates stack.json and builds the page (Node 18+)
└── assets/
    ├── template.html                # the study page
    └── example-stack.json           # small buildable example (invented questions)
```

Try the example:

```bash
node skills/exam-stack/scripts/build.mjs skills/exam-stack/assets/example-stack.json demo.html
```

## Notes

- The page is a single HTML file. It works opened locally (progress saved in the browser) or hosted. When it's hosted as a claude.ai Artifact with per-user storage, progress syncs across devices.
- Exercises come only from real past exams that **you** provide. Respect your course's rules on sharing exam material: keep the generated page private unless you're allowed to share it.

MIT License.
