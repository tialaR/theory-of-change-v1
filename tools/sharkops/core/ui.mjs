const enabled = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, text) => enabled ? `\u001b[${code}m${text}\u001b[0m` : text;
export const ui = {
  cyan: (t) => c('38;5;45', t),
  blue: (t) => c('38;5;75', t),
  white: (t) => c('97', t),
  muted: (t) => c('38;5;244', t),
  green: (t) => c('38;5;48', t),
  yellow: (t) => c('38;5;220', t),
  red: (t) => c('38;5;196', t),
  bold: (t) => c('1', t),
};
export function logo() {
  return [
    ui.cyan('        /\\'),
    ui.cyan('   ____/  \\____'),
    ui.cyan('  /   SHARKOPS  \\__'),
    ui.cyan('  \\____  ___  ____/'),
    ui.cyan('       \\/   \\/'),
  ].join('\n');
}
export function heading(label, status) {
  console.log(logo());
  console.log(`\n${ui.bold(ui.white(label))}  ${ui.cyan(status)}\n`);
}
export function row(label, value) {
  console.log(`${ui.muted(label.padEnd(15))}${ui.white(value)}`);
}
export function pass(message) { console.log(`${ui.green('PASS')}  ${message}`); }
export function fail(message) { console.error(`${ui.red('BREACH')} ${message}`); }
