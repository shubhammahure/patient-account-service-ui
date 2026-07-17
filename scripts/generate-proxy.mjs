import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = process.env.BACKEND_URL || 'http://localhost:8080';

const config = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
  },
  '/login': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
  '/register': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
  '/token': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
};

const outPath = resolve(process.cwd(), 'proxy.generated.json');
writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`[proxy] generated ${outPath} -> ${target}`);

