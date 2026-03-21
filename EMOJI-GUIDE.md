# Emoji Semantics Guide

Respec skills use emojis **functionally**, not decoratively. Each emoji has a specific semantic meaning to improve scannability and consistency.

## Standard Emoji Mappings

### 🎯 When to Use / Mission
**Meaning:** Trigger conditions, use cases, scope  
**Used in:** Skill description, "When to Use This Skill" section  
**Example:** "🎯 Use when building React apps with Server Components"

---

### 💬 Communication Style
**Meaning:** Tone, voice, verbosity, audience level  
**Used in:** How this skill talks to users  
**Example:** "💬 Code examples for every pattern, assume React fundamentals"

---

### ✅ Success Metrics
**Meaning:** Measurable outcomes, quality thresholds  
**Used in:** How to know if you're using this skill effectively  
**Example:** "✅ Lighthouse Performance >90, Zero client-side data fetching"

---

### 🏗️ Core Patterns
**Meaning:** Main techniques, primary guidance  
**Used in:** The core content of the skill  
**Example:** "🏗️ Server Components, Client Components, Data Fetching"

---

### ❌ Anti-Patterns
**Meaning:** What NOT to do, common mistakes  
**Used in:** Examples of wrong approaches with explanations  
**Example:** "❌ Don't fetch in useEffect — use Server Components instead"

---

### 📚 Examples
**Meaning:** Working code samples, demonstrations  
**Used in:** Full examples showing patterns in action  
**Example:** "📚 Complete Next.js app with Server Components"

---

### 🚨 Critical Rules
**Meaning:** Non-negotiable constraints, must-follow requirements  
**Used in:** Rules you cannot compromise on  
**Example:** "🚨 Never run Docker containers as root in production"

---

### 🔧 Technical Details
**Meaning:** Implementation specifics, configuration  
**Used in:** Low-level technical guidance  
**Example:** "🔧 Configure TypeScript strict mode in tsconfig.json"

---

### 📋 Best Practices
**Meaning:** Optional optimizations, recommendations  
**Used in:** Things you should do but aren't critical  
**Example:** "📋 Use code splitting for better performance"

---

### 🎨 Design / Visual
**Meaning:** UI/UX guidance, aesthetic decisions  
**Used in:** Design-focused skills  
**Example:** "🎨 Use generous spacing and sophisticated typography"

---

### 🔒 Security
**Meaning:** Security considerations, vulnerabilities  
**Used in:** Security-critical guidance  
**Example:** "🔒 Always use parameterized queries to prevent SQL injection"

---

### ⚡ Performance
**Meaning:** Speed, optimization, efficiency  
**Used in:** Performance-critical sections  
**Example:** "⚡ Optimize bundle size with code splitting"

---

## Usage Guidelines

### DO ✅
- Use emojis consistently across all skills
- Place emoji at the start of section headers
- Use the same emoji for the same concept across skills
- Keep emoji meanings semantic (functional, not decorative)

### DON'T ❌
- Mix emoji meanings (e.g., using 🎯 for both mission and examples)
- Use emojis mid-paragraph (only in headers)
- Use emojis that aren't in this guide without documenting first
- Use multiple emojis per header (pick one)

## Adding New Emojis

If you need a new emoji meaning:

1. Propose it in a GitHub Discussion
2. Explain the semantic meaning
3. Show why existing emojis don't fit
4. Update this guide if approved

## Validation

Skills are validated against this guide in CI:
- Section headers should use standard emojis
- Emoji meanings should be consistent
- Unknown emojis trigger warnings (not errors)

---

**See also:**
- [SKILL-TEMPLATE.md](SKILL-TEMPLATE.md) — Template with emoji headers
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
