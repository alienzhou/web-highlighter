# Web Highlighter

[![NPM version](https://img.shields.io/npm/v/web-highlighter.svg)](https://www.npmjs.com/package/web-highlighter)  ![version](https://img.shields.io/badge/version-0.3.1-blue.svg?cacheSeconds=2592000)  [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)   

✨A no-runtime dependency lib for text highlight & persistence on any website ✨🖍️

即文本划词高亮。

![](./docs/img/sample.gif)

用于实现非耦合的文本区域高亮功能（例如在文本阅读器、博客文章页面、小说阅读页面）；

同时提供一种可靠的高亮区域的序列化与反序列化方法，用于实现高亮选区的持久化，用以在下次加载页面后还原高亮区域。

一行代码，开启高亮功能：

```JavaScript
(new Highlighter()).run();
```

四行代码，实现高亮持久化：

```JavaScript
// 实例化
var highlighter = new Highlighter();
// 从存储中还原高亮区域
getStore().then(s => highlighter.fromStore(s.startMeta, s.endMeta, s.id, s.text));
// 存储高亮区域数据
highlighter.on(Highlighter.event.CREATE, ({sources}) => save(sources));
// 开启自动高亮
highlighter.run();
```

## 支持能力

- 文本类内容高亮
- 文本内容取消高亮
- 支持高亮选取重合与包含
- 提供高亮信息持久化，通过数据还原高亮展示（内置可持久化数据格式的生成与还原）
- 提供多个钩子，实现业务定制化

## 兼容性

- IE 10、11
- Edge
- Firefox 52+
- Chrome 15+
- Safari 5.1+
- Opera 15+

## 安装

### npm 安装

```bash
npm i web-highlighter
```

### 直接从源码构建

```bash
# git clone
git clone git@github.com:alienzhou/web-highlighter.git

# 使用某一版本
git checkout 0.3.0

npm i
npm run build
```

然后 `dist/web-highlighter.min.js` 即为最终产出，产出格式为 UMD 格式。

## 使用

引入方式：

```JavaScript
// 全局
var Highlighter = window.Highlighter;

// CommonJS
var Highlighter = require('highlighter');

// ES Module
import Highlighter from 'highlighter';
```

```JavaScript
var highlighter = new Highlighter();

// 开启 划词自动高亮
highlighter.run();
```

## 功能

### API 功能列表

[相关文档](./docs/API.md)

### 暴露的钩子函数

[相关文档](./docs/ADVANCE.md)

## 开发

### 启动本地 DEMO 进行开发

```bash
npm run dev
```

### 外部系统调用调试（构建产出包并提供 HTTP 访问）

```bash
npm run start
```

## 调试

外部项目引入 web-highlighter 后，由于都是压缩后的代码，出错时可能不便与调试。因此，build时除了产出最终代码产物，同时会在 `dist` 下产出 SourceMap ——  `web-highlighter.min.js.map`，外部程序使用 web-highlighter 时，可以载入该 SourceMap 用以进行源码调试。

SourceMap 与一些工具的集成方式：

- 浏览器中可以直接放在对应服务器目录，直接载入；
- webpack可以使用 [`source-map-loader`](https://webpack.js.org/loaders/source-map-loader/)
- gulp可以结合使用 [`vinyl-sourcemaps-apply`](https://github.com/gulp-sourcemaps/vinyl-sourcemaps-apply)
- rollup可以考虑使用 [`rollup-plugin-sourcemaps`](https://github.com/maxdavidson/rollup-plugin-sourcemaps)
