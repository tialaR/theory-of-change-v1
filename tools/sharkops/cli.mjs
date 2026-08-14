import { heading, ui } from './core/ui.mjs';
heading('🦈 SHARKOPS', 'ATTACK CONTROL');
console.log(`${ui.white('Commands')}\n`);
console.log('  npm run shark:status   Current target and next bite');
console.log('  npm run shark:doctor   Structural system scan');
console.log('  npm run shark:verify   Verify the installed contract');
console.log('  npm run shark:new -- --id SO-001 --codename "Black Box" --purpose "Knowledge as Code"');
console.log(`\n${ui.muted('No silent deviation. Every approved rule becomes a gate.')}\n`);
