// cSpell:ignore contenthash
const path = require('path');
const basePath = require('./paths.js').basePath;

module.exports = {
    entry: [
        path.resolve(basePath, 'src/index.ts')
    ],
    module: {
        rules: [{
            test: /.ts$/,
            loader: 'ts-loader',
        }]
    },
    output: {
        path: path.resolve(basePath, 'dist'),
        library: 'Highlighter',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    }
};