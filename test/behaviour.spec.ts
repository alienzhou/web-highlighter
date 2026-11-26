import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';
import type HighlightSource from '../src/model/source';
import { ERROR } from '../src/types';
import sources from './fixtures/source.json';

const fixture = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');

const permutations = <T>(list: T[]): T[][] =>
    list.length <= 1
        ? [list]
        : list.flatMap((item, i) =>
              permutations([...list.slice(0, i), ...list.slice(i + 1)]).map(rest => [item, ...rest]),
          );

const textOf = (h: Highlighter, id: string) =>
    h
        .getDoms(id)
        .map($n => $n.textContent)
        .join('');

const rangeOf = ($text: Node, start: number, end: number) => {
    const range = document.createRange();

    range.setStart($text, start);
    range.setEnd($text, end);

    return range;
};

describe('Highlighter behaviour', function () {
    this.timeout(50000);

    let cleanup: () => void;
    let highlighter: Highlighter;

    afterEach(() => {
        highlighter.dispose();
        cleanup();
    });

    describe('overlapping highlights', () => {
        let originalHtml: string;

        beforeEach(() => {
            cleanup = jsdomGlobal();
            document.body.innerHTML = fixture;
            originalHtml = document.querySelector('p').innerHTML;
            highlighter = new Highlighter();
        });

        permutations(sources.map((_, i) => i)).forEach(order => {
            it(`should keep the other highlights intact when removing in order ${order.join(',')}`, () => {
                sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));

                const remaining = new Set(sources.map(s => s.id));

                order.forEach(i => {
                    highlighter.remove(sources[i].id);
                    remaining.delete(sources[i].id);

                    expect(highlighter.getDoms(sources[i].id), `${sources[i].id} removed`).to.have.lengthOf(0);
                    sources
                        .filter(s => remaining.has(s.id))
                        .forEach(s => expect(textOf(highlighter, s.id), `${s.id} intact`).to.equal(s.text));
                });

                const $p = document.querySelector('p');

                expect($p.innerHTML).to.equal(originalHtml);
                expect($p.childNodes).to.have.lengthOf(1);
            });
        });

        it('should render the same DOM when a removed highlight is restored from its source', () => {
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));

            const before = document.querySelector('p').textContent;
            const s = sources[1];

            highlighter.remove(s.id);
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);

            expect(textOf(highlighter, s.id)).to.equal(s.text);
            expect(document.querySelector('p').textContent).to.equal(before);
        });
    });

    describe('nested highlights', () => {
        const html = 'web highlighter makes notes';
        let outer: HighlightSource;
        let inner: HighlightSource;

        beforeEach(() => {
            cleanup = jsdomGlobal();
            document.body.innerHTML = `<p>${html}</p>`;
            highlighter = new Highlighter();

            outer = highlighter.fromRange(rangeOf(document.querySelector('p').firstChild, 0, 21));

            const $outerText = highlighter.getDoms(outer.id)[0].firstChild;

            inner = highlighter.fromRange(rangeOf($outerText, 4, 15));
        });

        it('should split the outer wrapper around the inner one', () => {
            expect(textOf(highlighter, outer.id)).to.equal('web highlighter makes');
            expect(textOf(highlighter, inner.id)).to.equal('highlighter');
            expect(highlighter.getExtraIdByDom(highlighter.getDoms(inner.id)[0])).to.include(outer.id);
        });

        it('should keep the inner highlight when removing the outer one first', () => {
            highlighter.remove(outer.id);

            expect(highlighter.getDoms(outer.id)).to.have.lengthOf(0);
            expect(textOf(highlighter, inner.id)).to.equal('highlighter');
            expect(highlighter.getExtraIdByDom(highlighter.getDoms(inner.id)[0])).not.to.include(outer.id);

            highlighter.remove(inner.id);
            expect(document.querySelector('p').innerHTML).to.equal(html);
        });

        it('should keep the outer highlight when removing the inner one first', () => {
            highlighter.remove(inner.id);

            expect(highlighter.getDoms(inner.id)).to.have.lengthOf(0);
            expect(textOf(highlighter, outer.id)).to.equal('web highlighter makes');

            highlighter.remove(outer.id);
            expect(document.querySelector('p').innerHTML).to.equal(html);
        });

        it('should fully cover an existing wrapper by adding an extra id', () => {
            const $wrap = highlighter.getDoms(inner.id)[0];
            const same = highlighter.fromRange(rangeOf($wrap.firstChild, 0, 11));

            expect(highlighter.getIdByDom($wrap)).to.equal(same.id);
            expect(highlighter.getExtraIdByDom($wrap)).to.include.members([inner.id, outer.id]);

            highlighter.remove(same.id);
            expect(highlighter.getIdByDom($wrap)).to.equal(inner.id);
            expect(textOf(highlighter, inner.id)).to.equal('highlighter');
        });
    });

    describe('restoring from store after the DOM changed', () => {
        const page = '<main><p>alpha beta gamma</p><p>delta epsilon</p></main>';
        let stored: HighlightSource;

        beforeEach(() => {
            cleanup = jsdomGlobal();
            document.body.innerHTML = page;
            highlighter = new Highlighter();
            stored = highlighter.fromRange(rangeOf(document.querySelectorAll('p')[1].firstChild, 6, 13));
            highlighter.dispose();
            highlighter = new Highlighter();
        });

        const restore = () =>
            highlighter.fromStore(stored.startMeta, stored.endMeta, stored.text, stored.id, stored.extra);

        it('should restore on an unchanged page', () => {
            document.body.innerHTML = page;

            expect(restore()).not.to.be.null;
            expect(textOf(highlighter, stored.id)).to.equal('epsilon');
        });

        it('should restore when text in another paragraph changed', () => {
            document.body.innerHTML = '<main><p>completely different text</p><p>delta epsilon</p></main>';

            restore();
            expect(textOf(highlighter, stored.id)).to.equal('epsilon');
        });

        it('should restore when text was appended after the highlight', () => {
            document.body.innerHTML = '<main><p>alpha beta gamma</p><p>delta epsilon and more</p></main>';

            restore();
            expect(textOf(highlighter, stored.id)).to.equal('epsilon');
        });

        it('should restore when the paragraph gained inline markup before the highlight', () => {
            document.body.innerHTML = '<main><p>alpha beta gamma</p><p><b>delta</b> epsilon</p></main>';

            restore();
            expect(textOf(highlighter, stored.id)).to.equal('epsilon');
        });

        it('should not throw and should record an error when the paragraph is gone', () => {
            document.body.innerHTML = '<main><p>alpha beta gamma</p></main>';

            let result: HighlightSource;

            expect(() => (result = restore())).not.to.throw();
            expect(result).to.be.null;
            expect(highlighter.getDoms()).to.have.lengthOf(0);
            expect(
                highlighter
                    .getDiagnostics()
                    .errors.some(e => e.type === ERROR.HIGHLIGHT_SOURCE_RECREATE && e.sourceId === stored.id),
            ).to.be.true;
            expect(document.body.textContent).to.equal('alpha beta gamma');
        });
    });

    describe('exceptSelectors with a custom wrapTag', () => {
        const page = '<main><p>alpha <span class="skip">beta</span> gamma</p></main>';
        let $p: HTMLElement;

        beforeEach(() => {
            cleanup = jsdomGlobal();
            document.body.innerHTML = page;
            highlighter = new Highlighter({ exceptSelectors: ['.skip'], wrapTag: 'mark' });
            $p = document.querySelector('p');
        });

        const crossRange = () => {
            const range = document.createRange();

            range.setStart($p.firstChild, 2);
            range.setEnd($p.lastChild, 4);

            return range;
        };

        it('should wrap text around the excepted element with the custom tag only', () => {
            const source = highlighter.fromRange(crossRange());
            const $doms = highlighter.getDoms(source.id);

            expect(source.text).to.equal('pha beta gam');
            expect($doms.map($n => $n.tagName)).to.deep.equal(['MARK', 'MARK']);
            expect(textOf(highlighter, source.id)).to.equal('pha  gam');
            expect(document.querySelector('.skip').innerHTML).to.equal('beta');
            expect(document.querySelector('span[data-highlight-id]')).to.be.null;
        });

        it('should stop at an excepted element that contains the end', () => {
            const range = document.createRange();

            range.setStart($p.firstChild, 0);
            range.setEnd(document.querySelector('.skip').firstChild, 2);

            const source = highlighter.fromRange(range);

            expect(textOf(highlighter, source.id)).to.equal('alpha ');
            expect(document.querySelector('.skip').innerHTML).to.equal('beta');
        });

        it('should restore the original DOM after removing', () => {
            const source = highlighter.fromRange(crossRange());

            highlighter.remove(source.id);

            expect(document.body.innerHTML).to.equal(page);
        });

        it('should render the same wrappers when restored from store', () => {
            const source = highlighter.fromRange(crossRange());
            const rendered = document.body.innerHTML;

            document.body.innerHTML = page;
            highlighter.fromStore(source.startMeta, source.endMeta, source.text, source.id);

            expect(document.body.innerHTML).to.equal(rendered);
        });
    });
});
