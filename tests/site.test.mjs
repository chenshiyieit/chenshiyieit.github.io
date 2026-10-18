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

test('people show the current PhD students heading in both languages', () => {
  for (const locale of ['en', 'zh']) {
    const html = readPage(locale, 'people/');
    assert.match(html, locale === 'en' ? /Current PhD Students/ : /在读博士生/);
  }
});

test('every past member has an English and Chinese name in both locales', () => {
  for (const locale of ['en', 'zh']) {
    const alumni = readPage(locale, 'people/').match(/class="prose alumni-content">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(alumni, `Missing alumni section in ${locale}`);
    const names = [...alumni.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((match) => match[1].replace(/<[^>]+>/g, ''));
    assert.equal(names.length, 23);
    for (const name of names) {
      assert.match(name, /^[A-Za-z]+(?:[- ][A-Za-z]+)+\s+[\p{Script=Han}]{2,}/u, `${locale}: ${name}`);
    }
  }
});

test('Xiang Yang appears among undergraduate alumni with his graduation year and homepage', () => {
  for (const locale of ['en', 'zh']) {
    const html = readPage(locale, 'people/');
    const undergraduates = html.match(/<h3[^>]*>(?:Undergraduate students|本科生)<\/h3>([\s\S]*?)<h3/);
    assert.ok(undergraduates, `Missing undergraduate section in ${locale}`);
    assert.match(undergraduates[1], /Xiang Yang 杨翔/);
    assert.match(undergraduates[1], /2012/);
    assert.match(undergraduates[1], /https:\/\/www\.me\.psu\.edu\/department\/directory-detail-g\.aspx\?q=xzy48/);
  }
});

test('current students contain exactly the four confirmed names and no former faculty', () => {
  for (const locale of ['en', 'zh']) {
    const html = readPage(locale, 'people/');
    const members = [...html.matchAll(/<article class="member">[\s\S]*?<h3>([\s\S]*?)<\/h3>/g)]
      .map((match) => match[1].replace(/<[^>]+>/g, ''));
    assert.equal(members.length, 4);
    for (const [index, name] of ['杨鑫平', '杨忠鑫', '张时斌', '王彦祺'].entries()) assert.ok(members[index].includes(name));
    assert.doesNotMatch(html, /李岩松|姜汉博|章盛祺|韦雁机|杨永超/);
  }
});

test('current PhD students show confirmed affiliations without invented photos, links or PI labels', () => {
  for (const locale of ['en', 'zh']) {
    const members = [...readPage(locale, 'people/').matchAll(/<article class="member">([\s\S]*?)<\/article>/g)].map((match) => match[1]);
    assert.equal(members.length, 4);
    for (const member of members) assert.doesNotMatch(member, /class="member-pi"|<img|<a /);
    for (const member of members.slice(0, 2)) assert.match(member, /Peking University|北京大学/);
    assert.match(members[2], /Shanghai Jiao Tong University|上海交通大学/);
    assert.match(members[3], /The Hong Kong Polytechnic University|香港理工大学/);
    for (const member of members.slice(2)) {
      assert.match(member, /Eastern Institute of Technology|东方理工/);
      assert.match(member, /joint|联培|联合培养/i);
    }
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
