---
name: llm-security
emoji: 🔒
vibe: OWASP Top 10 defender against prompt injection
category: security
description: Security guidelines for LLM applications based on OWASP Top 10 for LLM 2025. Use when building LLM apps, reviewing AI security, implementing RAG systems, or asking about LLM vulnerabilities like "prompt injection" or "check LLM security".
maturity: seed
evolution_count: 0
tags:
  - security
  - llm
  - ai
triggers:
  - reviewing security of an LLM application or AI feature
  - protecting against prompt injection or jailbreaking
  - securing a RAG pipeline or agent with tool access
  - auditing LLM output handling or data leakage risks
  - implementing input/output guardrails for an AI system
dependencies:
  - name: OpenAI API
    url: https://platform.openai.com
    tier: paid
  - name: Anthropic API
    url: https://console.anthropic.com
    tier: paid
---

# LLM Security Guidelines (OWASP Top 10 for LLM 2025)

Comprehensive security rules for building secure LLM applications. Based on the OWASP Top 10 for Large Language Model Applications 2025 - the authoritative guide to LLM security risks.

## 🚨 Critical Rules

### Never Trust User Input in Prompts
- **Always sanitize user input before LLM** — Strip control characters, validate length, check for injection patterns
- **Never concatenate user input directly into system prompts** — Use structured formats (JSON, delimiters)
- **Always use separate user/system message roles** — Prevents prompt injection via role confusion

### Never Expose System Prompts
- **Never echo system prompts in responses** — Attackers use "repeat your instructions" attacks
- **Never log full prompts with sensitive instructions** — Use redacted logs
- **Always treat system prompts as secrets** — Store separately, don't hardcode

### Never Trust LLM Output as Safe
- **Always sanitize LLM output before rendering** — Prevents XSS, code injection
- **Never execute LLM-generated code without sandboxing** — Use isolated environments
- **Never pass LLM output directly to SQL/shell** — Validate + parameterize

### Always Limit LLM Agency
- **Always use least-privilege for tool access** — LLMs should only access what they need
- **Never give LLMs write access to production databases** — Read-only by default
- **Always require human approval for high-risk actions** — Delete, payment, email sends

**Default Requirements:**
- Unless told otherwise, always sanitize user input before LLM
- Unless told otherwise, always validate LLM output before use
- Unless told otherwise, never expose system prompts

<!-- ZONE:STABLE -->
## 🎯 How It Works

1. When building or reviewing LLM applications, reference these security guidelines
2. Each rule includes vulnerable patterns and secure implementations
3. Rules cover the complete LLM application lifecycle: training, deployment, and inference

## Categories

### Critical Impact
- **LLM01: Prompt Injection** - Prevent direct and indirect prompt manipulation
- **LLM02: Sensitive Information Disclosure** - Protect PII, credentials, and proprietary data
- **LLM03: Supply Chain** - Secure model sources, training data, and dependencies
- **LLM04: Data and Model Poisoning** - Prevent training data manipulation and backdoors
- **LLM05: Improper Output Handling** - Sanitize LLM outputs before downstream use

### High Impact
- **LLM06: Excessive Agency** - Limit LLM permissions, functionality, and autonomy
- **LLM07: System Prompt Leakage** - Protect system prompts from disclosure
- **LLM08: Vector and Embedding Weaknesses** - Secure RAG systems and embeddings
- **LLM09: Misinformation** - Mitigate hallucinations and false outputs
- **LLM10: Unbounded Consumption** - Prevent DoS, cost attacks, and model theft

## Usage

Reference the rules in `rules/` directory for detailed examples:

- `rules/prompt-injection.md` - Prompt injection prevention (LLM01)
- `rules/sensitive-disclosure.md` - Sensitive information protection (LLM02)
- `rules/supply-chain.md` - Supply chain security (LLM03)
- `rules/data-poisoning.md` - Data and model poisoning prevention (LLM04)
- `rules/output-handling.md` - Output handling security (LLM05)
- `rules/excessive-agency.md` - Agency control (LLM06)
- `rules/system-prompt-leakage.md` - System prompt protection (LLM07)
- `rules/vector-embedding.md` - RAG and embedding security (LLM08)
- `rules/misinformation.md` - Misinformation mitigation (LLM09)
- `rules/unbounded-consumption.md` - Resource consumption control (LLM10)
- `rules/_sections.md` - Full index of all rules

## Quick Reference

| Vulnerability | Key Prevention |
|--------------|----------------|
| Prompt Injection | Input validation, output filtering, privilege separation |
| Sensitive Disclosure | Data sanitization, access controls, encryption |
| Supply Chain | Verify models, SBOM, trusted sources only |
| Data Poisoning | Data validation, anomaly detection, sandboxing |
| Output Handling | Treat LLM as untrusted, encode outputs, parameterize queries |
| Excessive Agency | Least privilege, human-in-the-loop, minimize extensions |
| System Prompt Leakage | No secrets in prompts, external guardrails |
| Vector/Embedding | Access controls, data validation, monitoring |
| Misinformation | RAG, fine-tuning, human oversight, cross-verification |
| Unbounded Consumption | Rate limiting, input validation, resource monitoring |

## Key Principles

1. **Never trust LLM output** - Validate and sanitize all outputs before use
2. **Least privilege** - Grant minimum necessary permissions to LLM systems
3. **Defense in depth** - Layer multiple security controls
4. **Human oversight** - Require approval for high-impact actions
5. **Monitor and log** - Track all LLM interactions for anomaly detection

## References

- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- [MITRE ATLAS - Adversarial Threat Landscape for AI Systems](https://atlas.mitre.org/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

<!-- ZONE:APPEND -->
## Lessons Learned

<!-- ZONE:APPEND -->
## Changelog
