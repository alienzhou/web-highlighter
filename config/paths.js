const path = require('path');
module.exports.basePath = path.resolve(__dirname, '..');
module.exports.distDirname = 'dist';
module.exports.distPath = path.resolve(exports.basePath, exports.distDirname);