#!/usr/bin/env node

import { Command } from 'commander'
import { runIndexerTasks } from './tasker';
var packageJson = require('./../package.json');

const program = new Command();

program
  .name('indexer')
  .description('Indexer of crypto assets on supported networks')
  .version(packageJson.version)

program.command('index')
  .description('Run through all the tasks specified in tasks.json and index all the assets. Commit them to the repository via the assets-helper.')
  .option('-n --network <string>', 'The specific network to validate. If not specified all network tasks will be run.')
  .option('-t, --type <string>', 'The type of tasks to exclusively run. If not specified, all tasks will be run.')
  .action((options) => {
    
    runIndexerTasks(options.network, options.type)
    .then(results => {
      for(const result of results) {
        console.log(`${result.network}: ${result.type} ${result.source} ${result.verified ? 'verified' : 'not verified'}`);
      }

      process.exit(0);
    })
    .catch(err => {
      console.error("Error running index command\n", err);
      process.exit(1);
    });
});

program.parse(process.argv);
