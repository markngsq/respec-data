# Respec Role-Based Skill Bundles

**Quick install:** `respec install --role <role-name>`

Instead of installing skills one-by-one, install curated bundles for your role. Each bundle includes the essential skills for that job function.

---

## 🎯 Available Roles

### Full-Stack Developer
**When:** Building complete web applications from database to UI  
**Skills:** 8 essential + 3 optional

**Essential:**
- `nextjs` — Server-first React with App Router
- `prisma` — Type-safe database ORM
- `shadcn` — Copy-paste UI components
- `docker-containerization` — Containerize for deployment
- `javascript-testing-patterns` — Unit + integration tests
- `git-advanced-workflows` — Clean history with rebasing
- `sql-expert` — Query optimization
- `vercel-react-best-practices` — Performance patterns

**Optional:**
- `llm-app-patterns` — Add AI features
- `senior-architect` — Architecture decisions
- `healthcheck` — Production monitoring

**Install:**
```bash
respec install --role full-stack-developer
```

---

### AI Engineer
**When:** Building LLM applications, RAG systems, or AI agents  
**Skills:** 6 essential + 2 optional

**Essential:**
- `llm-app-patterns` — Production RAG and agent architectures
- `llm-security` — OWASP Top 10 for LLM applications
- `senior-prompt-engineer` — Systematic prompt optimization
- `mcp-builder` — Type-safe MCP servers for tool integration
- `nextjs` — Web UI for AI apps
- `prisma` — Store embeddings and conversation history

**Optional:**
- `senior-data-scientist` — Statistical analysis for AI outputs
- `docker-containerization` — Deploy AI services

**Install:**
```bash
respec install --role ai-engineer
```

---

### Product Designer
**When:** Designing user interfaces and experiences  
**Skills:** 7 essential + 4 optional

**Essential:**
- `frontend-design` — Distinctive, production-grade interfaces
- `adapt` — Responsive design across devices
- `animate` — Purposeful animations and micro-interactions
- `audit` — Comprehensive interface quality audit
- `teach-impeccable` — Gather design context, establish guidelines
- `shadcn` — Production-ready UI components
- `nextjs` — Implement designs in React

**Optional:**
- `delight` — Add moments of joy and personality
- `bolder` — Amplify safe designs for visual impact
- `clarify` — Improve UX copy and error messages
- `normalize` — Enforce design system consistency

**Install:**
```bash
respec install --role product-designer
```

---

### Backend Engineer
**When:** Building APIs, databases, and server-side systems  
**Skills:** 7 essential + 3 optional

**Essential:**
- `architecture-patterns` — Clean Architecture for maintainable backends
- `prisma` — Type-safe ORM for databases
- `sql-expert` — Query optimization and schema design
- `docker-containerization` — Containerize services
- `javascript-testing-patterns` — Test APIs thoroughly
- `git-advanced-workflows` — Manage complex histories
- `software-security` — Secure-by-default patterns

**Optional:**
- `senior-architect` — System design and trade-offs
- `llm-app-patterns` — Add AI capabilities to APIs
- `healthcheck` — Production readiness

**Install:**
```bash
respec install --role backend-engineer
```

---

### DevOps Engineer
**When:** Managing infrastructure, CI/CD, and deployments  
**Skills:** 5 essential + 3 optional

**Essential:**
- `docker-containerization` — Container best practices
- `git-advanced-workflows` — Manage deployment branches
- `healthcheck` — Security hardening and monitoring
- `sql-expert` — Database performance tuning
- `software-security` — Secure deployments

**Optional:**
- `architecture-patterns` — Understand service architectures
- `nextjs` — Deploy web applications
- `senior-architect` — Infrastructure decisions

**Install:**
```bash
respec install --role devops-engineer
```

---

### Data Scientist
**When:** Statistical analysis, machine learning, data pipelines  
**Skills:** 5 essential + 2 optional

**Essential:**
- `senior-data-scientist` — Statistical rigor meets business impact
- `sql-expert` — Advanced queries and optimization
- `prisma` — Manage datasets in databases
- `javascript-testing-patterns` — Test data pipelines
- `llm-app-patterns` — Build AI/ML applications

**Optional:**
- `docker-containerization` — Deploy models as services
- `nextjs` — Build data dashboards

**Install:**
```bash
respec install --role data-scientist
```

---

### QA Engineer
**When:** Test automation and quality assurance  
**Skills:** 4 essential + 2 optional

**Essential:**
- `javascript-testing-patterns` — Unit, integration, E2E testing
- `senior-qa` — Test generation and coverage analysis
- `git-advanced-workflows` — Test branch workflows
- `nextjs` — Test React applications

**Optional:**
- `software-security` — Security testing
- `audit` — Accessibility and quality audits

**Install:**
```bash
respec install --role qa-engineer
```

---

### Technical Writer
**When:** Writing documentation, API references, guides  
**Skills:** 4 essential + 2 optional

**Essential:**
- `docs-management` — Documentation audit and maintenance
- `rustie-docs` — Enforce documentation standards
- `smart-docs` — AI-powered codebase documentation
- `nextjs` — Build documentation sites

**Optional:**
- `frontend-design` — Design better docs UI
- `git-advanced-workflows` — Manage docs in version control

**Install:**
```bash
respec install --role technical-writer
```

---

### Indie Hacker / Solo Founder
**When:** Building and shipping products solo  
**Skills:** 10 essential (breadth over depth)

**Essential:**
- `nextjs` — Build full-stack apps fast
- `prisma` — Database without SQL complexity
- `shadcn` — Ship beautiful UI quickly
- `vercel-react-best-practices` — Performance best practices
- `docker-containerization` — Deploy anywhere
- `llm-app-patterns` — Add AI features easily
- `frontend-design` — Design without a designer
- `javascript-testing-patterns` — Ship with confidence
- `git-advanced-workflows` — Solo workflow efficiency
- `nightly` — End-of-day cleanup automation

**Install:**
```bash
respec install --role indie-hacker
```

---

### Startup CTO
**When:** Technical leadership and architecture decisions  
**Skills:** 7 essential (strategy over execution)

**Essential:**
- `senior-architect` — Technical decisions backed by trade-offs
- `architecture-patterns` — Scalable system design
- `llm-app-patterns` — Evaluate AI opportunities
- `senior-data-scientist` — Data-driven decisions
- `docker-containerization` — Infrastructure strategy
- `software-security` — Security posture
- `healthcheck` — Production readiness

**Install:**
```bash
respec install --role startup-cto
```

---

### Design System Architect
**When:** Building and maintaining design systems  
**Skills:** 8 essential

**Essential:**
- `teach-impeccable` — Establish design guidelines
- `normalize` — Enforce design system consistency
- `extract` — Consolidate reusable components
- `shadcn` — Component library patterns
- `frontend-design` — Production-grade implementation
- `audit` — Quality and accessibility audits
- `nextjs` — Build design system site
- `git-advanced-workflows` — Version design tokens

**Install:**
```bash
respec install --role design-system-architect
```

---

### Platform Engineer
**When:** Building internal tools and developer platforms  
**Skills:** 7 essential

**Essential:**
- `architecture-patterns` — Platform architecture
- `mcp-builder` — Build tool integrations
- `docker-containerization` — Containerized tooling
- `nextjs` — Internal dashboards
- `prisma` — Tool configuration storage
- `javascript-testing-patterns` — Test internal tools
- `git-advanced-workflows` — Monorepo workflows

**Install:**
```bash
respec install --role platform-engineer
```

---

### UX Researcher
**When:** User research, usability testing, design validation  
**Skills:** 5 essential

**Essential:**
- `audit` — Interface quality evaluation
- `critique` — UX evaluation with actionable feedback
- `onboard` — First-time user experience design
- `adapt` — Test across devices and contexts
- `teach-impeccable` — Document user insights

**Install:**
```bash
respec install --role ux-researcher
```

---

## 🛠️ Custom Roles

Don't see your role? Create a custom bundle:

```bash
# Install specific skills
respec install nextjs prisma shadcn

# Or create your own role definition
# Add to ~/.respec/custom-roles.json:
{
  "my-custom-role": {
    "name": "My Custom Role",
    "description": "When building X with Y",
    "essential": ["nextjs", "prisma"],
    "optional": ["shadcn", "docker-containerization"]
  }
}

# Then install
respec install --role my-custom-role
```

---

## 📊 Role Comparison Matrix

| Role | Skills Count | Focus | Best For |
|------|--------------|-------|----------|
| Full-Stack Developer | 8 + 3 | Breadth | Complete web apps |
| AI Engineer | 6 + 2 | AI/ML | LLM applications |
| Product Designer | 7 + 4 | UX/UI | Interface design |
| Backend Engineer | 7 + 3 | Server | APIs and databases |
| DevOps Engineer | 5 + 3 | Infra | Deployments |
| Data Scientist | 5 + 2 | Analytics | Data pipelines |
| QA Engineer | 4 + 2 | Testing | Quality assurance |
| Technical Writer | 4 + 2 | Docs | Documentation |
| Indie Hacker | 10 | Speed | Ship fast solo |
| Startup CTO | 7 | Strategy | Technical leadership |
| Design System | 8 | Consistency | Component libraries |
| Platform Engineer | 7 | Tooling | Internal platforms |
| UX Researcher | 5 | Research | User insights |

---

## 🎯 How to Choose

**Beginner?** Start with your primary role (Full-Stack, Product Designer, Backend)

**Specialized?** Pick role + add optional skills as you grow

**Multi-disciplinary?** Install multiple roles:
```bash
respec install --role full-stack-developer
respec install --role ai-engineer
```

**Learner?** Browse skills by category in [CATEGORIES.md](CATEGORIES.md)

---

## 🔄 Role Evolution

Roles evolve as skills mature and new patterns emerge. Check for updates:

```bash
respec upgrade --role full-stack-developer
```

---

**See also:**
- [CATEGORIES.md](CATEGORIES.md) — Browse skills by category
- [SKILL-TEMPLATE.md](SKILL-TEMPLATE.md) — Create your own skill
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribute skills or roles
