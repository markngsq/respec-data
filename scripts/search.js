#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.resolve(__dirname, '../capabilities.json');
const MAX_RESULTS = 5;

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/[\s\-]+/)
    .filter(t => t.length > 1);
}

function expandWithSynonyms(tokens, synonymMap) {
  const expanded = new Set(tokens);
  for (const t of tokens) {
    const syns = synonymMap[t];
    if (syns) syns.forEach(s => expanded.add(s));
  }
  return [...expanded];
}

function search(query) {
  if (!fs.existsSync(INDEX_FILE)) {
    console.error(`❌ Index not found: ${INDEX_FILE}`);
    console.error('   Run: npm run build:index');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  const queryTokens = expandWithSynonyms(tokenize(query), data.synonyms);

  if (queryTokens.length === 0) {
    console.error('❌ Query too short — provide at least one meaningful word');
    process.exit(1);
  }

  const scores = {};

  for (const token of queryTokens) {
    const postings = data.index[token];
    if (!postings) continue;

    for (const { skill, weight } of postings) {
      scores[skill] = (scores[skill] || 0) + weight;
    }
  }

  const ranked = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_RESULTS);

  if (ranked.length === 0) {
    console.log(`\n❌ No skills found for: "${query}"\n`);
    console.log('Try broader terms like: "react", "testing", "database", "docker"\n');
    process.exit(0);
  }

  console.log(`\n🔍 Results for: "${query}"\n`);

  for (const [skillName, score] of ranked) {
    const skill = data.skills[skillName];
    console.log(`\x1b[1m${skillName}\x1b[0m \x1b[2m(score: ${score})\x1b[0m`);
    if (skill.description) {
      const desc = skill.description.slice(0, 120);
      console.log(`   ${desc}${desc.length < skill.description.length ? '...' : ''}`);
    }
    if (skill.triggers && skill.triggers.length > 0) {
      console.log(`   \x1b[36mTriggers:\x1b[0m ${skill.triggers.slice(0, 2).join(', ')}`);
    }
    console.log('');
  }

  console.log(`\x1b[2mShowing top ${ranked.length} of ${Object.keys(scores).length} matches\x1b[0m\n`);
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('Usage:');
  console.log('  npm run search "optimize React"');
  console.log('  node scripts/search.js "database queries"');
  console.log('\nSearches Respec skills by keyword/capability');
  process.exit(args[0] === '--help' || args[0] === '-h' ? 0 : 1);
}

const query = args.join(' ');
search(query);
