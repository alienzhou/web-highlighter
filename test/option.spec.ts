import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';
import { getDefaultOptions } from '../src/util/const';

describe('Highlighter Options', function () {
    this.timeout(50000);

    let cleanup: () => void;

    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');

        cleanup = jsdomGlobal();
        document.body.innerHTML = html;
    });

    describe('#$root', () => {
        it('should highlight text inside $root', () => {
            const $root = document.querySelectorAll('p')[0];
            const highlighter = new Highlighter({ $root });

            highlighter.removeAll();

            expect(highlighter.getDoms()).lengthOf(0);

            const range = document.createRange();

            range.setStart($root.childNodes[0], 0);
            range.setEnd($root.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);
        });

        it('should not highlight text outside $root', () => {
            const $root = document.querySelectorAll('p')[0];
            const highlighter = new Highlighter({ $root });

            highlighter.removeAll();
            expect(highlighter.getDoms()).lengthOf(0);

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[1];

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf(0);
        });

        it('should not modify the dom outside $root', () => {
            const $root = document.querySelectorAll('p')[0];
            const highlighter = new Highlighter({ $root });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[1];
            const html = $p.innerHTML;
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);

            expect(highlighter.fromRange(range)).to.be.null;
            expect($p.innerHTML).to.equal(html);
        });

        it('should not highlight a range partially outside $root', () => {
            const $root = document.querySelectorAll('p')[0];
            const highlighter = new Highlighter({ $root });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[1];
            const rootHtml = $root.innerHTML;
            const outsideHtml = $p.innerHTML;
            const range = document.createRange();

            range.setStart($root.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);

            expect(highlighter.fromRange(range)).to.be.null;
            expect($root.innerHTML).to.equal(rootHtml);
            expect($p.innerHTML).to.equal(outsideHtml);
            expect(highlighter.getDoms()).lengthOf(0);
        });
    });

    describe('#exceptSelectors', () => {
        it('should skip nodes because of the tag selector filters', () => {
            const highlighter = new Highlighter({
                exceptSelectors: ['p'],
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf(0);
        });

        it('should skip nodes because of the className selector filters', () => {
            const highlighter = new Highlighter({
                exceptSelectors: ['.first-p'],
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf(0);
        });

        it('should skip nodes because of the id selector filters', () => {
            const highlighter = new Highlighter({
                exceptSelectors: ['#js-first-p'],
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf(0);
        });

        it('should not skip when no filter matches', () => {
            const highlighter = new Highlighter({
                exceptSelectors: ['.no-match'],
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);
        });

        it('should stop at an end node inside an excluded element', () => {
            document.body.innerHTML =
                '<main><p>before <span class="excluded">excluded</span> after</p><p>unrelated</p></main>';

            const highlighter = new Highlighter({
                exceptSelectors: ['.excluded'],
            });
            const $paragraphs = document.querySelectorAll('p');
            const $firstText = $paragraphs[0].firstChild;
            const $excludedText = $paragraphs[0].querySelector('.excluded').firstChild;
            const range = document.createRange();

            range.setStart($firstText, 0);
            range.setEnd($excludedText, 3);
            highlighter.fromRange(range);

            expect(highlighter.getDoms().map($node => $node.textContent)).to.deep.equal(['before ']);
            expect($paragraphs[0].textContent).to.equal('before excluded after');
            expect($paragraphs[1].textContent).to.equal('unrelated');
        });

        it('should highlight text after an excluded start node', () => {
            document.body.innerHTML = '<main><p>before <span class="excluded">excluded</span> after</p></main>';

            const highlighter = new Highlighter({
                exceptSelectors: ['.excluded'],
            });
            const $paragraph = document.querySelector('p');
            const $excludedText = $paragraph.querySelector('.excluded').firstChild;
            const $lastText = $paragraph.lastChild;
            const range = document.createRange();

            range.setStart($excludedText, 3);
            range.setEnd($lastText, 3);
            highlighter.fromRange(range);

            expect(highlighter.getDoms().map($node => $node.textContent)).to.deep.equal([' af']);
            expect($paragraph.textContent).to.equal('before excluded after');
        });

        it('should stop at the first excluded end ancestor when multiple nodes are excluded', () => {
            document.body.innerHTML = [
                '<main><p>before <span class="excluded">first</span> between ',
                '<span class="excluded">second</span> after</p><p>unrelated</p></main>',
            ].join('');

            const highlighter = new Highlighter({
                exceptSelectors: ['.excluded'],
            });
            const $paragraphs = document.querySelectorAll('p');
            const $firstText = $paragraphs[0].firstChild;
            const $excludedText = $paragraphs[0].querySelectorAll('.excluded')[1].firstChild;
            const range = document.createRange();

            range.setStart($firstText, 0);
            range.setEnd($excludedText, 3);
            highlighter.fromRange(range);

            expect(highlighter.getDoms().map($node => $node.textContent)).to.deep.equal(['before ', ' between ']);
            expect($paragraphs[0].textContent).to.equal('before first between second after');
            expect($paragraphs[1].textContent).to.equal('unrelated');
        });
    });

    describe('#wrapTag', () => {
        it("should use default tag for wrapping node when there's no config", () => {
            const wrapTag = getDefaultOptions().wrapTag;
            const highlighter = new Highlighter();

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);

            const useCorrectTag = highlighter.getDoms().every(n => n.tagName.toUpperCase() === wrapTag.toUpperCase());

            expect(useCorrectTag).to.be.true;
        });

        it('should use customized tag for wrapping nodes', () => {
            const wrapTag = getDefaultOptions().wrapTag === 'b' ? 'i' : 'b';
            const highlighter = new Highlighter({ wrapTag });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);

            const useCorrectTag = highlighter.getDoms().every(n => n.tagName.toUpperCase() === wrapTag.toUpperCase());

            expect(useCorrectTag).to.be.true;
        });
    });

    describe('#style.className', () => {
        it("should use default className for wrapping nodes when there's no config", () => {
            const defaultClassName = getDefaultOptions().style.className;
            const highlighter = new Highlighter();

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);
            expect(highlighter.getDoms().every(n => n.classList.contains(defaultClassName))).to.be.true;
        });

        it('should use customized className for wrapping nodes', () => {
            const className = 'test-class-config';
            const defaultClassName = getDefaultOptions().style.className;
            const highlighter = new Highlighter({
                style: { className },
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);
            expect(highlighter.getDoms().every(n => n.classList.contains(className))).to.be.true;
            expect(highlighter.getDoms().some(n => n.classList.contains(defaultClassName))).to.be.false;
        });

        it('should use support an className array for wrapping nodes', () => {
            const className = ['test-class-config-1', 'test-class-config-2'];
            const defaultClassName = getDefaultOptions().style.className;
            const highlighter = new Highlighter({
                style: { className },
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);
            expect(
                highlighter
                    .getDoms()
                    .every(n => n.classList.contains(className[0]) && n.classList.contains(className[1])),
            ).to.be.true;
            expect(highlighter.getDoms().some(n => n.classList.contains(defaultClassName))).to.be.false;
        });

        it('should keep the default interaction style with a customized className', () => {
            const highlighter = new Highlighter({
                style: { className: 'test-class-config' },
            });

            highlighter.removeAll();

            const $p = document.querySelectorAll('p')[0];
            const range = document.createRange();

            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(highlighter.getDoms()).lengthOf.gt(0);
            expect(highlighter.getDoms().every(n => getComputedStyle(n).cursor === 'pointer')).to.be.true;
        });
    });

    afterEach(() => {
        cleanup();
    });
});
