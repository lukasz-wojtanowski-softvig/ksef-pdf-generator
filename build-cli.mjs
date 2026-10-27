#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

await esbuild.build({
  entryPoints: ['src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: 'dist/cli/index.js',
  banner: {
    js: "import{createRequire}from'module';const require=createRequire(import.meta.url);",
  },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  logLevel: 'warning',
});
