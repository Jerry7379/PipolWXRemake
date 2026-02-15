# PipolWXRemake 当前进度总览

最后更新时间：2026-02-15
项目路径：`/Users/nrick/PipolWXRemake`

## 1. 项目目标

- 目标：复刻 `Pipol Destinations` 核心玩法到微信小游戏（Cocos Creator 3.8.5）。
- 方向：玩法尽量对齐原版，画风与资源原创重制。

## 2. 当前状态（可运行）

- 项目可在 Cocos Creator 正常打开并运行。
- 场景主节点：`GameRoot`，已挂：
- `GameController`
- `TerrainDebugRenderer`
- `TerrainPainterInput`
- 当前关卡从 `resources/levels` 自动加载，支持多关切换（现有 2 关）。

## 3. 已完成能力

### 3.1 地形与关卡

- 地形语义已扩展并落地：
- `#` 实体且可编辑
- `o` 空格但可编辑（土层洞）
- `.` 空格且不可编辑（天空/上方通道）
- 关卡校验器支持上述语义与字段校验。

### 3.2 两区结构复刻

- 已实现“上方出生管道区 + 下方可挖土层区 + 土内目标点”。
- 出生点占用有防呆告警。

### 3.3 挖填输入与细腻度

- 网格细化到 `160 x 128`，`cellSize=4`（挖土最小单位进一步变细）。
- 输入从单格改为“圆形笔刷 + 拖拽插值”：
- `brushRadiusCells`
- `strokeSpacingCells`

### 3.4 角色移动规则（可配置）

- `simulationRules` 已接入关卡层，可按关卡调参：
- `movementPriority`
- `reverseWhenBlocked`
- `checkGoalBeforeMove`
- `checkGoalAfterMove`
- `maxStepUpCells`
- `maxStepDownCells`
- `spawnRetryDelaySec`
- `outOfBoundsKillY`
- `maxSafeFallCells`
- 已支持坡面行为：
- 前方阻挡时可抬升上坡（step up）
- 前方落差时可顺坡下行（step down）
- 已支持多格角色碰撞体：
- `agentCollisionWidthCells`
- `agentCollisionHeightCells`
- 当前正式关卡建议值：`maxStepUpCells=2`、`maxStepDownCells=2`。
- 当前正式关卡占位：`1x1`（多格碰撞能力保留在代码，待专门关卡验证后再启用）。

### 3.5 视觉渲染（调试美术阶段）

- 地形、土层分界、管道、目标标记、小人已可视化。
- 小人视觉尺寸已与挖土最小单位解耦：
- `agentHeightCells` 默认 `2.6`（角色约 2.6 格高）。
- 渲染锚点已按碰撞宽度对齐，避免“碰撞体与画面位置错位”。
- 线宽与图形在小网格下做了自适应和最小尺寸保护。

### 3.6 自动回归测试

- 已建立基准回放系统：
- 脚本：`tools/replay-baselines.mjs`
- 命令：`npm run test:replay`
- 用例：`tools/baselines/*.json`（当前 5 条）
- 已覆盖：
- 直线到达
- 缺口坠落
- 水平优先
- Fill 搭桥
- Dig 导流下落
- 当前结果：5/5 通过。

## 4. 关键文件索引

- 规格文档：`docs/GameSpec.md`
- 本进度文档：`docs/PROJECT_PROGRESS.md`
- 关卡格式：`docs/level-json-format.md`
- 主控：`assets/scripts/controllers/GameController.ts`
- 模拟器：`assets/scripts/sim/GameSimulator.ts`
- 地形：`assets/scripts/core/TerrainGrid.ts`
- 关卡加载：`assets/scripts/core/LevelLoader.ts`
- 输入：`assets/scripts/input/TerrainPainterInput.ts`
- 渲染：`assets/scripts/render/TerrainDebugRenderer.ts`
- 正式关卡：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`

## 5. 当前可调参数（优先）

### 5.1 Inspector 可调

- `TerrainPainterInput.brushRadiusCells`（建议 2.2 ~ 2.8）
- `TerrainPainterInput.strokeSpacingCells`（建议 0.3 ~ 0.45）
- `TerrainDebugRenderer.agentHeightCells`（建议 4.8 ~ 5.8）
- `TerrainDebugRenderer.agentHeightCells`（当前默认 5.2，约对应旧配置 2.6 的视觉高度）
- `GameController.fixedStepSec`（当前 0.0125）

### 5.2 关卡 JSON 可调（simulationRules）

- `agentCollisionWidthCells`（角色碰撞宽度）
- `agentCollisionHeightCells`（角色碰撞高度）
- `maxStepUpCells`（上坡能力）
- `maxStepDownCells`（顺坡能力）
- 其余规则项见 `docs/GameSpec.md`

## 6. 已知差距（相对原版）

- 挖土边缘当前是圆刷风格，尚未做原版那种噪声边缘/像素质感贴图。
- 角色动画与土体材质仍处于调试表现阶段，尚未进入最终美术稿。

## 7. 下一步建议（按优先级）

1. 增加坡面/边缘专用回放关卡，持续对齐原版爬坡行为。
2. 挖土边缘升级为贴图化或噪声轮廓，进一步贴近原版观感。
3. 进入正式美术替换与动画细化。

## 7.1 下一会话开工清单（建议直接执行）

1. 新增 3 条坡面回放用例（上坡通过、下坡通过、阶梯阻挡反向）。
2. 跑 `npm run test:replay`，要求新增用例也全部通过。
3. 再调 `simulationRules` 的 `maxStepUpCells/maxStepDownCells` 到接近原版手感。
4. 挖土边缘升级为更接近原版的像素噪声轮廓。

完成判定：

- 在坡面场景中，小人可稳定上/下坡且不会异常卡边。
- 回放关卡可稳定验证坡面与阻挡细节。

## 8. 会话更新记录

### 2026-02-15（当前会话）

- 完成项目从原型到可持续迭代框架搭建：
- 规则规格文档化（`GameSpec`）
- 回放基准体系（5/5）
- 关卡细化到 `80x64@8px`
- 圆形笔刷挖土
- 坡面上/下移动规则
- 角色视觉尺寸与挖土最小单位解耦
- 要求新增：后续每次会话都必须维护本文件，作为断点续做入口。
- 新增会话接续机制文件：
- `docs/PROJECT_PROGRESS.md`（本文件）
- `/Users/nrick/AGENTS.md`（写入“每次对话/修改都要更新本文件”的规则）
- README 已加入本文件入口，便于下次快速定位。

### 2026-02-15（会话续记）

- 用户询问“下一步该做什么”。
- 本次未改动玩法代码，仅补充下一会话开工清单与完成判定标准。
- 建议下一步优先实现“多格角色碰撞体 + 坡面回放验证”。

### 2026-02-15（会话续记-多格碰撞）

- 用户确认开始实现多格角色碰撞体。
- 已完成：
- `simulationRules` 增加 `agentCollisionWidthCells/agentCollisionHeightCells`
- `GameSimulator` 改为多格占位碰撞、支撑判定、上/下坡步阶、目标区域相交判定
- 正式关卡已启用 `2x3` 占位
- 回放脚本同步到多格逻辑
- 文档 `GameSpec` 与 `level-json-format` 已同步新参数
- 验证：`npm run test:replay` 5/5 通过。
- 下一步：补 3 条坡面专项回放用例，继续调参与原版对齐。
- 补充：渲染层已接入碰撞占位宽高对齐（避免视觉/碰撞错位）。

### 2026-02-15（会话续记-回滚配置）

- 用户反馈：启用 `2x3` 后平面行走体感出现误碰撞。
- 处理策略：不回退代码能力，仅回退正式关卡配置。
- 已将正式关卡 `agentCollisionWidthCells/agentCollisionHeightCells` 调回 `1x1`，恢复稳定可玩手感。
- 多格碰撞逻辑仍保留在代码中，后续通过专项回放与专用关卡再逐步启用。
- 验证：`npm run test:replay` 5/5 通过。

### 2026-02-15（会话续记-更细土地）

- 用户要求进一步细化挖土最小单位。
- 已将正式关卡从 `80x64@8px` 升级为 `160x128@4px`（保持地图物理尺寸）。
- 同步调整默认参数：
- `GameController.fixedStepSec = 0.0125`
- `TerrainPainterInput.brushRadiusCells = 2.4`
- `TerrainDebugRenderer.agentHeightCells = 5.2`
- 验证：关卡结构校验通过，`npm run test:replay` 5/5 通过。
- 风险提示：`4px` 网格绘制负载显著上升，后续需关注微信真机帧率。
