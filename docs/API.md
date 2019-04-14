# API 功能列表

## 初始化配置

```JavaScript
var highlighter = new Highlighter({
    $root: document.documentElement,
    exceptSelectors: ['img', 'code'],
    style: {
        className: 'highlight-wrap'
    }
});
```

|配置项|描述|值|默认值|
|---|---|---|---|
|`$root`|确定可高亮区域的根元素|`HTMLElement`类型元素|`document.documentElement`|
|`exceptSelectors`|不需要高亮的元素|`Array<string>`|`null`|
|`style.className`|为高亮包裹元素添加的样式类|`Array<string>`|highlight-mengshou-wrap|

## API 列表

### `.run`

> 开启自动高亮功能

```JavaScript
highlighter.run();
```

### `.stop`

> 关闭自动高亮功能

```JavaScript
highlighter.stop();
```

### `.dispose`

> 回收与清理工作，会清理无用资源、注销事件监听等

```JavaScript
highlighter.dispose();
```

### `.fromRange`

> 通过浏览器中用户选区，将该选区进行高亮

参数：

- `Range`: `{Range}` 浏览器中的 Range 对象

```JavaScript
const selection = window.getSelection();
if (selection.isCollapsed) {
    highlighter.fromRange(selection.getRangeAt(0));
}
```

### `.fromStore`

> 通过持久化的数据，来还原高亮选区

参数：

- `start`: `{Object}` 起始元素元数据信息
- `end`: `{Object}` 终止元素元数据信息
- `text`: `{string}` 选区纯文本值
- `id`: `{string}` 选区 id

```JavaScript
request('/highlight/store').then(function(list) {
    list.forEach(function (h) {
        highlighter.fromStore(h.startMeta, h.endMeta, h.text, h.id);
    });
});
```

### `.remove`

> 删除某个高亮选区

参数：

- `id`: `{string}` 高亮区域 id

```JavaScript
highlighter.remove(id);
```

### `.removeAll`

> 删除所有高亮选区

```JavaScript
highlighter.removeAll();
```

### `.addClass`

> 为某一选区添加样式类

参数：

- `className`: `{string}` 样式类
- `id`: `{string}` 高亮区域 id

```JavaScript
highlighter.addClass('active', id);
```

### `.removeClass`

> 移除某一选区的样式类

参数：

- `className`: `{string}` 样式类
- `id`: `{string}` 高亮区域 id

```JavaScript
highlighter.removeClass('active', id);
```

### `.getDoms`

> 根据 id 获取某个高亮选区的所有 DOM，或获取根元素下所有高亮 DOM

- `id`?: `{string}` 高亮区域 id（非必传，若不传则返回所有 DOM）

```JavaScript
var $nodes = highlighter.getDoms(id);
$nodes.forEach(function ($n) {
    console.log($n);
});
```

### `.getIdByDom`

> 根据 高亮选区的 DOM 获取其所对应的 id

- `$node`: `{HTMLElement}` 高亮区域的 DOM

```JavaScript
var id = highlighter.getIdByDom($node);
```

## 事件监听

```JavaScript
var highlighter = new Highlighter();
highlighter.on(Highlighter.event.CREATE, function (data, inst, e) {
    // ...
});
```

`Highlighter.event`是内部的`EventType`类型，包含事件全集：

- `EventType.CLICK`: 高亮区域被点击
- `EventType.HOVER`: 鼠标移入高亮区域
- `EventType.HOVER_OUT`: 鼠标移出高亮区域
- `EventType.CREATE`: 高亮区域被创建
- `EventType.REMOVE`: 高亮区域被移除

### 回调参数

- `data` 为监听暴露的数据
- `inst` highlighter 实例
- `e` 部分事件由浏览器交互触发，会暴露原生event

其中各类型事件的`data`为：

### `EventType.CLICK`

> 无event参数

|参数名|描述|类型|
|---|---|---|
|`id`|高亮选区 id|Array|

### `EventType.HOVER`

> 无event参数

|参数名|描述|类型|
|---|---|---|
|`id`|高亮选区 id|Array|

### `EventType.HOVER_OUT`

> 无event参数

|参数名|描述|类型|
|---|---|---|
|`id`|高亮选区 id|Array|

### `EventType.CREATE`

> 无event参数

|参数名|描述|类型|
|---|---|---|
|`source`|可持久化的选区信息|Array|
|`type`|创建类型|string|

### `EventType.REMOVE`

> 无event参数

|参数名|描述|类型|
|---|---|---|
|`ids`|被删除选区的 id 列表|Array|