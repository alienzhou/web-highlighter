import { expect } from 'chai';
import jsdomGlobal from 'jsdom-global';
import HighlightSource from '../src/model/source/index';
import sources from './fixtures/source.json';
import Cache from '../src/data/cache';
import Hook from '../src/util/hook';
import EventEmitter from '../src/util/event.emitter';
import { initDefaultStylesheet } from '../src/painter/style';
import { addEventListener } from '../src/util/dom';
import sinon from 'sinon';

describe('Else Utils', function () {
    this.timeout(50000);

    describe('Cache', () => {
        let cache: Cache;

        beforeEach(() => {
            cache = new Cache();
        });

        it('should work correctly when saving source', () => {
            const s = sources[0];
            const highlightSource = new HighlightSource(s.startMeta, s.endMeta, s.text, s.id);
            cache.save(highlightSource);
            expect(cache.getAll()).lengthOf(1);
            expect(cache.getAll()[0]).to.be.equal(highlightSource);
        });

        it('should throw error when set data', () => {
            const s = sources[0];
            const highlightSource = new HighlightSource(s.startMeta, s.endMeta, s.text, s.id);
            cache.save(highlightSource);
            expect(() => cache.data = [highlightSource]).to.throw();
        });

        it('should be the same when using .data and .getAll', () => {
            const s = sources[0];
            const highlightSource = new HighlightSource(s.startMeta, s.endMeta, s.text, s.id);
            cache.save(highlightSource);
            expect(cache.getAll()).lengthOf(cache.data.length);
            expect(cache.getAll().every(c => cache.data.indexOf(c) > -1)).to.be.true;
        });

        it('should support an array as the argument', () => {
            const highlightSources = sources.map(s => new HighlightSource(s.startMeta, s.endMeta, s.text, s.id));
            cache.save(highlightSources);
            expect(cache.getAll()).lengthOf(highlightSources.length);
        });

        it('should return the correct data by .get', () => {
            const s = sources[0];
            const highlightSource = new HighlightSource(s.startMeta, s.endMeta, s.text, s.id);
            cache.save(highlightSource);
            expect(cache.get(s.id)).to.be.equal(highlightSource);
        });
    });

    describe('Style', () => {
        it('should not generate duplicate stylesheet', () => {
            const cleanup = jsdomGlobal();
            expect(document.querySelectorAll('style')).lengthOf(0);
            initDefaultStylesheet();
            expect(document.querySelectorAll('style')).lengthOf(1);
            initDefaultStylesheet();
            expect(document.querySelectorAll('style')).lengthOf(1);
            cleanup();
        });
    });

    describe('Hook', () => {
        it('should have the correct name', () => {
            const hook = new Hook('test');
            expect(hook.name).to.be.equal('test');
        });

        it('should be empty before tapping anything', () => {
            const hook = new Hook();
            expect(hook.isEmpty()).to.be.true;
        });

        it('should call only once for a tapped function', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const spy2: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const hook = new Hook();
            hook.tap(spy);
            hook.tap(spy2);
            hook.call();

            expect(spy.calledOnce).to.be.true;
            expect(spy2.calledOnce).to.be.true;
        });

        it('should call tapped functions in the correct order', () => {
            const seq = [];
            const first = () => seq.push(1);
            const second = () => seq.push(2);
            const third = () => seq.push(3);
            const hook = new Hook();
            hook.tap(first);
            hook.tap(second);
            hook.tap(third);
            hook.call();

            expect(seq).to.deep.equal([1, 2, 3]);
        });

        it('should return a valid removing function when calling .tap', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const hook = new Hook();
            const remove = hook.tap(spy);
            remove();
            hook.call();

            expect(hook.isEmpty()).to.be.true;
            expect(spy.callCount).to.be.equal(0);
        });

        it('should not tap the same function twice', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const hook = new Hook();
            hook.tap(spy);
            hook.tap(spy);
            hook.call();

            expect(spy.calledOnce).to.be.true;
        });

        it('should remove the tapped functions by calling .remove', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const hook = new Hook();
            hook.tap(spy);
            hook.remove(spy);
            hook.call();
            
            expect(hook.isEmpty()).to.be.true;
            expect(spy.callCount).to.be.equal(0);
        });

        it('should get the correct parameters when calling .call', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const spy2: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const hook = new Hook();
            const p1 = 'test';
            const p2 = [1];
            hook.tap(spy);
            hook.tap(spy2);
            hook.call(p1, p2);
            
            expect(spy.args[0][0]).to.be.equal(p1);
            expect(spy2.args[0][0]).to.be.equal(p1);
            expect(spy.args[0][1]).to.be.equal(p2);
            expect(spy2.args[0][1]).to.be.equal(p2);
        });

        it('should use the last tapped function\s return as the returned value', () => {
            const hook = new Hook();
            hook.tap(() => 1);
            hook.tap(() => 2);
            hook.tap(() => 3);
            expect(hook.call()).to.be.equal(3);
        });

        it('should not throw error when removing a non-exist function', () => {
            const hook = new Hook();
            expect(() => hook.remove(() => {})).not.to.be.throw();
        });
    });

    describe('EventEmitter', () => {
        it('should call the callback when event emit', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const event = new EventEmitter();
            event.on('test', spy);
            event.emit('test');

            expect(spy.calledOnce).to.be.true;
        });

        it('should not call the callback when another event emit', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const event = new EventEmitter();
            event.on('test', spy);
            event.emit('test-2');

            expect(spy.callCount).to.be.equal(0);
        });

        it('should not call the callback after calling .off', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const event = new EventEmitter();
            event.on('test', spy);
            event.off('test', spy);
            event.emit('test');

            expect(spy.callCount).to.be.equal(0);
        });

        it('should not have effects when event name is not exist', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const event = new EventEmitter();
            event.on('test', spy);
            event.off('test-1', spy);
            event.emit('test');

            expect(spy.calledOnce).to.be.true;
        });
    });

    describe('DOM addEventListener', () => {
        it('should add listener correctly', () => {
            const cleanup = jsdomGlobal('<button>test</button>');
            
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const dom = document.querySelector('button');
            addEventListener(dom, 'click', spy);
            dom.dispatchEvent(new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            }));

            expect(spy.calledOnce).to.be.true;
            cleanup();
        });

        it('should remove listener correctly', () => {
            const cleanup = jsdomGlobal('<button>test</button>');
            
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            const dom = document.querySelector('button');
            const remove = addEventListener(dom, 'click', spy);
            remove();
            dom.dispatchEvent(new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            }));

            expect(spy.callCount).to.be.equal(0);
            cleanup();
        });
    });
});
