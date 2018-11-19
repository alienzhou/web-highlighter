// cSpell:ignore contenthash
const path = require('path');
const {distDirname, basePath} = require('./paths.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./base.config');
const version = require('../package.json').version;

const config = {
    mode: 'production',
    output: {
        filename: `highlighter.${version}.min.js`
    },
    plugins: [
        new CleanWebpackPlugin([distDirname], {root: basePath})
    ]
};

module.exports = merge(baseConfig, config);