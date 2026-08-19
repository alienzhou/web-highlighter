import { expect } from 'chai';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';

describe('Native selection lifecycle', function () {
    this.timeout(50000);

    let cleanup: () => void;

    beforeEach(() => {
        cleanup = jsdomGlobal();
        document.body.innerHTML = '<p>start <a href="#">link</a> middle <i>italic</i> end</p>';
    });

    afterEach(() => {
        cleanup();
    });

    const selectAcrossTextNodes = () => {
        const $p = document.querySelector('p');
        const range = document.createRange();

        range.setStart($p.firstChild, 2);
        range.setEnd($p.lastChild, 3);

        const selection = window.getSelection();

        selection.removeAllRanges();
        selection.addRange(range);

        return { range, text: range.toString() };
    };

    it('should keep the native selection untouched by default', () => {
        const { range } = selectAcrossTextNodes();
        const highlighter = new Highlighter();

        expect(highlighter.fromRange(range)).not.to.be.null;
        expect(window.getSelection().rangeCount).to.equal(1);
    });

    it('should drop the native selection when asked to clear it', () => {
        const { range, text } = selectAcrossTextNodes();
        const highlighter = new Highlighter();

        const source = highlighter.fromRange(range, { selection: 'clear' });

        expect(source.text).to.equal(text);
        expect(window.getSelection().isCollapsed).to.be.true;
    });

    it('should select the created wrappers when asked to restore it', () => {
        const { range, text } = selectAcrossTextNodes();
        const highlighter = new Highlighter();

        const source = highlighter.fromRange(range, { selection: 'restore' });

        expect(source.text).to.equal(text);
        expect(window.getSelection().toString()).to.equal(text);
    });

    it('should not leave a truncated selection in the automatic mode', () => {
        const highlighter = new Highlighter();

        highlighter.run();

        const { text } = selectAcrossTextNodes();

        document.body.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true }));

        expect(
            highlighter
                .getDoms()
                .map($n => $n.textContent)
                .join(''),
        ).to.equal(text);
        expect(window.getSelection().isCollapsed).to.be.true;
    });
});
