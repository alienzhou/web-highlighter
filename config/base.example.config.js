const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const {examplePath, staticPath} = require('./paths.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TextReplaceHtmlWebpackPlugin = require('text-replace-html-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./base.config');
const mdContent = fs.readFileSync(paths.exampleMdPath, 'utf-8');

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
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(examplePath, 'index.html')
        }),
        new TextReplaceHtmlWebpackPlugin({
            replacementArray: [{
                regex : /{{\$markdown}}/,
                replace : mdContent
            }]
        })
    ],
    output: {
        path: staticPath,
        filename: 'index.js'
    }
};

module.exports = merge(baseConfig, config);