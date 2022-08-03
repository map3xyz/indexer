#!/usr/bin/env node

import { runIndexerTasks } from './tasker';

console.log('Running indexer tasks...');

runIndexerTasks()
.then(results => {
  if(results.length === 0) {
    console.log('No new indexing results were found.');
  }

  for(const result of results) {
    console.log(`${result.network}: ${result.type} ${result.source} ${result.verified ? 'verified' : 'not verified'}`);
  }

  process.exit(0);
})
.catch(err => {
  console.error("Error running index command\n", err);
  process.exit(1);
});
