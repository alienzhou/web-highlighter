# CHANGELOG

## v0.7.4

### Fix

Removing unsupported APIs to fix compatibility issues in IE11:

- [Array.prototype.includes](https://caniuse.com/array-includes)
- [String: startsWith](https://caniuse.com/mdn-javascript_builtins_string_startswith)
- [RegExp: unicode](https://caniuse.com/mdn-javascript_builtins_regexp_unicode)

---

## v0.7.3

### Fix

- highlight wrapper inside another wrapper not get updated when deleting [#80](https://github.com/alienzhou/web-highlighter/pull/80)
- make the className the latest one when wrapping a partial or an overlap node [#82](https://github.com/alienzhou/web-highlighter/pull/82)

### Improvement

- better typings for event emitter [#81](https://github.com/alienzhou/web-highlighter/pull/81)
- tsconfig path alias and npm scripts [#84](https://github.com/alienzhou/web-highlighter/pull/84)

---

## v0.7.2

### Fix

- including type declarations in the `package.json`
- making public `.options` a private field

---

## v0.7.1

### Features

- Generating .d.ts files for projects using typescript.

### Fix

- Select the range's container element correctly when it is not Text/Comment/CDATASection.

---

## v0.7.0

### Features

- Make get id methods more flexible.
  - It will get correct id(s) inside a wrapper. No need to be a wrapper element.
  - It is limited in the root scope.

### Fix

- Retain the wrapper's classname when wrapping a partial node.

---

## v0.6.0

### Features

- Add `.getExtraIdByDom` instance method which helps get extra ids from a wrapper.
- Add a new hook: `Serialize.Restore`. You can use it to customize your own restoring method. When you tap this hook, the HighlightSource instance will use the function you pass to calculate the start and end nodes' info.
- Support remove function in hooks. Now `hook.tap()` will return a function for removing it. Besides, you can also call `hook.remove()` to remove a tapped function.

### Fix

- When pre&next nodes are empty texts, the text node's wrapper should not be split.
- Avoid add duplicate functions to a hook.

### Other updates

- Add unit tests for hook, event emitter and new features.
- Use unknown type instead of any.

---

## v0.5.2

### Features

- Support verbose configuration. It decides whether warning&error message will be output.
- Add a static method .isHighlightWrapNode(). You can use it to test whether a node(DOM) is a highlight wrapper.

### Fix

- Prevent emit REMOVE event when no node is affected by calling `.remove()` and `.removeAll()`
- Fix the bug in `.getAll`, now it will return correct data
- Prevent injecting duplicate stylesheets when one has been injected

### Other updates

- Add a suit of unit tests to ensure the code quality.
- Refactor the way of error reporting.
- Remove `.dataset` polyfill.

---

## v0.5.1

### Fix

- fix the bug: When the root node has no children (except text nodes), the highlights can't be recreate by sources.

## v0.6.0-beta.0

### Features

- add a new hook: Serialize.Restore

> Customize your own restoring method. When you tap this hook, the HighlightSource instance will use the function you pass to calculate the start and end nodes' info.

---

## v0.5.0

### Features

- add an option: support changing the default wrapper's tag name

using it as below

```typescript
const highlighter = new Highlighter({
    wrapTag: 'b'
});
```

---

## 0.4.0-beta.0

### Features

- support highlighting on mobile devices:
  - automatically detect whether mobile devices
  - use touch events when on mobile devices

### Other updates

- source code: provide some internal methods for dom operation
- example app: bugfix & update

---

## v0.3.5

### Fix

- Bugfix: The highlighter.removeAll() method doesn't work

---

## v0.3.4

### Fix

- bugfix: `highlighter.removeAll()` does not work properly

---

## v0.3.3

### Fix

- hook: Remove.UpdateNode --> Remove.UpdateNodes

### Other update

- docs: english version
- use new README for the example

---

## v0.3.2

### Updates

- refactor: split some painter's functions
- update: update docs and the example

---

## v0.3.1

### Updates

- Structure refactor
- Handling compatibility issues
- Remove unnecessary modules

---

## v0.0.3

### Features

- support setting config dynamically

### Break Changes

- rename `.render()` to `.fromSource()`
- rename `.highlight()` to `.fromRange()`
- remove `.init` method and `highlight:init` event

---

## v0.0.2

### Features

- set highlight style (class) by id
- get highlight position info (offsetTop, offsetLeft)
- highlighting web text by passing range manually
