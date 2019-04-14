const path = require('path');
const {srcPath, basePath} = require('./paths');

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
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@src': srcPath
        }
    }
};