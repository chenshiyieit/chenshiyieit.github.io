import { cpSync, existsSync, mkdirSync } from 'node:fs';

const built = new URL('../dist-pages/', import.meta.url);
const staging = new URL('../.pages-deploy/', import.meta.url);
if (!existsSync(new URL('index.html', built))) throw new Error('Run npm run verify:pages first.');
mkdirSync(staging, { recursive: true });
cpSync(built, staging, { recursive: true, filter: (source) => !source.endsWith('/.gitkeep') });
console.log('Prepared only generated website files in .pages-deploy/');
