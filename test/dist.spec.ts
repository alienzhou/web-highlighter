import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

describe('Distribution bundle', function () {
    this.timeout(50000);

    it('stops before an excluded end node', () => {
        const bundle = readFileSync(resolve(__dirname, '..', 'dist', 'web-highlighter.min.js'), 'utf-8');
        const dom = new JSDOM(
            '<main><p>before <span class="excluded">excluded</span> after</p><p>unrelated</p></main>',
            {
                runScripts: 'dangerously',
            },
        );
        const { window } = dom;

        window.eval(bundle);

        const Highlighter = (window as typeof window & { Highlighter: new (options?: any) => any }).Highlighter;
        const paragraph = window.document.querySelector('p');
        const excluded = paragraph?.querySelector('.excluded');

        if (!Highlighter || !paragraph || !paragraph.firstChild || !excluded?.firstChild) {
            throw new Error('Expected test document structure');
        }

        const highlighter = new Highlighter({ exceptSelectors: ['.excluded'] });
        const range = window.document.createRange();

        range.setStart(paragraph.firstChild, 0);
        range.setEnd(excluded.firstChild, 3);
        highlighter.fromRange(range);

        expect(highlighter.getDoms().map(($node: Element) => $node.textContent)).to.deep.equal(['before ']);
        expect(window.document.querySelectorAll('[data-highlight-id]')).to.have.lengthOf(1);
        expect(paragraph.textContent).to.equal('before excluded after');
        expect(window.document.querySelectorAll('p')[1].textContent).to.equal('unrelated');

        window.close();
    });

    it('ignores image-only ranges', () => {
        const bundle = readFileSync(resolve(__dirname, '..', 'dist', 'web-highlighter.min.js'), 'utf-8');
        const dom = new JSDOM('<main><img></main>', {
            runScripts: 'dangerously',
        });
        const { window } = dom;

        window.eval(bundle);

        const Highlighter = (window as typeof window & { Highlighter: new (options?: any) => any }).Highlighter;
        const image = window.document.querySelector('img');

        if (!Highlighter || !image) {
            throw new Error('Expected UMD global and test image');
        }

        const highlighter = new Highlighter();
        const range = window.document.createRange();

        range.selectNodeContents(image);

        let source;

        expect(() => {
            source = highlighter.fromRange(range);
        }).not.to.throw();
        expect(source).to.be.null;
        expect(window.document.querySelector('[data-highlight-id]')).to.be.null;

        window.close();
    });

    it('exposes the UMD global and supports the highlight lifecycle', () => {
        const bundle = readFileSync(resolve(__dirname, '..', 'dist', 'web-highlighter.min.js'), 'utf-8');
        const dom = new JSDOM('<main><p>Highlight this text.</p></main>', {
            runScripts: 'dangerously',
        });
        const { window } = dom;

        window.eval(bundle);

        const Highlighter = (window as typeof window & { Highlighter: new (options?: any) => any }).Highlighter;

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
