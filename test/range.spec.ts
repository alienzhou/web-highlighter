import { expect } from 'chai';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';
import { DATASET_IDENTIFIER, getDefaultOptions } from '../src/util/const';

describe('Highlighter ranges', () => {
    let cleanup: () => void;
    let highlighter: Highlighter;
    let wrapSelector: string;

    beforeEach(() => {
        cleanup = jsdomGlobal();
        highlighter = new Highlighter();
        wrapSelector = `${getDefaultOptions().wrapTag}[data-${DATASET_IDENTIFIER}]`;
    });

    afterEach(() => {
        cleanup();
    });

    it('should ignore ranges that contain no text node', () => {
        document.body.innerHTML = '<main><img><p></p></main>';

        for (const $target of document.querySelectorAll('img, p')) {
            const range = document.createRange();

            range.selectNodeContents($target);

            let source;

            expect(() => {
                source = highlighter.fromRange(range);
            }).not.to.throw();
            expect(source).to.be.null;
        }

        expect(document.querySelector(wrapSelector)).to.be.null;
    });

    it('should ignore ranges whose element boundaries contain no text node', () => {
        document.body.innerHTML = '<main><p>before</p><p><img></p><p>after</p></main>';

        const $p = document.querySelectorAll('p')[1];
        const range = document.createRange();

        range.selectNodeContents($p);

        expect(highlighter.fromRange(range)).to.be.null;
        expect(document.querySelector(wrapSelector)).to.be.null;
        expect(document.body.textContent).to.equal('beforeafter');
    });

    it('should highlight text in a range containing an image', () => {
        document.body.innerHTML = '<p>before<img>after</p>';

        const $p = document.querySelector('p');

        if (!$p || !$p.firstChild) {
            throw new Error('Expected paragraph with text content');
        }

        const range = document.createRange();

        range.setStart($p.firstChild, 0);
        range.setEnd($p, 2);

        const source = highlighter.fromRange(range);

        expect(source.text).to.equal('before');
        expect($p.querySelector(wrapSelector).textContent).to.equal('before');
    });
});
