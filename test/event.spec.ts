import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import jsdom from 'jsdom';
import Highlighter from '../src/index';
import { CreateFrom } from '../src/types/index';
import HighlightSource from '../src/model/source/index';
import sources from './fixtures/source.json';
import sinon from 'sinon';

describe('Event Emit', function () {
    this.timeout(50000);

    let highlighter: Highlighter;
    let cleanup;

    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');
        cleanup = jsdomGlobal('', {
            resources: new jsdom.ResourceLoader({
                userAgent: 'Mellblomenator/9000'
            })
        });
        document.body.innerHTML = html;
        highlighter = new Highlighter();
    });

    describe('#CREATE event', () => {
        let listener: sinon.SinonSpy<any[], any[]>;

        beforeEach(() => {
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.CREATE, listener);
        });

        it('should be emitted by calling .fromRange', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct arguments by calling .fromRange', () => {
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            const content = range.toString();
            highlighter.fromRange(range);
            const sources: HighlightSource[] = listener.args[0][0].sources;

            expect(listener.args[0][0].type).to.be.equal(CreateFrom.INPUT);
            expect(sources[0].text).to.be.equal(content);
            expect(Highlighter.isHighlightSource(sources[0])).to.be.true;
        });

        it('should be emitted by calling .fromStore', () => {
            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);

            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct arguments by calling .fromStore', () => {
            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
            const sourcesRes: HighlightSource[] = listener.args[0][0].sources;

            expect(listener.args[0][0].type).to.be.equal(CreateFrom.STORE);
            expect(sourcesRes[0].text).to.be.equal(s.text);
            expect(Highlighter.isHighlightSource(sourcesRes[0])).to.be.true;
        });

        it('should be emitted when running automatically', () => {
            highlighter.run();

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

            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct arguments when running automatically', () => {
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

            const sources: HighlightSource[] = listener.args[0][0].sources;
            expect(listener.args[0][0].type).to.be.equal(CreateFrom.INPUT);
            expect(sources[0].text).to.be.equal(content);
            expect(Highlighter.isHighlightSource(sources[0])).to.be.true;
        });
    });

    describe('#REMOVE event', () => {
        let listener: sinon.SinonSpy<any[], any[]>;

        beforeEach(() => {      
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.REMOVE, listener);
        });

        it('should be emitted by calling .removeAll', () => {
            highlighter.removeAll();
            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct ids as arguments by calling .removeAll', () => {
            highlighter.removeAll();
            const ids: string[] = listener.args[0][0].ids;
            expect(ids).lengthOf(sources.length);
            expect(ids.every(id => sources.map(o => o.id).indexOf(id) > -1)).to.be.true;
            expect(listener.calledOnce).to.be.true;
        });

        it('should be emitted by calling .remove', () => {
            highlighter.remove(sources[0].id);
            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct ids as arguments by calling .remove', () => {
            const id = sources[0].id
            highlighter.remove(id);
            const ids: string[] = listener.args[0][0].ids;
            expect(ids).lengthOf(1);
            expect(ids[0]).to.be.equal(id);
        });

        it('should be emitted when the id does not exist', () => {
            highlighter.remove('fake id');
            expect(listener.calledOnce).to.be.false;
        });
    });

    describe('#CLICK event', () => {
        let listener: sinon.SinonSpy<any[], any[]>;
        let event: MouseEvent;

        beforeEach(() => {      
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.CLICK, listener);
            event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
        });

        it('should be emitted correctly', () => {
            highlighter.getDoms(sources[0].id)[0].dispatchEvent(event);
            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct id as arguments', () => {
            const id = sources[0].id;
            highlighter.getDoms(id)[0].dispatchEvent(event);
            const args = listener.args[0][0];

            expect(args.id).to.be.equal(id);
        });

        it('should not be emitted when clicked dom is not a wrapper', () => {
            document.querySelector('p').dispatchEvent(event);
            expect(listener.calledOnce).to.be.false;
        });
    });

    describe('#HOVER event', () => {
        let listener: sinon.SinonSpy<any[], any[]>;
        let event: MouseEvent;

        beforeEach(() => {      
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.HOVER, listener);
            event = new MouseEvent('mouseover', {
                view: window,
                bubbles: true,
                cancelable: true
            });
        });

        it('should be emitted correctly', () => {
            highlighter.getDoms(sources[0].id)[0].dispatchEvent(event);
            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct id as arguments', () => {
            const id = sources[0].id;
            highlighter.getDoms(id)[0].dispatchEvent(event);
            const args = listener.args[0][0];

            expect(args.id).to.be.equal(id);
        });

        it('should not be emitted when the dom hovered is not a wrapper', () => {
            document.querySelector('p').dispatchEvent(event);
            expect(listener.calledOnce).to.be.false;
        });

        it('should not be emitted when move to a same highlighted wrapper', () => {
            highlighter.getDoms(sources[1].id)[0].dispatchEvent(event);
            highlighter.getDoms(sources[1].id)[1].dispatchEvent(event);
            expect(listener.calledOnce).to.be.true;
        });
    });

    describe('#HOVER_OUT event', () => {
        let listener: sinon.SinonSpy<any[], any[]>;
        let event: MouseEvent;

        beforeEach(() => {      
            highlighter.removeAll();
            sources.forEach(s => highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id));
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.HOVER_OUT, listener);
            event = new MouseEvent('mouseover', {
                view: window,
                bubbles: true,
                cancelable: true
            });
        });

        it('should be emitted correctly', () => {
            highlighter.getDoms(sources[0].id)[0].dispatchEvent(event);
            document.querySelector('p').dispatchEvent(event);
            expect(listener.calledOnce).to.be.true;
        });

        it('should get correct id as arguments', () => {
            const id = sources[0].id;
            highlighter.getDoms(sources[0].id)[0].dispatchEvent(event);
            highlighter.getDoms(sources[1].id)[0].dispatchEvent(event);

            expect(listener.args[0][0].id).to.be.equal(id);
        });

        it('should not be emitted when just hover a wrapper', () => {
            highlighter.getDoms(sources[0].id)[0].dispatchEvent(event);
            expect(listener.calledOnce).to.be.false;
        });

        it('should not be emitted when just move to a wrapper in the same highlight', () => {
            highlighter.getDoms(sources[1].id)[0].dispatchEvent(event);
            highlighter.getDoms(sources[1].id)[1].dispatchEvent(event);
            expect(listener.calledOnce).to.be.false;
        });
    });

    afterEach(() => {
        cleanup();
    });
});
