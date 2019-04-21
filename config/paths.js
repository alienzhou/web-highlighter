const path = require('path');
const basePath = path.resolve(__dirname, '..');
const distDirname = 'dist';
const staticDirname = 'static';
const srcPath = path.resolve(basePath, 'src');
const examplePath = path.resolve(basePath, 'example');
const staticPath = path.resolve(examplePath, staticDirname);
const distPath = path.resolve(basePath, distDirname);
const exampleMdPath = path.resolve(examplePath, 'index.html');
const exampleTplPath = path.resolve(examplePath, 'tpl.html');

module.exports = {
    basePath,
    distDirname,
    staticDirname,
    examplePath,
    staticPath,
    distPath,
    srcPath,
    exampleMdPath,
    exampleTplPath
};