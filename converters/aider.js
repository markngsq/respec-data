#!/usr/bin/env node
/**
 * Aider Converter — Merge all Respec skills into single CONVENTIONS.md
 * 
 * Aider uses a single CONVENTIONS.md file in the project root.
 * We merge all skills into sections with clear headers.
 * 
 * Usage:
 *   node converters/aider.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SKILLS_DIR = path.join(__dirname, '../skills');
const OUTPUT_DIR = path.join(__dirname, '../integrations/aider');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'CONVENTIONS.md');

function getAllSkills() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = path.join(SKILLS_DIR, name);
      return fs.statSync(skillPath).isDirectory() && !name.startsWith('_');
    })
    .sort();
}

function extractSkillContent(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  
  if (!fs.existsSync(skillPath)) {
    return null;
  }
  
  const content = fs.readFileSync(skillPath, 'utf8');
  
  // Extract frontmatter and body
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n\n([\s\S]+)/);
  if (!frontmatterMatch) {
    return null;
  }
  
  let frontmatter;
  try {
    frontmatter = yaml.parse(frontmatterMatch[1]);
  } catch (err) {
    console.warn(`⚠ YAML parse error for ${skillName}, skipping`);
    return null;
  }
  const body = frontmatterMatch[2];
  
  return {
    name: frontmatter.displayName || frontmatter.name,
    vibe: frontmatter.vibe || '',
    description: frontmatter.description || '',
    body
  };
}

function buildConventionsFile() {
  const skills = getAllSkills();
  
  let output = `# Coding Conventions (Respec Skills)\n\n`;
  output += `This file contains coding conventions from ${skills.length} Respec skills.\n`;
  output += `Generated automatically — do not edit manually.\n\n`;
  output += `---\n\n`;
  
  // Table of contents
  output += `## Table of Contents\n\n`;
  for (const skillName of skills) {
    const skill = extractSkillContent(skillName);
    if (skill) {
      output += `- [${skill.name}](#${skill.name.toLowerCase().replace(/\s+/g, '-')})\n`;
    }
  }
  output += `\n---\n\n`;
  
  // Skill sections
  for (const skillName of skills) {
    const skill = extractSkillContent(skillName);
    if (!skill) continue;
    
    output += `## ${skill.name}\n\n`;
    if (skill.vibe) {
      output += `**${skill.vibe}**\n\n`;
    }
    output += `${skill.body}\n\n`;
    output += `---\n\n`;
  }
  
  return output;
}

// Main
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('Building CONVENTIONS.md for Aider...');
const conventionsContent = buildConventionsFile();

fs.writeFileSync(OUTPUT_FILE, conventionsContent);

const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`   Size: ${fileSize} KB`);
console.log('\nTo use in Aider:');
console.log(`  cp ${OUTPUT_FILE} ./CONVENTIONS.md`);
console.log(`  aider --read CONVENTIONS.md`);
