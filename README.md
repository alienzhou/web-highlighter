<div>
    <h1 align="center"><code>Web Highlighter</code>&nbsp;&nbsp;🖍️</h1>
    <p align="center">
        <strong>✨ A dependency-free library for highlighting and persisting text on any website ✨🖍️</strong>
    </p>
    <img src="https://raw.githubusercontent.com/alienzhou/web-highlighter/master/docs/img/logo.png">
    <p align="center">
        <a href="https://github.com/alienzhou/web-highlighter/actions/workflows/ci.yml" target="_blank">
            <img src="https://github.com/alienzhou/web-highlighter/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI status" />
        </a>
        <a href="https://www.npmjs.com/package/web-highlighter" target="_blank">
            <img src="https://img.shields.io/npm/v/web-highlighter.svg" alt="NPM version" />
        </a>
        <a href="https://unpkg.com/web-highlighter" target="_blank">
            <img src="https://img.badgesize.io/https://unpkg.com/web-highlighter/dist/web-highlighter.min.js?compression=gzip" alt="Gzip size" />
        </a>
        <a href="https://codebeat.co/projects/github-com-alienzhou-web-highlighter-master" target="_blank">
            <img src="https://codebeat.co/badges/f5a18a9b-9765-420e-a17f-fa0b54b3a125" alt="Codebeat" />
        </a>
        <a href="https://opensource.org/licenses/mit-license.php" target="_blank">
            <img src="https://img.shields.io/github/license/alienzhou/web-highlighter" alt="MIT Licence" />
        </a>
    </p>
</div>

---

English | [简体中文](https://github.com/alienzhou/web-highlighter/blob/master/README.zh_CN.md)

## Background

The project began with a simple idea: highlight text on a website and save those highlights, much like you would in a PDF.

If you have visited [medium.com](http://medium.com), you may be familiar with its highlighting feature: users select a text segment and click **Highlight**. The selected text receives a highlighted background, and the highlight is saved and restored on later visits. The following GIF shows a simple demo.

![](https://raw.githubusercontent.com/alienzhou/web-highlighter/master/docs/img/sample.gif)

This feature is useful for readers. Developers may want to add it to their websites, while users may want a browser extension that provides it.

web-highlighter helps you implement text highlighting and persistence on websites such as blogs, document viewers, and online books. It provides the core functionality and easy-to-use APIs for building your own product, and it is used in production.

## Development

This project uses Node.js `22.15.1` and publishes ES5 output with IE11 support. With [nvm](https://github.com/nvm-sh/nvm) installed, run:

```bash
nvm use
npm ci
npm test
```

## Install

```bash
npm i web-highlighter
```

## Usage

Add these two lines to automatically highlight selected text.

```javascript
import Highlighter from 'web-highlighter';
new Highlighter().run();
```

To persist highlights, add the following setup:

```javascript
import Highlighter from 'web-highlighter';

// 1. Initialize the highlighter.
const highlighter = new Highlighter();

// 2. Retrieve persisted data from the backend, then restore highlights.
getRemoteData().then(source => highlighter.fromStore(
    source.startMeta,
    source.endMeta,
    source.text,
    source.id,
));

// 3. Save newly created highlights to the backend.
highlighter.on(Highlighter.event.CREATE, ({ sources }) => save(sources));

// 4. Enable automatic highlighting.
highlighter.run();
```

## Example

A more complete integration:

```javascript
import Highlighter from 'web-highlighter';

// Do not highlight text within <pre> or <code> elements.
const highlighter = new Highlighter({
    exceptSelectors: ['pre', 'code'],
});

// Handle highlight interactions.
highlighter
    .on(Highlighter.event.HOVER, ({ id }) => {
        highlighter.addClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.HOVER_OUT, ({ id }) => {
        highlighter.removeClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.CREATE, ({ sources }) => {
        store.save(sources.map(hs => ({ hs })));
    });

// Restore persisted highlights.
store.getAll().forEach(({ hs }) => {
    highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id);
});

highlighter.run();
```

This repository also includes an interactive example in the `example` directory:

```bash
npm ci
npm start
```

Then visit <http://127.0.0.1:8085/>.

---

An example of a production product built with web-highlighter (the highlights appear on the left):

![product sample](https://user-images.githubusercontent.com/9822789/64678049-632e8500-d4ab-11e9-99d6-f960bc90d17b.gif)

## How it works

web-highlighter reads the current selection through the [`Selection API`](https://caniuse.com/#search=selection%20api) and converts it into a serializable `HighlightSource`. You can persist this data in a backend and restore the highlight when the user returns to the page. The data format is independent of the technology stack, so it works with pages built using React, Vue, Angular, jQuery, and other libraries.

### Persistence constraints

Persisted highlights record DOM paths and text offsets relative to `$root`; they are not screen coordinates. Restore highlights only after content is fully rendered, using a compatible `$root`, document structure, text segmentation, and `wrapTag` configuration. If a framework re-renders the content or the document changes, persisted positions may no longer be valid. Use the [`Serialize.Restore` hook](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md#serializerestore) to implement a restoration strategy for changing content.

### Cross-paragraph persistence and DOM restoration

A cross-paragraph selection creates a single continuous `HighlightSource`. If your application requires one persisted record per paragraph, split the selection into a separate `Range` for each paragraph before creating highlights. Call `fromRange()` for each range and persist each returned `HighlightSource` separately. Use the [`Serialize.RecordInfo` hook](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md#serializerecordinfo) to store paragraph-specific identifiers in `source.extra`.

```javascript
highlighter.hooks.Serialize.RecordInfo.tap((start, end) => ({
    startParagraphId: start.$node.parentElement.closest('p').dataset.id,
    endParagraphId: end.$node.parentElement.closest('p').dataset.id,
}));

const sources = paragraphRanges.map(range => highlighter.fromRange(range));
```

`remove(id)` and `removeAll()` remove the highlight wrappers and restore the original element hierarchy and attributes, including for cross-paragraph highlights. Browser text splitting and merging means the original TextNode object identities and event listeners attached directly to TextNodes are not preserved; delegate events from a stable parent element instead.

### Dynamic content and tables

Dynamic DOM is supported after it becomes stable. For asynchronously loaded or frequently re-rendered content, initialize and restore highlights after rendering completes. The library does not support one continuous highlight across table cells, because a wrapper cannot safely span multiple `td` or `th` elements. Use the [`Render.SelectedNodes` hook](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md#renderselectednodes) to split those selections into supported fragments.

For more details, please read [this article (in Chinese)](https://www.alienzhou.com/2019/04/21/web-note-highlight-in-js/).

## APIs

### 1. Options

```javascript
const highlighter = new Highlighter([opts]);
```

Creates a new `Highlighter` instance. `opts` is merged with the default options shown below.

```javascript
const highlighter = new Highlighter({
    $root: document,
    exceptSelectors: null,
    wrapTag: 'span',
    style: {
        className: 'highlight-mengshou-wrap',
    },
});
```

All options:

| name | type | description | required | default |
|---|---|---|---|---|
| $root | `Document | HTMLElement` | root container in which highlighting is enabled | No | `document` |
| exceptSelectors | `Array<string> | null` | selectors for elements whose text must not be highlighted | No | `null` |
| wrapTag | `string` | HTML tag used to wrap highlighted text | No | `span` |
| verbose | `boolean` | logs library warnings and errors to the console | No | `false` |
| style | `Object` | controls the style of highlight wrappers | No | see below |

`style` options:

| name | type | description | required | default |
|---|---|---|---|---|
| className | `string | string[]` | CSS class name(s) applied to highlight wrappers | No | `highlight-mengshou-wrap` |

`exceptSelectors` accepts `null` or an array of ID, class, or tag selectors. For example, to skip `h1` and `.title` elements:

```javascript
const highlighter = new Highlighter({
    exceptSelectors: ['h1', '.title'],
});
```

### 2. Static Methods

#### `Highlighter.isHighlightSource(source)`

Returns `true` when `source` is a valid `HighlightSource`; otherwise returns `false`.

#### `Highlighter.isHighlightWrapNode($node)`

Returns `true` when `$node` is a highlight wrapper element; otherwise returns `false`.

### 3. Instance Methods

#### `highlighter.run()`

Enables automatic highlighting. When a user selects text, the library creates a highlight automatically.

#### `highlighter.stop()`

Disables automatic highlighting without removing existing highlights.

#### `highlighter.dispose()`

Stops the highlighter, removes its event listeners, and clears internal resources. Call this when the instance is no longer needed.

#### `highlighter.fromRange(range, [options])`

Creates a highlight from a [`Range`](https://developer.mozilla.org/en-US/docs/Web/API/Range). Obtain one from `window.getSelection().getRangeAt(0)` or create one with `document.createRange()`.

```javascript
const selection = window.getSelection();
if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
    highlighter.fromRange(selection.getRangeAt(0));
}
```

Highlighting splits and replaces text nodes. A native selection is live, so the browser recomputes its boundaries while that happens and may truncate it when the selection spans several text nodes. `options.selection` controls what happens to the native selection:

| value | behavior |
|---|---|
| `keep` | Default. Leaves the native selection to the caller. |
| `clear` | Clears the native selection before the DOM is modified. |
| `restore` | Selects the created wrappers after highlighting. |

```javascript
// Keep the selected text selected after creating its highlight.
highlighter.fromRange(selection.getRangeAt(0), { selection: 'restore' });
```

`highlighter.run()` always clears the native selection before modifying the DOM.

#### `highlighter.fromStore(start, end, text, id, [extra])`

Restores a highlight from persisted `HighlightSource` data. Pass the corresponding `startMeta`, `endMeta`, `text`, `id`, and optional `extra` fields from a previously saved source.

#### `highlighter.remove(id)`

Removes the highlight with the given ID. IDs are generated by web-highlighter by default; use the [`Render.UUID` hook](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md#renderuuid) to provide your own IDs.

#### `highlighter.removeAll()`

Removes every highlight under the configured root.

#### `highlighter.addClass(className, [id])`

Adds a CSS class to the wrappers for a highlight. Omit `id` to apply the class to every highlight.

#### `highlighter.removeClass(className, [id])`

Removes a CSS class from highlight wrappers. Omit `id` to remove it from every highlight.

#### `highlighter.getDoms([id])`

Returns the wrapper elements for a highlight, which may consist of several segments. Omit `id` to return wrapper elements for every highlight under the root.

#### `highlighter.getSourceByDom(node)`

Returns the `HighlightSource` for one wrapper element. It accepts the wrapper itself or one of its descendants, and returns `null` outside a highlight. Unlike the source emitted by the `CREATE` event, this source describes only the individual wrapped segment, so `startMeta` and `endMeta` can be persisted separately for a cross-node or cross-paragraph selection.

#### `highlighter.getIdByDom(node)`

Returns the highlight ID for a DOM node. For a non-wrapper element, it looks up the nearest ancestor wrapper. Returns an empty string if none exists.

#### `highlighter.getExtraIdByDom(node)`

Returns the extra IDs associated with a DOM node's highlight. For a non-wrapper element, it looks up the nearest ancestor wrapper. Returns an empty array if none exists.

#### `highlighter.setOption(opt)`

Updates the highlighter configuration. `opt` has the same shape as the constructor options and may contain only the fields you want to change.

#### `highlighter.getDiagnostics([options])`

Returns a diagnostic snapshot for bug reports. See [Diagnostics for bug reports](#diagnostics-for-bug-reports) for the available evidence levels and privacy considerations.

### 4. Event Listener

Use `.on()` to subscribe to highlighter events:

```javascript
const highlighter = new Highlighter();
highlighter.on(Highlighter.event.CREATE, (data, instance) => {
    // ...
});
```

Every callback receives `data` and the current `Highlighter` instance. `CLICK`, `HOVER`, and `HOVER_OUT` callbacks also receive the native browser event as a third argument.

`Highlighter.event` includes:

- `EventType.CLICK`: a highlight is clicked.
- `EventType.HOVER`: the pointer enters a highlight.
- `EventType.HOVER_OUT`: the pointer leaves a highlight.
- `EventType.CREATE`: a highlight is created.
- `EventType.REMOVE`: a highlight is removed.

Event data:

#### `EventType.CLICK`

| name | description | type |
|---|---|---|
| `id` | Highlight ID | `string` |

#### `EventType.HOVER`

| name | description | type |
|---|---|---|
| `id` | Highlight ID | `string` |

#### `EventType.HOVER_OUT`

| name | description | type |
|---|---|---|
| `id` | Highlight ID | `string` |

#### `EventType.CREATE`

| name | description | type |
|---|---|---|
| `sources` | Created `HighlightSource` objects | `HighlightSource[]` |
| `type` | Creation origin: `from-input` or `from-store` | `string` |

The callback receives `(data, instance)`; it does not receive a browser event. Destructure `data` as `({ sources, type })`. Each item in `sources` is a `HighlightSource`, so pass an item—not the enclosing event data object—to `Highlighter.isHighlightSource()`.

`HighlightSource` is a JSON-serializable representation of a highlight location. Store it in your backend to restore the highlight later.

#### `EventType.REMOVE`

| name | description | type |
|---|---|---|
| `ids` | Removed highlight IDs | `string[]` |

### 5. Hooks

Hooks let you customize the highlighting lifecycle. See the [advanced guide](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md) for available hooks and examples.

### Diagnostics for bug reports

`getDiagnostics()` supports three evidence levels. Start with the default safe snapshot:

```javascript
copy(JSON.stringify(highlighter.getDiagnostics(), null, 2));
```

It includes browser/runtime capabilities, library lifecycle state, current selection shape, configuration, recent library errors, and persisted-position metadata. It intentionally **does not include page HTML or selected text**.

For a structure mismatch or cross-device restore issue, export a text-free DOM structure where every text node is replaced by its length:

```javascript
copy(JSON.stringify(highlighter.getDiagnostics({ dom: 'redacted' }), null, 2));
```

For a trusted/private reproduction only, you can explicitly opt in to the root HTML and original persisted sources. Review and redact this output before sharing; the DOM output is capped at 20,000 characters by default and can be adjusted with `maxDomLength`.

```javascript
copy(JSON.stringify(highlighter.getDiagnostics({
    dom: 'full',
    sources: 'full',
    maxDomLength: 50000,
}), null, 2));
```

Include the suitable snapshot with a minimal HTML/JavaScript reproduction and exact interaction steps. For `fromStore()` failures, include the original source and the relevant DOM before and after content changes.


## Compatibility

> It depends on [Selection API](https://caniuse.com/#search=selection%20api).

- IE 11
- Edge
- Firefox 52+
- Chrome 15+
- Safari 5.1+
- Opera 15+

_**Mobile support:**_ Mobile devices are detected automatically and use touch events instead of mouse events.

### Runtime environment

web-highlighter requires browser DOM APIs, including `document`, `Range`, and `Selection`. It supports browsers and WebViews that provide these APIs. Native mini-program renderers and non-DOM native application views are not supported.

## Advanced usage

For more ways to customize highlighting behavior, read the [advanced guide](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md).

## License

[MIT](./LICENSE)
