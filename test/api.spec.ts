import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';
import { getDefaultOptions, DATASET_SPLIT_TYPE, DATASET_IDENTIFIER } from '../src/util/const';
import { SplitType } from '../src/types/index';
import sources from './fixtures/source.json';
import brokenSources from './fixtures/broken.json';
import getInteraction from '../src/util/interaction';

describe('Highlighter API', function () {
    this.timeout(50000);

    let highlighter: Highlighter;
    let cleanup;
    let wrapSelector: string;

    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');
        cleanup = jsdomGlobal();
        document.body.innerHTML = html;
        highlighter = new Highlighter();
        wrapSelector = `${getDefaultOptions().wrapTag}[data-${DATASET_IDENTIFIER}]`;
    });

    describe('#fromRange', () => {
        it('should wrap correctly in p', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            const content = range.toString();
            highlighter.fromRange(range);
            const wrapper = $p.querySelector(wrapSelector);

            expect(wrapper.textContent).to.be.equal(content, 'wrapped text should be the same as the range')
        });

        it('should wrap nothing when range is empty', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 0);
            highlighter.fromRange(range);

            expect($p.querySelector(wrapSelector).textContent.length).to.be.equal(0);
        });

        it('should wrap correctly when cross multi dom', () => {
            const range = document.createRange();
            const $p1 = document.querySelectorAll('p')[0];
            const $p2 = document.querySelectorAll('p')[1];
            range.setStart($p1.childNodes[0], 54);
            range.setEnd($p2.childNodes[0], 11);
            highlighter.fromRange(range);

            const segContent1 = 'save the highlighted areas just like what you do in PDF.';
            const segContent2 = 'If you have';

            expect($p1.querySelector(wrapSelector).textContent).to.be.equal(segContent1, 'first segment correct');
            expect($p2.querySelector(wrapSelector).textContent).to.be.equal(segContent2, 'second segment correct');
        });

        it('should split correctly when the new selection is inside an exist selection', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            const $highlight = $p.querySelector('span');
            range.setStart($highlight.childNodes[0], 12);
            range.setEnd($highlight.childNodes[0], 21);
            highlighter.fromRange(range);

            const wraps = $p.querySelectorAll(wrapSelector);
            const attr = `data-${DATASET_SPLIT_TYPE}`;
            expect(wraps.length).to.be.equal(3, 'split into three pieces');
            expect(wraps[1].textContent).to.be.equal('developer', 'highlighted the correct content');
            expect(wraps[0].getAttribute(attr)).to.be.equal(SplitType.both);
            expect(wraps[1].getAttribute(attr)).to.be.equal(SplitType.both);
            expect(wraps[2].getAttribute(attr)).to.be.equal(SplitType.both);
        });

        it('should split correctly when the new selection is across an exist selection', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            range.setStart($p.querySelector('span').childNodes[0], 64);
            range.setEnd($p.querySelector('span').nextSibling, 9);
            highlighter.fromRange(range);

            const wraps = $p.querySelectorAll(wrapSelector);
            const attr = `data-${DATASET_SPLIT_TYPE}`;
            expect(wraps.length).to.be.equal(3, 'split into three pieces');
            expect(wraps[1].textContent).to.be.equal('attract more visits.', 'highlighted the correct content');
            expect(wraps[2].textContent).to.be.equal('If you\'re', 'highlighted the correct content');
            expect(wraps[0].getAttribute(attr)).to.be.equal(SplitType.both);
            expect(wraps[1].getAttribute(attr)).to.be.equal(SplitType.head);
            expect(wraps[2].getAttribute(attr)).to.be.equal(SplitType.tail);
        });

        it('should not split when the new selection matches an exist wrapper', () => {
            const startOffset = 0;
            const endOffset = 17;

            let range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], startOffset);
            range.setEnd($p.childNodes[0], endOffset);
            highlighter.fromRange(range);

            const $pre = [...$p.querySelectorAll(wrapSelector)];

            // select a exist wrapper
            range = document.createRange();
            const $wrapper = $p.querySelector(wrapSelector);
            range.setStart($wrapper.childNodes[0], startOffset);
            range.setEnd($wrapper.childNodes[0], endOffset);
            highlighter.fromRange(range);

            const $after = [...$p.querySelectorAll(wrapSelector)];

            expect($after).lengthOf($pre.length, 'its length should be the same as before');
            expect($after.every($n => $pre.indexOf($n) > -1), 'wrappers should be the same').to.be.true;
        });

        it('should work correctly when a container is not a Text/Comment/CDATASection', () => {
            let range = document.createRange();
            const $p = document.querySelectorAll('p')[5];
            range.setStart($p, 1);
            range.setEnd($p.childNodes[2], 8);
            highlighter.fromRange(range);

            const $pre = [...$p.querySelectorAll(wrapSelector)];

            const text = $pre.reduce((t, $n) => t + $n.textContent, '');
            expect(text).to.be.equal('have fun');
        });
    });

    describe('#fromStore', () => {
        it('should re-create(highlighting) correctly', () => {
            const s = sources[0];
            const $p = document.querySelectorAll('p')[0];
            let $wrappers = $p.querySelectorAll(wrapSelector);
            expect($wrappers.length, 'has no wrapper before highlighting').to.be.equal(0);

            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
            $wrappers = $p.querySelectorAll(wrapSelector);
            expect($wrappers.length, 'only has one wrapper').to.be.equal(1);
            expect($wrappers[0].textContent, 'highlight correct text').to.be.equal(s.text);
        });

        it('should highlight correctly when structure is complex', () => {
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            const $p = document.querySelectorAll('p')[0];
            const $w = $p.querySelectorAll(wrapSelector);
            expect($w.length, 'has three wrapper').to.be.equal(5);
            expect($w[0].textContent + $w[1].textContent + $w[2].textContent, 'correct text 1').to.be.equal(sources[0].text);
            expect($w[2].textContent + $w[3].textContent + $w[4].textContent, 'correct text 2').to.be.equal(sources[1].text);
            expect($w[1].textContent + $w[2].textContent + $w[3].textContent, 'correct text 3').to.be.equal(sources[2].text);
        });

        it('should highlight correctly by different re-creating sequence', () => {
            const typeReg = new RegExp(`data-${DATASET_SPLIT_TYPE}=".+"`, 'g');
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            const html1 = document.body.innerHTML.replace(typeReg, '');

            document.body.innerHTML = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');
            sources.slice(0).reverse().forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            const html2 = document.body.innerHTML.replace(typeReg, '');

            expect(html1).to.be.equal(html2);
        });

        it('should not crash when highlight source is invalid', () => {
            const s = brokenSources[0];
            expect(() => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id)).not.to.throw();
        });
    });

    describe('#remove', () => {
        beforeEach(() => {
            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
        });

        it('should remove all highlighted areas', () => {
            const id = sources[0].id;
            highlighter.remove(id);

            const hasItem = [...document.querySelectorAll(wrapSelector)].some(n => n.getAttribute(`data-${DATASET_IDENTIFIER}`) === id);

            expect(hasItem).to.be.false;
        });

        it('should not occur errors when the id does not exist', () => {
            expect(() => highlighter.remove('fake id')).not.to.throw();
        });

        it('should not affect document when the id is empty', () => {
            const html = document.body.innerHTML;
            highlighter.remove('');
            expect(html).to.be.equal(document.body.innerHTML);
        });
    });

    describe('#removeAll', () => {
        beforeEach(() => {
            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
            highlighter.removeAll();
        });

        it('should remove all highlighted areas', () => {
            expect(document.querySelectorAll(wrapSelector).length).to.be.equal(0);
        });
    });

    describe('#run', () => {
        it('should highlight automatically after the user\'s interaction', () => {
            expect(getInteraction().PointerEnd).to.be.equal('mouseup');

            highlighter.run();

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            window.getSelection().addRange(range);

            const content = range.toString();
            const e = new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            document.body.dispatchEvent(e);
            const $w = document.querySelectorAll('p')[0].querySelector(wrapSelector);
            expect($w.textContent).to.be.equal(content);
        });

        it('should not affect the document when selection is collapsed', () => {
            highlighter.run();

            const html = document.body.innerHTML;
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 5);
            range.setEnd($p.childNodes[0], 5);
            window.getSelection().addRange(range);

            const e = new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            document.body.dispatchEvent(e);

            expect(document.body.innerHTML).to.be.equal(html);
        });
    });

    describe('#dispose', () => {
        it('should not highlight automatically after calling .dispose', () => {
            highlighter.run();
            highlighter.dispose();

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            window.getSelection().addRange(range);

            const e = new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            document.body.dispatchEvent(e);

            const $w = document.querySelectorAll('p')[0].querySelectorAll(wrapSelector);
            expect($w.length).to.be.equal(0);
        });

        it('should remove all highlights after calling .dispose', () => {
            highlighter.dispose();

            const $w = document.querySelectorAll(wrapSelector);
            expect($w.length).to.be.equal(0);
        });
    });

    describe('#stop', () => {
        it('should not highlight automatically after calling .stop', () => {
            highlighter.run();
            highlighter.stop();

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            window.getSelection().addRange(range);

            const e = new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            document.body.dispatchEvent(e);

            const $w = document.querySelectorAll('p')[0].querySelectorAll(wrapSelector);
            expect($w.length).to.be.equal(0);
        });
    });

    describe('#getDoms', () => {
        beforeEach(() => {
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
        });

        it('get specific highlight\'s doms by passing the id', () => {
            const s = sources[0];
            const doms = highlighter.getDoms(s.id);
            expect(doms.length).gt(0);
            expect(doms.map(n => n.textContent).join('')).to.be.equal(s.text);
            expect(doms.every(Highlighter.isHighlightWrapNode), 'dom is wrapper').to.be.true;
        });

        it('get no doms when id does not exist', () => {
            const doms = highlighter.getDoms(sources[0].id + 'fake');
            expect(doms.length).to.be.equal(0);
            expect(doms.every(Highlighter.isHighlightWrapNode), 'dom is wrapper').to.be.true;
        });

        it('get all doms without an argument', () => {
            const doms = highlighter.getDoms();
            document.querySelectorAll(wrapSelector);
            expect(doms.length).to.be.equal(document.querySelectorAll(wrapSelector).length);
            expect(doms.every(Highlighter.isHighlightWrapNode), 'dom is wrapper').to.be.true;
        });
    });

    describe('#addClass', () => {
        const className = 'test-class';

        beforeEach(() => {
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
        });

        it('should add class name to the exact doms by id', () => {
            const id = sources[0].id;
            highlighter.addClass(className, id);
            const containClassName = highlighter
                .getDoms(id)
                .every(n => n.getAttribute('class').indexOf(className) > -1);
            expect(containClassName).to.be.true;
        });

        it('should not add class name to the doms without the id', () => {
            const id = sources[0].id;
            highlighter.addClass(className, id);
            expect(document.querySelectorAll(`.${className}`).length).not.gt(highlighter.getDoms(id).length);
        });

        it('should not affect the document when id dose not exist', () => {
            expect(document.querySelectorAll(`.${className}`)).lengthOf(0);
            highlighter.addClass(className, sources[0].id + 'fake');
            expect(document.querySelectorAll(`.${className}`)).lengthOf(0);
        });

        it('should affect all wrapper nodes when not passing id', () => {
            highlighter.addClass(className);
            const $set = [...document.querySelectorAll(`.${className}`)];
            const $doms = highlighter.getDoms();
            expect($set).lengthOf($doms.length);
            expect($set.every(n => $doms.indexOf((n as HTMLElement)) > -1)).to.be.true;
        });
    });

    describe('#removeClass', () => {
        const className = 'test-class';

        beforeEach(() => {
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            highlighter.addClass(className);
        });

        it('should remove the class name from all wrappers without the id argument', () => {
            highlighter.removeClass(className);
            expect(document.querySelectorAll(`.${className}`)).lengthOf(0);
        });

        it('should remove the class name from the specific highlight', () => {
            const id = sources[0].id;
            highlighter.removeClass(className, id);
            const notContain = highlighter
                .getDoms(id)
                .every(n => n.getAttribute('class').indexOf(className) === -1);

            expect(notContain).to.be.true;
        });

        it('should not affect the document when id dose not exist', () => {
            expect(document.querySelectorAll(`.${className}`)).lengthOf(highlighter.getDoms().length);
            highlighter.removeClass(className, sources[0].id + 'fake');
            expect(document.querySelectorAll(`.${className}`)).lengthOf(highlighter.getDoms().length);
        });
    });

    describe('#getIdByDom', () => {
        beforeEach(() => {
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
        });

        it('should return the correct id when it\'s a wrapper', () => {
            const id = sources[0].id;
            const dom = highlighter.getDoms(id)[0];
            expect(highlighter.getIdByDom(dom)).to.be.equal(id);
        });

        it('should return the correct id when it\'s inside a wrapper', () => {
            const id = sources[0].id;
            const dom = highlighter.getDoms(id)[0];
            expect(highlighter.getIdByDom(dom.childNodes[0] as HTMLElement)).to.be.equal(id);
        });

        it('should return \'\' when it\'s outside a wrapper', () => {
            const id = sources[0].id;
            const dom = highlighter.getDoms(id)[0];
            expect(highlighter.getIdByDom(dom.parentElement)).to.be.empty;
        });

        it('should return \'\' when a valid wrapper is outside the root', () => {
            const footerHighlighter = new Highlighter({
                $root: document.querySelector('footer')
            });
            const dom = highlighter.getDoms(sources[0].id)[0];
            expect(footerHighlighter.getIdByDom(dom)).to.be.empty;
        });

        it('should return \'\' when the dom is not be wrapped', () => {
            expect(highlighter.getIdByDom(document.querySelector('img'))).to.be.empty;
        });
    });

    describe('#getExtraIdByDom', () => {
        beforeEach(() => {
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
        });

        it('should return the correct ids when it\'s a wrapper', () => {
            const id = sources[0].id;
            const dom = highlighter.getDoms(id)[2];
            const ids = highlighter.getExtraIdByDom(dom);
            expect(ids.sort()).to.deep.equal([sources[0].id, sources[1].id].sort());
        });

        it('should return the correct ids when it\'s inside a wrapper', () => {
            const id = sources[0].id;
            const dom = highlighter.getDoms(id)[2].childNodes[0];
            const ids = highlighter.getExtraIdByDom(dom as HTMLElement);
            expect(ids.sort()).to.deep.equal([sources[0].id, sources[1].id].sort());
        });

        it('should return [] when it\'s outside a wrapper', () => {
            const id = sources[0].id;
            const dom = highlighter.getDoms(id)[2].parentElement;
            const ids = highlighter.getExtraIdByDom(dom);
            expect(ids).to.deep.equal([]);
        });

        it('should return [] when a valid wrapper is outside the root', () => {
            const footerHighlighter = new Highlighter({
                $root: document.querySelector('footer')
            });
            const dom = highlighter.getDoms(sources[0].id)[0];
            expect(footerHighlighter.getExtraIdByDom(dom)).to.deep.equal([]);
        });

        it('should return [] when there is no extra id', () => {
            const dom = highlighter.getDoms(sources[0].id)[0];
            expect(highlighter.getExtraIdByDom(dom)).to.deep.equal([]);
        });

        it('should return [] when the dom is not be wrapped', () => {
            expect(highlighter.getExtraIdByDom(document.querySelector('img'))).to.deep.equal([]);
        });
    });

    describe('changing className by .setOption', () => {
        it('should get updated after deleting when the highlight wrapper is inside another wrapper', () => {
            // https://github.com/alienzhou/web-highlighter/pull/80
            const defaultClassName = getDefaultOptions().style.className;
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            const $highlight = $p.querySelector('span');
            range.setStart($highlight.childNodes[0], 12);
            range.setEnd($highlight.childNodes[0], 21);

            // change className and highlight it 
            highlighter.setOption({ style: { className: 'highlight-test' } });
            const { id } = highlighter.fromRange(range);

            // remove the highlight
            highlighter.remove(id);

            const classnames: string[] = [];
            const $wraps = $p.querySelectorAll(wrapSelector);
            $wraps.forEach($n => classnames.push($n.className));

            expect(classnames).to.be.deep.equal(new Array($wraps.length).fill(defaultClassName));
        });

        it('should set the only new className on an already existed wrapper after highlighting', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            range.setStart($p.querySelector('span').childNodes[0], 64);
            range.setEnd($p.querySelector('span').nextSibling, 9);
            highlighter.fromRange(range);

            const $span = $p.querySelectorAll(wrapSelector)[1];
            const range2 = document.createRange();
            range2.setStart($span.childNodes[0], 0);
            range2.setEnd($span.childNodes[0], 20);
            highlighter.setOption({ style: { className: 'highlight-test' } });
            highlighter.fromRange(range2);

            const $wraps = $p.querySelectorAll(wrapSelector);
            expect($wraps[1].className).to.be.equal('highlight-test');
        });

        it('should set the only new className on a split wrapper after highlighting', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            const $highlight = $p.querySelector('span');
            range.setStart($highlight.childNodes[0], 12);
            range.setEnd($highlight.childNodes[0], 21);

            // change className and highlight it 
            highlighter.setOption({ style: { className: 'highlight-test' } });
            highlighter.fromRange(range);

            const $wraps = $p.querySelectorAll(wrapSelector);

            expect($wraps[1].className).to.be.equal('highlight-test');
        });
    });

    afterEach(() => {
        cleanup();
    });
});
