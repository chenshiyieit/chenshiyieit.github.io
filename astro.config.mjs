import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeBaseLinks } from './src/lib/base-path.mjs';

const base = process.env.SITE_BASE || '/';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: process.env.SITE_URL || undefined,
  base,
  outDir: process.env.BUILD_OUTPUT || './dist',
  markdown: { processor: unified({ rehypePlugins: [[rehypeBaseLinks, { base }]] }) },
});
