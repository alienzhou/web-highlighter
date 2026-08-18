import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

describe('Distribution bundle', function () {
    this.timeout(50000);

    it('exposes the UMD global and supports the highlight lifecycle', () => {
        const bundle = readFileSync(resolve(__dirname, '..', 'dist', 'web-highlighter.min.js'), 'utf-8');
        const dom = new JSDOM('<main><p>Highlight this text.</p></main>', {
            runScripts: 'dangerously',
        });
        const { window } = dom;

        window.eval(bundle);

        const Highlighter = (window as typeof window & { Highlighter: new () => any }).Highlighter;

        expect(Highlighter).to.be.a('function');

        const highlighter = new Highlighter();
        const paragraph = window.document.querySelector('p');

        if (!paragraph || !paragraph.firstChild || !paragraph.firstChild.textContent) {
            throw new Error('Expected test paragraph with text content');
        }

        const text = paragraph.firstChild;
        const textContent = text.textContent;

        if (!textContent) {
            throw new Error('Expected test paragraph with text content');
        }

        const range = window.document.createRange();

        range.setStart(text, 0);
        range.setEnd(text, textContent.length);

        const source = highlighter.fromRange(range);
        const wrapper = window.document.querySelector('[data-highlight-id]');

        if (!wrapper) {
            throw new Error('Expected highlighted wrapper');
        }

        expect(wrapper.textContent).to.equal('Highlight this text.');
        expect(highlighter.getDoms(source.id)).to.deep.equal([wrapper]);

        highlighter.remove(source.id);

        expect(window.document.querySelector('[data-highlight-id]')).to.be.null;
        expect(paragraph.textContent).to.equal('Highlight this text.');

        window.close();
    });
});
