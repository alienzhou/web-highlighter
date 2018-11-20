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

const wrapHighlight = (
    selected: SelectedNode,
    range: HighlightRange,
    className?: string
): void => {
    const $parent = selected.$node.parentNode as HTMLElement;
    const $prev = selected.$node.previousSibling;
    const $next = selected.$node.nextSibling;

    // 文本节点，且不包裹在span中，照常加 span 包裹来高亮
    if (!isHighlightWrapNode($parent)) {
        className = className || DEFAULT_OPTIONS.style.highlightClassName;

        const $wrap = document.createElement('span');
        $wrap.classList.add(className);

        $wrap.dataset[CAMEL_DATASET_IDENTIFIER] = range.id;
        $wrap.dataset[CAMEL_DATASET_SPLIT_TYPE] = selected.splitType;

        $wrap.appendChild(selected.$node.cloneNode(false));
        selected.$node.parentElement.replaceChild($wrap, selected.$node);
    }
    // 文本节点，包裹在span中，则需要切分
    else if (isHighlightWrapNode($parent) && ($prev || $next)) {
        const $fr = document.createDocumentFragment();
        const parentId = $parent.dataset[CAMEL_DATASET_IDENTIFIER];
        const parentExtraId = $parent.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
        const $wrap = document.createElement('span');
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
    // 与 span 节点完全重叠，只需要记录额外id信息
    else {
        const dataset = $parent.dataset;
        dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA]
            ? dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] + ID_DIVISION + range.id
            : range.id;
    }
};

export function render($root: HTMLElement|Document, range: HighlightRange, className?: string): void {
    const {
        start: {
            $node: $startNode,
            offset: startOffset
        },
        end: {
            $node: $endNode,
            offset: endOffset
        }
    } = range;
    const nodes = getSelectedNodes($root, $startNode, $endNode, startOffset, endOffset);
    nodes.forEach(n => wrapHighlight(n, range, className));
};
