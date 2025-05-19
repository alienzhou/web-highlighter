const staticPath = require('./paths.js').staticPath;
const PORT = process.env.PORT || 8085;
const HOST = process.env.HOST || '0.0.0.0';

module.exports = {
    allowedHosts: "all",
    compress: true,
    hot: true,
    host: HOST,
    port: PORT,
    static: {
        directory: staticPath,
        watch: true,
        staticOptions: {
            ignored: /node_modules/
        }
    }
};