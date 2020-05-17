import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import jsdom from 'jsdom';
import Highlighter from '../src/index';
import { getDefaultOptions } from '../src/util/const';
import getInteraction from '../src/util/interaction';

describe('Highlighter on mobiles', function () {
    this.timeout(50000);

    let highlighter: Highlighter;
    let cleanup;
    let wrapSelector: string;

    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');
        cleanup = jsdomGlobal('', {
            resources: new jsdom.ResourceLoader({
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
            })
        });
        document.body.innerHTML = html;
        highlighter = new Highlighter();
        wrapSelector = getDefaultOptions().wrapTag;
    });

    describe('#run', () => {
        it('should highlight automatically after the user\'s interaction', () => {
            expect(getInteraction().PointerEnd).to.be.equal('touchend');

            highlighter.run();

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            window.getSelection().addRange(range);

            const content = range.toString();
            const e = new TouchEvent('touchend', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            document.body.dispatchEvent(e);

            const $w = document.querySelectorAll('p')[0].querySelector(wrapSelector);
            expect($w.textContent).to.be.equal(content);
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

            const e = new TouchEvent('touchend', {
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

    afterEach(() => {
        cleanup();
    });
});
