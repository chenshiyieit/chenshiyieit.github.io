import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const output = new URL('../dist/', import.meta.url);
const pages = ['', 'biography/', 'research/', 'publications/', 'people/', 'gallery/'];
const readPage = (locale, page = '') => readFileSync(new URL(`${locale}/${page}index.html`, output), 'utf8');

test('build generates English and Chinese versions of every page', () => {
  for (const locale of ['en', 'zh']) {
    for (const page of pages) {
      assert.ok(existsSync(new URL(`${locale}/${page}index.html`, output)), `Missing ${locale}/${page}`);
    }
  }
});

test('root directly renders the English homepage without a redirect interstitial', () => {
  assert.ok(existsSync(new URL('index.html', output)), 'Missing root entry');
  const html = readFileSync(new URL('index.html', output), 'utf8');
  assert.match(html, /<html[^>]+lang="en"/);
  assert.match(html, /<h1[\s>]/);
  assert.match(html, /Lattice Boltzmann method for fluid flows/);
  assert.doesNotMatch(html, /http-equiv="refresh"|Redirecting|Astro\.redirect/i);
  assert.equal(html, readPage('en'), 'Root and legacy English entry should render the same homepage');
});

test('language switch preserves the current page and declares document language', () => {
  for (const locale of ['en', 'zh']) {
    for (const page of pages) {
      const html = readPage(locale, page);
      assert.match(html, new RegExp(`<html[^>]+lang="${locale}(?:-CN)?"`));
      const counterpart = locale === 'zh' && !page ? '/' : `/${locale === 'en' ? 'zh' : 'en'}/${page}`;
      assert.ok(html.includes(`href="${counterpart}"`), `Missing counterpart for ${locale}/${page}`);
      assert.match(html, /<h1[\s>]/);
    }
  }
});

test('home includes representative work and correct Google Scholar profile', () => {
  for (const locale of ['en', 'zh']) {
    const html = readPage(locale);
    assert.match(html, /Lattice Boltzmann method for fluid flows/);
    assert.match(html, /G4cgJtgAAAAJ/);
    assert.ok(html.includes(`href="/${locale}/publications/"`));
  }
});

test('publication page groups a substantial bibliography in descending year order', () => {
  const html = readPage('en', 'publications/');
  const years = [...html.matchAll(/id="year-(\d{4})"/g)].map((match) => Number(match[1]));
  assert.ok(years.length >= 10, 'Expected at least ten publication years');
  assert.deepEqual(years, [...years].sort((a, b) => b - a));
  assert.ok((html.match(/<li class="publication"/g) ?? []).length >= 100, 'Expected at least one hundred papers');
});

test('both languages display the same bibliography without duplicate paper titles', () => {
  const titles = (locale) => [...readPage(locale, 'publications/').matchAll(/<h3><a[^>]*>(.*?)<\/a><\/h3>/g)].map((match) => match[1]);
  const english = titles('en');
  assert.ok(english.length >= 100);
  assert.deepEqual(titles('zh'), english);
  assert.equal(new Set(english.map((title) => title.toLowerCase())).size, english.length);
});

test('people include faculty members and their homepage links', () => {
  for (const locale of ['en', 'zh']) {
    const html = readPage(locale, 'people/');
    assert.match(html, /Shengqi Zhang|章盛祺/);
    assert.match(html, /https:\/\/faculty.eitech.edu.cn\/mech\/zsq_en\/main.htm/);
    assert.match(html, /https:\/\/faculty.eitech.edu.cn\/mech\/jhb\/main.htm/);
  }
});

test('every past member has an English and Chinese name in both locales', () => {
  for (const locale of ['en', 'zh']) {
    const alumni = readPage(locale, 'people/').match(/class="prose alumni-content">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(alumni, `Missing alumni section in ${locale}`);
    const names = [...alumni.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((match) => match[1].replace(/<[^>]+>/g, ''));
    assert.equal(names.length, 22);
    for (const name of names) {
      assert.match(name, /^[A-Za-z]+(?:[- ][A-Za-z]+)+\s+[\p{Script=Han}]{2,}/u, `${locale}: ${name}`);
    }
  }
});

test('current team contains only the three requested faculty members', () => {
  for (const locale of ['en', 'zh']) {
    const html = readPage(locale, 'people/');
    const members = [...html.matchAll(/<article class="member">[\s\S]*?<h3>([\s\S]*?)<\/h3>/g)]
      .map((match) => match[1].replace(/<[^>]+>/g, ''));
    assert.equal(members.length, 3);
    assert.match(members[0], /姜汉博/);
    assert.match(members[1], /章盛祺/);
    assert.match(members[2], /韦雁机/);
    assert.doesNotMatch(html, /Yansong Li|李岩松|yansong-li\.jpg/);
    assert.ok(members.some((name) => name.includes('韦雁机')));
    assert.ok(members.some((name) => name.includes('姜汉博')));
    assert.ok(members.every((name) => !name.includes('杨永超')));
  }
});

test('all three current faculty members have PI labels', () => {
  for (const locale of ['en', 'zh']) {
    const members = [...readPage(locale, 'people/').matchAll(/<article class="member">([\s\S]*?)<\/article>/g)].map((match) => match[1]);
    assert.equal(members.length, 3);
    for (const member of members) assert.match(member, /class="member-pi"/);
  }
});

test('each of the four research topics has a local illustration in both languages', () => {
  for (const locale of ['en', 'zh']) {
    const topics = readPage(locale, 'research/').split('<main')[1].split(/<h2[^>]*>/).slice(1);
    assert.equal(topics.length, 4);
    for (const topic of topics) assert.match(topic, /<img[^>]+src="\/images\/research\/[^" ]+\.svg"/);
  }
});

test('home selects and orders the four highest-cited papers from the verified Scholar snapshot', () => {
  const expected = [
    'Lattice Boltzmann method for fluid flows',
    'Recovery of the Navier-Stokes equations using a lattice-gas Boltzmann method',
    'A novel thermal model for the lattice Boltzmann method in incompressible limit',
    'A lattice Boltzmann scheme for incompressible multiphase flow and its application in simulation of Rayleigh–Taylor instability',
  ];
  for (const locale of ['en', 'zh']) {
    const actual = [...readPage(locale).matchAll(/<h3><a[^>]*>(.*?)<\/a><\/h3>/g)].map((match) => match[1]);
    assert.deepEqual(actual, expected);
  }
});

test('all generated local links and image sources resolve', () => {
  const root = output.pathname;
  const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : path.endsWith('.html') ? [path] : [];
  });
  for (const path of walk(root)) {
    const html = readFileSync(path, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?#]*)(?:[?#][^"]*)?"/g)) {
      const target = decodeURIComponent(match[1]);
      const resolved = join(root, target, target.endsWith('/') ? 'index.html' : '');
      assert.ok(existsSync(resolved), `Broken local target ${target} in ${path}`);
    }
  }
});

test('visitor pages do not contain internal research or maintenance notes', () => {
  for (const locale of ['en', 'zh']) {
    for (const page of pages) {
      assert.doesNotMatch(readPage(locale, page), /以下依据|历史页面整理|待核实|尚非完整目录|compiled from university profiles|not yet an exhaustive|does not imply sole supervision/i);
    }
  }
});
