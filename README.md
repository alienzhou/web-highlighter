![Web Highlighter](https://raw.githubusercontent.com/alienzhou/web-highlighter/master/docs/img/logo.png)

✨A no-runtime dependency lib for highlighting-note & persistence on any website ✨🖍️

[![NPM version](https://img.shields.io/npm/v/web-highlighter.svg)](https://www.npmjs.com/package/web-highlighter)  [![version](https://img.shields.io/badge/version-0.3.3-blue.svg?cacheSeconds=2592000)](https://github.com/alienzhou/web-highlighter)  [![](https://api.travis-ci.org/alienzhou/web-highlighter.svg?branch=master)](https://travis-ci.org/alienzhou/web-highlighter) [![gizp size](https://img.badgesize.io/https://unpkg.com/web-highlighter/dist/web-highlighter.min.js?compression=gzip)](https://unpkg.com/web-highlighter)  [![codebeat badge](https://codebeat.co/badges/f5a18a9b-9765-420e-a17f-fa0b54b3a125)](https://codebeat.co/projects/github-com-alienzhou-web-highlighter-master) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

English | [简体中文](https://github.com/alienzhou/web-highlighter/blob/master/README.zh_CN.md)

## Background

It's from an idea: highlight texts on the website and save the highlighted areas just like what you do in PDFs.

If you have ever visited [medium.com](http://medium.com), you must know the feature of higlighting notes: users select a text segment and click the 'highlight' button. Then the text will be highlighted with a shining background color. Besides, the highlighted areas will be saved and recovered when you visit it next time. It's like the simple demo bellow.

![](https://raw.githubusercontent.com/alienzhou/web-highlighter/master/docs/img/sample.gif)

This is a usefull feature for readers. If you're a developer, you may want your website support it and attract more visitings. If you're a user (like me), you may want a browser-plugin to do this.

For this reason, the repo (web-highlighter) aims to help you implement highlighting-note on any website quickly (e.g. blogs, document viewers, online books and so on). It contains the core abilities for note highlighting and persistence. And you can implement your own product by some easy-to-use APIs. It has been used for our sites in production.

## Install

```bash
npm i web-highlighter
```

## Usage

Only two lines, highlighted when texts are selected.

```JavaScript
import Highlighter from 'web-highlighter';
(new Highlighter()).run();
```

If you need persistence, four lines make it.

```JavaScript
import Highlighter from 'web-highlighter';

// 1. initailize
const highlighter = new Highlighter();

// 2. retrieve data from backend, then highlight it on the page
getRemoteData().then(s => highlighter.fromStore(s.startMeta, s.endMeta, s.id, s.text));

// 3. listen for highlight creating, then save to backend
highlighter.on(Highlighter.event.CREATE, ({sources}) => save(sources));

// 4. auto highlight
highlighter.run();
```

## Example

A more complex example

```JavaScript
import Highlighter from 'web-highlighter';

// won't highlight pre&code elements
const highlighter = new Highlighter({
    exceptSelectors: ['pre', 'code']
});

// add some listeners to handle interaction, such as hover
highlighter
    .on('selection:hover', ({id}) => {
        // display different bg color when hover
        highlighter.addClass('highlight-wrap-hover', id);
    })
    .on('selection:hover-out', ({id}) => {
        // remove the hover effect when leaving
        highlighter.removeClass('highlight-wrap-hover', id);
    })
    .on('selection:create', ({sources}) => {
        sources = sources.map(hs => ({hs}));
        // save to backend
        store.save(sources);
    });

// retrieve data from store, and display highlights on the website
store.getAll().forEach(
    // hs is the same data saved by 'store.save(sources)'
    ({hs}) => highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
);

// auto-highlight selections
highlighter.run()
```

Besides, there is an example in this repo (in `example` folder). To play with it, you just need ——

Firstly enter the repository and run

```bash
npm i
```

Then start the example

```
npm start
```

Finially visit http://127.0.0.1:8085/

---

Another real product built with web-highlighter (for the highlighting area on the left):

![product sample](https://user-images.githubusercontent.com/9822789/64678049-632e8500-d4ab-11e9-99d6-f960bc90d17b.gif)

## API

### `highlighter = new Highlighter([opts])`

Create a new `highlighter` instance.

`opts` will be merged into the default options (shown bellow).

```JavaScript
{
    $root: document.documentElement,    // root element for addEventlistener / DFS / ...
    exceptSelectors: null,              // if an element matches the selector, it won't be highlighted
    style: {
        className: 'highlight-wrap'     // the classname for wrap element
    }
}
```

`exceptSelectors` needs `null` or `Array<string>`. It suports id selectors, class selectors and tag selectors.

For example, to skip h1 and `.title` elements:

```JavaScript
var highlighter = new Highlighter({
    exceptSelectors: ['h1', '.title']
});
```

### `highlighter.run()`

Start auto-highlighting. When the user select a text segement, a highlighting will be added to the text automatically.

### `highlighter.stop()`

It will stop the auto-highlighting.

### `highlighter.dispose()`

When you don't want the highlighter anymore, remember to call it first. It will remove some listeners and do some cleanup.

### `highlighter.fromRange(range)`

You can pass a [`Range`](https://developer.mozilla.org/en-US/docs/Web/API/Range) object to it and then it will be highlighted. You can use `window.getSelection().getRangeAt(0)` to get a range object or use `document.createRange()` to create a new range.

Use it as bellow:

```JavaScript
const selection = window.getSelection();
if (selection.isCollapsed) {
    highlighter.fromRange(selection.getRangeAt(0));
}
```

### `highlighter.fromStore(start, end, text, id)`

Mostly, you use this api to highlight text by the persisted infomation stored from backend.

These four values are from the `HighlightSource` object. `HighlightSource` object is a special object created by web-highlighter when highlighted area created. For persistence in backend (database), it's necessary to find a data structure to represent a dom node. This structure is called `HighlightSource` in web-highlighter.

Four attributes' meanings:

- start `Object`:    meta info about the beginning element
- end   `Object`:    meata info about then end element
- text  `string`:    text content
- id    `string`:    unique id

### `highlighter.remove(id)`

Remove (clean) a highlighted area by it's unique id. The id will be generated by web-highlighter by default. You can also add a hook for your own rule. [Hooks doc here](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md).

### `highlighter.removeAll()`

Remove all highlighted areas belonging to the root.

### `highlighter.addClass(classname, id)`

Add a classname for highlighted areas (wrap elements) by unique id. You can change a highlighted area's style by using this api.


### `highlighter.removeClass(classname, id)`

Remove the classname by unique id. It's `highlighter.addClass`'s inverse operation.

### `highlighter.getDoms([id])`

Get all the wrap nodes in a highlighted area. A highlighted area may contain many segments. It will return all the dom nodes wrapping these segements.

If the `id` is not passed, it will return all the areas' wrap nodes.


### `highlighter.getIdByDom(node)`

If you have a wrap node, it can return the unique highlight id for you.

### `Event Listener`

web-highlighter use listeners to handle the events.

e.g.

```JavaScript
var highlighter = new Highlighter();
highlighter.on(Highlighter.event.CREATE, function (data, inst, e) {
    // ...
});
```

The callback function will receive three parameters:

- data `any`: event data
- inst `Highligher`: current Highligher instance
- e `Event`: some event is triggered by the browser (such as click), web-highlighter will expose it

`Highlighter.event` is `EventType` type. It contains：

- `EventType.CLICK`: click the highlighted area
- `EventType.HOVER`: mouse enter the highlighted area
- `EventType.HOVER_OUT`: mouse leave the highlighted area
- `EventType.CREATE`: a highlighted area is created
- `EventType.REMOVE`: a highlighted area is removed


Different event has different `data`. Attributes below:

#### `EventType.CLICK`

|name|description|type|
|---|---|---|
|`id`|the highlight id|string|

#### `EventType.HOVER`

|name|description|type|
|---|---|---|
|`id`|the highlight id|string|

#### `EventType.HOVER_OUT`

|name|description|type|
|---|---|---|
|`id`|the highlight id|string|

#### `EventType.CREATE`

> no parameter `e`

|name|description|type|
|---|---|---|
|`source`|`HighlightSource` object|Array<HighlightSource>|
|`type`|the reason for creating|string|

`source` is a `HighlightSource` object. It is an object created by web-highlighter when highlighted area created. For persistence in backend (database), it's necessary to use a data structure which can be serialized (`JSON.stringify()`) to represent a dom node in browsers. `HighlightSource` is the data structure designed for this.

`type` explains why a highlighted area is be created. Now `type` has two possible values: `from-input` and `from-store`. `from-input` shows that a highlighted area is created because of user's selection. `from-store` means it from a storage.

#### `EventType.REMOVE`

> no parameter `e`

|name|description|type|
|---|---|---|
|`ids`|a list of the highlight id|Array<string>|

## Compatibility

> It depends on [Selection API](https://caniuse.com/#search=selection%20api).

- IE 10、11
- Edge
- Firefox 52+
- Chrome 15+
- Safari 5.1+
- Opera 15+

## Advance

It provides some hooks for you so that the highlighting behaviour can be controlled better by your own.

To learn more about the hooks, read [this doc](https://github.com/alienzhou/web-highlighter/blob/master/docs/ADVANCE.md).

## License

MIT
