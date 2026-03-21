#!/usr/bin/env node
/**
 * Auto-suggest categories for all Respec skills based on tags and content
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SKILLS_DIR = path.join(__dirname, '../skills');
const CATEGORIES = {
  frontend: ['react', 'nextjs', 'vue', 'shadcn', 'tailwind', 'ui', 'css'],
  backend: ['prisma', 'node', 'express', 'api', 'server', 'postgres', 'mysql'],
  fullstack: ['mern', 'mean', 'stack'],
  testing: ['jest', 'vitest', 'playwright', 'test', 'qa'],
  deployment: ['docker', 'kubernetes', 'ecs', 'cloud', 'deploy', 'ci', 'cd'],
  ai: ['llm', 'openai', 'anthropic', 'prompt', 'rag', 'embedding', 'agent'],
  data: ['sql', 'database', 'analytics', 'etl', 'pipeline'],
  mobile: ['react-native', 'flutter', 'ios', 'android', 'mobile'],
  design: ['figma', 'ui', 'ux', 'accessibility', 'a11y', 'design'],
  devops: ['git', 'github', 'monitoring', 'observability', 'infrastructure'],
  security: ['auth', 'oauth', 'jwt', 'encryption', 'security', 'vulnerability'],
  productivity: ['workflow', 'automation', 'tool', 'skill', 'cron'],
  specialized: [] // catch-all
};

function suggestCategory(skillName, frontmatter) {
  const tags = frontmatter.tags || [];
  const description = (frontmatter.description || '').toLowerCase();
  const name = skillName.toLowerCase();
  
  const scores = {};
  
  // Score each category based on tag/name/description matches
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (category === 'specialized') continue;
    
    let score = 0;
    for (const keyword of keywords) {
      if (tags.includes(keyword)) score += 3;
      if (name.includes(keyword)) score += 2;
      if (description.includes(keyword)) score += 1;
    }
    scores[category] = score;
  }
  
  // Find highest-scoring category
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'specialized';
  
  return Object.entries(scores).find(([_, score]) => score === maxScore)[0];
}

function suggestEmoji(category, skillName) {
  const emojiMap = {
    frontend: ['⚡', '🎨', '🖼️', '💅'],
    backend: ['🗄️', '⚙️', '🔧', '📦'],
    fullstack: ['🔥', '🚀', '⚡'],
    testing: ['🧪', '✅', '🔬'],
    deployment: ['🐳', '☁️', '🚢', '📦'],
    ai: ['🤖', '🧠', '✨', '🔮'],
    data: ['📊', '📈', '🗃️'],
    mobile: ['📱', '📲', '🍎', '🤖'],
    design: ['🎨', '✏️', '🖌️'],
    devops: ['⚙️', '🔧', '🛠️'],
    security: ['🔒', '🔐', '🛡️'],
    productivity: ['⚡', '🎯', '📋'],
    specialized: ['🔮', '✨', '🎪']
  };
  
  const options = emojiMap[category] || ['📦'];
  return options[0];
}

function suggestVibe(category, skillName) {
  // Generate concise vibe based on skill name and category
  const vibes = {
    nextjs: 'Server-first React with type-safe data flows',
    shadcn: 'Copy-paste components that you own',
    prisma: 'Type-safe database queries with zero boilerplate',
    'docker-containerization': 'Ship anywhere with zero config drift',
    'javascript-testing-patterns': 'Test-driven confidence with zero flakiness',
    // Add more as needed
  };
  
  return vibes[skillName] || `${category} excellence`;
}

// Main execution
const skillDirs = fs.readdirSync(SKILLS_DIR).filter(name => {
  const skillPath = path.join(SKILLS_DIR, name);
  return fs.statSync(skillPath).isDirectory() && !name.startsWith('_');
});

console.log(`Found ${skillDirs.length} skills\n`);

const suggestions = [];

for (const skillName of skillDirs) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillPath)) continue;
  
  const content = fs.readFileSync(skillPath, 'utf8');
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) continue;
  
  const frontmatter = yaml.parse(match[1]);
  
  // Skip if already has category
  if (frontmatter.category) {
    console.log(`✓ ${skillName}: already has category (${frontmatter.category})`);
    continue;
  }
  
  const category = suggestCategory(skillName, frontmatter);
  const emoji = frontmatter.emoji || suggestEmoji(category, skillName);
  const vibe = frontmatter.vibe || suggestVibe(category, skillName);
  
  suggestions.push({ skillName, category, emoji, vibe });
  
  console.log(`→ ${skillName}:`);
  console.log(`  category: ${category}`);
  console.log(`  emoji: ${emoji}`);
  console.log(`  vibe: ${vibe}`);
  console.log();
}

console.log(`\n${suggestions.length} skills need category assignment`);
console.log('\nTo apply these suggestions, run:');
console.log('  node scripts/apply-categories.js\n');

// Save suggestions
fs.writeFileSync(
  path.join(__dirname, '../category-suggestions.json'),
  JSON.stringify(suggestions, null, 2)
);
console.log('Saved suggestions to category-suggestions.json');
