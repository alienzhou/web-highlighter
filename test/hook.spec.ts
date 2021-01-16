import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import Highlighter from '../src/index';
import HighlightSource from '../src/model/source';
import { DomNode } from '../src/types';
import sinon from 'sinon';
import sources from './fixtures/source.json';

describe('Highlighter Hooks', function () {
    this.timeout(50000);

    let highlighter: Highlighter;
    let cleanup;

    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');
        cleanup = jsdomGlobal();
        document.body.innerHTML = html;
        highlighter = new Highlighter();
    });

    describe('#Render.UUID', () => {
        let listener: sinon.SinonSpy<any[], any[]>;
        let id = 'customize-id';

        beforeEach(() => {
            listener = sinon.spy();
            (highlighter as any).on(Highlighter.event.CREATE, listener);
        });

        it('should use the customized id', () => {
            highlighter.hooks.Render.UUID.tap(() => id);

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(listener.args[0][0].sources[0].id).to.be.equal(id);
        });

        it('should use the internal uuid id when return undefined in the hook', () => {
            const spy: sinon.SinonSpy<any[], string> = sinon.spy();
            highlighter.hooks.Render.UUID.tap(spy);

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(spy.calledOnce).to.be.true;
            expect(listener.args[0][0].sources[0].id).to.not.equal(id);
        });

        it('should get correct arguments in the hook', () => {
            const spy: sinon.SinonSpy<any[], string> = sinon.spy();
            highlighter.hooks.Render.UUID.tap(spy);

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            const content = range.toString();
            highlighter.fromRange(range);

            expect(spy.args[0][0].$node).to.be.equal($p.childNodes[0]);
            expect(spy.args[0][0].offset).to.be.equal(0);
            expect(spy.args[0][1].$node).to.be.equal($p.childNodes[0]);
            expect(spy.args[0][1].offset).to.be.equal(17);
            expect(spy.args[0][2]).to.be.equal(content);
        });
    });

    describe('#Render.SelectedNodes', () => {

        it('should not affect the document when return an empty array in the hook', () => {
            highlighter.hooks.Render.SelectedNodes.tap(() => []);

            const html = document.body.innerHTML;
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(document.body.innerHTML).to.be.equal(html);
        });

        it('should not affect the document when return undefined in the hook', () => {
            highlighter.hooks.Render.SelectedNodes.tap(() => []);

            const html = document.body.innerHTML;
            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);

            expect(() => highlighter.fromRange(range)).not.to.throw();
            expect(document.body.innerHTML).to.be.equal(html);
        });

        it('should get correct arguments in the hook', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            highlighter.hooks.Render.SelectedNodes.tap(spy);

            const range = document.createRange();
            const $p = document.querySelectorAll('p')[0];
            range.setStart($p.childNodes[0], 0);
            range.setEnd($p.childNodes[0], 17);
            highlighter.fromRange(range);

            expect(spy.calledOnce).to.be.true;
            expect(spy.args[0][0]).not.to.be.empty;
            expect(spy.args[0][0]).not.to.be.string;
            expect(spy.args[0][1]).lengthOf(1);
        });
    });

    describe('#Render.WrapNode', () => {
        it('should get correct arguments in the hook', () => {
            const spy: sinon.SinonSpy<any[], HTMLElement> = sinon.spy();
            highlighter.hooks.Render.WrapNode.tap(spy);

            const range = document.createRange();
            range.setStart(document.querySelectorAll('p')[0].childNodes[0], 0);
            range.setEnd(document.querySelectorAll('p')[0].childNodes[0], 17);
            highlighter.fromRange(range);

            expect(spy.calledOnce).to.be.true;
            expect(spy.args[0][0]).not.to.be.empty;
            expect(spy.args[0][0]).not.to.be.string;
            expect(Highlighter.isHighlightWrapNode(spy.args[0][1])).to.be.true;
        });

        it('should be called multiple times when creating multiple wrappers', () => {
            const spy: sinon.SinonSpy<any[], HTMLElement> = sinon.spy();
            highlighter.hooks.Render.WrapNode.tap(spy);

            const range = document.createRange();
            range.setStart(document.querySelectorAll('p')[0].childNodes[0], 0);
            range.setEnd(document.querySelectorAll('p')[1].childNodes[0], 17);
            highlighter.fromRange(range);

            expect(spy.callCount).to.be.equal(3);
        });
    });

    describe('#Serialize.Restore', () => {
        it('should get correct arguments in the hook', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            highlighter.hooks.Serialize.Restore.tap(spy);

            const extra = 'this is for testing extra';
            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id, extra);

            expect(spy.calledOnce).to.be.true;

            const source: HighlightSource = spy.args[0][0];
            expect(source, 'source should not be empty').not.to.be.empty;
            expect(source.extra, 'source extra info should be the same').to.be.equal(extra);

            const start: DomNode = spy.args[0][1];
            expect(start.$node instanceof Node, 'start .$node to be a Node').to.be.true;
            expect(typeof start.offset, 'start .offset to be a number').to.be.equal('number');

            const end: DomNode = spy.args[0][2];
            expect(end.$node instanceof Node, 'end .$node to be a Node').to.be.true;
            expect(typeof end.offset, 'end .offset to be a number').to.be.equal('number');
        });

        it('should change the selection when returning other values in the hook', () => {
            const start = 5;
            const end = 9;
            highlighter.hooks.Serialize.Restore.tap((_: HighlightSource, s: DomNode, e: DomNode) => {
                s.offset = start;
                e.offset = end;
                return [s , e];
            });

            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
            const doms = highlighter.getDoms(s.id);

            expect(doms).lengthOf(1);
            expect(doms[0].textContent).to.be.equal(s.text.slice(start, end));
        });
    });

    describe('#Serialize.RecordInfo', () => {
        it('should get correct arguments in the hook', () => {
            const spy: sinon.SinonSpy<any[], string> = sinon.spy();
            highlighter.hooks.Serialize.RecordInfo.tap(spy);

            const range = document.createRange();
            range.setStart(document.querySelectorAll('p')[0].childNodes[0], 0);
            range.setEnd(document.querySelectorAll('p')[0].childNodes[0], 17);
            highlighter.fromRange(range);

            expect(spy.calledOnce).to.be.true;
            expect(spy.args[0][0]).not.to.be.empty;
            expect(spy.args[0][1]).not.to.be.empty;
            expect(spy.args[0][2]).to.be.equal(document);
        });

        it('should add extra info to sources', () => {   
            const extra = 'test-extra';
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            (highlighter as any).on(Highlighter.event.CREATE, spy);
            highlighter.hooks.Serialize.RecordInfo.tap(() => extra);

            const range = document.createRange();
            range.setStart(document.querySelectorAll('p')[0].childNodes[0], 0);
            range.setEnd(document.querySelectorAll('p')[0].childNodes[0], 17);
            highlighter.fromRange(range);

            expect(spy.args[0][0].sources[0].extra).to.be.equal(extra);
        });
    });

    describe('#Remove.UpdateNodes', () => {
        it('should get correct arguments in the hook', () => {
            const spy: sinon.SinonSpy<any[], any[]> = sinon.spy();
            highlighter.hooks.Remove.UpdateNodes.tap(spy);

            const s = sources[0];
            highlighter.fromStore(s.startMeta, s.endMeta, s.text, s.id);
            highlighter.remove(s.id);

            expect(spy.calledOnce).to.be.true;
            expect(spy.args[0][0]).to.be.equal(s.id);
            expect(Highlighter.isHighlightWrapNode(spy.args[0][1])).to.be.true;
            expect(spy.args[0][2]).to.be.equal('remove');
        });
    });

    afterEach(() => {
        cleanup();
    });
});
