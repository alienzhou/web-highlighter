const path = require('path');
const basePath = path.resolve(__dirname, '..');
const distDirname = 'dist';
const staticDirname = 'static';
const examplePath = path.resolve(basePath, 'example');
const staticPath = path.resolve(examplePath, staticDirname);
const distPath = path.resolve(basePath, distDirname);

module.exports = {
    basePath,
    distDirname,
    staticDirname,
    examplePath,
    staticPath,
    distPath
};