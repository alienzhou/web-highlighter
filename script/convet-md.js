const showdown = require('showdown');
const path = require('path');
const paths = require('../config/paths');
const fs = require('fs');

module.exports = function convertMd2Html() {
    const md = fs.readFileSync(path.resolve(paths.basePath, 'docs/note.md'), 'utf-8');
    showdown.setFlavor('github');
    const converter = new showdown.Converter();
    const html = converter.makeHtml(md);
    fs.writeFileSync(path.resolve(paths.examplePath, 'md.html'), html, 'utf-8');
    console.log('convert md to html success!');
}

process.argv[1] === __filename && convertMd2Html();