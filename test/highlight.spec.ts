import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdom from 'jsdom-global';
import Highlighter from '../src/index';
import { getDefaultOptions, DATASET_SPLIT_TYPE, DATASET_IDENTIFIER } from '../src/util/const';
import { SplitType, CreateFrom } from '../src/types/index';
import HighlightSource from '../src/model/source/index';
import sinon from 'sinon';

describe('Highlighter', function () {
    this.timeout(50000);

    let highlighter: Highlighter;
    let cleanup;
    let wrapSelector: string;

    beforeEach(async () => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');
        cleanup = jsdom();
        document.body.innerHTML = html;
        highlighter = new Highlighter();
        wrapSelector = getDefaultOptions().wrapTag;
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

        it('should emit CREATE event when highlighted', callback => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            const content = range.toString();
    
            (highlighter as any).on(Highlighter.event.CREATE, (data) => {
                const sources: HighlightSource[] = data.sources;
                expect(data.type).to.be.equal(CreateFrom.INPUT);
                expect(sources[0].text).to.be.equal(content);
                expect(Highlighter.isHighlightSource(sources[0])).to.be.true;
                callback();
            });

            highlighter.fromRange(range);
        });
    });

    describe('#remove', () => {
        let listener: sinon.SinonSpy<any[], any[]>;
        let id: string;

        beforeEach(async () => {            
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.REMOVE, listener);
            (highlighter as any).on(Highlighter.event.CREATE, (data) => id = data.sources[0].id);

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            range.setStart($p.querySelector('span').childNodes[0], 64);
            range.setEnd($p.querySelector('span').nextSibling, 9);
            highlighter.fromRange(range);

        });

        it('should remove all highlighted areas', () => {
            highlighter.remove(id);
            const hasItem = []
                .slice
                .call(document.querySelectorAll(wrapSelector))
                .some(n => n.getAttribute(`data-${DATASET_IDENTIFIER}`) === id);
            expect(hasItem).to.be.false;
        });

        it('should emit REMOVE event', () => {
            highlighter.remove(id);
            expect(listener.calledOnce).to.be.true;
        });
    });

    describe('#removeAll', () => {
        let listener: sinon.SinonSpy<any[], any[]>;

        beforeEach(async () => {            
            listener = sinon.spy();

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[3];
            range.setStart($p.querySelector('span').childNodes[0], 64);
            range.setEnd($p.querySelector('span').nextSibling, 9);
            highlighter.fromRange(range);

            (highlighter as any).on(Highlighter.event.REMOVE, listener);

            highlighter.removeAll();
        });

        it('should remove all highlighted areas', () => {
            expect(document.querySelectorAll(wrapSelector).length).to.be.equal(0);
        });

        it('should emit REMOVE event', () => {
            expect(listener.calledOnce).to.be.true;
        });
    });

    afterEach(() => {
        cleanup();
    });
});
