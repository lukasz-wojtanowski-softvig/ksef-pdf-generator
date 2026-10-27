#!/usr/bin/env node

import { Command } from 'commander';
import { CliApplication } from './application/index.js';

declare const __APP_VERSION__: string;

(async () => {
  const app = new CliApplication();
  await app.initialize();

  const program = new Command();
  program
    .name('ksef-pdf')
    .description('Generator PDF dla faktur i UPO z systemu KSeF')
    .version(__APP_VERSION__);

  app.setupCommands(program);
  program.parse(process.argv);
})();
