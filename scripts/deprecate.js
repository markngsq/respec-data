#!/usr/bin/env node
/**
 * deprecate.js — Skill deprecation workflow
 * Mark skills as deprecated and suggest replacements
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.resolve(__dirname, '../skills');
const DEPRECATED_DIR = path.resolve(__dirname, '../skills/_deprecated');

// ANSI colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

// Parse YAML frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { content: '', rest: content };
  
  return {
    content: match[1],
    rest: content.slice(match[0].length),
  };
}

// Update frontmatter
function updateFrontmatter(content, updates) {
  const { content: frontmatter, rest } = parseFrontmatter(content);
  
  const lines = frontmatter.split(/\r?\n/);
  const updated = [];
  const keys = Object.keys(updates);
  
  // Update existing keys
  for (const line of lines) {
    let matched = false;
    for (const key of keys) {
      if (line.match(new RegExp(`^${key}:`))) {
        const value = updates[key];
        updated.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
        matched = true;
        delete updates[key];
        break;
      }
    }
    if (!matched) {
      updated.push(line);
    }
  }
  
  // Add new keys
  for (const [key, value] of Object.entries(updates)) {
    updated.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  }
  
  return `---\n${updated.join('\n')}\n---${rest}`;
}

// Mark skill as deprecated
function markDeprecated(skillId, replacement = null, reason = null) {
  const skillPath = path.join(SKILLS_DIR, skillId);
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  
  if (!fs.existsSync(skillMdPath)) {
    console.error(`${C.red}Error: Skill not found: ${skillId}${C.reset}`);
    return false;
  }
  
  const content = fs.readFileSync(skillMdPath, 'utf8');
  
  const updates = {
    deprecated: 'true',
    deprecatedDate: new Date().toISOString().split('T')[0],
  };
  
  if (replacement) {
    updates.replacement = replacement;
  }
  
  if (reason) {
    updates.deprecationReason = reason;
  }
  
  const updated = updateFrontmatter(content, updates);
  fs.writeFileSync(skillMdPath, updated);
  
  console.log(`${C.yellow}✓ Marked as deprecated: ${skillId}${C.reset}`);
  if (replacement) {
    console.log(`  ${C.dim}→ Replacement: ${replacement}${C.reset}`);
  }
  if (reason) {
    console.log(`  ${C.dim}→ Reason: ${reason}${C.reset}`);
  }
  
  return true;
}

// Archive deprecated skill (move to _deprecated/)
function archiveSkill(skillId) {
  const skillPath = path.join(SKILLS_DIR, skillId);
  
  if (!fs.existsSync(skillPath)) {
    console.error(`${C.red}Error: Skill not found: ${skillId}${C.reset}`);
    return false;
  }
  
  if (!fs.existsSync(DEPRECATED_DIR)) {
    fs.mkdirSync(DEPRECATED_DIR, { recursive: true });
  }
  
  const archivePath = path.join(DEPRECATED_DIR, skillId);
  
  if (fs.existsSync(archivePath)) {
    console.error(`${C.red}Error: Archive already exists: ${skillId}${C.reset}`);
    return false;
  }
  
  // Move skill to _deprecated/
  fs.renameSync(skillPath, archivePath);
  
  console.log(`${C.green}✓ Archived: ${skillId}${C.reset}`);
  console.log(`  ${C.dim}→ Moved to: skills/_deprecated/${skillId}${C.reset}`);
  
  return true;
}

// Unmark skill as deprecated
function unmarkDeprecated(skillId) {
  const skillPath = path.join(SKILLS_DIR, skillId);
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  
  if (!fs.existsSync(skillMdPath)) {
    console.error(`${C.red}Error: Skill not found: ${skillId}${C.reset}`);
    return false;
  }
  
  const content = fs.readFileSync(skillMdPath, 'utf8');
  const { content: frontmatter, rest } = parseFrontmatter(content);
  
  const lines = frontmatter.split(/\r?\n/);
  const filtered = lines.filter(line => {
    return !line.match(/^(deprecated|deprecatedDate|replacement|deprecationReason):/);
  });
  
  const updated = `---\n${filtered.join('\n')}\n---${rest}`;
  fs.writeFileSync(skillMdPath, updated);
  
  console.log(`${C.green}✓ Unmarked as deprecated: ${skillId}${C.reset}`);
  
  return true;
}

// List all deprecated skills
function listDeprecated() {
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const deprecated = [];
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    
    const skillMdPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const { content: frontmatter } = parseFrontmatter(content);
    
    const isDeprecated = frontmatter.includes('deprecated: true') || 
                        frontmatter.includes("deprecated: 'true'") ||
                        frontmatter.includes('deprecated: "true"');
    
    if (isDeprecated) {
      const lines = frontmatter.split(/\r?\n/);
      const data = {};
      
      for (const line of lines) {
        const match = line.match(/^(replacement|deprecationReason|deprecatedDate):\s*(.*)/);
        if (match) {
          data[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      }
      
      deprecated.push({
        id: entry.name,
        ...data,
      });
    }
  }
  
  if (deprecated.length === 0) {
    console.log(`${C.dim}No deprecated skills found.${C.reset}`);
    return;
  }
  
  console.log(`\n${C.bold}${C.yellow}Deprecated Skills (${deprecated.length}):${C.reset}\n`);
  
  deprecated.forEach(skill => {
    console.log(`  ${C.yellow}⚠${C.reset} ${skill.id}`);
    if (skill.deprecatedDate) {
      console.log(`    ${C.dim}Deprecated: ${skill.deprecatedDate}${C.reset}`);
    }
    if (skill.replacement) {
      console.log(`    ${C.dim}→ Use instead: ${skill.replacement}${C.reset}`);
    }
    if (skill.deprecationReason) {
      console.log(`    ${C.dim}→ Reason: ${skill.deprecationReason}${C.reset}`);
    }
  });
  
  console.log('');
}

// Main
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'mark':
      if (!args[1]) {
        console.error(`${C.yellow}Usage: deprecate.js mark <skill-id> [--replacement=<id>] [--reason=<text>]${C.reset}`);
        process.exit(1);
      }
      
      const replacement = args.find(a => a.startsWith('--replacement='))?.split('=')[1];
      const reason = args.find(a => a.startsWith('--reason='))?.split('=')[1];
      
      markDeprecated(args[1], replacement, reason);
      break;
      
    case 'unmark':
      if (!args[1]) {
        console.error(`${C.yellow}Usage: deprecate.js unmark <skill-id>${C.reset}`);
        process.exit(1);
      }
      unmarkDeprecated(args[1]);
      break;
      
    case 'archive':
      if (!args[1]) {
        console.error(`${C.yellow}Usage: deprecate.js archive <skill-id>${C.reset}`);
        process.exit(1);
      }
      archiveSkill(args[1]);
      break;
      
    case 'list':
      listDeprecated();
      break;
      
    default:
      console.log(`${C.bold}Deprecation Workflow${C.reset}\n`);
      console.log('Commands:');
      console.log(`  ${C.cyan}mark <skill-id>${C.reset} [--replacement=<id>] [--reason=<text>]`);
      console.log(`    Mark skill as deprecated`);
      console.log(`  ${C.cyan}unmark <skill-id>${C.reset}`);
      console.log(`    Remove deprecation status`);
      console.log(`  ${C.cyan}archive <skill-id>${C.reset}`);
      console.log(`    Move skill to _deprecated/ folder`);
      console.log(`  ${C.cyan}list${C.reset}`);
      console.log(`    List all deprecated skills`);
      console.log('');
  }
}

main();
