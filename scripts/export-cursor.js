#!/usr/bin/env node
/**
 * Convert Respec skills to Cursor .mdc rules format
 * Usage: node scripts/export-cursor.js [skill-name]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SKILLS_DIR = path.join(__dirname, '../skills');
const OUTPUT_DIR = path.join(__dirname, '../integrations/cursor');

function convertToCursor(skillName, skillMdContent, frontmatter) {
  // Cursor .mdc format:
  // ---
  // title: Rule Title
  // description: Short description
  // tags: [tag1, tag2]
  // ---
  // 
  // Rule content in markdown
  
  const title = frontmatter.displayName || frontmatter.name;
  const description = frontmatter.description || '';
  const tags = frontmatter.tags || [];
  
  // Extract content after frontmatter
  const contentMatch = skillMdContent.match(/^---\n[\s\S]+?\n---\n\n([\s\S]+)/);
  const content = contentMatch ? contentMatch[1] : skillMdContent;
  
  // Build Cursor .mdc file
  const cursorFrontmatter = yaml.stringify({
    title,
    description: description.split('\n')[0].replace(/^-\.\s+Use when[^.]+\.\s+/, ''),
    tags
  });
  
  return `---\n${cursorFrontmatter}---\n\n${content}`;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node export-cursor.js <skill-name>');
  console.error('Example: node export-cursor.js nextjs');
  process.exit(1);
}

const skillName = args[0];
const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');

if (!fs.existsSync(skillPath)) {
  console.error(`Error: Skill "${skillName}" not found`);
  process.exit(1);
}

const skillContent = fs.readFileSync(skillPath, 'utf8');
const match = skillContent.match(/^---\n([\s\S]+?)\n---/);
if (!match) {
  console.error('Error: Invalid SKILL.md frontmatter');
  process.exit(1);
}

const frontmatter = yaml.parse(match[1]);
const cursorContent = convertToCursor(skillName, skillContent, frontmatter);

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Write .mdc file
const outputPath = path.join(OUTPUT_DIR, `${skillName}.mdc`);
fs.writeFileSync(outputPath, cursorContent);

console.log(`✓ Converted ${skillName} to Cursor format`);
console.log(`  → ${outputPath}`);
console.log('\nTo use in Cursor:');
console.log(`  1. Copy ${outputPath} to .cursor/rules/ in your project`);
console.log('  2. Cursor will auto-load the rule');
