#!/usr/bin/env node
/**
 * Cursor Converter — Convert Respec skills to Cursor .mdc format
 * 
 * Cursor uses .cursor/rules/ directory with .mdc files.
 * Format: YAML frontmatter + markdown content
 * 
 * Usage:
 *   node converters/cursor.js <skill-name>
 *   node converters/cursor.js --all
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SKILLS_DIR = path.join(__dirname, '../skills');
const OUTPUT_DIR = path.join(__dirname, '../integrations/cursor');

function convertSkillToCursor(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  
  if (!fs.existsSync(skillPath)) {
    console.error(`❌ Skill ${skillName} not found`);
    return false;
  }
  
  const content = fs.readFileSync(skillPath, 'utf8');
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n\n([\s\S]+)/);
  if (!frontmatterMatch) {
    console.error(`❌ Invalid SKILL.md format for ${skillName}`);
    return false;
  }
  
  let frontmatter;
  try {
    frontmatter = yaml.parse(frontmatterMatch[1]);
  } catch (err) {
    console.error(`❌ YAML parse error for ${skillName}: ${err.message}`);
    return false;
  }
  const body = frontmatterMatch[2];
  
  // Build Cursor .mdc frontmatter
  const cursorFrontmatter = {
    title: frontmatter.displayName || frontmatter.name,
    description: frontmatter.vibe || frontmatter.description?.split('\n')[0]?.replace(/^-\.\s+Use when[^.]+\.\s+/, '') || '',
    tags: frontmatter.tags || []
  };
  
  // Build .mdc content
  const mdcContent = `---\n${yaml.stringify(cursorFrontmatter)}---\n\n${body}`;
  
  // Write to output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${skillName}.mdc`);
  fs.writeFileSync(outputPath, mdcContent);
  
  console.log(`✅ ${skillName} → ${outputPath}`);
  return true;
}

function convertAll() {
  const skills = fs.readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = path.join(SKILLS_DIR, name);
      return fs.statSync(skillPath).isDirectory() && !name.startsWith('_');
    });
  
  let success = 0;
  let failed = 0;
  
  for (const skill of skills) {
    if (convertSkillToCursor(skill)) {
      success++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n✅ Converted ${success} skills to Cursor format`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} skills`);
  }
  console.log(`\nOutput: ${OUTPUT_DIR}/`);
  console.log('\nTo use in Cursor:');
  console.log(`  cp ${OUTPUT_DIR}/*.mdc .cursor/rules/`);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log('Usage:');
  console.log('  node converters/cursor.js <skill-name>');
  console.log('  node converters/cursor.js --all');
  process.exit(args[0] === '--help' ? 0 : 1);
}

if (args[0] === '--all') {
  convertAll();
} else {
  const skillName = args[0];
  if (convertSkillToCursor(skillName)) {
    console.log('\nTo use in Cursor:');
    console.log(`  cp ${OUTPUT_DIR}/${skillName}.mdc .cursor/rules/`);
  } else {
    process.exit(1);
  }
}
