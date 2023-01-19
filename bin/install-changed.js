#!/usr/bin/env node

const { program } = require('commander')

const watcher = require('../lib/main')

program
  .option(
    '--install-command [command]',
    'The command to run when dependencies need to be installed/updated'
  )
// .option(
//   '--shell',
//   'shell type for exec'
// )
  .option(
    '--hash-filename [filename]',
    'Filename where hash of dependencies will be written to'
  )
  .option('--lock-filename [lock_filename]', 'Filename of package lock')
  .option('--hash-only', 'Only update the hash')

program.parse(process.argv)

watcher({
  installCommand: program.installCommand,
  hashFilename: program.hashFilename,
  lockFilename: program.lockFilename,
  isHashOnly: program.hashOnly
})
