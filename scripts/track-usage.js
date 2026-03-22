#!/usr/bin/env node
/**
 * track-usage.js — Usage analytics for skills
 * Tracks which skills are used and generates insights
 */

const fs = require('fs');
const path = require('path');

const USAGE_LOG = path.resolve(__dirname, '../.usage-log.json');

// ANSI colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Load usage log
function loadLog() {
  if (!fs.existsSync(USAGE_LOG)) {
    return { skills: {}, events: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(USAGE_LOG, 'utf8'));
  } catch {
    return { skills: {}, events: [] };
  }
}

// Save usage log
function saveLog(log) {
  fs.writeFileSync(USAGE_LOG, JSON.stringify(log, null, 2));
}

// Record skill usage
function recordUsage(skillId, action = 'use') {
  const log = loadLog();
  
  if (!log.skills[skillId]) {
    log.skills[skillId] = {
      totalUses: 0,
      firstUsed: new Date().toISOString(),
      lastUsed: null,
      actions: {},
    };
  }
  
  const skill = log.skills[skillId];
  skill.totalUses++;
  skill.lastUsed = new Date().toISOString();
  
  if (!skill.actions[action]) {
    skill.actions[action] = 0;
  }
  skill.actions[action]++;
  
  log.events.push({
    timestamp: new Date().toISOString(),
    skillId,
    action,
  });
  
  // Keep only last 1000 events
  if (log.events.length > 1000) {
    log.events = log.events.slice(-1000);
  }
  
  saveLog(log);
  console.log(`${C.dim}✓ Tracked: ${skillId} (${action})${C.reset}`);
}

// Generate analytics report
function generateReport(options = {}) {
  const log = loadLog();
  const skills = Object.entries(log.skills);
  
  if (skills.length === 0) {
    console.log(`\n${C.yellow}No usage data yet.${C.reset}`);
    console.log(`${C.dim}Skills will be tracked when used via respec CLI.${C.reset}\n`);
    return;
  }
  
  // Sort by total uses
  const sorted = skills.sort((a, b) => b[1].totalUses - a[1].totalUses);
  
  console.log(`\n${C.bold}${C.blue}═══ Skill Usage Analytics ═══${C.reset}\n`);
  
  // Summary stats
  const totalSkills = skills.length;
  const totalUses = skills.reduce((sum, [, data]) => sum + data.totalUses, 0);
  const avgUsesPerSkill = Math.round(totalUses / totalSkills);
  
  const recentEvents = log.events.slice(-100);
  const last24h = recentEvents.filter(e => {
    const eventTime = new Date(e.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return eventTime > oneDayAgo;
  });
  
  console.log(`${C.bold}Summary:${C.reset}`);
  console.log(`  Skills tracked: ${totalSkills}`);
  console.log(`  Total uses: ${totalUses.toLocaleString()}`);
  console.log(`  Average uses per skill: ${avgUsesPerSkill}`);
  console.log(`  Activity (last 24h): ${last24h.length} events`);
  
  // Top 10 most used
  const top10 = sorted.slice(0, 10);
  console.log(`\n${C.bold}Top 10 Most Used:${C.reset}\n`);
  
  top10.forEach(([skillId, data], idx) => {
    const rank = `${idx + 1}.`.padStart(3);
    const uses = `${data.totalUses}x`.padStart(6);
    const lastUsed = new Date(data.lastUsed);
    const daysAgo = Math.floor((Date.now() - lastUsed) / (1000 * 60 * 60 * 24));
    const recency = daysAgo === 0 ? 'today' : 
                   daysAgo === 1 ? 'yesterday' :
                   `${daysAgo}d ago`;
    
    console.log(`  ${C.cyan}${rank}${C.reset} ${uses}  ${skillId.padEnd(35)} ${C.dim}(${recency})${C.reset}`);
  });
  
  // Least used (bottom 5)
  if (!options.topOnly && sorted.length > 10) {
    const bottom5 = sorted.slice(-5).reverse();
    console.log(`\n${C.bold}${C.dim}Least Used:${C.reset}\n`);
    
    bottom5.forEach(([skillId, data]) => {
      const uses = `${data.totalUses}x`.padStart(6);
      const lastUsed = new Date(data.lastUsed);
      const daysAgo = Math.floor((Date.now() - lastUsed) / (1000 * 60 * 60 * 24));
      
      console.log(`  ${C.dim}${uses}  ${skillId.padEnd(35)} (${daysAgo}d ago)${C.reset}`);
    });
  }
  
  // Recent activity
  if (!options.noRecent && recentEvents.length > 0) {
    console.log(`\n${C.bold}Recent Activity (last ${recentEvents.length} events):${C.reset}\n`);
    
    const bySkill = {};
    recentEvents.forEach(e => {
      if (!bySkill[e.skillId]) bySkill[e.skillId] = 0;
      bySkill[e.skillId]++;
    });
    
    const recentSorted = Object.entries(bySkill)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    recentSorted.forEach(([skillId, count]) => {
      const pct = Math.round((count / recentEvents.length) * 100);
      console.log(`  ${C.green}${count}x${C.reset}  ${skillId.padEnd(35)} ${C.dim}(${pct}%)${C.reset}`);
    });
  }
  
  // Recommendations
  if (!options.noRecommendations) {
    console.log(`\n${C.bold}Insights:${C.reset}\n`);
    
    const unused = 56 - totalSkills; // Assuming 56 total skills
    if (unused > 0) {
      console.log(`  ${C.yellow}▸ ${unused} skills have never been used${C.reset}`);
      console.log(`    Consider promoting or deprecating unused skills`);
    }
    
    const highUse = sorted.filter(([, data]) => data.totalUses > avgUsesPerSkill * 2);
    if (highUse.length > 0) {
      console.log(`  ${C.green}▸ ${highUse.length} skills are heavily used (>2x avg)${C.reset}`);
      console.log(`    Prioritize these for maintenance and improvements`);
    }
    
    const stale = sorted.filter(([, data]) => {
      const lastUsed = new Date(data.lastUsed);
      const monthsAgo = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo > 3;
    });
    if (stale.length > 0) {
      console.log(`  ${C.dim}▸ ${stale.length} skills haven't been used in 3+ months${C.reset}`);
      console.log(`    Consider archiving or deprecating`);
    }
  }
  
  console.log('');
}

// Clear usage data
function clearLog() {
  if (fs.existsSync(USAGE_LOG)) {
    fs.unlinkSync(USAGE_LOG);
    console.log(`${C.green}✓ Usage log cleared${C.reset}`);
  } else {
    console.log(`${C.dim}No usage log to clear${C.reset}`);
  }
}

// Export data
function exportData(format = 'json') {
  const log = loadLog();
  
  if (format === 'csv') {
    console.log('skill_id,total_uses,first_used,last_used');
    Object.entries(log.skills).forEach(([id, data]) => {
      console.log(`${id},${data.totalUses},${data.firstUsed},${data.lastUsed}`);
    });
  } else {
    console.log(JSON.stringify(log, null, 2));
  }
}

// Main
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'track':
      if (!args[1]) {
        console.error(`${C.yellow}Usage: track-usage.js track <skill-id> [action]${C.reset}`);
        process.exit(1);
      }
      recordUsage(args[1], args[2] || 'use');
      break;
      
    case 'report':
      generateReport({
        topOnly: args.includes('--top-only'),
        noRecent: args.includes('--no-recent'),
        noRecommendations: args.includes('--no-recommendations'),
      });
      break;
      
    case 'clear':
      clearLog();
      break;
      
    case 'export':
      exportData(args[1] || 'json');
      break;
      
    default:
      // Default to report
      generateReport();
  }
}

main();
