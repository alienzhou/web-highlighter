/**
 * Painter object is designed for some painting work about higlighting,
 * including rendering, cleaning...
 * No need to tantiate repeatly. A Highlighter instance will bind a Painter instance.
 */

import type HighlightRange from '@src/model/range';
import type { PainterOptions, HookMap, HighlighterOptions } from '@src/types';
import HighlightSource from '@src/model/source';
import { wrapHighlight, getSelectedNodes, normalizeSiblingText } from '@src/painter/dom';
import { getHighlightsByRoot, forEach, addClass, removeAllClass } from '@src/util/dom';
import { ERROR } from '@src/types';
import { initDefaultStylesheet } from '@src/painter/style';
import {
    ID_DIVISION,
    eventEmitter,
    DATASET_IDENTIFIER,
    INTERNAL_ERROR_EVENT,
    CAMEL_DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER_EXTRA,
} from '@src/util/const';

export default class Painter {
    options: PainterOptions;

    $style: HTMLStyleElement;

    styleId: string;

    hooks: HookMap;

    robustOptions?: HighlighterOptions['robustRestore'];

    constructor(options: PainterOptions, hooks: HookMap, robustOptions?: HighlighterOptions['robustRestore']) {
        this.options = {
            $root: options.$root,
            wrapTag: options.wrapTag,
            exceptSelectors: options.exceptSelectors,
            className: options.className,
        };
        this.hooks = hooks;
        this.robustOptions = robustOptions;

        initDefaultStylesheet();
    }

    /* =========================== render =========================== */
    highlightRange(range: HighlightRange): HTMLElement[] {
        if (!range.frozen) {
            throw ERROR.HIGHLIGHT_RANGE_FROZEN;
        }

        const { $root, className, exceptSelectors } = this.options;
        const hooks = this.hooks;

        let $selectedNodes = getSelectedNodes($root, range.start, range.end, exceptSelectors);

        if (!hooks.Render.SelectedNodes.isEmpty()) {
            $selectedNodes = hooks.Render.SelectedNodes.call(range.id, $selectedNodes) || [];
        }

        // 使用更安全的方式处理每个节点，防止单个节点失败影响整个高亮过程
        const wrappedNodes: HTMLElement[] = [];
        
        $selectedNodes.forEach(n => {
            try {
                let $node = wrapHighlight(n, range, className, this.options.wrapTag);

                if (!hooks.Render.WrapNode.isEmpty()) {
                    $node = hooks.Render.WrapNode.call(range.id, $node);
                }

                // 只有成功包装的节点才添加到结果中
                if ($node) {
                    wrappedNodes.push($node);
                }
            } catch (error) {
                // 单个节点包装失败时记录错误但继续处理其他节点
                console.warn('包装高亮节点时发生错误:', error, n);
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                    error,
                });
            }
        });

        return wrappedNodes;
    }

    highlightSource(sources: HighlightSource | HighlightSource[]): HighlightSource[] {
        const list = Array.isArray(sources) ? sources : [sources];

        const renderedSources: HighlightSource[] = [];

        list.forEach(s => {
            if (!(s instanceof HighlightSource)) {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.SOURCE_TYPE_ERROR,
                });

                return;
            }

            try {
                const range = s.deSerialize(this.options.$root, this.hooks, this.robustOptions);
                const $nodes = this.highlightRange(range);

                if ($nodes.length > 0) {
                    renderedSources.push(s);
                } else {
                    eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                        type: ERROR.HIGHLIGHT_SOURCE_NONE_RENDER,
                        detail: s,
                    });
                }
            } catch (error: unknown) {
                // Error handling for robust restore failures
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                    error,
                });
            }
        });

        return renderedSources;
    }
    /* ============================================================== */

    /* =========================== clean =========================== */
    // id: target id - highlight with this id should be clean
    // if there is no highlight for this id, it will return false, vice versa
    removeHighlight(id: string): boolean {
        // whether extra ids contains the target id
        const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);

        const hooks = this.hooks;
        const wrapTag = this.options.wrapTag;
        const $spans = document.querySelectorAll<HTMLElement>(`${wrapTag}[data-${DATASET_IDENTIFIER}]`);

        // nodes to remove
        const $toRemove: HTMLElement[] = [];
        // nodes to update main id
        const $idToUpdate: HTMLElement[] = [];
        // nodes to update extra id
        const $extraToUpdate: HTMLElement[] = [];

        for (const $s of $spans) {
            const spanId = $s.dataset[CAMEL_DATASET_IDENTIFIER];
            const spanExtraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];

            // main id is the target id and no extra ids --> to remove
            if (spanId === id && !spanExtraIds) {
                $toRemove.push($s);
            }
            // main id is the target id but there is some extra ids -> update main id & extra id
            else if (spanId === id) {
                $idToUpdate.push($s);
            }
            // main id isn't the target id but extra ids contains it -> just remove it from extra id
            else if (spanId !== id && reg.test(spanExtraIds)) {
                $extraToUpdate.push($s);
            }
        }

        $toRemove.forEach($s => {
            // 检查元素是否仍然在DOM中且有有效的父节点
            if (!$s || !$s.parentNode || !$s.isConnected) {
                return;
            }

            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();

            forEach($s.childNodes, ($c: Node) => $fr.appendChild($c.cloneNode(false)));

            const $prev = $s.previousSibling;
            const $next = $s.nextSibling;

            // 再次检查父节点是否仍然存在
            if ($s.parentNode === $parent && $parent) {
                $parent.replaceChild($fr, $s);
                // there are bugs in IE11, so use a more reliable function
                normalizeSiblingText($prev, true);
                normalizeSiblingText($next, false);
                hooks.Remove.UpdateNodes.call(id, $s, 'remove');
            }
        });

        $idToUpdate.forEach($s => {
            const dataset = $s.dataset;
            const ids = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION);
            const newId = ids.shift();

            // find overlapped wrapper associated with "extra id"
            const $overlapSpan = document.querySelector<HTMLElement>(
                `${wrapTag}[data-${DATASET_IDENTIFIER}="${newId}"]`,
            );

            if ($overlapSpan) {
                // empty the current class list
                removeAllClass($s);
                // retain the class list of the overlapped wrapper which associated with "extra id"
                addClass($s, [...$overlapSpan.classList]);
            }

            dataset[CAMEL_DATASET_IDENTIFIER] = newId;
            dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = ids.join(ID_DIVISION);

            hooks.Remove.UpdateNodes.call(id, $s, 'id-update');
        });

        $extraToUpdate.forEach($s => {
            const extraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];

            $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = extraIds.replace(reg, '');
            hooks.Remove.UpdateNodes.call(id, $s, 'extra-update');
        });

        return $toRemove.length + $idToUpdate.length + $extraToUpdate.length !== 0;
    }

    removeAllHighlight() {
        const { wrapTag, $root } = this.options;
        const $spans = getHighlightsByRoot($root, wrapTag);

        $spans.forEach($s => {
            try {
                // 检查元素是否仍然在DOM中且有有效的父节点
                if (!$s || !$s.parentNode || !$s.isConnected) {
                    return;
                }

                const $parent = $s.parentNode;
                const $fr = document.createDocumentFragment();

                // 安全地克隆子节点
                forEach($s.childNodes, ($c: Node) => {
                    if ($c) {
                        $fr.appendChild($c.cloneNode(false));
                    }
                });

                // 再次检查父节点是否仍然存在（防止在异步操作中被移除）
                if ($s.parentNode === $parent && $parent) {
                    $parent.replaceChild($fr, $s);
                }
            } catch (error) {
                // 如果单个元素处理失败，记录错误但继续处理其他元素
                console.warn('移除高亮元素时发生错误:', error, $s);
                
                // 触发内部错误事件，让调用方知道发生了错误
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                    error,
                });
            }
        });
    }
    /* ============================================================== */
}
