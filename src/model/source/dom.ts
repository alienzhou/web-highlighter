import type { DomMeta, DomNode, HighlighterOptions } from '@src/types';
import type HighlightSource from '@src/model/source/index';
import { ROOT_IDX } from '@src/util/const';
import {
    getNodeTextContent,
    findTextInNode,
    normalizeText,
    findAllOccurrences,
    mapRootOffsetToDomNode,
} from '@src/util/text-matcher';

/**
 * Best-effort estimate of where `startMeta` would land in $root's
 * concatenated text content. Used as a tie-breaker when the target
 * text occurs multiple times in $root.
 *
 *  1) prefer `rootTextOffset` (added in the extended DomMeta, available
 *     on all records saved with the new serializer);
 *  2) otherwise estimate from `parentTagName`/`parentIndex` + `textOffset`.
 */
const computeExpectedRootOffset = (startMeta: DomMeta, $root: Document | HTMLElement): number | null => {
    if (typeof startMeta.rootTextOffset === 'number') {
        return startMeta.rootTextOffset;
    }

    try {
        const originalNode =
            startMeta.parentIndex === ROOT_IDX
                ? $root
                : $root.getElementsByTagName(startMeta.parentTagName)[startMeta.parentIndex];

        if (!originalNode || originalNode === $root) {
            return startMeta.textOffset;
        }

        const range = document.createRange();

        range.setStart($root, 0);
        range.setEndBefore(originalNode as Node);

        return range.toString().length + startMeta.textOffset;
    } catch (_error) {
        return null;
    }
};

/**
 * Because of supporting highlighting a same area (range overlapping),
 * Highlighter will calculate which text-node and how much offset it actually be,
 * based on the origin website dom node and the text offset.
 *
 * @param {Node} $parent element node in the origin website dom tree
 * @param {number} offset text offset in the origin website dom tree
 * @param {boolean} robustMode whether to enable robust mode
 * @return {DomNode} DOM a dom info object
 */
export const getTextChildByOffset = ($parent: Node, offset: number, robustMode = false): DomNode => {
    const nodeStack: Node[] = [$parent];

    let $curNode: Node = null;
    let curOffset = 0;
    let startOffset = 0;

    while (($curNode = nodeStack.pop())) {
        const children = $curNode.childNodes;

        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        if ($curNode.nodeType === 3) {
            startOffset = offset - curOffset;
            curOffset += $curNode.textContent.length;

            if (curOffset >= offset) {
                break;
            }
        }
    }

    // Robust mode: if exact node not found, try to find the closest text node
    if (!$curNode && robustMode) {
        const walker = document.createTreeWalker($parent, NodeFilter.SHOW_TEXT);

        let lastTextNode: Node = null;
        let textNode: Node;

        // Find the last text node as fallback
        while ((textNode = walker.nextNode())) {
            lastTextNode = textNode;
        }

        if (lastTextNode) {
            $curNode = lastTextNode;
            startOffset = Math.min(startOffset, lastTextNode.textContent?.length || 0);
        }
    }

    if (!$curNode) {
        $curNode = $parent;
        startOffset = 0;
    }

    // Robust mode: ensure startOffset doesn't exceed node text length
    if (robustMode && $curNode.nodeType === 3) {
        const textLength = $curNode.textContent?.length || 0;

        startOffset = Math.max(0, Math.min(startOffset, textLength));
    }

    return {
        $node: $curNode,
        offset: startOffset,
    };
};

/**
 * Get sibling level nodes around the original index
 */
const getSiblingLevelNodes = (
    $root: Document | HTMLElement,
    tagName: string,
    originalIndex: number,
    levels: number,
): Node[] => {
    const allNodes = $root.getElementsByTagName(tagName);
    const nodes: Node[] = [];
    const addedIndices = new Set<number>(); // Prevent duplicate node additions

    // 1. Expand level nodes (search upward and downward)
    for (let level = 1; level <= levels; level++) {
        // Search upward
        const upperIndex = originalIndex - level;
        if (upperIndex >= 0 && upperIndex < allNodes.length && !addedIndices.has(upperIndex)) {
            nodes.push(allNodes[upperIndex]);
            addedIndices.add(upperIndex);
        }

        // Search downward
        const lowerIndex = originalIndex + level;
        if (lowerIndex >= 0 && lowerIndex < allNodes.length && !addedIndices.has(lowerIndex)) {
            nodes.push(allNodes[lowerIndex]);
            addedIndices.add(lowerIndex);
        }
    }

    // 2. Add adjacent node search (consecutive neighboring nodes)
    for (let i = 1; i <= levels; i++) {
        // Previous adjacent nodes
        const prevIndex = originalIndex - i;
        if (prevIndex >= 0 && prevIndex < allNodes.length && !addedIndices.has(prevIndex)) {
            nodes.push(allNodes[prevIndex]);
            addedIndices.add(prevIndex);
        }

        // Next adjacent nodes
        const nextIndex = originalIndex + i;
        if (nextIndex >= 0 && nextIndex < allNodes.length && !addedIndices.has(nextIndex)) {
            nodes.push(allNodes[nextIndex]);
            addedIndices.add(nextIndex);
        }
    }

    return nodes;
};

/**
 * Search for target text within specified text range
 */
const searchTextInRange = (
    text: string,
    targetText: string,
    startOffset: number,
    searchRange: number,
): { found: boolean; start: number; end: number } => {
    const normalizedText = normalizeText(text);
    const normalizedTarget = normalizeText(targetText);

    // Calculate search range
    const searchStart = Math.max(0, startOffset - searchRange);
    const searchEnd = Math.min(text.length, startOffset + targetText.length + searchRange);

    // Search for target text within range
    const searchText = normalizedText.slice(searchStart, searchEnd);
    const foundIndex = searchText.indexOf(normalizedTarget);

    if (foundIndex !== -1) {
        const actualStart = searchStart + foundIndex;
        const actualEnd = actualStart + normalizedTarget.length;

        return {
            found: true,
            start: actualStart,
            end: actualEnd,
        };
    }

    return { found: false, start: -1, end: -1 };
};

/**
 * Unified robust search function - search directly from HighlightSource to final DOM nodes
 */
const robustSearch = (
    hs: HighlightSource,
    $root: Document | HTMLElement,
    robustOptions?: HighlighterOptions['robustRestore'],
): { startInfo: DomNode; endInfo: DomNode } | null => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { startMeta, endMeta, text: targetText, id } = hs;
    const searchRange = robustOptions?.searchThreshold || 50;
    const maxLevels = robustOptions?.maxLevels || 3;

    // Helper function: try to match text in specified node
    const tryMatchInNode = (node: Node, offset: number): { startInfo: DomNode; endInfo: DomNode } | null => {
        const nodeText = getNodeTextContent(node);
        let targetOffset: number | null = null;

        // 1. Try exact match at original offset
        const originalText = nodeText.slice(offset, offset + targetText.length);

        if (normalizeText(originalText) === normalizeText(targetText)) {
            targetOffset = offset;
        } else if (robustOptions?.enabled) {
            // 2. Range search
            const searchResult = searchTextInRange(nodeText, targetText, offset, searchRange);

            if (searchResult.found) {
                targetOffset = searchResult.start;
            }
        }

        // 3. DOM positioning
        if (targetOffset !== null) {
            const textRange = findTextInNode(node, targetText, targetOffset);

            if (textRange) {
                return {
                    startInfo: {
                        $node: textRange.startNode,
                        offset: textRange.startOffset,
                    },
                    endInfo: {
                        $node: textRange.endNode,
                        offset: textRange.endOffset,
                    },
                };
            }
        }

        return null;
    };

    // Step 1: Try original node
    try {
        const originalNode =
            startMeta.parentIndex === ROOT_IDX
                ? $root
                : $root.getElementsByTagName(startMeta.parentTagName)[startMeta.parentIndex];

        if (originalNode) {
            const result = tryMatchInNode(originalNode, startMeta.textOffset);

            if (result) {
                return result;
            }
        }
    } catch (error: unknown) {
        // Silent error handling
    }

    // Step 2: Search sibling level nodes
    if (robustOptions?.enabled) {
        const siblingNodes = getSiblingLevelNodes($root, startMeta.parentTagName, startMeta.parentIndex, maxLevels);

        for (const siblingNode of siblingNodes) {
            const result = tryMatchInNode(siblingNode, startMeta.textOffset);

            if (result) {
                return result;
            }
        }
    }

    return null;
};

/**
 * Root-level text search fallback.
 *
 * Locates the target text by searching the full concatenated text
 * content of `$root`. This is very robust against structural DOM
 * changes (stage-specific conditional rendering, inserted wrapper
 * elements, etc.) as long as the underlying visible text is unchanged.
 *
 * Resolution strategy:
 *  - If the stored `text` occurs exactly once in $root -> use it.
 *  - If it occurs multiple times, pick the occurrence closest to an
 *    expected position:
 *      1) `rootTextOffset` on the meta (preferred, added after v1.0.3);
 *      2) an estimate derived from the original parent element
 *         (`parentTagName`/`parentIndex`) plus `textOffset`, which is
 *         what's stored on older records and is still useful as a hint.
 *  - If no occurrence is found and `robustOptions.enabled`, fall back
 *    to normalized (trim/lowercase/whitespace-collapse) matching.
 */
const rootTextSearch = (
    hs: HighlightSource,
    $root: Document | HTMLElement,
    robustOptions?: HighlighterOptions['robustRestore'],
): { startInfo: DomNode; endInfo: DomNode } | null => {
    const { startMeta, endMeta, text: targetText } = hs;

    if (!targetText) {
        return null;
    }

    const rootText = getNodeTextContent($root);

    if (!rootText) {
        return null;
    }

    // Step 1: exact (raw) indexOf
    let positions = findAllOccurrences(rootText, targetText);

    let normalizedMode = false;
    let matchedText = targetText;

    if (positions.length === 0 && robustOptions?.enabled) {
        // Step 2: normalized matching. Because normalize changes lengths
        // (lowercasing + collapsing whitespace), we can only trust
        // normalized results when the match is unique - otherwise mapping
        // normalized indices back to raw indices is lossy.
        const normalizedRoot = normalizeText(rootText);
        const normalizedTarget = normalizeText(targetText);

        positions = findAllOccurrences(normalizedRoot, normalizedTarget);

        if (positions.length === 0) {
            return null;
        }

        normalizedMode = true;
        matchedText = normalizedTarget;
    }

    if (positions.length === 0) {
        return null;
    }

    let targetPosition: number;

    if (positions.length === 1) {
        targetPosition = positions[0];
    } else {
        // Multiple candidates -> pick the closest one to an expected position.
        const expectedPosition = computeExpectedRootOffset(startMeta, $root);

        if (expectedPosition !== null) {
            let best = positions[0];
            let bestDist = Math.abs(best - expectedPosition);

            for (let i = 1; i < positions.length; i++) {
                const dist = Math.abs(positions[i] - expectedPosition);

                if (dist < bestDist) {
                    bestDist = dist;
                    best = positions[i];
                }
            }
            targetPosition = best;
        } else {
            // Last resort: first occurrence.
            targetPosition = positions[0];
        }
    }

    // When matched against normalized text we can only reliably restore
    // a highlight if the match is unique - otherwise the normalized
    // position cannot be mapped back to a raw character position without
    // rebuilding a normalize-aware offset map. We intentionally bail
    // here for the ambiguous normalized case to avoid showing a wrong
    // highlight.
    if (normalizedMode && positions.length !== 1) {
        return null;
    }

    let startRootOffset: number;
    let endRootOffset: number;

    if (!normalizedMode) {
        startRootOffset = targetPosition;
        endRootOffset = targetPosition + targetText.length;
    } else {
        // Map normalized position back to a raw position by scanning.
        const rawStart = mapNormalizedIndexToRaw(rootText, targetPosition);
        const rawEnd = mapNormalizedIndexToRaw(rootText, targetPosition + matchedText.length);

        if (rawStart === null || rawEnd === null) {
            return null;
        }

        startRootOffset = rawStart;
        endRootOffset = rawEnd;
    }

    const startInfo = mapRootOffsetToDomNode($root, startRootOffset);
    const endInfo = mapRootOffsetToDomNode($root, endRootOffset);

    if (!startInfo || !endInfo) {
        return null;
    }

    // Sanity check: the resolved DOM range must reproduce the stored text
    // (or its normalized form). Otherwise we could hand back a broken
    // range that the painter happily wraps across unrelated nodes, which
    // is exactly the bug the old parent-index path suffered from.
    if (!verifyRange($root, startInfo, endInfo, targetText, normalizedMode)) {
        return null;
    }

    // Suppress unused warning - endMeta is intentionally not needed here
    // because the text-search branch always re-derives endInfo from the
    // start position + text length.
    void endMeta;

    return { startInfo, endInfo };
};

/**
 * Try to restore a highlight purely from `rootTextOffset` anchors on
 * both the start and end metas. This is the fastest and most precise
 * path and is used only when the saved record contains the new field
 * (i.e. was serialized with the updated serializer).
 */
const directAnchorRestore = (
    hs: HighlightSource,
    $root: Document | HTMLElement,
): { startInfo: DomNode; endInfo: DomNode } | null => {
    const { startMeta, endMeta, text: targetText } = hs;

    if (typeof startMeta?.rootTextOffset !== 'number' || typeof endMeta?.rootTextOffset !== 'number') {
        return null;
    }

    if (endMeta.rootTextOffset < startMeta.rootTextOffset) {
        return null;
    }

    // If we know the text length, an anchor length mismatch signals the
    // DOM text around the anchors has shifted - bail so we fall through
    // to text-based search.
    if (targetText && endMeta.rootTextOffset - startMeta.rootTextOffset !== targetText.length) {
        return null;
    }

    const startInfo = mapRootOffsetToDomNode($root, startMeta.rootTextOffset);
    const endInfo = mapRootOffsetToDomNode($root, endMeta.rootTextOffset);

    if (!startInfo || !endInfo) {
        return null;
    }

    if (!verifyRange($root, startInfo, endInfo, targetText, false)) {
        return null;
    }

    return { startInfo, endInfo };
};

/**
 * Sanity check: materialize a DOM Range from the resolved start/end
 * and make sure its text equals the stored target (raw or normalized).
 */
const verifyRange = (
    $root: Document | HTMLElement,
    startInfo: DomNode,
    endInfo: DomNode,
    targetText: string,
    allowNormalized: boolean,
): boolean => {
    // targetText can legitimately be empty for a zero-length meta - in
    // that case we skip the text check.
    if (!targetText) {
        return true;
    }

    try {
        const range = document.createRange();

        range.setStart(startInfo.$node, startInfo.offset);
        range.setEnd(endInfo.$node, endInfo.offset);

        const resolved = range.toString();

        if (resolved === targetText) {
            return true;
        }

        if (allowNormalized && normalizeText(resolved) === normalizeText(targetText)) {
            return true;
        }

        return false;
    } catch (_e) {
        return false;
    }
};

/**
 * Map an index in the normalized version of `raw` back to an index in `raw`.
 * Uses the same normalization rules as `normalizeText`:
 *   - leading whitespace trimmed
 *   - trailing whitespace trimmed
 *   - runs of whitespace collapsed to one space
 *   - lowercased (case-only change does not move indices).
 */
const mapNormalizedIndexToRaw = (raw: string, normalizedIndex: number): number | null => {
    if (normalizedIndex < 0) {
        return null;
    }

    // Skip leading whitespace (trim).
    let i = 0;

    while (i < raw.length && /\s/.test(raw[i])) {
        i++;
    }

    if (normalizedIndex === 0) {
        return i;
    }

    let normalized = 0;
    let inWhitespace = false;

    for (; i < raw.length; i++) {
        const ch = raw[i];
        const isSpace = /\s/.test(ch);

        if (isSpace) {
            if (!inWhitespace) {
                // This position produces a single space in normalized form.
                normalized++;
                inWhitespace = true;
                if (normalized === normalizedIndex) {
                    // Return the raw index right AFTER this whitespace run.
                    while (i < raw.length && /\s/.test(raw[i])) {
                        i++;
                    }
                    return i;
                }
            }
        } else {
            inWhitespace = false;
            normalized++;
            if (normalized === normalizedIndex) {
                return i + 1;
            }
        }
    }

    return normalized === normalizedIndex ? i : null;
};

/**
 * get start and end parent element from meta info
 *
 * Restore strategy (first successful wins):
 *  1) Direct anchors - when both start and end have `rootTextOffset`
 *     and the resolved range text matches exactly. Preferred because
 *     it is immune to structural DOM changes as long as the text is
 *     unchanged.
 *  2) Root-level text search (new). Finds the target text anywhere
 *     under `$root` and, when there are multiple matches, picks the
 *     closest one to the expected root offset. This fixes cases
 *     where structural DOM changes (e.g. stage/mode switches) move
 *     or insert wrapper elements but leave the text content
 *     unchanged - including records saved BEFORE `rootTextOffset`
 *     existed.
 *  3) Legacy `parentIndex`-based `robustSearch` (the previous
 *     implementation). Kept as a last-chance fallback for edge cases
 *     where the stored text isn't found verbatim in $root but the
 *     node-local search (with normalization and ±N-char tolerance)
 *     still recovers the range.
 *  4) Traditional fallback (keep compatibility with existing callers).
 *
 * @param {HighlightSource} hs
 * @param {HTMLElement | Document} $root root element, default document
 * @param {HighlighterOptions['robustRestore']} robustOptions robust restore options
 * @return {Object}
 */
export const queryElementNode = (
    hs: HighlightSource,
    $root: Document | HTMLElement,
    robustOptions?: HighlighterOptions['robustRestore'],
): { start: Node; end: Node; startInfo?: DomNode; endInfo?: DomNode } => {
    const anchorResult = directAnchorRestore(hs, $root);

    if (anchorResult) {
        return {
            start: $root,
            end: $root,
            startInfo: anchorResult.startInfo,
            endInfo: anchorResult.endInfo,
        };
    }

    const rootResult = rootTextSearch(hs, $root, robustOptions);

    if (rootResult) {
        return {
            start: $root,
            end: $root,
            startInfo: rootResult.startInfo,
            endInfo: rootResult.endInfo,
        };
    }

    const searchResult = robustSearch(hs, $root, robustOptions);

    if (searchResult) {
        return {
            start: $root,
            end: $root,
            startInfo: searchResult.startInfo,
            endInfo: searchResult.endInfo,
        };
    }

    // Fallback: use traditional method
    const startIndex = hs.startMeta.parentIndex;
    const endIndex = hs.endMeta.parentIndex;

    const start = startIndex === ROOT_IDX ? $root : $root.getElementsByTagName(hs.startMeta.parentTagName)[startIndex];
    const end = endIndex === ROOT_IDX ? $root : $root.getElementsByTagName(hs.endMeta.parentTagName)[endIndex];

    return { start: start || $root, end: end || $root };
};
