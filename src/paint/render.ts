import Highlight from '../model/highlight';
import {
    SplitType,
    SelectedNode
} from '../model/types';
import {
    DEFAULT_OPTIONS,
    CAMEL_DATASET_SPLIT_TYPE,
    CAMEL_DATASET_IDENTIFIER
} from '../util/const'
import getSelectedNodes from './traverse';

function wrapHighlight(selected: SelectedNode, highlight: Highlight, className?: string): void {
    if (!className) {
        className = DEFAULT_OPTIONS.style.highlightClassName;
    }

    const $wrap = document.createElement('span');
    $wrap.classList.add(className);

    $wrap.dataset[CAMEL_DATASET_IDENTIFIER] = highlight.id;
    $wrap.dataset[CAMEL_DATASET_SPLIT_TYPE] = selected.splitType;

    $wrap.appendChild(selected.$node.cloneNode(false));

    selected.$node.parentElement.replaceChild($wrap, selected.$node);
};

export const render = (
    $root: HTMLElement | Document,
    highlight: Highlight,
    className?: string
): void => {
    const {
        $startNode,
        $endNode,
        startOffset,
        endOffset
    } = highlight;
    const nodes = getSelectedNodes($root, $startNode, $endNode, startOffset, endOffset);
    nodes.forEach(n => wrapHighlight(n, highlight, className));
}

export const resetDom = ($s: HTMLSpanElement) => {
    const splitType = ($s as HTMLElement).dataset[CAMEL_DATASET_SPLIT_TYPE];
    const $prev = $s.previousSibling;
    const $next = $s.nextSibling;
    switch (splitType) {
        case SplitType.both:
            if ($prev.nodeType === 3) {
                $s.textContent = $prev.textContent + $s.textContent;
                $s.parentNode.removeChild($prev);
            }
            if ($next.nodeType === 3) {
                $s.textContent = $s.textContent + $next.textContent;
                $s.parentNode.removeChild($next);
            }
            break;
        case SplitType.head:
            if ($prev.nodeType === 3) {
                $s.textContent = $prev.textContent + $s.textContent;
                $s.parentNode.removeChild($prev);
            }
            break;
        case SplitType.tail:
            if ($next.nodeType === 3) {
                $s.textContent = $s.textContent + $next.textContent;
                $s.parentNode.removeChild($next);
            }
            break;
        case SplitType.none:
            break;
        default:
            break;
    }
}