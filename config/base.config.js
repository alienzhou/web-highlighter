const path = require('path');
const {basePath} = require('./paths');
const {TsconfigPathsPlugin} = require('tsconfig-paths-webpack-plugin');

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
        plugins: [new TsconfigPathsPlugin()],
        extensions: ['.ts', '.tsx', '.js']
    }
};