#!/usr/bin/env node
import readline from 'readline';
import { spawn } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n⚠️  WARNING: You are about to reset the database!');
console.log('This will:');
console.log('  - Drop all tables');
console.log('  - Recreate schema from migrations');
console.log('  - Reseed mandatory data\n');

rl.question('Type "RESET DATABASE" to confirm: ', (answer) => {
  rl.close();

  if (answer === 'RESET DATABASE') {
    console.log('\n✅ Confirmed. Starting database reset...\n');

    const npm = spawn('npm', ['run', 'db:rollback:all', '&&', 'npm', 'run', 'db:migrate', '&&', 'npm', 'run', 'db:seed:mandatory'], {
      stdio: 'inherit',
      shell: true
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Database reset complete!');
      } else {
        console.log('\n❌ Database reset failed');
      }
      process.exit(code);
    });
  } else {
    console.log('\n❌ Cancelled. You did not type "RESET DATABASE".');
    process.exit(1);
  }
});
