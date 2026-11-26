import { expect } from 'chai';
import jsdomGlobal from 'jsdom-global';
import sinon from 'sinon';
import Highlighter from '../src/index';
import HighlightRange from '../src/model/range';
import HighlightSource from '../src/model/source';
import { getDomMeta } from '../src/model/range/dom';
import { restoreSelection } from '../src/model/range/selection';
import { eventEmitter, INTERNAL_ERROR_EVENT, UNKNOWN_IDX, DATASET_IDENTIFIER } from '../src/util/const';
import { ERROR } from '../src/types';

describe('Edge cases', function () {
    this.timeout(50000);

    let cleanup: () => void;
    let highlighter: Highlighter;

    beforeEach(() => {
        cleanup = jsdomGlobal();
        document.body.innerHTML = '<main><p id="a">first paragraph</p><p id="b">second paragraph</p></main>';
        highlighter = new Highlighter();
    });

    afterEach(() => {
        highlighter.dispose();
        sinon.restore();
        cleanup();
    });

    const errorTypes = () => highlighter.getDiagnostics().errors.map(e => e.type);

    describe('Painter', () => {
        it('should refuse to render a range that is not frozen', () => {
            const $text = document.querySelector('#a').firstChild;
            const range = new HighlightRange({ $node: $text, offset: 0 }, { $node: $text, offset: 5 }, 'first', 'x');

            expect(() => highlighter.painter.highlightRange(range)).to.throw(ERROR.HIGHLIGHT_RANGE_FROZEN);
            expect(document.querySelector(`[data-${DATASET_IDENTIFIER}]`)).to.be.null;
        });

        it('should report and skip objects that are not highlight sources', () => {
            const rendered = highlighter.painter.highlightSource([{ id: 'fake' } as unknown as HighlightSource]);

            expect(rendered).to.have.lengthOf(0);
            expect(errorTypes()).to.include(ERROR.SOURCE_TYPE_ERROR);
        });

        it('should report a source that renders no node', () => {
            const excepting = new Highlighter({ exceptSelectors: ['p'] });
            const meta = { parentTagName: 'P', parentIndex: 0, textOffset: 0 };
            const source = excepting.fromStore(meta, { ...meta, textOffset: 5 }, 'first', 'none-render');

            expect(source).not.to.be.null;
            expect(excepting.getDoms()).to.have.lengthOf(0);
            expect(excepting.getDiagnostics().errors).to.deep.include({
                type: ERROR.HIGHLIGHT_SOURCE_NONE_RENDER,
                sourceId: 'none-render',
            });
            excepting.dispose();
        });

        it('should apply every class of an array className when splitting a wrapper', () => {
            const multi = new Highlighter({ style: { className: ['one', 'two'] } });
            const $text = document.querySelector('#a').firstChild;
            const outer = document.createRange();

            outer.setStart($text, 0);
            outer.setEnd($text, 15);

            const first = multi.fromRange(outer);
            const $inner = multi.getDoms(first.id)[0].firstChild;
            const inner = document.createRange();

            inner.setStart($inner, 6);
            inner.setEnd($inner, 9);

            const second = multi.fromRange(inner);
            const $wrap = multi.getDoms(second.id)[0];

            expect($wrap.textContent).to.equal('par');
            expect($wrap.classList.contains('one')).to.be.true;
            expect($wrap.classList.contains('two')).to.be.true;
            multi.dispose();
        });

        it('should restore an element whose only text node was wholly wrapped', () => {
            document.body.innerHTML = '<p>one <b>two</b> three</p>';

            const $p = document.querySelector('p');
            const range = document.createRange();

            range.setStart($p.firstChild, 0);
            range.setEnd($p.lastChild, 6);

            const source = highlighter.fromRange(range);

            expect(highlighter.getDoms(source.id).map($n => $n.textContent)).to.deep.equal(['one ', 'two', ' three']);

            highlighter.remove(source.id);

            expect($p.innerHTML).to.equal('one <b>two</b> three');
            expect($p.querySelector('b').childNodes).to.have.lengthOf(1);
        });
    });

    describe('Diagnostics error buffer', () => {
        it('should keep only the last 20 errors', () => {
            eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                detail: { id: 'oldest' } as HighlightSource,
                error: new Error('boom'),
            });

            for (let i = 0; i < 20; i++) {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, { type: ERROR.RANGE_INVALID });
            }

            const { errors } = highlighter.getDiagnostics();

            expect(errors).to.have.lengthOf(20);
            expect(errors.every(e => e.type === ERROR.RANGE_INVALID)).to.be.true;
        });

        it('should record the error message and source id', () => {
            eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                detail: { id: 'src-1' } as HighlightSource,
                error: new Error('boom'),
            });

            expect(highlighter.getDiagnostics().errors).to.deep.equal([
                { type: ERROR.HIGHLIGHT_SOURCE_RECREATE, message: 'boom', sourceId: 'src-1' },
            ]);
        });
    });

    describe('verbose option', () => {
        it('should log errors with console.warn when verbose', () => {
            const warn = sinon.stub(console, 'warn');
            const verbose = new Highlighter({ verbose: true });

            eventEmitter.emit(INTERNAL_ERROR_EVENT, { type: ERROR.RANGE_INVALID });

            expect(warn.calledWith({ type: ERROR.RANGE_INVALID })).to.be.true;
            verbose.dispose();
        });

        it('should stay silent when not verbose', () => {
            const warn = sinon.stub(console, 'warn');

            eventEmitter.emit(INTERNAL_ERROR_EVENT, { type: ERROR.RANGE_INVALID });

            expect(warn.called).to.be.false;
        });

        it('should stop listening for errors after dispose', () => {
            const warn = sinon.stub(console, 'warn');
            const verbose = new Highlighter({ verbose: true });

            verbose.dispose();
            eventEmitter.emit(INTERNAL_ERROR_EVENT, { type: ERROR.RANGE_INVALID });

            expect(warn.called).to.be.false;
            expect(verbose.getDiagnostics().errors).to.have.lengthOf(0);
        });
    });

    describe('getDomMeta', () => {
        it('should use an element node as its own origin parent', () => {
            const $p = document.querySelector('#b') as HTMLElement;
            const meta = getDomMeta($p, 0, document);

            expect(meta.parentTagName).to.equal('P');
            expect(meta.parentIndex).to.equal(1);
        });

        it('should return an unknown index for a node outside the root', () => {
            const $root = document.querySelector('#a') as HTMLElement;
            const $text = document.querySelector('#b').firstChild as Text;

            expect(getDomMeta($text, 0, $root).parentIndex).to.equal(UNKNOWN_IDX);
        });
    });

    describe('restoreSelection', () => {
        it('should clear the selection and select nothing for an empty node list', () => {
            const range = document.createRange();

            range.selectNodeContents(document.querySelector('#a'));
            window.getSelection().addRange(range);

            restoreSelection([]);

            expect(window.getSelection().rangeCount).to.equal(0);
        });
    });
});
