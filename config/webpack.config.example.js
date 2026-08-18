// cSpell:ignore devtool,contenthash
/**
 * config for building example bundle (homepage)
 */
const { staticPath } = require('./paths.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.example.config');

const config = {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [staticPath]
        })
    ],
    output: {
        filename: 'index.[contenthash:8].js'
    }
};

module.exports = merge(baseConfig, config);