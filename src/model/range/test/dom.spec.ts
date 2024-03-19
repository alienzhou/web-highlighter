import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import jsdomGlobal from 'jsdom-global';
import { getClosestTextNode } from '../dom';

describe('getClosestTextNode()', () => {
    const cleanup = jsdomGlobal();

    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, 'fixtures', 'index.html'), 'utf-8');

        document.body.innerHTML = html;
    });

	it('should get the closest text node', () => {
		const textNode = document.createTextNode('test');
		expect(getClosestTextNode(textNode)).to.be.equal(textNode)
	})

})
