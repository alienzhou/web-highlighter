/**
 * Text matching utilities for robust highlight restoration
 */

/**
 * Normalize text: remove extra whitespace and convert to lowercase
 */
export const normalizeText = (text: string): string => {
    if (!text) {
        return '';
    }

    const result = text.trim().toLowerCase();

    return result.replace(/\s+/g, ' ');
};

/**
 * Get all text content from a DOM node
 */
export const getNodeTextContent = (node: Node): string => {
    if (node.nodeType === 3) {
        // Text node
        return node.textContent || '';
    }

    let text = '';
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

    let textNode: Node;

    while ((textNode = walker.nextNode())) {
        text += textNode.textContent || '';
    }

    return text;
};

/**
 * Find all occurrences of `target` inside `source` (case-sensitive, raw).
 * Returned positions are indices into `source` (the raw, un-normalized text).
 */
export const findAllOccurrences = (source: string, target: string): number[] => {
    if (!source || !target) {
        return [];
    }

    const result: number[] = [];
    let searchFrom = 0;

    while (true) {
        const idx = source.indexOf(target, searchFrom);

        if (idx === -1) {
            break;
        }

        result.push(idx);
        searchFrom = idx + 1;
    }

    return result;
};

/**
 * Walk text nodes under `$root` and locate the text node that covers
 * the given root-relative char offset. Returns the DOM text node plus
 * an in-node offset, or null if the offset is out of range.
 *
 * Note: we walk ALL text nodes (including any inside except-selector
 * elements). This is consistent with how `rootTextOffset` is computed
 * at save time (via `getTextPreOffset`), so positions round-trip.
 */
export const mapRootOffsetToDomNode = (
    $root: Node,
    rootOffset: number,
): { $node: Node; offset: number } | null => {
    if (rootOffset < 0) {
        return null;
    }

    const walker = document.createTreeWalker($root, NodeFilter.SHOW_TEXT);

    let accumulated = 0;
    let lastTextNode: Node = null;
    let textNode: Node;

    while ((textNode = walker.nextNode())) {
        lastTextNode = textNode;

        const nodeLen = textNode.textContent?.length || 0;

        if (accumulated + nodeLen >= rootOffset) {
            return {
                $node: textNode,
                offset: Math.max(0, Math.min(nodeLen, rootOffset - accumulated)),
            };
        }

        accumulated += nodeLen;
    }

    if (lastTextNode) {
        return {
            $node: lastTextNode,
            offset: lastTextNode.textContent?.length || 0,
        };
    }

    return null;
};

/**
 * Find DOM node range containing specified text with precise offset support
 */
export const findTextInNode = (
    node: Node,
    targetText: string,
    startOffset = 0,
): { startNode: Node; startOffset: number; endNode: Node; endOffset: number } | null => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

    let currentOffset = 0;
    let startNode: Node = null;
    let endNode: Node = null;
    let startNodeOffset = 0;
    let endNodeOffset = 0;
    let found = false;

    const targetStart = startOffset;
    const targetEnd = startOffset + targetText.length;

    let textNode: Node;

    while ((textNode = walker.nextNode())) {
        const nodeText = textNode.textContent || '';
        const nodeLength = nodeText.length;

        // Check if target text starts in current node
        if (!found && currentOffset + nodeLength > targetStart) {
            startNode = textNode;
            startNodeOffset = Math.max(0, targetStart - currentOffset);
            found = true;
        }

        // Check if target text ends in current node
        if (found && currentOffset + nodeLength >= targetEnd) {
            endNode = textNode;
            endNodeOffset = Math.min(nodeLength, targetEnd - currentOffset);
            break;
        }

        currentOffset += nodeLength;
    }

    if (startNode && endNode) {
        return {
            startNode,
            startOffset: startNodeOffset,
            endNode,
            endOffset: endNodeOffset,
        };
    }

    return null;
};
