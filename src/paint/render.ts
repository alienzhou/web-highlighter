import HighlightRange from '../model/range';
import {SplitType,SelectedNode} from '../types';
import {getSelectedNodes, isHighlightWrapNode} from '../util/dom';
import {
    ID_DIVISION,
    DEFAULT_OPTIONS,
    CAMEL_DATASET_SPLIT_TYPE,
    CAMEL_DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER_EXTRA
} from '../util/const'

/**
 * wrap a dom node with highlight wrap
 */
const wrapHighlight = (
    selected: SelectedNode,
    range: HighlightRange,
    className?: string
): HTMLElement => {
    const $parent = selected.$node.parentNode as HTMLElement;
    const $prev = selected.$node.previousSibling;
    const $next = selected.$node.nextSibling;

    let $wrap: HTMLElement;
    // text node, not in a highlight wrap -> should wrap in a highlight wrap
    if (!isHighlightWrapNode($parent)) {
        className = className || DEFAULT_OPTIONS.style.highlightClassName;

        $wrap = document.createElement('span');
        $wrap.classList.add(className);

        $wrap.dataset[CAMEL_DATASET_IDENTIFIER] = range.id;
        $wrap.dataset[CAMEL_DATASET_SPLIT_TYPE] = selected.splitType;

        $wrap.appendChild(selected.$node.cloneNode(false));
        selected.$node.parentElement.replaceChild($wrap, selected.$node);
    }
    // text node, in a highlight wrap -> should split the highlight wrap
    else if (isHighlightWrapNode($parent) && ($prev || $next)) {
        const $fr = document.createDocumentFragment();
        const parentId = $parent.dataset[CAMEL_DATASET_IDENTIFIER];
        const parentExtraId = $parent.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
        $wrap = document.createElement('span');
        $wrap.classList.add(className);

        $wrap.dataset[CAMEL_DATASET_IDENTIFIER] = range.id;
        $wrap.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = parentExtraId
            ? parentExtraId + ID_DIVISION + parentId
            : parentId;
        $wrap.appendChild(selected.$node.cloneNode(false));

        let headSplit = false;
        let tailSplit = false;
        let splitType: SplitType;

        if ($prev) {
            const $span = $parent.cloneNode(false);
            $span.textContent = $prev.textContent;
            $fr.appendChild($span);
            headSplit = true;
        }

        $fr.appendChild($wrap);

        if ($next) {
            const $span = $parent.cloneNode(false);
            $span.textContent = $next.textContent;
            $fr.appendChild($span);
            tailSplit = true;
        }

        if (headSplit && tailSplit) {
            splitType = SplitType.both;
        }
        else if (headSplit) {
            splitType = SplitType.head;
        }
        else if (tailSplit) {
            splitType = SplitType.tail;
        }
        else {
            splitType = SplitType.none;
        }

        $wrap.dataset[CAMEL_DATASET_SPLIT_TYPE] = splitType;
        $parent.parentNode.replaceChild($fr, $parent);
    }
    // completely overlap (with a highlight wrap) -> only add extra id info
    else {
        $wrap = $parent;
        const dataset = $parent.dataset;
        dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA]
            ? dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] + ID_DIVISION + range.id
            : range.id;
    }
    return $wrap;
};

/**
 * render range into highlight status
 */
export function render(
    $root: HTMLElement|Document,
    range: HighlightRange,
    exceptSelectors: Array<string>,
    className?: string
): Array<HTMLElement> {
    const {
        start: {$node: $startNode, offset: startOffset},
        end: {$node: $endNode, offset: endOffset}
    } = range;
    const nodes = getSelectedNodes($root, $startNode, $endNode, startOffset, endOffset, exceptSelectors);
    return nodes.map(n => wrapHighlight(n, range, className));
};
