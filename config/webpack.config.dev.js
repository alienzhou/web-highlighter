// cSpell:ignore devtool
/**
 * config for dev environment
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./base.example.config');

const config = {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
};

module.exports = merge(baseConfig, config);