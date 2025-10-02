#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

// Configuration: mapping from regex -> replacement
const replacements = [
  { regex: /\btext-gray-700\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-gray-600\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-gray-800\b/g, replace: 'text-card-foreground' },
  { regex: /\btext-neutral-800\b/g, replace: 'text-card-foreground' },
  // Also handle occurrences inside longer className lists
  { regex: /text-gray-700(?=["'`\s\>\)])/g, replace: 'text-muted-foreground' },
  { regex: /text-gray-600(?=["'`\s\>\)])/g, replace: 'text-muted-foreground' },
  { regex: /text-gray-800(?=["'`\s\>\)])/g, replace: 'text-card-foreground' },
  { regex: /text-neutral-800(?=["'`\s\>\)])/g, replace: 'text-card-foreground' },
];

const root = path.resolve(__dirname, '..');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === 'node_modules') continue;
      results.push(...await walk(res));
    } else {
      if (/\.(tsx?|jsx?|css|html)$/.test(entry.name)) results.push(res);
    }
  }
  return results;
}

async function run() {
  const files = await walk(path.join(root, 'client', 'src'));
  let changed = 0;
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let original = content;
    for (const { regex, replace } of replacements) {
      content = content.replace(regex, replace);
    }
    if (content !== original) {
      await fs.writeFile(file, content, 'utf8');
      console.log('Patched:', path.relative(root, file));
      changed++;
    }
  }
  console.log(`Done. Files changed: ${changed}`);
  // Show remaining matches
  const remaining = [];
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    if (/text-gray-700|text-gray-600|text-gray-800|text-neutral-800/.test(content)) {
      remaining.push(path.relative(root, file));
    }
  }
  if (remaining.length) {
    console.log('\nRemaining matches in (please inspect):');
    remaining.forEach(f => console.log(' -', f));
  } else {
    console.log('\nNo remaining matches found.');
  }
}

run().catch(err => { console.error(err); process.exit(1); });
