import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';
import HighlightSource from '../src/model/source';

describe('Integration Usage', function () {
    this.timeout(50000);

    let cleanup;

    beforeEach(() => {
        cleanup = jsdomGlobal();
    });

    it('should work correctly when root contains no dom', () => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');

        document.body.innerHTML = html;

        let highlighter = new Highlighter({
            $root: document.querySelector('p'),
        });

        let s: HighlightSource;

        (highlighter as any).on(Highlighter.event.CREATE, data => {
            s = data.sources[0];
        });

        const range = document.createRange();
        const $p = document.querySelectorAll('p')[0];

        range.setStart($p.childNodes[0], 0);
        range.setEnd($p.childNodes[0], 17);
        highlighter.fromRange(range);

        const htmlHighlighted = document.body.innerHTML;

        document.body.innerHTML = html;
        highlighter = new Highlighter({
            $root: document.querySelector('p'),
        });
        highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
        expect(document.body.innerHTML).to.be.equal(htmlHighlighted);
    });

    it('should restore the same text when the range ends at an element boundary', () => {
        const html = '<main><p>123</p><p><b>345</b></p></main>';

        document.body.innerHTML = html;

        let highlighter = new Highlighter();
        let s: HighlightSource;

        (highlighter as any).on(Highlighter.event.CREATE, data => {
            s = data.sources[0];
        });

        const range = document.createRange();
        const $paragraphs = document.querySelectorAll('p');

        range.setStart($paragraphs[0].childNodes[0], 0);
        range.setEnd($paragraphs[1], 0);
        highlighter.fromRange(range);

        const highlightedText = highlighter
            .getDoms()
            .map($n => $n.textContent)
            .join('');

        expect(highlightedText).to.be.equal('123');

        document.body.innerHTML = html;
        highlighter = new Highlighter();
        highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);

        expect(
            highlighter
                .getDoms()
                .map($n => $n.textContent)
                .join(''),
        ).to.be.equal(highlightedText);
    });

    it('should restore the same text when the range starts at an element boundary', () => {
        const html = '<main><p>123</p><p><b>345</b></p></main>';

        document.body.innerHTML = html;

        let highlighter = new Highlighter();
        let s: HighlightSource;

        (highlighter as any).on(Highlighter.event.CREATE, data => {
            s = data.sources[0];
        });

        const range = document.createRange();
        const $paragraphs = document.querySelectorAll('p');

        range.setStart($paragraphs[1], 0);
        range.setEnd($paragraphs[1].querySelector('b').childNodes[0], 3);
        highlighter.fromRange(range);

        const highlightedText = highlighter
            .getDoms()
            .map($n => $n.textContent)
            .join('');

        expect(highlightedText).to.be.equal('345');

        document.body.innerHTML = html;
        highlighter = new Highlighter();
        highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);

        expect(
            highlighter
                .getDoms()
                .map($n => $n.textContent)
                .join(''),
        ).to.be.equal(highlightedText);
    });

    it('should restore the original DOM structure after removing a cross-paragraph highlight', () => {
        const html =
            '<main><p data-key="first">before <b>bold</b> after</p><p data-key="second">next paragraph</p></main>';

        document.body.innerHTML = html;

        const highlighter = new Highlighter();
        const $paragraphs = document.querySelectorAll('p');
        const range = document.createRange();

        range.setStart($paragraphs[0].firstChild, 3);
        range.setEnd($paragraphs[1].firstChild, 4);
        highlighter.fromRange(range);
        highlighter.removeAll();

        expect(document.body.innerHTML).to.equal(html);
    });

    afterEach(() => {
        cleanup();
    });
});
