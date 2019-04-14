// cSpell:ignore devtool
/**
 * config for production (lib bundle)
 */
const webpack = require('webpack');
const {distDirname, basePath} = require('./paths.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./base.config');
const pkg = require('../package.json');
const name = pkg.name;
const version = pkg.version;
const repository = pkg.repository.url;
const bannerInfo = `${name} v${version} ${repository}`;

const config = {
    mode: 'production',
    devtool: 'source-map',
    output: {
        filename: 'web-highlighter.min.js'
    },
    plugins: [
        new CleanWebpackPlugin([distDirname], {root: basePath}),
        new webpack.BannerPlugin(bannerInfo)
    ]
};

module.exports = merge(baseConfig, config);