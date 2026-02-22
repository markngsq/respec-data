# Respec — The Skill Tree

**Respec** is a curated skill tree for AI agents (Claude Code and compatible). Skills encode expert methodology, patterns, and domain knowledge that an AI agent can load on demand — turning a general-purpose assistant into a focused specialist.

This repository (`respec-data`) is the **master skill tree**. It contains the canonical set of skills, categories, tiers, molecules, and workflows that power the [Respec app](https://respec.app.tc1.airbase.sg).

---

## What's a Skill?

A skill is a `SKILL.md` file that gives an AI agent specialized instructions for a domain or task. When the agent encounters a matching task, it reads the skill and operates as an expert in that domain.

Skills aren't magic — they're structured knowledge. Well-written skills encode:
- The right mental model for a domain
- Proven patterns and anti-patterns
- Decision frameworks and decision trees
- Real-world gotchas and lessons learned

---

## The Skill Hierarchy

Skills are organized into four tiers (inspired by chemistry):

| Tier | Symbol | Description | Example |
|------|--------|-------------|---------|
| **Atom** | ⚛ | Single-purpose, does one thing well | `nextjs`, `sql-expert`, `playwright-skill` |
| **Molecule** | 🧬 | Composite — two or more atoms working together | `full-stack-ui` (nextjs + shadcn) |
| **Workflow** | ⚡ | Multi-phase execution pipeline | `feature-development` (scope → design → build → test → review) |
| **Meta** | ◎ | Orchestration — coordinates other skills | `skill-orchestrator`, `gastown` |

Atoms are the building blocks. Everything else is composition.

---

## Repository Layout

```
respec-data/
├── skills/              # The skill tree — one directory per skill
│   ├── nextjs/
│   │   └── SKILL.md
│   ├── senior-architect/
│   │   └── SKILL.md
│   └── ...
├── config/
│   ├── CLAUDE.md        # AI-facing architecture reference (read this if you're an agent)
│   ├── categories.json  # Skill categories with colors and grid positions
│   ├── tiers.json       # Tier definitions + skill tier assignments + molecules + workflows
│   ├── skill-summaries.json  # Curated one-line descriptions for the UI
│   ├── synergies.json   # Skill synergy relationships
│   └── loadouts/        # Curated goal-oriented skill bundles
│       ├── feature-development.json
│       ├── ai-app-development.json
│       └── skill-lifecycle.json
└── users/               # Per-user branches (managed by the app)
    ├── registry.json    # User registry
    ├── mark/            # Admin user data
    └── ...
```

---

## Categories

Skills are grouped into 20 categories:

`Orchestration` · `Discovery & Search` · `Reasoning & Analysis` · `Knowledge & Learning` · `Project Scoping` · `Documentation` · `AI / LLM Tooling` · `Database` · `Full-Stack Framework` · `Infrastructure` · `Data Science` · `Git Workflows` · `Architecture & Design` · `Testing & QA` · `Code Quality` · `Performance` · `Security` · `Advanced Customization` · `Maintenance` · `Development`

---

## Loadouts

A **loadout** is a curated skill bundle for a specific goal. Instead of picking skills individually, you pick a loadout and it assembles the right skill stack for your project type.

Loadouts have phases. Each phase has recommended skills (atoms or molecules). The Respec app's Guide wizard walks you through a loadout → generates a structured project plan.

Current loadouts:
- **Feature Development** — Scope → Design → Build → Test → Review
- **AI App Development** — Prompts → Build → Secure → Deploy
- **Skill Lifecycle** — Research → Create → Evaluate → Document

---

## How the Contributor Model Works

The skill tree is an open system. Users can customize their own skill branches and contribute improvements back.

```
Master Branch (this repo)
        │
        ├──▶ User forks / personal branches
        │         └── Users customize skills for their context
        │
        └──▶ Pull Requests
                  └── Admin reviews diff, curates best changes, merges to master
```

**For users:** Fork the repo (or use the app's branch system), customize skills in your branch, submit a PR when you've found something genuinely better.

**For admin:** Collect all open PRs, review the diffs as a unified review, cherry-pick the best improvements into master.

> The goal: a skill tree that gets sharper over time through collective real-world use, without individual users degrading each other's experience.

---

## Writing a Skill

Every skill is a directory containing at minimum a `SKILL.md`. Additional files (scripts, reference docs, templates) can live alongside it.

### Minimal structure

```
skills/my-skill/
└── SKILL.md
```

### `SKILL.md` structure

```markdown
# Skill Name

## When to Use This Skill
[One sentence trigger description — this is what the agent uses to decide whether to load it]

## Core Concepts
[The mental model. What does an expert in this domain know that others don't?]

## Patterns
[Proven approaches. Numbered list, concrete.]

## Anti-Patterns
[What not to do. Common mistakes. Gotchas.]

## Decision Framework
[When to use X vs Y. Decision trees. Trade-offs.]

## Examples
[Concrete, runnable examples where relevant.]

## Lessons Learned
[Real-world discoveries that should be encoded. Add to this over time.]
```

### Quality bar

A skill earns its place in the master tree by passing this check:
- Does it encode knowledge that a general-purpose AI *wouldn't* have without it?
- Is it based on real usage, not just documentation re-hash?
- Does it help the agent make better decisions, not just perform steps?

---

## Skill Summaries

`config/skill-summaries.json` holds curated one-liners for each skill — shown in the Respec UI's Skills table. These are human-written, not auto-generated. Keep them honest and specific.

Format: `"skill-id": "One sentence that tells a human what this skill actually does."`

---

## Synergies

`config/synergies.json` declares which skills work better together. These power the graph visualization and recommendation engine.

---

## Running Locally

This repository is the data backend for the Respec app. To run the full app locally:

```bash
# From the respec/ app repo
pnpm run dev --filter @respec/web
```

The app reads from this directory (filesystem mode) or from the GitHub repo via API (deployed mode, set via `RESPEC_REPO` env var).

---

## Deployed App

Live at: [https://respec.app.tc1.airbase.sg](https://respec.app.tc1.airbase.sg)

---

*Built for the Rapid Experimentation team. Maintained by Mark ([@markngsq](https://github.com/markngsq)).*
