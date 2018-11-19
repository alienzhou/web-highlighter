const webpack = require('webpack');
const config = require('../config/prod.config.js');

const compiler = webpack(config, (err, stats) => {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});