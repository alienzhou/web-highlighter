import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Painter from '@src/painter';
import { DATASET_IDENTIFIER, getDefaultOptions } from '@src/util/const';
import Hook from '@src/util/hook';


describe.only('Painter', () => {
	let painter: Painter;

	beforeEach(() => {
		const html = readFileSync(resolve(__dirname, 'fixtures', 'span_with_ix_highlighted.html'), 'utf-8');

		document.body.innerHTML = html;

		const defaultOptions = getDefaultOptions()

		const hooks = {
			Render: {
				UUID: new Hook('Render.UUID'),
				SelectedNodes: new Hook('Render.SelectedNodes'),
				WrapNode: new Hook('Render.WrapNode'),
			},
			Serialize: {
				Restore: new Hook('Serialize.Restore'),
				RecordInfo: new Hook('Serialize.RecordInfo'),
			},
			Remove: {
				UpdateNodes: new Hook('Remove.UpdateNodes'),
			},
		}

		painter = new Painter(
			{ ...defaultOptions, wrapTag: 'mark', className: '' },
			// @ts-expect-error this is fine
			hooks,
		)


	})

	it('removeAllHighlight() should remove all the highlights and reconstruct the previous DOM state', () => {
		const originalHtml = readFileSync(resolve(__dirname, 'fixtures', 'span_with_ix_original.html'), 'utf-8');

		const originalContainer = document.createElement('span')
		const text1 = document.createTextNode('As ')
		const ix1 = document.createElement('ix')
		ix1.textContent = '25.0'

		const text2 = document.createTextNode('&nbsp;million In the')

		const ix2 = document.createElement('ix')
		ix2.textContent = '25.0'

		const text3 = document.createTextNode('&nbsp;million. See Note 7 for further details. ')

		originalContainer.appendChild(text1)
		originalContainer.appendChild(ix1)
		originalContainer.appendChild(text2)
		originalContainer.appendChild(ix2)
		originalContainer.appendChild(text3)

		console.log('it ~ originalContainer:', originalContainer.outerHTML)

		const highlightedContainer = document.createElement('span')
		const hText1 = document.createTextNode('As ')
		const hIx1 = document.createElement('ix')
		hIx1.textContent = '25.0'

		const hText2 = document.createTextNode('&nbsp;million ')
		const hMark1 = createMarkTag('In the')

		const hIx2 = document.createElement('ix')
		const hMark2 = createMarkTag('25.0')
		hIx2.appendChild(hMark2)

		const hMark3 = createMarkTag('&nbsp;million.')

		const hText3 = document.createTextNode(' See Note 7 for further details. ')

		highlightedContainer.appendChild(hText1)
		highlightedContainer.appendChild(hIx1)
		highlightedContainer.appendChild(hText2)
		highlightedContainer.appendChild(hMark1)
		highlightedContainer.appendChild(hIx2)
		highlightedContainer.appendChild(hMark3)
		highlightedContainer.appendChild(hText3)
		console.log('it ~ highlightedContainer:', highlightedContainer.outerHTML)

		const bodyContainer = document.createElement('body')
		bodyContainer.appendChild(highlightedContainer)

		document.body = bodyContainer

		painter.removeAllHighlight()
		console.log('it ~ processed container:', document.body.children[0].outerHTML)

		expect(compareDOMNodes(document.body.childNodes[0], originalContainer)).to.be.true
	});
});

function createMarkTag(text: string) {
	const mark = document.createElement('mark')
	mark.setAttribute(`data-${DATASET_IDENTIFIER}`, 'id')
	mark.textContent = text

	return mark
}

function compareDOMNodes(nodeA, nodeB) {
	// Step 1: Compare node types
	if (nodeA.nodeType !== nodeB.nodeType || nodeA.nodeName !== nodeB.nodeName) {
		return false;
	}

	// Step 2: Compare attributes if element nodes
	if (nodeA.nodeType === Node.ELEMENT_NODE) {
		const attrsA = nodeA.attributes;
		const attrsB = nodeB.attributes;
		if (attrsA.length !== attrsB.length) {
			return false;
		}
		for (let i = 0; i < attrsA.length; i++) {
			const attrName = attrsA[i].nodeName;
			if (nodeA.getAttribute(attrName) !== nodeB.getAttribute(attrName)) {
				return false;
			}
		}
	}

	// Step 3: Direct comparison for text nodes (basic check)
	if (nodeA.nodeType === Node.TEXT_NODE) {
		if (nodeA.textContent !== nodeB.textContent) {
			return false;
		}
	}

	// Step 4: Recursive comparison of child nodes
	const childrenA = nodeA.childNodes;
	const childrenB = nodeB.childNodes;
	if (childrenA.length !== childrenB.length) {
		return false;
	}
	for (let i = 0; i < childrenA.length; i++) {
		if (!compareDOMNodes(childrenA[i], childrenB[i])) {
			return false;
		}
	}

	// Passed all checks
	return true;
}

