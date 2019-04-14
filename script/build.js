const convert = require('./convet-md');
if (process.env.target === 'example') {
    convert();
}

const webpack = require('webpack');
const configPath = process.env.target === 'example' ? '../config/webpack.config.example.js' : '../config/webpack.config.prod.js';
const config = require(configPath);
webpack(config, (err, stats) => {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
        console.log(err);
        console.log(stats.toJson({colors: true}).errors)
        process.exit(1);
    }
    console.log(stats.toString({colors: true}));
    process.exit(0);
});