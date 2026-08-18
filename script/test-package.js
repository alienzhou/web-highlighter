const { execFileSync } = require('child_process');
const { mkdtempSync, rmSync, writeFileSync } = require('fs');
const { tmpdir } = require('os');
const { join, resolve } = require('path');

const packageJson = require('../package.json');
const basePath = resolve(__dirname, '..');
const tempPath = mkdtempSync(join(tmpdir(), 'web-highlighter-package-'));
const run = (command, args) => execFileSync(command, args, { cwd: basePath, stdio: 'inherit' });

try {
    run('npm', ['pack', '--pack-destination', tempPath]);

    const packagePath = join(tempPath, `${packageJson.name}-${packageJson.version}.tgz`);
    writeFileSync(join(tempPath, 'package.json'), '{"private":true}');
    writeFileSync(join(tempPath, 'tsconfig.json'), '{"compilerOptions":{"esModuleInterop":true,"lib":["dom","es2015"],"strict":true,"noEmit":true}}');
    writeFileSync(join(tempPath, 'index.ts'), "import Highlighter from 'web-highlighter';\nconst highlighter = new Highlighter({ wrapTag: 'mark' });\nhighlighter.run();\nhighlighter.removeAll();\nHighlighter.event.CREATE;\n");

    execFileSync('npm', ['install', '--ignore-scripts', '--no-package-lock', packagePath], { cwd: tempPath, stdio: 'inherit' });
    execFileSync(join(basePath, 'node_modules', '.bin', 'tsc'), ['--project', join(tempPath, 'tsconfig.json')], {
        cwd: tempPath,
        stdio: 'inherit',
    });
} finally {
    rmSync(tempPath, { recursive: true, force: true });
}
