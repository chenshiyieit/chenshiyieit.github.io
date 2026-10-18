import { execFileSync } from 'node:child_process';

execFileSync('npm', ['run', 'build'], {
  cwd: new URL('../', import.meta.url),
  stdio: 'inherit',
  timeout: 120000,
  env: {
    ...process.env,
    SITE_URL: 'https://chenshiyieit.github.io',
    SITE_BASE: '/',
    BUILD_OUTPUT: './dist-pages',
  },
});
