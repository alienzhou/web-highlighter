const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const {examplePath, staticPath} = require('./paths.js');
const TextReplaceHtmlWebpackPlugin = require('text-replace-html-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./base.config');

const config = {
    entry: [
        path.resolve(examplePath, 'index.js')
    ],
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [],
    output: {
        path: staticPath,
        filename: 'index.js'
    }
};

module.exports = merge(baseConfig, config);
