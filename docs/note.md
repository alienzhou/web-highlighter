# NOTE

## TODO

- 支持传入多root，并在事件触发时返回标示
- 支持手动触发highlight
- 使用worker多线程处理部分任务
- raf和ridle
- 避免不必要的性能开销、layout
- 考虑使用crc校验节点
- 补充文档
- API调整，配置梳理，事件梳理
- 记录highlight的页面位置信息，例如top、left
- 扩展点

## 主流程

```text
  (UserAgent)   |   (Highlighter lib)
                |
                |    Storage
                |      ⇅
                |    HighlightSource: pure type json
                |      ⇅
Range/Selection → →  HighlightRange: json with dom node
                |      ↓
                |    Paint: Highlighter.Paint
                |      ↓
                |    highlight in webpage

```