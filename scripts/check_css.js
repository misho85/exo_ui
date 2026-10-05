const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const compiler = path.join(root, 'node_modules', '.bin', 'lightningcss');
const bundles = [
  ['assets/css/exo.css', 'priv/static/exo.css'],
  ['assets/css/src/tokens.css', 'priv/static/exo.tokens.css']
];

for (const [source, output] of bundles) {
  const expected = execFileSync(compiler, ['--bundle', '--minify', source], { cwd: root });
  // The CLI appends a newline on stdout but not when using its -o option.
  if (expected.toString().trimEnd() !== fs.readFileSync(path.join(root, output), 'utf8').trimEnd()) {
    console.error(`${output} does not match its sources. Run bun run build:all.`);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log('CSS bundles match their sources.');
