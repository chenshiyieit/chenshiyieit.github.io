import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('main pushes build and validate the site before publishing only dist-pages', () => {
  const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  assert.match(workflow, /push:\s+branches: \[main\]/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run verify\s/);
  assert.match(workflow, /npm run verify:pages/);
  assert.match(workflow, /path: dist-pages/);
  assert.match(workflow, /needs: build/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /uses: actions\/deploy-pages@/);
  assert.doesNotMatch(workflow, /shiyi_pages_deploy|BEGIN OPENSSH PRIVATE KEY/);
});
