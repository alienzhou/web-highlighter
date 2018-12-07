const webpack = require('webpack');
const configPath = process.env.target === 'example' ? '../config/example.config.js' : '../config/prod.config.js';
const config = require(configPath);
const convert = require('./convet-md');

if (process.env.target === 'example') {
    convert();
}

webpack(config, (err, stats) => {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
        console.log(err);
        process.exit(1);
    }
    console.log(stats.toString({colors: true}));
    process.exit(0);
});