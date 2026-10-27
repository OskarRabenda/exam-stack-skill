# exam-stack

An agent skill that turns a **large pool of past written exams** into a prioritized, interactive study page.

It counts which question types come back across the papers, ranks them by points for the time they take, and builds a page with:
- **How this exam is graded:** sections and minimums, negative marking, choice questions, allowed aids
- one **card per recurring question type**, with why it's ranked there, **what graders reward**, and a step-by-step recipe (matched to your cheat sheet if you have one)
- **real past-exam questions where every part has its answer directly under it.** A block of 16 True/False statements gets 16 answers, each right under its statement
- a **rubric checklist** per answer: tick what you actually wrote and see your score, with each rubric marked official or inferred, and each answer marked official, recomputed or reasoned
- a **done pile** (nothing is ever deleted) and **Restart the stack** for a second round, either every card or only the ones you scored under 70%, with past rounds kept in a history

The look is a single reading column, like a well-typeset course reader in Crimson Pro. Each card reads top to bottom: why it matters, what graders reward, then the questions. The one exception is the recipe: it sits beside the questions and stays on screen while you scroll (on a phone, a floating **Recipe** button brings it up), and a **Hide recipe** switch removes it for closed-book practice. "How this exam is graded" stays folded until you open it, and a sun/moon button switches light and dark mode.

## Use it in Claude or ChatGPT (no install)

Start a new chat on claude.ai or chatgpt.com, attach your past exams (and solutions if you have them), and paste:

```
Use the "exam-stack" skill. Read its instructions and follow them step by step:
https://raw.githubusercontent.com/OskarRabenda/exam-stack-skill/main/skills/exam-stack/SKILL.md

My course: [course name]
Exam date and time: [date, time]
Study time I have: [about N hours]
My past exams are attached.
If you can't open that link, don't guess: tell me, and I'll attach the file instead.
```

Answer its questions, then open the page it gives you.

**If your AI says it can't open the link:** open [exam-stack-all-in-one.md](https://raw.githubusercontent.com/OskarRabenda/exam-stack-skill/main/exam-stack-all-in-one.md) in your browser, press **Ctrl+S** (Mac: **Cmd+S**) to save it, attach the saved file to the same chat, and write: *"Here is the file. Follow it."* That one file holds the instructions and the page template.

## Install (Claude Code and other coding agents)

```bash
npx skills add OskarRabenda/exam-stack-skill
```

## Use

Point your agent at a folder of past papers (ideally with solutions or rubrics, lecture notes and your cheat sheet):

> My Algebra exam is on Monday at 9 and I have about 5 hours. The last 6 years of exams and their solutions are in `~/courses/algebra/exams`. Build me an exam stack.

The skill is meant for written exams with at least ~4 past papers. With fewer, it tells you the ranking would be guesswork instead of pretending.

## What's inside

```
skills/exam-stack/
├── SKILL.md                         # the workflow: gate → profile → tally → cards → exercises → build → report
├── references/
│   ├── exam-profile.md              # what to extract from cover pages and how it changes the ranking
│   ├── frequency-research.md        # the tally format and how to turn counts into an order
│   ├── grading.md                   # rubrics, "what graders reward", answer sources
│   └── stack-json.md                # the data format of the page
├── scripts/
│   ├── tally.mjs                    # tally.csv → frequency ranking (deterministic counting)
│   ├── bundle.mjs                   # rebuilds exam-stack-all-in-one.md for chats that can't open links
│   └── build.mjs                    # validates stack.json, inlines images, builds the page (Node 18+)
└── assets/
    ├── template.html                # the study page
    ├── example-stack.json           # buildable example (invented questions)
    ├── example-tally.csv            # example tally
    └── figures/unit-square.svg      # example figure
```

Try the examples:

```bash
node skills/exam-stack/scripts/tally.mjs skills/exam-stack/assets/example-tally.csv
node skills/exam-stack/scripts/build.mjs skills/exam-stack/assets/example-stack.json demo.html
```

## Notes

- The page is a single HTML file. It works opened locally (progress saved in the browser) or hosted. Hosted as a claude.ai Artifact with per-user storage, progress syncs across devices.
- Exercises come only from real past exams that **you** provide. Respect your course's rules on sharing exam material: keep the generated page private unless you're allowed to share it.

MIT License.
