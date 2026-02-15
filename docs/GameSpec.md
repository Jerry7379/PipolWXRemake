# Pipol 复刻玩法规格（GameSpec v0.1）

本文档用于锁定“玩法行为”，避免后续美术和关卡迭代时把核心手感改坏。

## 1. 范围

- 目标：在微信小游戏中复刻 `Pipol Destinations` 的核心循环。
- 当前阶段：先保证逻辑一致性，再迭代美术与动效。
- 约束：本规格优先描述“可执行规则”，不绑定具体表现资源。

## 2. 坐标与离散时间

- 网格原点：左下角 `(0, 0)`。
- `terrain` 书写：JSON 中从上到下；运行时转换为底部原点索引。
- 角色状态更新：固定步长 Tick（默认由 `GameController.fixedStepSec = 0.1` 驱动）。

## 3. 地形语义

- `#`：实体且可编辑（土层）。
- `o`：空格但可编辑（土层中的洞，可回填）。
- `.`：空格且不可编辑（天空/管道区）。

挖填规则：

- 只能修改可编辑格（`#` 与 `o` 区域）。
- `protectedCells` 永不可编辑。
- `Fill` 不能直接填在角色当前占据的格子上。

## 4. 角色生命周期

角色状态字段（逻辑）：

- `pos`：当前格坐标。
- `direction`：水平朝向（`1` 右，`-1` 左）。
- `ageSec`：出生后的累计秒数（用于表现层动画）。
- `fallCells`：连续下落格数（用于跌落规则）。
- `dead/reachedGoal`：结算状态。

## 5. Tick 行为顺序

每个 Tick 的顺序：

1. 生成阶段（按 `spawn.intervalSec`，受出生点阻塞影响）。
2. 逐个更新所有存活角色：
- 增长 `ageSec`。
- 若开启“移动前终点判定”，先判定是否已在终点。
- 按 `movementPriority` 执行移动（重力优先/水平优先）。
- 若开启“移动后终点判定”，再次判定是否进入终点。

默认优先级为“重力优先”：

- 若脚下为空，先下落 1 格，本 Tick 不再水平移动。
- 若脚下有支撑，再尝试水平移动。

## 6. 失败与成功

- 成功：`saved >= requiredSaved`。
- 失败：
- 倒计时耗尽。
- 或所有角色已结算但未达到 `requiredSaved`。

个体死亡条件（默认）：

- 下落后 `y <= outOfBoundsKillY`（默认 `-1`）。
- 若启用最大安全坠落格数（`maxSafeFallCells >= 0`），当 `fallCells > maxSafeFallCells` 时死亡。

## 7. 可配置规则（simulationRules）

关卡可选字段 `simulationRules`，用于精确拟合原作行为：

- `movementPriority`：`gravity-then-horizontal` | `horizontal-then-gravity`
- `reverseWhenBlocked`：水平被阻挡时是否反向
- `checkGoalBeforeMove`：是否在移动前判定终点
- `checkGoalAfterMove`：是否在移动后判定终点
- `agentCollisionWidthCells`：角色碰撞宽度（格）
- `agentCollisionHeightCells`：角色碰撞高度（格）
- `maxStepUpCells`：前方受阻时允许抬升前进的最大步高
- `maxStepDownCells`：前方落差时允许顺坡下行的最大步高
- `spawnRetryDelaySec`：出生点阻塞后的重试延迟
- `outOfBoundsKillY`：越界死亡阈值
- `maxSafeFallCells`：最大安全坠落格数（`< 0` 表示关闭）

当前默认值（未在关卡中填写时自动补全）：

```json
{
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
}
```

## 8. 基准回放（必须通过）

每次改玩法逻辑必须跑基准回放，当前包含 5 个 case：

1. 直线通道全员到达。
2. 缺口地形全员坠落。
3. 水平优先规则触发“先横移后到达”。
4. `Fill` 搭桥避免坠落并到达。
5. `Dig` 开洞引导下落进入目标。

命令（项目根目录）：

```bash
node tools/replay-baselines.mjs
```

动作回放字段（用于挖/填序列验证）：

```json
{
  "actions": [
    { "tick": 2, "type": "fill", "x": 3, "y": 2 },
    { "tick": 7, "type": "dig", "x": 5, "y": 1 }
  ]
}
```

- `tick`: 在第几个模拟 Tick 执行。
- `type`: `dig` 或 `fill`。
- `x/y`: 目标格坐标。

## 9. 下一阶段（v0.2）

- 增加“边缘行为”与“转向时机”更细颗粒参数。
- 增加输入回放（挖/填事件序列）测试。
- 补齐关卡编辑器侧静态校验（出生点可站立、目标点可达性预检）。
