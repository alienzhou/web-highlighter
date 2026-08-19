import './index.css';
import './my.css';
import Highlighter from '../src/index';
import LocalStore from './local.store';

const INK_CLASS = {
    yellow: 'ink-amber',
    blue: 'ink-blue',
    rose: 'ink-rose',
};
const HOVER_CLASS = 'ink-hover';
const ACTIVE_CLASS = 'ink-active';

const $ = id => document.getElementById(id);
const $highlightCount = $('js-highlight-count');
const $storageCount = $('js-storage-count');
const $runtimeState = $('js-runtime-state');
const $selectedLabel = $('js-selected-label');
const $removeSelected = $('js-remove-selected');
const $eventLog = $('js-event-log');
const $wrapTag = $('js-wrap-tag');

const store = new LocalStore();

let ink = 'yellow';
let captureMode = 'on';
let selectedId = null;
let lastRange = null;
let syncStore = true;

const highlighter = new Highlighter({
    wrapTag: 'i',
    // the control desk itself must never become highlightable
    exceptSelectors: ['.desk', 'pre', 'code'],
    style: {
        className: INK_CLASS[ink],
    },
});

/* ---------------------------------------------------------------- logging */

const logEvent = (name, detail) => {
    const $item = document.createElement('li');
    const $time = document.createElement('time');
    const $name = document.createElement('span');

    $time.textContent = new Date().toLocaleTimeString();
    $name.textContent = name;
    $item.append($time, $name);

    if (detail) {
        const $detail = document.createElement('em');
        $detail.textContent = detail;
        $item.append($detail);
    }

    $eventLog.prepend($item);

    while ($eventLog.children.length > 6) {
        $eventLog.lastElementChild.remove();
    }
};

/* ------------------------------------------------------------ page state */

const countHighlights = () => {
    const ids = new Set();
    highlighter.getDoms().forEach($node => {
        const id = highlighter.getIdByDom($node);
        if (id) {
            ids.add(id);
        }
    });

    return ids.size;
};

const savedRecords = () => store.getAll().filter(item => item?.hs?.id);

const renderState = () => {
    $highlightCount.textContent = String(countHighlights());
    $storageCount.textContent = String(savedRecords().length);
    $runtimeState.textContent = captureMode === 'on' ? 'automatic mode' : 'manual mode';
    $removeSelected.disabled = !selectedId;
    $selectedLabel.textContent = selectedId
        ? `selected ${selectedId.slice(0, 8)} — press Delete to remove`
        : 'no highlight selected';
};

const selectHighlight = id => {
    if (selectedId) {
        highlighter.removeClass(ACTIVE_CLASS, selectedId);
    }

    selectedId = id || null;

    if (selectedId) {
        highlighter.addClass(ACTIVE_CLASS, selectedId);
    }

    renderState();
};

/* ------------------------------------------------------------- selection */

const readableRange = () => {
    const selection = window.getSelection();

    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        return selection.getRangeAt(0);
    }

    return lastRange;
};

const isInsideDesk = node => {
    const $element = node?.nodeType === 1 ? node : node?.parentElement;

    return !!$element?.closest('.desk');
};

document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);

    // ignore selections made inside the control desk
    if (isInsideDesk(range.commonAncestorContainer)) {
        return;
    }

    lastRange = range.cloneRange();
});

/* -------------------------------------------------------------- settings */

const setCaptureMode = mode => {
    captureMode = mode;
    mode === 'on' ? highlighter.run() : highlighter.stop();
    renderState();
};

const setInk = color => {
    ink = color;
    highlighter.setOption({
        style: {
            className: INK_CLASS[color],
        },
    });
    renderState();
};

/**
 * `getDoms()` looks up wrappers by the configured `wrapTag`, so highlights
 * created with a previous tag would become unreachable. Re-render every stored
 * highlight with the new tag to keep the demo consistent.
 */
const setWrapTag = tag => {
    const records = savedRecords();

    syncStore = false;
    highlighter.removeAll();
    // removing wrappers leaves fragmented text nodes behind, merge them back
    // so the stored offsets map onto the original document again
    document.body.normalize();
    highlighter.setOption({ wrapTag: tag });
    records.forEach(({ hs }) => restore(hs));
    syncStore = true;

    selectHighlight(null);
    logEvent('wrapper', `<${tag}> · ${records.length} highlight(s) re-rendered`);
};

/* ----------------------------------------------------------------- store */

function restore(hs) {
    try {
        highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra);

        return true;
    }
    catch (error) {
        console.warn('[highlighter] unable to restore a saved highlight', error);
        logEvent('restore failed', hs?.id ? hs.id.slice(0, 8) : 'invalid source');

        return false;
    }
}

/* ---------------------------------------------------------------- events */

highlighter
    .on(Highlighter.event.CLICK, ({ id }) => selectHighlight(id))
    .on(Highlighter.event.HOVER, ({ id }) => highlighter.addClass(HOVER_CLASS, id))
    .on(Highlighter.event.HOVER_OUT, ({ id }) => highlighter.removeClass(HOVER_CLASS, id))
    .on(Highlighter.event.CREATE, ({ sources, type }) => {
        store.save(sources.map(hs => ({ hs })));
        lastRange = null;

        if (type === 'from-input') {
            logEvent('created', `${sources.length} segment(s) · ${ink}`);
        }

        renderState();
    })
    .on(Highlighter.event.REMOVE, ({ ids }) => {
        if (syncStore) {
            ids.forEach(id => store.remove(id));
            logEvent('removed', `${ids.length} highlight(s)`);
        }

        if (ids.includes(selectedId)) {
            selectedId = null;
        }

        renderState();
    });

/* ------------------------------------------------------------ boot state */

const restored = savedRecords().filter(({ hs }) => restore(hs)).length;

setCaptureMode(captureMode);
setInk(ink);
renderState();
logEvent('ready', restored ? `${restored} highlight(s) restored` : 'select any sentence to start');

/* ------------------------------------------------------------ interaction */

const copySnapshot = async (snapshot, label) => {
    const text = JSON.stringify(snapshot, null, 2);

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        }
        else {
            const $temp = document.createElement('textarea');
            $temp.value = text;
            document.body.append($temp);
            $temp.select();
            document.execCommand('copy');
            $temp.remove();
        }
        logEvent('diagnostics', `${label} copied (${text.length} chars)`);
    }
    catch (error) {
        console.warn('[highlighter] unable to copy the snapshot', error);
        logEvent('diagnostics', 'clipboard blocked — snapshot logged to console');
        console.log(text);
    }
};

document.addEventListener('change', event => {
    const $target = event.target;

    if ($target.name === 'auto') {
        setCaptureMode($target.value);
        logEvent('capture', $target.value === 'on' ? 'automatic' : 'manual');
    }
    else if ($target.name === 'color') {
        setInk($target.value);
        logEvent('ink', `${$target.value} for new highlights`);
    }
    else if ($target === $wrapTag) {
        setWrapTag($target.value);
    }
});

document.addEventListener('click', event => {
    const $button = event.target.closest('button');

    if (!$button) {
        // clicking outside a highlight clears the current selection state
        if (!event.target.closest('[data-highlight-id]')) {
            selectHighlight(null);
        }

        return;
    }

    switch ($button.id) {
        case 'js-highlight': {
            const range = readableRange();

            if (!range) {
                logEvent('manual capture', 'select some text first');
                return;
            }

            highlighter.fromRange(range, { selection: 'clear' });
            break;
        }
        case 'js-remove-selected':
            if (selectedId) {
                highlighter.remove(selectedId);
            }
            break;
        case 'js-clear-highlights':
            if (countHighlights()) {
                highlighter.removeAll();
            }
            else {
                logEvent('clear', 'nothing to remove');
            }
            break;
        case 'js-clear-storage':
            store.removeAll();
            logEvent('storage', 'saved data reset — highlights stay until reload');
            renderState();
            break;
        case 'js-copy-diagnostics':
            copySnapshot(highlighter.getDiagnostics(), 'safe snapshot');
            break;
        case 'js-copy-redacted':
            copySnapshot(highlighter.getDiagnostics({ dom: 'redacted' }), 'redacted DOM snapshot');
            break;
        case 'js-clear-events':
            $eventLog.replaceChildren();
            break;
        default:
            break;
    }
});

document.addEventListener('keydown', event => {
    const tag = document.activeElement?.tagName || '';

    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
        return;
    }

    if (selectedId && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        highlighter.remove(selectedId);
    }
    else if (event.key === 'Escape') {
        selectHighlight(null);
    }
});
