import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../dist-pages/', import.meta.url).pathname;
const base = '/';
const origin = 'https://chenshiyieit.github.io';
const sections = ['', 'biography/', 'research/', 'publications/', 'people/', 'gallery/'];

test('GitHub Pages build exists separately from local build', () => {
  assert.ok(existsSync(join(root, 'index.html')), 'Missing project-site deployment build');
});

test('user-site pages use the new hostname and root-based navigation and assets', () => {
  for (const locale of ['en', 'zh']) {
    for (const section of sections) {
      const html = readFileSync(join(root, locale, section, 'index.html'), 'utf8');
      const counterpart = locale === 'zh' && !section ? base : `${base}${locale === 'en' ? 'zh' : 'en'}/${section}`;
      const canonical = locale === 'en' && !section ? `${origin}${base}` : `${origin}${base}${locale}/${section}`;
      assert.ok(html.includes(`href="${counterpart}"`));
      assert.ok(html.includes(`href="${canonical}"`), 'Canonical must use the new hostname');
      assert.ok(!html.includes('/shiyi-chen-web/'), 'Old project subpath must not remain');
      for (const match of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?#]*)(?:[?#][^"]*)?"/g)) {
        assert.ok(match[1].startsWith(base), `Escaping project path: ${match[1]}`);
        const relative = decodeURIComponent(match[1].slice(base.length));
        assert.ok(existsSync(join(root, relative, relative.endsWith('/') ? 'index.html' : '')), `Missing deployed asset: ${relative}`);
      }
    }
  }
});

test('user-site entry serves the full English homepage at the domain root', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /<h1[\s>]/);
  assert.match(html, /Lattice Boltzmann method for fluid flows/);
  assert.ok(html.includes(`rel="canonical" href="${origin}/"`));
  assert.doesNotMatch(html, /http-equiv="refresh"|Redirecting/i);
  assert.ok(!html.includes('/shiyi-chen-web/'));
});

test('deployment contains no source, internal notes, credentials or source maps', () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
  for (const path of walk(root)) {
    assert.doesNotMatch(path.slice(root.length), /(?:^|\/)(?:\.env|\.sisyphus|node_modules|docs|src)(?:\/|$)|\.(?:md|map|ts|astro)$/);
  }
  assert.ok(existsSync(join(root, '.nojekyll')));
});
