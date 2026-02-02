# Claude Skills Configuration

## Overview

This configuration uses a **layered skills architecture** with orchestrators coordinating specialized skills for optimal token efficiency and task execution.

## Architecture

```
ORCHESTRATION LAYER (Central Brain)
├── skill-orchestrator      # Primary: Analyzes tasks → creates execution plans
└── gastown                 # Advanced: Multi-agent lifecycle management

CAPABILITIES LAYER
├── Discovery & Search
│   └── skills-discovery        # Find/install skills from registry
├── Reasoning & Analysis
│   └── thought-based-reasoning # Chain-of-Thought, Tree of Thoughts, ReAct, etc.
├── Knowledge & Learning
│   ├── system-learn           # Ingest procedural memory into vector DB
│   └── brain-dump-assistant   # Personal knowledge capture system
├── Project Scoping & Interviews
│   ├── product-manager-toolkit # RICE, interviews, PRDs, discovery
│   └── project-interview      # Technical spec interviews → SPEC.md
├── Documentation
│   ├── docs-management         # Search, index, and manage docs
│   ├── rustie-docs            # Audit, create, maintain docs
│   └── smart-docs             # AI-powered codebase documentation
├── Development
│   └── cc-plugin-expert       # Claude Code plugin development
├── AI / LLM Tooling
│   ├── senior-prompt-engineer   # Prompt patterns, RAG, agent design, 550⭐
│   ├── llm-app-patterns         # Production RAG, agents, LLMOps, 348⭐
│   └── llm-security             # OWASP Top 10 for LLM (Semgrep), 4⭐
├── Database
│   ├── sql-expert               # SQL queries, optimization, schema design, 54 installs
│   └── prisma                   # Prisma ORM: queries, mutations, relations, schema, 57⭐
├── Git Workflows
│   └── git-advanced-workflows   # Rebase, cherry-pick, bisect, worktrees, 21K⭐
├── Full-Stack Framework
│   ├── nextjs                         # App Router, Server Components, Server Actions, 57⭐
│   └── shadcn                         # shadcn/ui components, Radix UI, Tailwind CSS, 57⭐
├── Infrastructure
│   └── docker-containerization        # Multi-stage builds, K8s, ECS, Cloud Run, 276⭐
├── Data Science & Experimentation
│   └── senior-data-scientist          # A/B testing, experiment design, causal inference, 744⭐
├── Core Engineering (TypeScript/JavaScript Focus)
│   ├── Architecture & Design
│   │   ├── architecture-patterns      # Clean/Hexagonal/DDD, 25K⭐
│   │   └── senior-architect          # System design for React/Next/Node, 752⭐
│   ├── Testing & QA
│   │   ├── playwright-skill          # Browser automation & E2E, 1.3K⭐
│   │   ├── senior-qa                 # Comprehensive QA for React/Next/Node, 755⭐
│   │   └── javascript-testing-patterns # Jest/Vitest/Testing Library, 20K⭐
│   ├── Code Quality & Refactoring
│   │   ├── code-reviewer             # Comprehensive code review, 757⭐
│   │   └── code-refactor             # Bulk refactoring operations, 224⭐
│   ├── Performance & Best Practices
│   │   ├── vercel-react-best-practices # React/Next.js optimization, 9.6K⭐
│   │   └── modern-javascript-patterns # ES6+ mastery, 21K⭐
│   └── Security
│       └── software-security         # OWASP Top 10, secure coding, 368⭐
├── Advanced Customization
│   ├── skill-from-masters      # Discover expert methodologies before creating skills
│   ├── Hook Development        # Create event-driven hooks (official)
│   ├── mcp-builder            # Build MCP servers for external integrations (official)
│   ├── skill-composer-studio  # Chain multiple skills into custom workflows
│   ├── skill-evaluator        # Evaluate skill quality and security
│   └── slash-command-factory  # Generate custom slash commands
└── Maintenance
    └── nightly                # End-of-day cleanup routine
```

## Usage Patterns

### For Complex Tasks
Let the orchestrator handle it:
```
"Use skill-orchestrator to [your complex task]"
```

The orchestrator will:
1. Analyze available skills
2. Create execution plan
3. Coordinate between skills
4. Execute in manual or delegated mode

### For Specific Skills
Invoke directly:
```
/skills-discovery [search query]
/rustie-docs
/nightly
/thought-based-reasoning
```

### For Multi-Agent Work
```
"Use gastown to coordinate [multi-step task]"
```

Gastown handles:
- Multi-agent orchestration
- Lifecycle management
- Crash recovery
- Workspace setup

## Skill Descriptions

### Orchestration

**skill-orchestrator**
- Analyzes programming tasks
- Creates execution plans using available skills
- Supports manual (Claude executes) or delegated (sub-agents) modes
- Use for: Any non-trivial coding task

**gastown**
- Multi-agent orchestrator for Claude Code
- Manages agent lifecycle, crash recovery
- Handles installation, workspace setup, work tracking
- Use for: Complex multi-agent scenarios

### Discovery

**skills-discovery**
- Searches claude-plugins.dev registry
- Installs skills via skills-installer
- Use before starting work: "Does a skill exist for this?"
- Triggers: Technology-specific tasks, specialized domains

### Reasoning

**thought-based-reasoning**
- Comprehensive reasoning techniques:
  - Chain-of-Thought (Zero-shot CoT)
  - Self-Consistency
  - Tree of Thoughts
  - Least-to-Most prompting
  - ReAct (Reasoning + Acting)
  - PAL (Program-Aided Language)
  - Reflexion
- Use for: Complex logic, multi-step problems, symbolic manipulation

### Knowledge & Learning

**system-learn**
- Ingests new procedural memory (skills, patterns, docs) into vector database
- Codifies learnings as reusable knowledge
- Builds institutional memory
- Use when: Converting discoveries into permanent knowledge

**brain-dump-assistant**
- Personal knowledge capture system
- Captures ideas, tracks todos, organizes projects
- Provides daily review and focus recommendations
- Use when: "capture this", "brain dump", "what's on my plate", "daily review"
- Triggers: Quick knowledge capture during work sessions

### Project Scoping & Interviews

**product-manager-toolkit**
- RICE prioritization framework
- Customer interview analysis
- PRD templates and discovery frameworks
- Go-to-market strategies
- Use for: Feature prioritization, user research synthesis, requirement documentation
- Comprehensive PM workflow from interviews to PRDs

**project-interview**
- Conducts structured specification interviews
- Clarifies architecture, tech stack, requirements
- Creates SPEC.md with complete project specification
- Use when: Starting new projects, planning architecture, gathering requirements
- Triggers: "interview me", "create spec", "define project"

### Documentation

**docs-management**
- Single source of truth for Claude official documentation
- Local storage, scraping, discovery, resolution
- Keyword search, natural language queries
- Index maintenance with tags/categories
- Use for: Finding/organizing documentation

**rustie-docs**
- Documentation audit, creation, maintenance
- Checks for staleness, broken references
- Auto-fixes issues
- Enforces documentation standards
- Use when: "check docs", "audit docs", "fix docs"

**smart-docs**
- AI-powered codebase documentation generator
- Analyzes project structure
- Creates C4 model diagrams
- Generates professional technical documentation
- Use for: Auto-documenting complex codebases

### Development

**cc-plugin-expert**
- Comprehensive Claude Code plugin development
- Guidance for creation, maintenance, installation
- Configuration and troubleshooting
- Use for: Building/managing plugins and skills

### AI / LLM Tooling

**senior-prompt-engineer** (550⭐, 4 installs)
- Prompt engineering patterns for LLM optimization
- RAG optimization, agent design, structured outputs
- Few-shot learning, chain-of-thought, evaluation frameworks
- AI product development and LLM system architecture
- Use for: Building AI products, optimizing prompts, designing agentic systems
- Triggers: "optimize prompts", "design prompt templates", "build agentic systems", "implement RAG"

**llm-app-patterns** (348⭐, 0 installs)
- Production-ready LLM application patterns
- RAG pipelines, agent architectures, prompt IDEs
- LLMOps monitoring and observability
- Use for: Designing AI applications, implementing RAG, building agents
- Triggers: "RAG pipeline", "agent architecture", "LLMOps", "LLM observability"

**llm-security** (4⭐, 0 installs — by Semgrep)
- OWASP Top 10 for LLM Applications 2025
- Prompt injection prevention, RAG security
- LLM-specific vulnerability patterns
- Complements `software-security` for AI-specific threats
- Use for: Securing LLM apps, reviewing AI security, RAG hardening
- Triggers: "prompt injection", "LLM security", "AI security", "RAG security"

### Database

**sql-expert** (3⭐, 54 installs)
- Expert SQL query writing and optimization
- PostgreSQL, MySQL, SQLite, SQL Server support
- Schema design with proper normalization
- Index creation, execution plan analysis
- Migrations and schema changes
- Use for: Complex queries, slow query optimization, schema design
- Triggers: "SQL", "database", "query optimization", "schema design", "migration"

### Git Workflows

**git-advanced-workflows** (21,032⭐, 152 installs)
- Advanced Git: rebasing, cherry-picking, bisect, worktrees, reflog
- Clean history maintenance and recovery
- Complex branch collaboration patterns
- Use for: Complex git histories, branch management, repository troubleshooting
- Triggers: "rebase", "cherry-pick", "bisect", "worktree", "reflog", "git history"

### Full-Stack Framework

**nextjs** (57⭐, 29 installs)
- Next.js 15+ App Router development patterns
- Server Components, Client Components, Server Actions
- Data fetching, layouts, route handlers, loading states, error boundaries
- Navigation, metadata, and middleware patterns
- Use for: Building pages, routes, forms, API handlers in Next.js
- Triggers: "Next.js", "App Router", "Server Components", "Server Actions", "route handler"

**shadcn** (57⭐, 44 installs)
- shadcn/ui component library patterns with Radix UI primitives
- Tables, forms, dialogs, cards, buttons, and all standard UI components
- Tailwind CSS styling integration
- Component installation and customization patterns
- Use for: Building any UI component, forms, data tables, dialogs
- Triggers: "shadcn", "UI component", "form", "dialog", "table", "card"

### Infrastructure

**docker-containerization** (276⭐, 33 installs)
- Docker containerization for Next.js, React, Node.js applications
- Multi-stage builds, image optimization, security hardening
- docker-compose configurations for development and production
- Deployment to Kubernetes, ECS, Cloud Run, and other platforms
- Use for: Dockerfiles, container orchestration, CI/CD pipelines
- Triggers: "Docker", "Dockerfile", "containerize", "docker-compose", "container"

### Data Science & Experimentation

**senior-data-scientist** (744⭐, 51 installs)
- Statistical modeling, A/B testing, experiment design
- Causal inference, time series analysis, feature engineering
- Python (NumPy, Pandas, Scikit-learn), R, SQL expertise
- Model evaluation, stakeholder communication, business intelligence
- Use for: Designing experiments, analyzing A/B tests, predictive models
- Triggers: "A/B test", "experiment design", "statistical analysis", "causal inference"

### Core Engineering (TypeScript/JavaScript Focus)

#### Architecture & Design

**architecture-patterns** (25,855⭐, 725 installs)
- Clean Architecture, Hexagonal Architecture, Domain-Driven Design
- Proven backend architecture patterns for maintainability
- Service boundaries, dependency management
- Use for: Complex system design, refactoring monoliths, POC→production scaling
- Triggers: "design architecture", "system design", "DDD", "clean architecture"

**senior-architect** (752⭐, 610 installs)
- System design for React, Next.js, Node.js, GraphQL, PostgreSQL
- Architecture diagram generation (Mermaid, C4 models)
- Tech stack decision frameworks and trade-off analysis
- Dependency analysis and integration patterns
- Use for: Making architecture decisions, designing scalable systems
- Triggers: "system architecture", "design system", "architecture diagram"

#### Testing & QA

**playwright-skill** (1,305⭐, 230 installs)
- Complete browser automation with Playwright
- Auto-detects dev servers, writes clean test scripts
- E2E testing, form filling, screenshots, responsive design
- Login flows, link checking, UX validation
- Use for: POC validation, browser testing, automated QA
- Triggers: "test website", "browser automation", "e2e test"

**senior-qa** (755⭐, 16 installs)
- Comprehensive QA for React/Next.js/Node.js applications
- Test suite generation, coverage analysis
- E2E testing setup with Playwright/Cypress
- Quality metrics and test strategies
- Use for: Test planning, QA workflows, coverage improvement
- Triggers: "QA strategy", "test coverage", "testing plan"

**javascript-testing-patterns** (20,796⭐, 57 installs)
- Jest, Vitest, Testing Library patterns
- Unit tests, integration tests, mocking strategies
- TDD/BDD workflows and test fixtures
- Use for: Writing JS/TS tests, test infrastructure setup
- Triggers: "write tests", "jest", "vitest", "TDD"

#### Code Quality & Refactoring

**code-reviewer** (757⭐, 146 installs)
- Comprehensive code review for TypeScript, JavaScript, Python
- Automated analysis, best practice checking
- Security scanning, review checklist generation
- Use for: PR reviews, code feedback, quality assurance
- Triggers: "review code", "code review", "check code quality"

**code-refactor** (224⭐, 71 installs)
- Bulk refactoring operations across multiple files
- Rename variables/functions project-wide
- Replace deprecated patterns, update API calls
- Use for: Large-scale refactoring, code modernization
- Triggers: "refactor", "rename variable", "replace pattern"

#### Performance & Best Practices

**vercel-react-best-practices** (9,651⭐, 49 installs)
- React and Next.js performance optimization from Vercel Engineering
- Bundle optimization, data fetching patterns
- Server components, streaming, caching strategies
- Use for: React/Next.js optimization, performance improvements
- Triggers: "optimize react", "next.js performance", "bundle size"

**modern-javascript-patterns** (21,029⭐, 184 installs)
- ES6+ features: async/await, destructuring, spread operators
- Promises, modules, iterators, generators
- Functional programming patterns
- Use for: Modern JS development, code modernization
- Triggers: "ES6", "modern javascript", "async/await"

#### Security

**software-security** (368⭐, 69 installs)
- OWASP Top 10 vulnerability prevention
- Secure-by-default practices with Project CodeGuard
- Common vulnerability detection (XSS, SQL injection, CSRF)
- Use for: Security audits, secure coding, vulnerability scanning
- Triggers: "security", "secure code", "vulnerabilities", "OWASP"

### Advanced Customization

**skill-from-masters**
- Discovers expert methodologies before creating skills
- Analyzes GitHub repositories for patterns and best practices
- Extracts domain knowledge from master practitioners
- Use before: Creating new skills to learn from existing experts
- Triggers: "Find experts in [domain]", "Learn from masters"

**Hook Development** (Official Anthropics)
- Creates event-driven hooks for Claude Code
- Hook types: PreToolUse, PostToolUse, Stop, SessionStart, SessionEnd
- Enables: Auto-commits, quality gates, session continuity
- Examples: Pre-commit checks, auto-learning, workflow automation
- Use for: Building custom event-driven behaviors

**mcp-builder** (Official Anthropics)
- Builds Model Context Protocol (MCP) servers
- Integrates external services: Jira, Linear, databases, APIs
- Provides structured data to Claude via protocol
- Examples: Jira integration, database access, API wrappers
- Use for: Connecting Claude to external systems

**skill-composer-studio**
- Chains multiple skills into custom composite workflows
- Creates new meta-skills from existing skill sequences
- Defines dependencies and execution order
- Examples: "Review → Test → Commit" workflow
- Use for: Building reusable skill sequences

**skill-evaluator**
- Evaluates skill quality, security, and best practices
- Checks SKILL.md structure and compliance
- Identifies security vulnerabilities in skills
- Provides recommendations for improvement
- Use before: Installing third-party skills, publishing your own skills

**slash-command-factory**
- Generates custom slash commands from descriptions
- Creates SKILL.md files with proper structure
- Automates skill boilerplate creation
- Use for: Quick skill prototyping, generating command templates

### Maintenance

**nightly**
- End-of-day cleanup routine
- Calculates Sleep Score (0-100) based on:
  - Uncommitted work
  - Branch cleanup
  - Issue updates
  - CI status
  - Service shutdown
- Captures session state to STATUS.json
- Use: At end of work day before closing Claude Code

## Decision Tree

```
New Task Arrives
│
├─ Is it complex/multi-skill? → skill-orchestrator
├─ Need multi-agent coordination? → gastown
├─ Starting new project? → project-interview
├─ Product discovery/scoping? → product-manager-toolkit
├─ Need to find a skill? → skills-discovery
├─ Complex reasoning required? → thought-based-reasoning
├─ Learned something new? → system-learn
├─ Quick idea capture? → brain-dump-assistant
│
├─ AI / LLM DEVELOPMENT
│   ├─ Prompt engineering? → senior-prompt-engineer
│   ├─ Building LLM apps? → llm-app-patterns
│   └─ LLM security concerns? → llm-security
│
├─ DATABASE WORK
│   ├─ SQL queries/schema/optimization? → sql-expert
│   └─ Prisma ORM operations? → prisma
│
├─ FULL-STACK FRAMEWORK
│   ├─ Next.js pages/routes/actions? → nextjs
│   └─ UI components (shadcn/ui)? → shadcn
│
├─ INFRASTRUCTURE
│   └─ Docker/containerization? → docker-containerization
│
├─ DATA SCIENCE / EXPERIMENTATION
│   └─ A/B testing / experiment design? → senior-data-scientist
│
├─ GIT OPERATIONS
│   └─ Complex git (rebase, cherry-pick, bisect)? → git-advanced-workflows
│
├─ CORE ENGINEERING (TypeScript/JavaScript)
│   ├─ Architecture decisions? → architecture-patterns, senior-architect
│   ├─ Testing needed? → playwright-skill, senior-qa, javascript-testing-patterns
│   ├─ Code review/refactoring? → code-reviewer, code-refactor
│   ├─ Performance issues? → vercel-react-best-practices, modern-javascript-patterns
│   └─ Security concerns? → software-security, llm-security
│
├─ Documentation work? → docs-management, rustie-docs, or smart-docs
├─ Plugin development? → cc-plugin-expert
├─ Creating new skill? → skill-from-masters → slash-command-factory
├─ Building workflow automation? → Hook Development
├─ Integrating external service? → mcp-builder
├─ Chaining skills together? → skill-composer-studio
├─ Evaluating a skill? → skill-evaluator
└─ End of work day? → nightly
```

## Best Practices

### 1. Let the Orchestrator Work
For non-trivial tasks, use `skill-orchestrator` instead of manual skill selection. It will:
- Analyze your skill tree
- Choose optimal skills
- Create efficient execution plans

### 2. Proactive Skill Discovery
Before implementing with base knowledge, ask:
> "Does a skill exist for [technology/domain]?"

Use `skills-discovery` to search the registry first.

### 3. Token Efficiency
- Skills load descriptions only (not full content) until invoked
- This file references skills by name, not duplicating their instructions
- Orchestrator handles coordination without loading all skills

### 4. Daily Routine
End each session with `/nightly` to:
- Clean up workspace
- Get Sleep Score
- Capture session state
- Ensure clean start next day

### 5. Documentation Hygiene
Periodically run `/rustie-docs` to:
- Check for stale docs
- Fix broken references
- Maintain documentation standards

## Installation Locations

All skills are installed globally at:
```
~/.claude/skills/
```

To see installed skills:
```bash
ls -la ~/.claude/skills/
```

## Adding New Skills

1. Search for skills:
   ```
   /skills-discovery [topic]
   ```

2. Install via skills-installer:
   ```bash
   npx skills-installer install @owner/repo/skill-name --client claude-code
   ```

3. Skills are automatically discovered by Claude

## Troubleshooting

**Skill not activating?**
- Restart Claude Code
- Verify installation: `ls ~/.claude/skills/skill-name/SKILL.md`
- Check skill description matches your task

**Too many skills loading?**
- Only descriptions load by default (~15K characters)
- Full content loads on invocation
- Increase budget if needed: `export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000`

**Orchestrator not working?**
- Be explicit: "Use skill-orchestrator to..."
- Complex tasks auto-trigger it
- Check that task requires multiple skills or planning

## Advanced: Creating Custom Skills

See `cc-plugin-expert` skill for guidance on:
- Creating SKILL.md with YAML frontmatter
- Structuring multi-file skills
- Using dynamic context with `!`command``
- Setting up dependencies and permissions

## Advanced Customization Capabilities

With the 6 new advanced customization skills, you can now:

### 1. Skill Creation Pipeline
```
skill-from-masters → slash-command-factory → skill-evaluator
```
- Research expert methodologies first
- Generate skill boilerplate
- Evaluate before deployment

### 2. Event-Driven Automation
Use `Hook Development` to create:
- **Pre-commit hooks**: Auto-lint, test, format before commits
- **Post-tool hooks**: Learn from tool usage, log patterns
- **Session hooks**: Auto-restore context, cleanup on exit
- **Quality gates**: Block unsafe operations

### 3. External Service Integration
Use `mcp-builder` to connect:
- Issue trackers (Jira, Linear, GitHub Issues)
- Databases (PostgreSQL, MongoDB, Redis)
- APIs (Slack, Discord, custom services)
- Development tools (CI/CD, monitoring)

### 4. Composite Workflows
Use `skill-composer-studio` to create:
- **Code review workflow**: Analyze → Test → Document → Commit
- **Release workflow**: Version → Changelog → Tag → Deploy
- **Onboarding workflow**: Setup → Interview → Document → Learn

### 5. Quality Assurance
Use `skill-evaluator` before:
- Installing third-party skills (security scan)
- Publishing your own skills (quality check)
- Updating existing skills (regression check)

### Examples of What You Can Build

**Auto-Learning System**
- Hook: SessionEnd → Capture patterns → skill-from-masters → Generate new skill
- Result: Automatically codify learnings as reusable skills

**Pre-Commit Quality Gate**
- Hook: PreToolUse(Bash, "git commit") → Run tests → Lint → Type check
- Result: Never commit broken code

**Jira Integration**
- MCP: mcp-builder → Jira API → Fetch issues, update status, create tickets
- Result: Manage Jira without leaving Claude

**Smart Project Scoping**
- Workflow: project-interview → product-manager-toolkit → system-learn
- Result: Comprehensive project scoping and knowledge capture

**Session Continuity**
- Hook: SessionEnd → Save context → SessionStart → Restore context
- Result: Never lose work between sessions

**Custom Commands**
- slash-command-factory: Generate `/deploy`, `/review`, `/standup` commands
- Result: Team-specific workflows as slash commands

## Quick Reference

| Need | Skill | Command |
|------|-------|---------|
| Complex task | skill-orchestrator | Let it auto-trigger or explicit |
| Multi-agent work | gastown | "Use gastown to..." |
| New project scoping | project-interview | `/project-interview` |
| Product discovery | product-manager-toolkit | `/product-manager-toolkit` |
| Find new skills | skills-discovery | `/skills-discovery [query]` |
| Deep reasoning | thought-based-reasoning | Auto-triggers on complex logic |
| Codify learnings | system-learn | `/system-learn` |
| Capture ideas | brain-dump-assistant | `/brain-dump-assistant` |
| **CORE ENGINEERING** | | |
| Architecture design | architecture-patterns | Auto-triggers on architecture keywords |
| System architecture | senior-architect | Auto-triggers on system design |
| Browser/E2E testing | playwright-skill | Auto-triggers on "test website" |
| QA strategy | senior-qa | `/senior-qa` |
| JS/TS testing | javascript-testing-patterns | Auto-triggers on testing keywords |
| Code review | code-reviewer | Auto-triggers on "review code" |
| Bulk refactoring | code-refactor | Auto-triggers on "refactor" |
| React/Next.js perf | vercel-react-best-practices | Auto-triggers on optimization |
| Modern JS patterns | modern-javascript-patterns | Auto-triggers on ES6+ |
| Security scanning | software-security | Auto-triggers on "security" |
| **AI / LLM** | | |
| Prompt engineering | senior-prompt-engineer | Auto-triggers on "optimize prompts" |
| LLM app patterns | llm-app-patterns | Auto-triggers on "RAG", "agent architecture" |
| LLM security | llm-security | Auto-triggers on "prompt injection", "LLM security" |
| **DATABASE** | | |
| SQL / schema design | sql-expert | Auto-triggers on "SQL", "query optimization" |
| Prisma ORM | prisma | Auto-triggers on Prisma schema/queries |
| **FULL-STACK FRAMEWORK** | | |
| Next.js App Router | nextjs | Auto-triggers on "Next.js", "Server Actions" |
| shadcn/ui components | shadcn | Auto-triggers on "shadcn", "UI component" |
| **INFRASTRUCTURE** | | |
| Docker / containers | docker-containerization | Auto-triggers on "Docker", "Dockerfile" |
| **DATA SCIENCE** | | |
| A/B testing / experiments | senior-data-scientist | Auto-triggers on "experiment", "A/B test" |
| **GIT** | | |
| Advanced git ops | git-advanced-workflows | Auto-triggers on "rebase", "cherry-pick", "bisect" |
| Manage docs | docs-management | `/docs-management` |
| Audit docs | rustie-docs | `/rustie-docs` |
| Document codebase | smart-docs | `/smart-docs` |
| Build plugins | cc-plugin-expert | `/cc-plugin-expert` |
| Learn from experts | skill-from-masters | `/skill-from-masters [domain]` |
| Create event hooks | Hook Development | `/hook-development` |
| Build MCP server | mcp-builder | `/mcp-builder` |
| Chain skills | skill-composer-studio | `/skill-composer-studio` |
| Evaluate skill | skill-evaluator | `/skill-evaluator` |
| Generate command | slash-command-factory | `/slash-command-factory` |
| End of day | nightly | `/nightly` |

---

**Last Updated:** 2026-02-01
**Skills Version:** 40 skills installed (20 foundation + 10 core engineering + 10 stack-specific: AI/LLM, DB, Git, Next.js, Prisma, shadcn, Docker, Data Science)
**Architecture:** Layered orchestration with specialized capabilities
**Focus:** Full-stack Next.js rapid prototyping with AI/LLM tooling, Prisma+PostgreSQL, Docker deployment, A/B experimentation, architecture, testing, security, and performance

## Knowledge Capture Workflow

```
Discovery Phase
├─ Interview stakeholders → product-manager-toolkit
├─ Technical scoping → project-interview
└─ Creates: PRD, SPEC.md

Learning Phase
├─ During work → brain-dump-assistant (quick capture)
├─ After discoveries → system-learn (codify as skills)
└─ Builds: Institutional knowledge, reusable patterns

Execution Phase
├─ Complex tasks → skill-orchestrator
├─ Multi-agent → gastown
└─ Specialized work → domain-specific skills
```
