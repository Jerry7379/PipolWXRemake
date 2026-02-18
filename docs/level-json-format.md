# 关卡 JSON 格式

## 数据结构

```json
{
  "id": "level_001",
  "name": "Welcome Valley",
  "gridSize": {
    "cols": 20,
    "rows": 12,
    "cellSize": 32
  },
  "timeLimitSec": 180,
  "requiredSaved": 5,
  "simulationRules": {
    "movementPriority": "gravity-then-horizontal",
    "reverseWhenBlocked": true,
    "checkGoalBeforeMove": true,
    "checkGoalAfterMove": true,
    "agentCollisionWidthCells": 1,
    "agentCollisionHeightCells": 1,
    "maxStepUpCells": 1,
    "maxStepDownCells": 1,
    "spawnRetryDelaySec": 0.2,
    "outOfBoundsKillY": -1,
    "maxSafeFallCells": -1
  },
  "spawn": {
    "position": { "x": 1, "y": 2 },
    "direction": 1,
    "count": 6,
    "intervalSec": 0.8
  },
  "goal": {
    "x": 17,
    "y": 2,
    "width": 2,
    "height": 3
  },
  "goalVisual": {
    "spritePath": "images/goal_house_transparent_80k",
    "useFixedPixelSize": true,
    "widthPx": 64,
    "heightPx": 56,
    "longSideScale": 2,
    "positionMode": "goal-center",
    "positionCell": { "x": 18, "y": 3.5 }
  },
  "goalDebug": {
    "showArea": true,
    "fillRgba": [255, 243, 150, 70],
    "strokeRgba": [255, 246, 138, 255]
  },
  "protectedRects": [
    { "x": 1, "y": 2, "width": 2, "height": 2 },
    { "x": 17, "y": 2, "width": 2, "height": 3 }
  ],
  "terrainTemplate": {
    "kind": "layered",
    "topAirRows": 2,
    "carveEditableRects": [
      { "x": 8, "y": 1, "width": 4, "height": 2 }
    ]
  }
}
```

## 字段说明

- `id`: 关卡唯一标识。
- `name`: 关卡名。
- `gridSize.cols`: 列数。
- `gridSize.rows`: 行数。
- `gridSize.cellSize`: 每格像素尺寸。
- `timeLimitSec`: 限时（秒）。
- `requiredSaved`: 过关所需到达终点人数。
- `simulationRules`: 可选，模拟规则覆盖项（不填则走默认规则）。
- `spawn.position`: 出生格坐标（左下原点）。
- `spawn.direction`: 初始方向，`1` 向右，`-1` 向左。
- `spawn.count`: 总生成人数。
- `spawn.intervalSec`: 生成间隔（秒）。
- `goal`: 终点矩形区域。
- `goalVisual`: 终点贴图渲染参数（与 `goal` 逻辑区解耦）。
- `goalDebug`: 终点逻辑区调试显示参数（颜色/开关）。
- `protectedRects`: 不能挖填的矩形保护区（推荐）。
- `protectedCells`: 不能挖填的格子（旧格式，保留兼容）。
- `terrainTemplate`: 参数化地形定义（推荐）。
- `terrain`: 地形字符串数组（旧格式，保留兼容）。

## simulationRules 规则项

- `movementPriority`: 移动优先级，`gravity-then-horizontal` 或 `horizontal-then-gravity`。
- `reverseWhenBlocked`: 水平移动被阻挡时是否反向。
- `checkGoalBeforeMove`: 是否在移动前判定终点。
- `checkGoalAfterMove`: 是否在移动后判定终点。
- `agentCollisionWidthCells`: 角色碰撞宽度（格）。
- `agentCollisionHeightCells`: 角色碰撞高度（格）。
- `maxStepUpCells`: 前方受阻时允许“抬升前进”的最大步高（格）。
- `maxStepDownCells`: 前方落差时允许“顺坡下行”的最大步高（格）。
- `spawnRetryDelaySec`: 出生点堵塞时的重试延迟（秒）。
- `outOfBoundsKillY`: 角色 `y <= 该值` 时死亡。
- `maxSafeFallCells`: 最大安全连续下落格数；`< 0` 表示关闭该规则。

## 终点显示配置

- `goalVisual.spritePath`: 终点贴图路径（`resources` 相对路径，不带扩展名）。
- `goalVisual.useFixedPixelSize`: `true` 时使用固定像素大小；`false` 时按逻辑区长边比例缩放。
- `goalVisual.widthPx / goalVisual.heightPx`: 固定像素大小（`useFixedPixelSize=true` 时生效）。
- `goalVisual.longSideScale`: 逻辑区缩放倍率（`useFixedPixelSize=false` 时生效）。
- `goalVisual.positionMode`: 贴图定位模式。`goal-center` 跟随逻辑区中心；`absolute-cell` 使用独立坐标。
- `goalVisual.positionCell`: 贴图中心坐标（单位：格，左下原点）。仅 `positionMode=absolute-cell` 时生效。
- `goalDebug.showArea`: 是否显示终点逻辑区调试框。
- `goalDebug.fillRgba`: 调试填充色，RGBA（0~255）。
- `goalDebug.strokeRgba`: 调试描边色，RGBA（0~255）。

## terrainTemplate 规则（推荐）

- 当前支持 `kind: "layered"`。
- `topAirRows`: 顶部空气层行数（这些行会生成 `.`）。
- 未被覆盖的其余区域默认生成 `#`。
- `carveEditableRects`: 在基础地形上挖出 `o` 区域（可编辑空洞）。
- `forceSolidRects`: 强制覆盖为 `#`（可选）。
- `forceSkyRects`: 强制覆盖为 `.`（可选）。
- 所有矩形坐标使用左下原点坐标系（与 `spawn/goal` 一致）。

## terrain 规则（旧格式，兼容）

- 每个字符代表一个网格。
- `#` 表示实体地形（可挖、可填）。
- `o` 表示可编辑空格（土层中的洞，可回填）。
- `.` 表示不可编辑空格（通常是上方天空/管道通道）。
- 数组长度必须等于 `rows`。
- 每行字符串长度必须等于 `cols`。
- 书写顺序是“从上到下”。加载时会转换为底部原点坐标。

## 保护区规则

- `protectedRects` 与 `protectedCells` 可同时存在；加载时会合并并去重。
- `protectedRects` 超出地图边界的部分会自动裁剪。
- 运行时保护区效果一致：位于保护区的格子不可挖、不可填。
