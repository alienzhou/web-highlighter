
// cSpell:ignore devtool
const path = require('path');
const baseConfig = require('./base.config');
const merge = require('webpack-merge');

const config = {
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    output: {
        filename: 'highlight.js'
    }
};

module.exports = merge(baseConfig, config);