# 关卡 JSON 配置方法（`assets/resources/levels`）

本目录下的 `level_*.json` 是小游戏运行时实际读取的关卡配置。

## 1. 生效方式

- 修改 `assets/resources/levels/*.json` 后，需要在 Cocos 里重新预览或重新构建微信小游戏。
- 建议先改一关验证，再批量同步到其他关卡。

## 2. 坐标与单位

- 坐标原点在左下角。
- 所有 `x/y/width/height` 默认单位都是“格（cell）”。
- 像素换算：`像素 = 格数 * gridSize.cellSize`。

## 3. 最小可用结构

```json
{
  "id": "level_001",
  "name": "Level Name",
  "gridSize": { "cols": 180, "rows": 360, "cellSize": 2 },
  "timeLimitSec": 220,
  "requiredSaved": 8,
  "simulationRules": {},
  "spawn": { "position": { "x": 20, "y": 308 }, "direction": 1, "count": 12, "intervalSec": 0.75 },
  "goal": { "x": 142, "y": 50, "width": 6, "height": 8 },
  "goalVisual": {},
  "goalDebug": {},
  "terrainTemplate": { "kind": "layered", "topAirRows": 60, "carveEditableRects": [] },
  "protectedRects": []
}
```

## 4. 常改字段

### 4.1 网格分辨率

- `gridSize.cols/rows`: 地图格子宽高。
- `gridSize.cellSize`: 每格像素大小；越小越细腻，但性能压力更高。

### 4.2 出生点

- `spawn.position.x/y`: 出生格坐标。
- `spawn.direction`: `1` 向右，`-1` 向左。
- `spawn.count`: 总人数。
- `spawn.intervalSec`: 出生间隔秒数。

### 4.3 终点逻辑区（胜利判定）

- `goal.x/y/width/height`: 终点逻辑矩形。
- 终点逻辑区不可挖不可填。

### 4.4 终点贴图（与逻辑区解耦）

- `goalVisual.spritePath`: `resources` 相对路径（不带扩展名）。
- `goalVisual.useFixedPixelSize`: `true` 用固定像素尺寸，`false` 用比例缩放。
- `goalVisual.widthPx/heightPx`: 固定像素尺寸。
- `goalVisual.longSideScale`: 比例模式下，按逻辑区长边放大倍数。
- `goalVisual.positionMode`: `goal-center` 或 `absolute-cell`。
- `goalVisual.positionCell`: 当 `positionMode=absolute-cell` 时，表示贴图中心格坐标。

### 4.5 终点调试框

- `goalDebug.showArea`: 是否显示逻辑区调试框。
- `goalDebug.fillRgba`: 填充色 `[r,g,b,a]`。
- `goalDebug.strokeRgba`: 描边色 `[r,g,b,a]`。

### 4.6 地形参数化生成

- `terrainTemplate.kind`: 当前使用 `layered`。
- `terrainTemplate.topAirRows`: 顶部空气层行数（自动生成 `.`）。
- `terrainTemplate.carveEditableRects`: 预挖空矩形（生成 `o`）。
- `terrainTemplate.forceSolidRects`: 强制刷成 `#`。
- `terrainTemplate.forceSkyRects`: 强制刷成 `.`。

说明：
- `#` = 实心可编辑土。
- `o` = 空洞可编辑（可回填）。
- `.` = 空洞不可编辑。

### 4.7 保护区（不可挖不可填）

- `protectedRects`: 推荐写法，矩形批量配置。
- `protectedCells`: 旧写法，逐格配置（仍兼容）。

## 5. 你当前最常用的配置入口

- 调整“终点附近默认挖开区域”：`terrainTemplate.carveEditableRects`。
- 调整“终点判定大小”：`goal.width/goal.height`。
- 调整“终点贴图大小”：`goalVisual.widthPx/goalVisual.heightPx`（固定像素模式）。
- 调整“终点贴图位置独立于逻辑区”：`goalVisual.positionMode = "absolute-cell"` + `goalVisual.positionCell`。
- 调整“跌落致死阈值”：`simulationRules.maxSafeFallCells`（落地时判定）。

## 6. 常见排查

- 改了 JSON 但画面没变：先确认改的是 `assets/resources/levels/*`，然后重开预览。
- 贴图路径不生效：确认资源在 `assets/resources` 下，`spritePath` 不带 `.png`。
- 看不清终点逻辑区：临时开启 `goalDebug.showArea=true` 并设置高对比色。

