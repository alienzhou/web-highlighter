# NOTE

## TODO

- ~~支持传入多root，并在事件触发时返回标示~~
- [x] P0: 根据id设置highlight属性样式
- [x] P0: 记录highlight的页面位置信息，例如top、left
- [x] P1: 支持手动触发highlight
- [ ] P0: API调整，配置梳理，事件梳理
- [ ] P0: 使用xPath记录节点位置
- [ ] P1: 补充文档
- [ ] P1: test
- [ ] P2: 考虑使用crc校验节点
- [ ] P2: 扩展点
- [ ] P2: 性能优化，raf和idle，考虑多线程处理部分任务，避免layout

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
