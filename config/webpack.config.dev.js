// cSpell:ignore devtool
/**
 * config for dev environment
 */
const { merge } = require('webpack-merge');
const baseConfig = require('./base.example.config');

const config = {
    mode: 'development',
    devtool: 'source-map'
};

module.exports = merge(baseConfig, config);