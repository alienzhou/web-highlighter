const showdown = require('showdown');
const path = require('path');
const chalk = require('chalk');
const paths = require('../config/paths');
const fs = require('fs-extra');
const g = chalk.green;

const log = (...args) => console.log.apply(console, [g('[convert]'), ...args.map(s => g(s))]);

module.exports = function () {
    const mdPath = path.resolve(paths.basePath, 'README.md');

    log(mdPath, '-', 'converting...');

    const md = fs.readFileSync(mdPath, 'utf-8');
    showdown.setFlavor('github');
    const converter = new showdown.Converter();
    const html = converter.makeHtml(md);
    const tpl = fs.readFileSync(paths.exampleTplPath, 'utf-8');
    fs.outputFileSync(paths.exampleMdPath, tpl.replace(/{{\$markdown}}/, html), 'utf-8');

    log(mdPath, '-', 'convert md to html success!');
}

process.argv[1] === __filename && module.exports();