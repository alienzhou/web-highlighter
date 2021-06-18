import './index.css';
import './my.css';
import Highlighter from '../src/index';
import LocalStore from './local.store';

const highlighter = new Highlighter({
    wrapTag: 'i',
    exceptSelectors: ['.my-remove-tip', 'pre', 'code']
});
highlighter.setOption({
    style: {
        className: 'yellow-highlight',
    },
});
const store = new LocalStore();
const log = console.log.bind(console, '[highlighter]');

/**
 * create a delete tip
 */
const createTag = (top, left, id) => {
    const $span = document.createElement('span');
    $span.style.left = `${left - 20}px`;
    $span.style.top = `${top - 25}px`;
    $span.dataset['id'] = id;
    $span.textContent = 'delete';
    $span.classList.add('my-remove-tip');
    document.body.appendChild($span);
};

/**
 * toggle auto highlighting & button status
 */
const switchAuto = auto => {
    auto === 'on' ? highlighter.run() : highlighter.stop();
    const $btn = document.getElementById('js-highlight');
    if (auto === 'on') {
        $btn.classList.add('disabled');
        $btn.setAttribute('disabled', true);
    }
    else {
        $btn.classList.remove('disabled');
        $btn.removeAttribute('disabled');
    }
};

const switchColor = color => highlighter.setOption({
    style: {
        className: color === 'yellow'
            ? 'yellow-highlight'
            : 'blue-highlight',
    },
});

function getPosition($node) {
    let offset = {
        top: 0,
        left: 0
    };
    while ($node) {
        offset.top += $node.offsetTop;
        offset.left += $node.offsetLeft;
        $node = $node.offsetParent;
    }

    return offset;
}

/**
 * highlighter event listener
 */
highlighter
    .on(Highlighter.event.CLICK, ({id}) => {
        log('click -', id);
    })
    .on(Highlighter.event.HOVER, ({id}) => {
        log('hover -', id);
        highlighter.addClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.HOVER_OUT, ({id}) => {
        log('hover out -', id);
        highlighter.removeClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.CREATE, ({sources}) => {
        log('create -', sources);
        sources.forEach(s => {
            const position = getPosition(highlighter.getDoms(s.id)[0]);
            createTag(position.top, position.left, s.id);
        });
        sources = sources.map(hs => ({hs}));
        store.save(sources);
    })
    .on(Highlighter.event.REMOVE, ({ids}) => {
        log('remove -', ids);
        ids.forEach(id => store.remove(id));
    });

/**
 * FIXME: avoid re-highlighting the existing selection
 */
// function getIds(selected) {
//     if (!selected || !selected.$node || !selected.$node.parentNode) {
//         return [];
//     }
//     return [
//         highlighter.getIdByDom(selected.$node.parentNode),
//         ...highlighter.getExtraIdByDom(selected.$node.parentNode)
//     ].filter(i => i)
// }
// function getIntersection(arrA, arrB) {
//     const record = {};
//     const intersection = [];
//     arrA.forEach(i => record[i] = true);
//     arrB.forEach(i => record[i] && intersection.push(i) && (record[i] = false));
//     return intersection;
// }
// highlighter.hooks.Render.SelectedNodes.tap((id, selectedNodes) => {
//     selectedNodes = selectedNodes.filter(n => n.$node.textContent);
//     if (selectedNodes.length === 0) {
//         return [];
//     }

//     const candidates = selectedNodes.slice(1).reduce(
//         (left, selected) => getIntersection(left, getIds(selected)),
//         getIds(selectedNodes[0])
//     );
//     for (let i = 0; i < candidates.length; i++) {
//         if (highlighter.getDoms(candidates[i]).length === selectedNodes.length) {
//             return [];
//         }
//     }

//     return selectedNodes;
// });

highlighter.hooks.Serialize.Restore.tap(
    source =>  log('Serialize.Restore hook -', source)
);

highlighter.hooks.Serialize.RecordInfo.tap(() => {
    const extraInfo = Math.random().toFixed(4);
    log('Serialize.RecordInfo hook -', extraInfo)
    return extraInfo;
});

/**
 * retrieve from local store
 */
const storeInfos =  store.getAll();
storeInfos.forEach(
    ({hs}) => highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
);

let autoStatus;
document.querySelectorAll('[name="auto"]').forEach($n => {
    if ($n.checked) {
        autoStatus = $n.value;
    }
});
switchAuto(autoStatus);

let colorStatus = 'yellow';
document.addEventListener('click', e => {
    const $ele = e.target;

    // delete highlight
    if ($ele.classList.contains('my-remove-tip')) {
        const id = $ele.dataset.id;
        log('*click remove-tip*', id);
        highlighter.removeClass('highlight-wrap-hover', id);
        highlighter.remove(id);
        $ele.parentNode.removeChild($ele);
    }
    // toggle auto highlighting switch
    else if ($ele.getAttribute('name') === 'auto') {
        const val = $ele.value;
        if (autoStatus !== val) {
            switchAuto(val);
            autoStatus = val;
        }
    }
    // toggle highlighting color
    else if ($ele.getAttribute('name') === 'color') {
        const val = $ele.value;
        if (colorStatus !== val) {
            switchColor(val);
            colorStatus = val;
        }
    }
    // highlight range manually
    else if ($ele.id === 'js-highlight') {
        const selection = window.getSelection();
        if (selection.isCollapsed) {
            return;
        }
        highlighter.fromRange(selection.getRangeAt(0));
        window.getSelection().removeAllRanges();
    }
});

let hoveredTipId;
document.addEventListener('mouseover', e => {
    const $ele = e.target;
    // toggle highlight hover state
    if ($ele.classList.contains('my-remove-tip') && hoveredTipId !== $ele.dataset.id) {
        hoveredTipId = $ele.dataset.id;
        highlighter.removeClass('highlight-wrap-hover');
        highlighter.addClass('highlight-wrap-hover', hoveredTipId);
    }
    else if (!$ele.classList.contains('my-remove-tip') && !$ele.classList.contains('highlight-mengshou-wrap')) {
        highlighter.removeClass('highlight-wrap-hover', hoveredTipId);
        hoveredTipId = null;
    }
});
