import {
    removeSelection,
    getHighlightRange
} from './range';
import {
    STYLE_TAG_ID,
    STYLE_TAG_TEXT,
    DATASET_IDENTIFIER
} from '../util/const';
import {
    SplitType,
    PainterOptions
} from '../model/types';
import Highlight from '../model/highlight';
import {
    render,
    resetDom
} from './render';

export default class Paint {
    options: PainterOptions;
    $style: HTMLStyleElement;
    styleId: string;

    constructor(options?: PainterOptions) {
        this.options = {
            $root: options.$root,
            highlightClassName: options.highlightClassName
        };
        this.styleId = STYLE_TAG_ID;

        let $style: HTMLStyleElement = document.getElementById(this.styleId) as HTMLStyleElement;
        if (!$style) {
            const $cssNode = document.createTextNode(STYLE_TAG_TEXT);
            $style = document.createElement('style');
            $style.id = this.styleId;
            $style.appendChild($cssNode);
            document.head.appendChild($style);
        }

        this.$style = $style;
    }

    renderHighlight(highlight: Highlight): void {
        render(this.options.$root, highlight, this.options.highlightClassName);
    };

    highlightSelection(): Highlight {
        const range = getHighlightRange();
        if (range === null) {
            return;
        }

        // 由于 Highlight 实例化中具有DOM相关查询操作
        // 因此需要在高亮（修改DOM树）之前先创建 highlight
        const highlight = new Highlight(
            range.$startNode,
            range.$endNode,
            range.startOffset,
            range.endOffset
        );

        render(this.options.$root, highlight);
        removeSelection();

        return highlight;
    }

    removeAllHighlight() {
        const $spans = document.querySelectorAll(`[data-${DATASET_IDENTIFIER}]`);
        $spans.forEach($s => {
            resetDom($s as HTMLSpanElement);
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            $s.childNodes.forEach($c => $fr.appendChild($c.cloneNode(false)));
            $parent.replaceChild($fr, $s);
        });
    }

    removeHighlight(id: string) {
        const $spans = document.querySelectorAll(`span[data-${DATASET_IDENTIFIER}='${id}']`);
        $spans.forEach($s => {
            resetDom($s as HTMLSpanElement);
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            $s.childNodes.forEach($c => $fr.appendChild($c.cloneNode(false)));
            $parent.replaceChild($fr, $s);
        });
    }
};