/**
 * Painter object is designed for some painting work about higlighting,
 * including rendering, cleaning...
 * No need to instantiate repeatly. A Highlighter instance will bind a Painter instance.
 */

import HighlightSource from '@src/model/source';
import HighlightRange from '@src/model/range';
import {wrapHighlight, getSelectedNodes, normalizeSiblingText} from './dom';
import {getHighlightsByRoot, forEach} from '@src/util/dom';
import {ERROR, PainterOptions, HookMap} from '@src/types';
import {initDefaultStylesheet} from './style';
import {
    ID_DIVISION,
    DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER_EXTRA
} from '../util/const';

export default class Painter {
    options: PainterOptions;
    $style: HTMLStyleElement;
    styleId: string;
    hooks: HookMap;

    constructor(options: PainterOptions, hooks: HookMap) {
        this.options = {
            $root: options.$root,
            wrapTag: options.wrapTag,
            exceptSelectors: options.exceptSelectors,
            className: options.className
        };
        this.hooks = hooks;

        initDefaultStylesheet();
    }

    /* =========================== render =========================== */
    highlightRange(range: HighlightRange): Array<HTMLElement> {
        if (!range.frozen) {
            throw ERROR.HIGHLIGHT_RANGE_FROZEN;
        }

        const {$root, className, exceptSelectors} = this.options;
        const hooks = this.hooks;

        let $selectedNodes = getSelectedNodes($root, range.start, range.end, exceptSelectors);
        if (!hooks.Render.SelectedNodes.isEmpty()) {
            $selectedNodes = hooks.Render.SelectedNodes.call(range.id, $selectedNodes);
        }

        return $selectedNodes.map(n => {
            let $node = wrapHighlight(n, range, className, this.options.wrapTag);
            if (!hooks.Render.WrapNode.isEmpty()) {
                $node = hooks.Render.WrapNode.call(range.id, $node);
            }
            return $node;
        });
    }

    highlightSource(sources: HighlightSource | HighlightSource[]): Array<HighlightSource> {
        const list = Array.isArray(sources)
            ? sources as HighlightSource[]
            : [sources as HighlightSource];

        const renderedSources: Array<HighlightSource> = [];
        list.forEach(s => {
            if (!(s instanceof HighlightSource)) {
                console.error(ERROR.SOURCE_TYPE_ERROR);
                return;
            }
            const range = s.deSerialize(this.options.$root, this.hooks);
            const $nodes = this.highlightRange(range);
            if ($nodes.length > 0) {
                renderedSources.push(s);
            }
            else {
                console.warn(ERROR.HIGHLIGHT_SOURCE_NONE_RENDER, s);
            }
        });

        return renderedSources;
    }
    /* ============================================================== */

    /* =========================== clean =========================== */
    // id: target id - highlight with this id should be clean
    removeHighlight(id: string) {
        // whether extra ids contains the target id
        const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);

        const hooks = this.hooks;
        const wrapTag = this.options.wrapTag;
        const $spans = document.querySelectorAll(`${wrapTag}[data-${DATASET_IDENTIFIER}]`) as NodeListOf<HTMLElement>;

        // nodes to remove
        const $toRemove: HTMLElement[] = [];
        // nodes to update main id
        const $idToUpdate: HTMLElement[] = [];
        // nodes to update extra id
        const $extraToUpdate: HTMLElement[] = [];

        for (let i = 0; i < $spans.length; i++) {
            const spanId = $spans[i].dataset[CAMEL_DATASET_IDENTIFIER];
            const spanExtraIds = $spans[i].dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            // main id is the target id and no extra ids --> to remove
            if (spanId === id && !spanExtraIds) {
                $toRemove.push($spans[i]);
            }
            // main id is the target id but there is some extra ids -> update main id & extra id
            else if (spanId === id) {
                $idToUpdate.push($spans[i]);
            }
            // main id isn't the target id but extra ids contains it -> just remove it from extra id
            else if (spanId !== id && reg.test(spanExtraIds)) {
                $extraToUpdate.push($spans[i]);
            }
        }

        $toRemove.forEach($s => {
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            forEach($s.childNodes, $c => $fr.appendChild($c.cloneNode(false)));
            const $prev = $s.previousSibling;
            const $next = $s.nextSibling;
            $parent.replaceChild($fr, $s);
            // there are bugs in IE11, so use a more reliable function
            normalizeSiblingText($prev, true);
            normalizeSiblingText($next, false);
            hooks.Remove.UpdateNodes.call(id, $s, 'remove');
        });

        $idToUpdate.forEach($s => {
            const dataset = $s.dataset;
            const ids = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION);
            dataset[CAMEL_DATASET_IDENTIFIER] = ids.shift();
            dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = ids.join(ID_DIVISION);
            hooks.Remove.UpdateNodes.call(id, $s, 'id-update');
        });

        $extraToUpdate.forEach($s => {
            const extraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = extraIds.replace(reg, '');
            hooks.Remove.UpdateNodes.call(id, $s, 'extra-update');
        });
    }

    removeAllHighlight() {
        const {wrapTag, $root} = this.options;
        const $spans = getHighlightsByRoot($root, wrapTag);
        $spans.forEach($s => {
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            forEach($s.childNodes, $c => $fr.appendChild($c.cloneNode(false)));
            $parent.replaceChild($fr, $s);
        });
    }
    /* ============================================================== */
};
