---
name: software-security
description: >-
  Integrates Project CodeGuard secure-by-default practices into AI coding workflows — applies language-specific security rules covering authentication, injection prevention, cryptography, session management, and infrastructure hardening. Use when writing, reviewing, or modifying code to enforce security standards and prevent common vulnerabilities.
vibe: Secure-by-default code patterns
codeguard-version: 1.2.0
framework: Project CodeGuard
purpose: Embed secure-by-default practices into AI coding workflows
maturity: seed
evolution_count: 0
tags:
  - security
  - backend
triggers:
  - writing authentication, authorisation, or session handling code
  - handling user input, file uploads, or SQL queries (injection risk)
  - reviewing code for common vulnerabilities (XSS, CSRF, SQLi)
  - storing secrets, credentials, or sensitive data
  - setting up security headers, CORS, or rate limiting
---

# Software Security Skill (Project CodeGuard)
This skill provides comprehensive security guidance to help AI coding agents generate secure code and prevent common vulnerabilities. It is based on **Project CodeGuard**, an open-source, model-agnostic security framework that embeds secure-by-default practices into AI coding workflows.

<!-- ZONE:STABLE -->
## When to Use This Skill
This skill should be activated when:
- Writing new code in any language
- Reviewing or modifying existing code
- Implementing security-sensitive features (authentication, cryptography, data handling, etc.)
- Working with user input, databases, APIs, or external services
- Configuring cloud infrastructure, CI/CD pipelines, or containers
- Handling sensitive data, credentials, or cryptographic operations

## How to Use This Skill
When writing or reviewing code:
1. Always-Apply Rules: Some rules MUST be checked on every code operation:
- `codeguard-1-hardcoded-credentials.md` - Never hardcode secrets, passwords, API keys, or tokens
- `codeguard-1-crypto-algorithms.md` - Use only modern, secure cryptographic algorithms
- `codeguard-1-digital-certificates.md` - Validate and manage digital certificates securely
2. Context-Specific Rules: Apply rules from /rules directory based on the language of the feature being implemented using the table given below:


| Language | Rule Files to Apply |
|----------|---------------------|
| apex | codeguard-0-input-validation-injection.md |
| c | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-client-side-web-security.md, codeguard-0-data-storage.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-iac-security.md, codeguard-0-input-validation-injection.md, codeguard-0-logging.md, codeguard-0-safe-c-functions.md, codeguard-0-session-management-and-cookies.md, codeguard-0-xml-and-serialization.md |
| cpp | codeguard-0-safe-c-functions.md |
| d | codeguard-0-iac-security.md |
| docker | codeguard-0-devops-ci-cd-containers.md, codeguard-0-supply-chain-security.md |
| go | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-input-validation-injection.md, codeguard-0-mcp-security.md, codeguard-0-session-management-and-cookies.md, codeguard-0-xml-and-serialization.md |
| html | codeguard-0-client-side-web-security.md, codeguard-0-input-validation-injection.md, codeguard-0-session-management-and-cookies.md |
| java | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-input-validation-injection.md, codeguard-0-mcp-security.md, codeguard-0-mobile-apps.md, codeguard-0-session-management-and-cookies.md, codeguard-0-xml-and-serialization.md |
| javascript | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-client-side-web-security.md, codeguard-0-cloud-orchestration-kubernetes.md, codeguard-0-data-storage.md, codeguard-0-devops-ci-cd-containers.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-iac-security.md, codeguard-0-input-validation-injection.md, codeguard-0-logging.md, codeguard-0-mcp-security.md, codeguard-0-mobile-apps.md, codeguard-0-privacy-data-protection.md, codeguard-0-session-management-and-cookies.md, codeguard-0-supply-chain-security.md |
| kotlin | codeguard-0-additional-cryptography.md, codeguard-0-authentication-mfa.md, codeguard-0-framework-and-languages.md, codeguard-0-mobile-apps.md |
| matlab | codeguard-0-additional-cryptography.md, codeguard-0-authentication-mfa.md, codeguard-0-mobile-apps.md, codeguard-0-privacy-data-protection.md |
| perl | codeguard-0-mobile-apps.md |
| php | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-client-side-web-security.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-input-validation-injection.md, codeguard-0-session-management-and-cookies.md, codeguard-0-xml-and-serialization.md |
| powershell | codeguard-0-devops-ci-cd-containers.md, codeguard-0-iac-security.md, codeguard-0-input-validation-injection.md |
| python | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-input-validation-injection.md, codeguard-0-mcp-security.md, codeguard-0-session-management-and-cookies.md, codeguard-0-xml-and-serialization.md |
| ruby | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-iac-security.md, codeguard-0-input-validation-injection.md, codeguard-0-session-management-and-cookies.md, codeguard-0-xml-and-serialization.md |
| rust | codeguard-0-mcp-security.md |
| shell | codeguard-0-devops-ci-cd-containers.md, codeguard-0-iac-security.md, codeguard-0-input-validation-injection.md |
| sql | codeguard-0-data-storage.md, codeguard-0-input-validation-injection.md |
| swift | codeguard-0-additional-cryptography.md, codeguard-0-authentication-mfa.md, codeguard-0-mobile-apps.md |
| typescript | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authentication-mfa.md, codeguard-0-authorization-access-control.md, codeguard-0-client-side-web-security.md, codeguard-0-file-handling-and-uploads.md, codeguard-0-framework-and-languages.md, codeguard-0-input-validation-injection.md, codeguard-0-mcp-security.md, codeguard-0-session-management-and-cookies.md |
| vlang | codeguard-0-client-side-web-security.md |
| xml | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-devops-ci-cd-containers.md, codeguard-0-framework-and-languages.md, codeguard-0-mobile-apps.md, codeguard-0-xml-and-serialization.md |
| yaml | codeguard-0-additional-cryptography.md, codeguard-0-api-web-services.md, codeguard-0-authorization-access-control.md, codeguard-0-cloud-orchestration-kubernetes.md, codeguard-0-data-storage.md, codeguard-0-devops-ci-cd-containers.md, codeguard-0-framework-and-languages.md, codeguard-0-iac-security.md, codeguard-0-logging.md, codeguard-0-privacy-data-protection.md, codeguard-0-supply-chain-security.md |


3. Proactive Security: Don't just avoid vulnerabilities-actively implement secure patterns:
- Use parameterized queries for database access
- Validate and sanitize all user input
- Apply least-privilege principles
- Use modern cryptographic algorithms and libraries
- Implement defense-in-depth strategies

## CodeGuard Security Rules
The security rules are available in the `rules/` directory.

### Usage Workflow
When generating or reviewing code, follow this workflow:

### 1. Initial Security Check
Before writing any code:
- Check: Will this handle credentials? → Apply codeguard-1-hardcoded-credentials
- Check: What language am I using? → Identify applicable language-specific rules
- Check: What security domains are involved? → Load relevant rule files

### 2. Code Generation
While writing code:
- Apply secure-by-default patterns from relevant Project CodeGuard rules
- Add security-relevant comments explaining choices

### 3. Security Review
After writing code:
- Review against implementation checklists in each rule
- Verify no hardcoded credentials or secrets
- Validate that all the rules have been successfully followed when applicable.
- Explain which security rules were applied
- Highlight security features implemented

<!-- ZONE:APPEND -->
## Lessons Learned

### 2026-03-23 — GWS OAuth: full scope URLs required, enable APIs before credentials

**1. Scope format — use full URLs**
```js
// WRONG
scopes: ['drive.file', 'email']

// CORRECT
scopes: [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid'
]
```

**2. Enable the API in GCP before creating OAuth credentials** — credentials created before the API is enabled will auth fine but API calls return 403.

**3. Test users must be explicitly listed** — for apps in "Testing" mode, any account not listed hits "Access blocked: App not verified". [project:respec]

---

### 2026-03-25 — JWT role auto-assignment pattern for mixed OAuth + password auth

When supporting both OAuth and password login, keep JWT payload consistent and assign roles in the callback:

```ts
const role = email.endsWith('@tech.gov.sg') ? 'govtech' : 'user'
const user = await findOrCreateUser({ email, name, avatar, provider: 'google', role })
```

`createUser()` must handle optional `passwordHash` (OAuth users have none). Use a `provider` field to distinguish auth type without separate tables. [project:respec]

---

### 2026-03-23 — GWS OAuth: regular Drive folders work; Shared Drives need admin

Creating Shared Drives requires GSuite admin permissions (403 `insufficientPermissions`). Regular folders in My Drive work identically for app storage without admin.

Also: `drive.file` scope only covers files the app created. For managing a folder hierarchy across users (`users/*/skills/`), you need the full `https://www.googleapis.com/auth/drive` scope. [project:respec]

<!-- ZONE:APPEND -->
## Changelog
