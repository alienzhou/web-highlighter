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
            $root: document.querySelector('p')
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
            $root: document.querySelector('p')
        });
        highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
        expect(document.body.innerHTML).to.be.equal(htmlHighlighted);
    });

    afterEach(() => {
        cleanup();
    });
});
