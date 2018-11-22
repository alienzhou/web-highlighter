const webpack = require('webpack');
const {distDirname, basePath} = require('./paths.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./base.config');
const version = require('../package.json').version;
const repository = 'https://github.com/alienzhou/highlighter';
const bannerInfo = `highlighter v${version} ${repository}`;

const config = {
    mode: 'production',
    output: {
        filename: 'highlighter.min.js'
    },
    plugins: [
        new CleanWebpackPlugin([distDirname], {root: basePath}),
        new webpack.BannerPlugin(bannerInfo)
    ]
};

module.exports = merge(baseConfig, config);