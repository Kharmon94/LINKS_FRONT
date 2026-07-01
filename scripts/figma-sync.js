#!/usr/bin/env node
/**
 * Figma / design repo sync helper.
 * Default design repo for Links monorepo.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const repoRoot = path.join(frontendRoot, '..');
const cloneDir = path.join(repoRoot, '.figma-design-repo');
const FIGMA_REPO_URL =
  process.env.FIGMA_REPO_URL || 'https://github.com/BlackCollar27/Linksblackcollario.git';

const FILES_TO_PRESERVE = [
  'src/services/api.ts',
  'src/services/api.test.ts',
  'src/types/index.ts',
  'src/app/contexts/auth-context.tsx',
  'src/app/components/error-boundary.tsx',
  'src/app/components/protected-route.tsx',
  'src/app/components/nav/app-top-nav.tsx',
  'src/app/components/nav/public-top-nav.tsx',
  'src/app/components/footer.tsx',
  'src/app/components/auth-screen.tsx',
  'src/app/pages/oauth-complete-page.tsx',
  'src/app/pages/auth-page.tsx',
  'src/app/pages/verify-page.tsx',
  'src/app/pages/landing-page.tsx',
  'src/app/pages/links-page.tsx',
  'src/app/pages/global-analytics-page.tsx',
  'src/services/analytics-api.ts',
  'src/app/pages/settings-page.tsx',
  'src/app/routes.tsx',
  'src/main.tsx',
  'vite.config.ts',
  'vitest.config.ts',
  'vitest.setup.ts',
];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot });
}

function check() {
  if (!fs.existsSync(cloneDir)) {
    run(`git clone --depth 1 "${FIGMA_REPO_URL}" "${cloneDir}"`);
  } else {
    run(`git -C "${cloneDir}" pull --ff-only || true`);
  }
  const state = {
    repo: FIGMA_REPO_URL,
    updatedAt: new Date().toISOString(),
    designSrcFiles: countFiles(path.join(cloneDir, 'src')),
    frontendSrcFiles: countFiles(path.join(frontendRoot, 'src')),
  };
  fs.writeFileSync(path.join(frontendRoot, '.figma-sync-state.json'), JSON.stringify(state, null, 2));
  console.log('figma:check OK', state);
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else n += 1;
    }
  };
  walk(dir);
  return n;
}

function diff() {
  console.log('Files to preserve (integration):');
  for (const f of FILES_TO_PRESERVE) console.log(' -', f);
  console.log('\nCompare design clone src vs frontend src manually or with:');
  console.log(`  diff -qr "${path.join(cloneDir, 'src')}" "${path.join(frontendRoot, 'src')}" | head`);
}

const cmd = process.argv[2];
if (cmd === 'check') check();
else if (cmd === 'diff') diff();
else {
  console.log('Usage: node scripts/figma-sync.js check|diff');
  process.exit(1);
}
