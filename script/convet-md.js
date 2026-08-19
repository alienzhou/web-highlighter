const MarkdownIt = require('markdown-it');
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
    // The README intentionally uses HTML for its centered masthead, badges, and logo.
    // This is a local, repository-controlled document, so preserve those elements
    // instead of escaping them into visible source text in the example page.
    const html = new MarkdownIt({ html: true }).render(md);
    const tpl = fs.readFileSync(paths.exampleTplPath, 'utf-8');
    fs.outputFileSync(paths.exampleMdPath, tpl.replace(/{{\$markdown}}/, html), 'utf-8');

    log(mdPath, '-', 'convert md to html success!');
}

process.argv[1] === __filename && module.exports();