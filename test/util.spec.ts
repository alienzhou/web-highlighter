import { expect } from 'chai';
import jsdomGlobal from 'jsdom-global';
import HighlightSource from '../src/model/source/index';
import sources from './fixtures/source.json';
import Cache from '../src/data/cache';
import { initDefaultStylesheet } from '../src/painter/style';

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
        });
    });
});
