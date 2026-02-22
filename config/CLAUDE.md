# Respec — AI Agent Reference

This document is the authoritative reference for AI agents operating within the Respec skill tree. Read this when you need to understand what Respec is, how its data model works, how skills are structured, and what your responsibilities are as a contributing agent.

---

## What Is Respec

Respec is a **skill tree system for AI agents**. It encodes expert knowledge into structured `SKILL.md` files that agents load on demand to operate as domain specialists. The skill tree is the content layer; the Respec web app (`respec/` repo) is the interface that surfaces it to humans.

Two repositories:
- **`respec-data/`** — the skill tree data (this repo). Skills, config, loadouts, user branches.
- **`respec/`** — the Next.js application. Project cockpit, guide, tracker, skill browser.

As an agent, you interact primarily with `respec-data/`.

---

## Architecture: How Skills Are Loaded

Skills in `respec-data/skills/` are registered with the host runtime (OpenClaw) via `skills.load.extraDirs` in `openclaw.json`. The runtime injects all skill `<description>` entries into `<available_skills>` in your system prompt. When a task matches a skill's description, you **read its `SKILL.md`** before proceeding.

**Load order (priority, highest first):**
1. User's global skills (`~/.openclaw/workspace/skills/`)
2. Respec master skill tree (`respec-data/skills/`)
3. Built-in runtime skills (node_modules)

User skills are never overridden by the master tree. A user's local version of a skill always takes precedence.

**Skill loading rule:** Read exactly one skill per task — the most specific match. Never speculatively load multiple skills. Load only when a task genuinely matches.

---

## The Skill Hierarchy

```
META       ◎   Orchestration — coordinates other skills
WORKFLOW   ⚡   Multi-phase pipeline — ordered execution stages
MOLECULE   🧬   Composite — two or more atoms combined
ATOM       ⚛   Single-purpose — one domain, one job
```

Atoms are the unit of composition. Everything above is defined in `config/tiers.json`.

**Tier assignments** live in `tiers.json → skillTiers`. Molecules are defined as `atoms[]` arrays. Workflows are defined as ordered `phases[]`.

---

## The Contributor Model

The skill tree improves through collective use. Here's how changes flow:

```
Master Branch
     │
     ├── User A's branch (users/alice/)
     │       └── Customizes skills for her context
     │               └── PR to master when she finds something better
     │
     ├── User B's branch (users/mark/)
     │       └── Customizes skills for his context
     │               └── PR to master
     │
     └── Admin review pass
               └── Reads all PRs as unified diff
                       └── Curates + merges best changes to master
```

**As an agent:**
- When you discover a better pattern during a task, add it to the relevant skill's `## Lessons Learned` section
- When you author a new skill, follow the structure spec below
- Commit and push to the data repo: `cd respec-data && git add -A && git commit -m "learn: <skill> — <lesson>" && git push`
- Don't push noise — only real discoveries that generalize beyond the current task

**As the admin agent (operating in M's context):**
- Review open PRs from user branches periodically
- Evaluate each diff against the quality criteria in `CONTRIBUTING.md`
- Cherry-pick improvements worth promoting to master
- Keep the master tree sharp — reject changes that degrade precision

---

## Data Model

### Skills — `skills/{id}/SKILL.md`

Every skill is a directory with a `SKILL.md` at minimum. Additional files (scripts, templates, reference docs) can accompany it.

**Required `SKILL.md` structure:**
```markdown
# Skill Name

## When to Use This Skill
[Trigger description — determines when agent loads this skill]

## Core Concepts
[Mental model. What does an expert know that a generalist doesn't?]

## Patterns
[Numbered, concrete. Proven approaches only.]

## Anti-Patterns
[What not to do. Common mistakes. Gotchas.]

## Decision Framework
[X vs Y decisions. Trade-off tables. When to escalate.]

## Lessons Learned
[Real discoveries from actual use. Append, never delete.]
```

The `## When to Use This Skill` section is the routing key. Make it specific enough to avoid false positives. Too broad = skill loads on unrelated tasks and wastes context.

### Config Files

| File | Purpose |
|------|---------|
| `config/categories.json` | Skill categories with UI colors and grid positions |
| `config/tiers.json` | Tier definitions, skill tier assignments, molecules, workflows |
| `config/skill-summaries.json` | Human-readable one-liners for the skills table UI |
| `config/synergies.json` | Skill synergy relationships for graph visualization |
| `config/loadouts/*.json` | Goal-oriented skill bundles with interview questions |
| `config/admins.json` | Admin user IDs |

### User Data — `users/{id}/`

Each user has an isolated branch in the data repo. User branches contain:
- Customized skill versions
- Personal plan data (`.claude/respec/plan.json`)
- User-specific config overrides

The app's `GitHubDataSource` reads from the user's branch, defaulting to master for files not overridden.

### Loadout Templates — `config/loadouts/*.json`

Loadouts are the entry point for the Guide wizard. Structure:
```json
{
  "id": "loadout-id",
  "name": "Human Name",
  "description": "What kind of project this loadout is for",
  "phases": [...],
  "interview": [...],
  "rules": {...}
}
```

Phases reference atoms and molecules. Interview questions gather project-specific context. Rules govern plan generation.

---

## Plan Sync Contract

The bridge between Respec and Claude Code is `.claude/respec/plan.json`.

**Respec writes:**
- Plan structure (id, title, loadout, phases, steps, tasks)
- Team lanes (member IDs, avatars)
- Loadout and interview answers

**Claude writes:**
- Step status (`pending` | `active` | `done` | `blocked`)
- Task status and assignments
- Notes and audit events
- Member focus and session status

Advisory locking via `.claude/respec/plan.lock` (5 second stale timeout). Check for lock before writing.

**CLI for plan updates:**
```bash
node scripts/respec-plan-status.mjs [project-dir]
node scripts/respec-plan-update.mjs step-status <step-id> <status>
node scripts/respec-plan-update.mjs task-add <title> [--step <step-id>]
node scripts/respec-plan-update.mjs task-status <task-id> <status>
node scripts/respec-plan-update.mjs member-focus <member-id> <focus>
node scripts/respec-plan-update.mjs member-status <member-id> <status>
```

---

## Skills Quick Reference

### Orchestration (use these to coordinate)
- **skill-orchestrator** `meta` — analyze task → create execution plan → coordinate skills
- **gastown** `meta` — multi-agent lifecycle, convoys, crash recovery

### Discovery
- **skills-discovery** `atom` — search registry for skills you don't have yet

### Reasoning
- **thought-based-reasoning** `atom` — CoT, ToT, ReAct, Self-Consistency, Reflexion

### Knowledge
- **system-learn** `atom` — ingest discoveries into vector DB as reusable procedural memory
- **brain-dump-assistant** `atom` — personal knowledge capture and todo management

### Project Scoping
- **project-interview** `atom` — structured spec interviews → SPEC.md
- **product-manager-toolkit** `atom` — RICE, PRDs, discovery, go-to-market

### Documentation
- **docs-management** `atom` — search, index, and manage Claude official docs
- **rustie-docs** `atom` — audit, fix, and maintain documentation
- **smart-docs** `atom` — AI-powered codebase documentation generator

### AI / LLM
- **senior-prompt-engineer** `atom` — prompt patterns, few-shot, RAG, agent design
- **llm-app-patterns** `atom` — production RAG, agent architecture, LLMOps
- **llm-security** `atom` — OWASP Top 10 for LLM 2025, prompt injection, RAG hardening

### Database
- **sql-expert** `atom` — SQL queries, optimization, schema design (PG/MySQL/SQLite/MSSQL)
- **prisma** `atom` — Prisma ORM queries, mutations, relations, transactions, schema

### Full-Stack Framework
- **nextjs** `atom` — Next.js 15+ App Router: Server Components, Server Actions, route handlers
- **shadcn** `atom` — shadcn/ui components with Radix UI + Tailwind CSS

### Infrastructure
- **docker-containerization** `atom` — Dockerfiles, multi-stage builds, compose, K8s, ECS, Cloud Run

### Data Science
- **senior-data-scientist** `atom` — A/B testing, experiment design, causal inference, Python/R

### Git
- **git-advanced-workflows** `atom` — rebase, cherry-pick, bisect, worktrees, reflog

### Architecture
- **architecture-patterns** `atom` — Clean/Hexagonal/DDD patterns for complex backends
- **senior-architect** `atom` — system design, ADRs, C4 diagrams, tech stack decisions

### Testing & QA
- **playwright-skill** `atom` — browser automation, E2E tests, responsive design validation
- **senior-qa** `atom` — QA strategy, test coverage, testing plans
- **javascript-testing-patterns** `atom` — Jest/Vitest/Testing Library, TDD/BDD

### Code Quality
- **code-reviewer** `atom` — automated code review, security scan, review checklists
- **code-refactor** `atom` — bulk rename, replace patterns, update APIs across files

### Performance
- **vercel-react-best-practices** `atom` — React/Next.js bundle optimization, data fetching patterns
- **modern-javascript-patterns** `atom` — ES6+ mastery, async/await, functional patterns

### Security
- **software-security** `atom` — OWASP Top 10, secure-by-default, vulnerability scanning

### Customization
- **skill-from-masters** `atom` — discover expert methodologies before creating new skills
- **Hook Development** `atom` — PreToolUse/PostToolUse/Stop hooks, event-driven automation
- **mcp-builder** `atom` — build MCP servers for external service integration
- **skill-composer-studio** `atom` — chain skills into composite workflows
- **skill-evaluator** `atom` — evaluate skill quality, security, compliance before installing/publishing
- **slash-command-factory** `atom` — generate custom slash commands

### Maintenance
- **nightly** `atom` — end-of-day cleanup, Sleep Score, session state capture
- **cc-plugin-expert** `atom` — Claude Code plugin development, configuration, troubleshooting

---

## Decision Tree

```
New Task Arrives
│
├─ Complex / needs planning? ──────────────────▶ skill-orchestrator
├─ Multi-agent coordination? ──────────────────▶ gastown
├─ Starting a new project? ────────────────────▶ project-interview
├─ Product discovery / prioritization? ────────▶ product-manager-toolkit
├─ Need a skill that isn't in the tree? ───────▶ skills-discovery
├─ Complex reasoning / logic chain? ───────────▶ thought-based-reasoning
├─ Learned something worth keeping? ───────────▶ system-learn
│
├─ AI / LLM WORK
│   ├─ Prompt optimization / few-shot? ────────▶ senior-prompt-engineer
│   ├─ Building LLM application? ──────────────▶ llm-app-patterns
│   └─ AI security / prompt injection? ────────▶ llm-security
│
├─ DATABASE
│   ├─ SQL query / schema / optimization? ─────▶ sql-expert
│   └─ Prisma ORM operations? ─────────────────▶ prisma
│
├─ FULL-STACK FRAMEWORK
│   ├─ Next.js pages / routes / actions? ──────▶ nextjs
│   └─ UI components (shadcn/ui)? ─────────────▶ shadcn
│
├─ INFRASTRUCTURE
│   └─ Docker / containerization? ────────────▶ docker-containerization
│
├─ ARCHITECTURE
│   ├─ Clean/Hex/DDD patterns? ────────────────▶ architecture-patterns
│   └─ System design / ADR / diagrams? ────────▶ senior-architect
│
├─ TESTING
│   ├─ Browser / E2E / automation? ────────────▶ playwright-skill
│   ├─ QA strategy / test planning? ───────────▶ senior-qa
│   └─ Unit / integration tests (JS/TS)? ──────▶ javascript-testing-patterns
│
├─ CODE QUALITY
│   ├─ Code review / PR analysis? ─────────────▶ code-reviewer
│   └─ Bulk rename / pattern replace? ─────────▶ code-refactor
│
├─ PERFORMANCE
│   ├─ React / Next.js optimization? ──────────▶ vercel-react-best-practices
│   └─ Modern JS / ES6+ patterns? ─────────────▶ modern-javascript-patterns
│
├─ SECURITY
│   └─ OWASP / secure coding? ─────────────────▶ software-security
│
├─ DOCUMENTATION
│   ├─ Manage / search docs? ──────────────────▶ docs-management
│   ├─ Audit / fix docs? ──────────────────────▶ rustie-docs
│   └─ Document a codebase? ───────────────────▶ smart-docs
│
├─ CUSTOMIZATION
│   ├─ Creating a new skill? ──────────────────▶ skill-from-masters → slash-command-factory
│   ├─ Evaluating a skill? ─────────────────────▶ skill-evaluator
│   ├─ Event-driven hooks? ─────────────────────▶ Hook Development
│   ├─ External service integration? ──────────▶ mcp-builder
│   └─ Chaining skills into workflow? ─────────▶ skill-composer-studio
│
└─ End of work day? ──────────────────────────▶ nightly
```

---

## Molecules (Composed Skill Sets)

| Molecule | Atoms | Purpose |
|----------|-------|---------|
| **full-stack-ui** | nextjs + shadcn | App Router with component library |
| **database-layer** | sql-expert + prisma | Full database management |
| **testing-suite** | senior-qa + javascript-testing-patterns + playwright-skill | Comprehensive QA |
| **security-coverage** | software-security + llm-security | Full security coverage |
| **ai-engineering** | senior-prompt-engineer + llm-app-patterns | Prompt → production |
| **system-design** | architecture-patterns + senior-architect | Architecture decisions |
| **code-quality-pipeline** | code-reviewer + code-refactor | Review → fix |
| **product-scoping** | project-interview + product-manager-toolkit | Spec → strategy |
| **skill-creation** | skill-from-masters + slash-command-factory + skill-evaluator | Research → create → validate |
| **documentation-suite** | docs-management + rustie-docs + smart-docs | Full docs lifecycle |

---

## Best Practices for Agents

1. **Read one skill, read it fully.** Don't skim. The instructions are there because they matter.

2. **Prefer specificity over coverage.** One well-chosen skill beats loading three broadly-matching ones.

3. **Lessons Learned is append-only.** When you discover something real, add it. Never remove or rewrite existing lessons — they're a record of what the tree has learned.

4. **Push discoveries back.** After a significant task, ask: did I learn something that generalizes? If yes, commit it to the skill. The tree should be smarter after every use.

5. **Don't over-trigger.** If the task doesn't clearly match a skill's "When to Use" description, don't load it. Unnecessary skill loading burns context.

6. **The plan.json contract is sacred.** Write to it carefully. Bad writes corrupt the tracker view for the human. Use the lock file. Don't write partial JSON.

---

*Last updated: 2026-02-22*
*Skills: 39 | Molecules: 10 | Workflows: 3*
