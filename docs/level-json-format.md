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
  "protectedCells": [
    { "x": 1, "y": 2 },
    { "x": 17, "y": 2 }
  ],
  "terrain": [
    "....................",
    "....................",
    "####################"
  ]
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
- `protectedCells`: 不能挖填的格子（通常放出生点/终点）。
- `terrain`: 地形字符串数组。

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

## terrain 规则

- 每个字符代表一个网格。
- `#` 表示实体地形（可挖、可填）。
- `o` 表示可编辑空格（土层中的洞，可回填）。
- `.` 表示不可编辑空格（通常是上方天空/管道通道）。
- 数组长度必须等于 `rows`。
- 每行字符串长度必须等于 `cols`。
- 书写顺序是“从上到下”。加载时会转换为底部原点坐标。
