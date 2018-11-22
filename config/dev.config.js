
// cSpell:ignore devtool
const merge = require('webpack-merge');
const baseConfig = require('./example.base.config');

const config = {
    mode: 'development',
    devtool: 'source-map'
};

module.exports = merge(baseConfig, config);