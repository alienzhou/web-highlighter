import HighlightSource from '../model/source';
import HighlightRange from '../model/range';
import {render} from './render';
import {ERROR, PainterOptions} from '../types';
import {
    ID_DIVISION,
    STYLE_TAG_ID,
    STYLE_TAG_TEXT,
    DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER_EXTRA
} from '../util/const';

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

    highlightRange(range: HighlightRange) {
        if (!range.frozen) {
            throw ERROR.HIGHLIGHT_RANGE_FROZEN;
        }
        render(this.options.$root, range, this.options.highlightClassName);
    }

    highlightSource(source: HighlightSource) {
        const range = source.boil();
        this.highlightRange(range);
    }

    removeAllHighlight() {
        const $spans = document.querySelectorAll(`[data-${DATASET_IDENTIFIER}]`);
        $spans.forEach($s => {
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            $s.childNodes.forEach($c => $fr.appendChild($c.cloneNode(false)));
            $parent.replaceChild($fr, $s);
        });
    }

    removeHighlight(id: string) {
        const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);
        const $spans = document.querySelectorAll(`span[data-${DATASET_IDENTIFIER}]`) as NodeListOf<HTMLElement>;
        const $toRemove: HTMLElement[] = [];
        const $idToUpdate: HTMLElement[] = [];
        const $extraToUpdate: HTMLElement[] = [];
        for (let i = 0; i < $spans.length; i++) {
            const spanId = $spans[i].dataset[CAMEL_DATASET_IDENTIFIER];
            const spanExtraIds = $spans[i].dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            // 为当前待删除 id，同时没有其他 id，需要直接删除
            if (spanId === id && !spanExtraIds) {
                $toRemove.push($spans[i]);
            }
            // id 为当前为待删除 id，但具有其他 id（其他 highlight 也经过该区域）
            else if (spanId === id) {
                $idToUpdate.push($spans[i]);
            }
            // id 不为当前待删除 id，但其他 id 中包含该 id
            else if (spanId !== id && reg.test(spanExtraIds)) {
                $extraToUpdate.push($spans[i]);
            }
        }

        $toRemove.forEach($s => {
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            $s.childNodes.forEach($c => $fr.appendChild($c.cloneNode(false)));
            $parent.replaceChild($fr, $s);
        });

        $idToUpdate.forEach($s => {
            const dataset = $s.dataset;
            const ids = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION);
            dataset[CAMEL_DATASET_IDENTIFIER] = ids.shift();
            dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = ids.join(ID_DIVISION);
        });

        $extraToUpdate.forEach($s => {
            const extraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = extraIds.replace(reg, '');
        });
    }
};
