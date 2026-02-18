# PipolWXRemake 当前进度总览

最后更新时间：2026-02-17
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
- `assets/levels` 镜像目录已删除，本文中历史记录提到该目录仅用于回顾旧变更。

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

### 3.7 移动端适配

- 已加入运行时屏幕自适应布局：
- 地图区域按屏幕可用空间自动缩放（预留顶部 HUD + 底部边距）
- 地图默认底部贴齐、水平居中
- Canvas 尺寸变化时自动重新布局
- 相机正交高度改为跟随 Canvas 高度，避免固定值导致移动端画面过小。

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

### 2026-02-15（会话续记-移动适配）

- 用户反馈：移动设备竖屏显示地图过小、黑边明显。
- 已完成移动端布局适配：
- `GameController` 新增地图区域自动缩放参数与计算逻辑
- 监听 `canvas-resize` 自动重排地图与 UI
- 相机 `orthoHeight` 跟随 Canvas 高度同步
- HUD 文本宽度与字号在窄屏下自适应
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 在微信真机（高分屏和低端机各一台）验证竖屏与横屏切换、刘海安全区、帧率稳定性。

### 2026-02-15（会话续记-移动适配校验）

- 对 `GameController` 的移动适配实现做兼容性复查：
- 相机同步逻辑不再依赖 `Camera.ProjectionType` 枚举判断，仅在取到 Canvas 相机后更新 `orthoHeight`，避免版本差异导致报错。
- 已执行回放回归：
- `npm run test:replay`
- 结果：5/5 通过，无玩法回归。
- 当前状态：
- 可继续进入微信开发者工具真机预览环节，重点验证不同屏幕比例下地图填充、HUD 可读性与安全区表现。

### 2026-02-15（会话续记-竖屏优先修正）

- 用户反馈：移动端适配后地图贴底且上方黑区过大，要求竖屏优先。
- 已完成修正：
- `GameController` 增加竖屏优先开关与放大倍率参数（`portraitPriority`、`portraitScaleBoost`）
- 竖屏下改为“放大优先 + 顶部对齐 + 左侧对齐”，保证出生侧可见并减少视觉黑边
- Canvas 相机清屏色改为天空色，避免非地图区域显示纯黑
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 在微信开发者工具和真机分别验证：iPhone 刘海屏、安卓 20:9 机型、横竖切换返回竖屏时的重排是否稳定。

### 2026-02-15（会话续记-竖屏全屏与关卡重构）

- 用户要求：整体改为竖屏优先、画面占满全屏；关卡改成“上方出生点 + 下方整块可挖土区”。
- 已完成代码调整：
- `GameController` 新增 `portraitFillScreen`（默认开启）
- 竖屏下启用全屏填充缩放（cover），并改为顶部对齐，减少上下留白
- 已完成关卡数据重构（两关）：
- 网格统一为 `90x180 @ cellSize=4`（竖屏比例）
- 顶部 30 行为出生通道（`.`），其余为可挖土层（`#`）
- 出生点保持在顶部通道；目标点埋入下方土层，需挖通到达
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 验证结果：
- 关卡结构校验通过（行列长度、出生点位置、土层分布检查通过）
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 在微信真机确认“全屏填充”是否满足预期；若仍希望完全无裁切，可再按目标机型比例微调 `gridSize`（例如 9:19.5）。

### 2026-02-15（会话续记-竖屏强制填充修正）

- 用户反馈：改动后游戏区域仍未铺满全屏。
- 问题定位：全屏分支仍受 `portraitPriority` 条件影响，部分场景配置下会退回 contain 缩放，产生左右/上下留边。
- 已完成修正：
- 竖屏下改为强制 `cover` 填充（不再依赖 `portraitPriority`）
- 竖屏下位置改为顶部对齐并居中，确保屏幕内不出现地图外边框
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 微信开发者工具重新构建并清缓存后真机预览，确认旧包未缓存导致显示旧逻辑。

### 2026-02-15（会话续记-全向强制全屏填充）

- 用户反馈：仍存在边框，要求游戏区域铺满全屏。
- 已完成修正：
- 缩放策略由“竖屏时 cover”进一步改为“开启 `portraitFillScreen` 时不区分方向，统一 cover 填充”
- 定位策略保持顶部对齐 + 水平居中，确保上方出生区可见且屏幕不留边框
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 微信开发者工具执行“重新构建 + 清缓存 + 重新预览”，确认运行的是最新脚本。

### 2026-02-15（会话续记-全屏填充兜底）

- 为避免 Inspector 旧配置干扰，运行时 `fillScreen` 已改为强制启用（不再依赖组件开关值）。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-15（会话续记-Canvas 竖屏基准）

- 为减少构建/缓存导致的横屏基准干扰，场景 `Canvas` 初始分辨率已切换为竖屏基准：
- 位置由 `(640, 360)` 改为 `(360, 640)`
- 尺寸由 `1280x720` 改为 `720x1280`
- 影响文件：
- `assets/scene.scene`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-15（会话续记-微信 libVersion 报错修复）

- 用户反馈：微信开发者工具提示 `project.config.json: libVersion 字段需为 string`。
- 已完成修复：
- 根目录 `project.config.json` 补充 `libVersion: \"3.14.2\"`
- 构建目录 `build/wechatgame/project.config.json` 的 `libVersion` 由 `\"game\"` 改为 `\"3.14.2\"`
- 影响文件：
- `project.config.json`
- `build/wechatgame/project.config.json`
- 验证结果：
- 两个文件均已确认为字符串类型 `libVersion`
- 下一步建议：
- 在微信开发者工具重新打开 `build/wechatgame` 并重新编译。

### 2026-02-15（会话续记-全屏适配配置兜底）

- 用户反馈：真机预览仍未满屏，怀疑为小游戏配置问题。
- 排查结论：
- 构建产物 `build/wechatgame/src/settings.json` 中存在 `designResolution: 1280x720, policy: 4`，确实会干扰竖屏满屏表现。
- 已完成代码兜底（不依赖构建配置）：
- `GameController` 在运行时读取设备 `frameSize`，强制同步 `view.setDesignResolutionSize(frameW, frameH, 0)`
- 在 `canvas-resize` 时再次同步，防止切换机型/方向后回到旧分辨率
- 已同步修正当前构建包配置（便于立即验证）：
- `build/wechatgame/src/settings.json` 改为 `designResolution: 720x1280, policy: 1, exactFitScreen: false`
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `build/wechatgame/src/settings.json`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 重新构建微信小游戏后再真机预览；若仍有留边，再把构建配置中的设计分辨率也固定为竖屏值（720x1280）。

### 2026-02-15（会话续记-终点不可挖）

- 用户反馈：终点区域应不可挖/不可填。
- 已完成修复：
- `TerrainGrid.isProtected` 增加终点矩形保护判定（`goal` 区域统一视为受保护格）
- `dig/fill` 已共用 `isProtected`，因此终点内格子现在无法被工具修改
- 影响文件：
- `assets/scripts/core/TerrainGrid.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-15（会话续记-终点接触即成功）

- 用户反馈：小人“碰到终点”就应算成功，不应要求进入终点内部。
- 已完成修复：
- `GameSimulator.intersectsGoal` 改为矩形接触判定（含贴边接触）
- 规则从“占据终点格”调整为“与终点区域发生接触（含边界）即可达成”
- 回放脚本 `tools/replay-baselines.mjs` 同步同样的终点判定逻辑
- 为避免基准 005 被提前触发，已调整其目标点高度，保持“需 Dig 才成功”的测试意图
- 影响文件：
- `assets/scripts/sim/GameSimulator.ts`
- `tools/replay-baselines.mjs`
- `tools/baselines/005-dig-drop-to-goal.json`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-15（会话续记-速度参数咨询）

- 用户询问：在哪里调整小人移动速度。
- 结论：
- 当前工程没有“独立于物理步进的角色速度”参数，小人每个模拟步最多移动 1 格。
- 主要通过 `GameController.fixedStepSec` 调整整体模拟频率来改变体感速度。
- 关卡内 `spawn.intervalSec` 影响出人节奏，不影响单个小人行走每步位移。
- 影响文件：
- `docs/PROJECT_PROGRESS.md`（仅记录，无玩法代码改动）

### 2026-02-15（会话续记-移动速度减半）

- 用户要求：小人移动速度放缓一倍。
- 已完成修复：
- `GameController.fixedStepSec` 由 `0.0125` 调整为 `0.025`
- 模拟步频减半，小人每秒移动格数相应减半
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-15（会话续记-速度不生效排查）

- 用户反馈：修改 `fixedStepSec` 后体感速度未变化。
- 排查结论：
- 源码里 `fixedStepSec` 一度为异常值 `1.425`（非预期）
- 微信构建包仍是旧脚本（`build/wechatgame/assets/main/index.js` 中初始化值仍为 `0.0125`），未同步到最新源码
- 已完成修复：
- `GameController.fixedStepSec` 统一改回目标值 `0.025`
- 关卡加载日志增加 `fixedStepSec` 输出，便于真机日志确认当前生效参数
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步建议：
- 重新构建微信小游戏并清缓存后预览，确认日志打印 `fixedStepSec=0.025`。

### 2026-02-15（会话续记-速度倍率兜底）

- 用户反馈：浏览器预览中即使把 `fixedStepSec` 改到很大，体感移动速度仍无明显变化。
- 处理策略：
- 保留固定步进用于稳定模拟（`fixedStepSec` 回到 `0.0125`）
- 新增独立参数 `simulationSpeedScale` 控制模拟速度倍率，默认 `0.5`（整体慢一倍）
- 在 `update` 中使用 `simDt = dt * simulationSpeedScale` 驱动计时与模拟累积，确保预览体感直接受控
- 关卡加载日志同步输出 `fixedStepSec` 与 `speedScale`，便于确认实际生效值
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-15（会话续记-libVersion 反复报错兜底）

- 用户反馈：重新编译后再次出现 `project.config.json: libVersion 字段需为 string`。
- 排查结论：
- 构建流程会重写 `build/wechatgame/project.config.json`，并把 `libVersion` 写回 `\"game\"`，导致微信开发者工具再次报错。
- 已完成修复：
- `profiles/v2/packages/wechatgame.json` 增加 `libVersion: \"3.14.2\"`（构建参数侧兜底）
- 新增脚本 `tools/fix-wechat-config.mjs`，统一修复以下文件的 `libVersion` 为字符串版本：
- `project.config.json`
- `build/wechatgame/project.config.json`
- `project.private.config.json`
- `build/wechatgame/project.private.config.json`
- `package.json` 新增命令：`npm run fix:wechat-config`
- 已执行一次脚本，当前四个配置文件均为 `libVersion: \"3.14.2\"`
- 影响文件：
- `profiles/v2/packages/wechatgame.json`
- `tools/fix-wechat-config.mjs`
- `package.json`
- `project.config.json`
- `project.private.config.json`
- `build/wechatgame/project.config.json`
- `build/wechatgame/project.private.config.json`
- 验证结果：
- `npm run fix:wechat-config` 执行成功
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-角色贴地修复）

- 用户反馈：小人视觉上向下偏移，看起来没有站在地面上。
- 已完成修复：
- `TerrainDebugRenderer.drawAgent` 改为以脚底基线 `footY = agent.pos.y * cellSize + 0.5` 计算角色位置
- 身体、头部、出生脉冲统一按脚底基线重新布局，避免整体下沉
- 双腿终点改为直接落在 `footY`，不再使用旧的中心点下偏计算
- 本次仅改渲染锚点，未改模拟与碰撞逻辑
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 在浏览器与微信真机各验证一遍站姿；如仍有轻微视觉误差，再微调脚底偏移（`footY` 的 `+0.5`）。

### 2026-02-17（会话续记-挖洞细腻度建议，仅讨论）

- 用户询问：如何让挖洞像素更细腻。
- 本次结论（未改玩法代码）：
- 先调输入笔刷参数：`brushRadiusCells` 从 `2.4` 降到 `1.6~1.9`，`strokeSpacingCells` 从 `0.45` 降到 `0.2~0.3`，可明显减少“挖洞块感”。
- 若要进一步提升颗粒度，再调网格：将 `cellSize` 从 `4` 降到 `3` 或 `2`，并按比例提高 `cols/rows` 以保持世界物理尺寸不变（如 `90x180@4` -> `120x240@3`）。
- 影响文件（建议修改入口）：
- `assets/scripts/input/TerrainPainterInput.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 验证结果：
- 本次仅参数建议，无代码改动与测试执行。

### 2026-02-17（会话续记-土地像素感弱化）

- 用户澄清目标：不是继续细化挖掘单位，而是降低土地整体“像素块感”。
- 已完成修复（仅渲染层）：
- 将“已挖空土洞”从硬矩形改为圆角块绘制，减少洞口的方块边缘感。
- 新增 `drawSoilBoundarySmoothing`，对“实体土层与空洞/天空接壤边界”做圆角扩展平滑，视觉更接近连续土体。
- 物理网格、碰撞、挖填规则保持不变，保证玩法一致。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 在微信真机验证性能与观感；若边界仍偏硬，可再叠加一层低透明度土壤纹理噪声（仅视觉，不改逻辑网格）。

### 2026-02-17（会话续记-网格细化实改）

- 用户确认：改网格而不是只做视觉平滑。
- 已完成改动：
- 正式关卡两关从 `90x180@4` 调整为 `120x240@3`，保持世界物理尺寸（360x720）不变，同时提升网格分辨率。
- 出生点、终点按像素等比换算到新网格：
- `level_001`：spawn `10,164 -> 13,219`，goal `62,22,12,12 -> 83,29,16,16`
- `level_002`：spawn `74,164 -> 99,219`，goal `14,26,12,12 -> 19,35,16,16`
- 出生保护区按等比重建为约 `24x32px` 对应的新网格矩形（每关 `88` 格），持续防止管道口被误挖。
- `terrain` 结构同步重建为“顶部 40 行通道 + 下方 200 行可挖土层”。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 验证结果：
- 关卡结构检查通过（行列长度、出生点在通道、目标在土层）
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 微信真机重点验证触控手感与帧率；若需要更顺手，可在保持网格不变前提下微调 `brushRadiusCells/strokeSpacingCells`。

### 2026-02-17（会话续记-网格细化后 Graphics 溢出修复）

- 用户反馈：预览报错 `RangeError: Invalid typed array length`，栈定位到 `Graphics._uploadData`。
- 排查结论：
- 网格细化到 `120x240@3` 后，逐格 `rect/roundRect` 绘制导致单帧 Graphics 顶点量过大，引发 Web 预览渲染缓冲异常。
- 已完成修复（渲染层）：
- 土层绘制改为“按行合并连续区段（run-length）”而非逐格绘制，显著降低几何数量。
- 挖空洞绘制同样改为按行合并连续区段。
- 对细网格大地图增加平滑兜底：`cols*rows >= 28000 && cellSize <= 3` 时跳过边界圆角平滑，防止再次触发顶点溢出。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 在 Cocos 浏览器预览与微信真机各验证一次；若仍有性能压力，再将土层静态部分缓存为离屏纹理（仅角色/动态层实时绘制）。

### 2026-02-17（会话续记-进一步细化网格到 2px）

- 用户反馈：当前效果仍不够细腻，要求继续细化。
- 已完成改动：
- 正式关卡两关从 `120x240@3` 进一步升级到 `180x360@2`，保持世界尺寸 `360x720` 不变。
- 关键坐标按像素等比重建：
- `level_001`：spawn `20,328`，goal `124,44,24,24`
- `level_002`：spawn `148,328`，goal `28,52,24,24`
- 顶部通道保持 `120px`，对应新网格 `60` 行；其余为可挖土层。
- 出生保护区按 `24x32px` 对应新网格重建（每关 `192` 格）。
- 为保持步阶像素能力，`maxStepUpCells/maxStepDownCells` 从 `2` 调整为 `3`。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 验证结果：
- 关卡结构检查通过（世界尺寸、行列长度、出生点在通道、目标在土层）
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 在浏览器和微信真机验证手感与帧率；若挖掘过慢，可微调 `simulationSpeedScale` 或笔刷参数，不再回退网格。

### 2026-02-17（会话续记-小人视觉放大 1.5x）

- 用户需求：小人实际占位与贴图大小分离，视觉放大到 1.5 倍。
- 已完成改动：
- `TerrainDebugRenderer` 新增渲染参数 `agentVisualScale`，默认值 `1.5`。
- 小人高度计算改为 `agentHeightCells * agentVisualScale`，仅影响渲染尺寸，不影响碰撞体占位。
- 出生脉冲半径同步使用视觉缩放后的高度，保证观感一致。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 如需继续放大/缩小，直接在 Inspector 调整 `agentVisualScale`；碰撞占位保持由 `simulationRules.agentCollisionWidthCells/HeightCells` 控制。

### 2026-02-17（会话续记-跌落死亡规则查询，仅讨论）

- 用户询问：当前小人跌落多少会死亡。
- 查询结论（无代码改动）：
- 两关当前配置均为 `maxSafeFallCells = -1`、`outOfBoundsKillY = -1`。
- 含义是：不启用“跌落格数上限死亡”；只有掉出地图底部（`y <= -1`）才会死亡。
- 参考文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `assets/scripts/sim/GameSimulator.ts`

### 2026-02-17（会话续记-配置文件注释说明）

- 用户需求：在配置文件添加注释，说明“修改后会对什么生效”。
- 已完成改动：
- 在两关配置文件新增 `_comment` 与 `_effectGuide` 字段（JSON 合法字段，不影响解析）。
- `_effectGuide` 覆盖关键可调项的生效范围：网格分辨率、碰撞占位、步阶、跌落死亡、出界死亡、出生参数、终点参数、保护区、地形字符语义。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 验证结果：
- `npm run test:replay` 5/5 通过
- 下一步计划：
- 若你希望注释更精简，可只保留 `_comment` 和你常改的 3~5 个字段说明。

### 2026-02-17（会话续记-maxSafeFallCells 生效优先级说明，仅讨论）

- 用户问题：`maxSafeFallCells` 在多处出现，哪个会生效。
- 结论（无代码改动）：
- 运行时优先读取“当前加载关卡”的 `simulationRules.maxSafeFallCells`。
- 若关卡未配置该字段，才回退到 `DEFAULT_SIMULATION_RULES.maxSafeFallCells`。
- `tools/baselines/*.json` 与 `tools/replay-baselines.mjs` 仅用于回放测试，不影响游戏运行。
- `docs/*` 与关卡里的 `_effectGuide` 仅文档说明，不参与逻辑。
- 参考文件：
- `assets/scripts/controllers/GameController.ts`
- `assets/scripts/core/LevelLoader.ts`
- `assets/scripts/core/GameTypes.ts`

### 2026-02-17（会话续记-统一改为 5 格跌落致死）

- 用户需求：每关都改成“5 格跌落死亡”。
- 已完成改动：
- 将正式关卡的 `simulationRules.maxSafeFallCells` 统一从 `-1` 改为 `5`。
- 同步更新了 `assets/levels` 下的镜像关卡，避免同名配置造成误解。
- 生效含义：连续下落 `> 5` 格时死亡（即第 6 格触发）。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `assets/levels/level_001.json`
- `assets/levels/level_002.json`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-跌落 11 格与出生高度调整）

- 用户需求：
- 出生管道样式优化。
- 跌落死亡阈值改为 11。
- 出生点到地面的落差改为 8 格。
- 已完成改动：
- 运行关卡（`assets/resources/levels`）中 `maxSafeFallCells` 已改为 `11`。
- 同步更新镜像关卡（`assets/levels`）的 `maxSafeFallCells`，避免多份配置混淆。
- 运行关卡出生点 `spawn.position.y` 从 `328` 调整为 `308`，并将 `protectedCells` 整体下移 `20` 格以保持出生区保护范围。
- 校验结果：当前地表可站立层 `y=300`，出生 `y=308`，实际下落 `8` 格到地面。
- `TerrainDebugRenderer` 中出生管道重绘为加厚金属风格（管身高光、口沿、开口与铆钉），替换旧简化样式。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `assets/levels/level_001.json`
- `assets/levels/level_002.json`
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- 关卡参数校验通过（出生到地面落差 8 格）
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-跌落死亡改为落地判定）

- 用户需求：超过跌落阈值时不要在空中立刻死亡，改为“落地时再判定死亡”。
- 已完成改动：
- `GameSimulator` 新增 `resolveLanding`，仅在“本帧未继续下落且有累计 fallCells”时执行阈值判定。
- `tryGravityStep` 中移除了 `maxSafeFallCells` 的即时死亡判定，保留 `outOfBoundsKillY` 的即时判定。
- 横移步阶（step up/down）不再直接清空 `fallCells`，统一交由落地结算逻辑处理，避免空中落地绕过判定。
- 回放脚本 `tools/replay-baselines.mjs` 同步相同语义，确保测试模型与运行时一致。
- 关卡 `_effectGuide` 中 `simulationRules.maxSafeFallCells` 说明已更新为“落地时判定”。
- 影响文件：
- `assets/scripts/sim/GameSimulator.ts`
- `tools/replay-baselines.mjs`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-出生管道改为马里奥风）

- 用户需求：出生管道贴图太丑，希望换成马里奥管道风格。
- 已完成改动：
- 在 `TerrainDebugRenderer` 中将原灰色金属管改为绿色马里奥风格原创重绘（管身底色、左高光、右阴影、亮绿色管口与内阴影）。
- 保持原有几何锚点与出生脉冲逻辑，不改玩法行为。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-管道宽度改为人物 3 倍）

- 用户需求：管道太窄，宽度改为人物的 3 倍。
- 已完成改动：
- 出生管道宽度不再使用固定值，改为按“人物视觉宽度 * 3”动态计算。
- 管口宽度同步基于管身宽度计算，保持比例协调。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-隐藏顶部三个按钮）

- 用户需求：顶部三个按钮（Dig / Fill / Restart）先隐藏。
- 已完成改动：
- `GameController` 新增运行时开关 `showTopButtons`（默认 `false`）。
- `ButtonGroup` 根据该开关控制 `active`，关闭时不再创建/显示顶部三个按钮。
- 按钮逻辑代码保留，后续若要恢复只需把 `showTopButtons` 设为 `true`。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-微信上传 libVersion 报错修复）

- 用户反馈：微信开发者工具上传时报错 `project.config.json: libVersion 字段需为 string`。
- 排查结果：
- `build/wechatgame/project.config.json` 的 `libVersion` 曾被构建过程写成 `\"game\"`，导致上传校验失败。
- 已完成修复：
- 执行 `npm run fix:wechat-config`，将以下四个文件统一修正为字符串版本号 `\"3.14.2\"`：
- `project.config.json`
- `project.private.config.json`
- `build/wechatgame/project.config.json`
- `build/wechatgame/project.private.config.json`
- 为防止后续构建再次覆盖，在 `profiles/v2/packages/wechatgame.json` 的任务配置与 options 中补充 `libVersion: \"3.14.2\"`。
- 影响文件：
- `profiles/v2/packages/wechatgame.json`
- 验证结果：
- 四个配置文件的 `libVersion` 均已确认为 `string` 类型且值为 `\"3.14.2\"`。

### 2026-02-17（会话续记-终点改为 12x12 且置于 24x16 挖空区）

- 用户需求：终点改成 `12x12` 贴图，且终点被一个 `24x16` 的挖空区域包含。
- 已完成改动：
- 运行关卡（`assets/resources/levels`）中：
- `goal` 改为 `6x6` 格（`cellSize=2`），即 `12x12 px`。
- 在终点周围创建 `12x8` 格挖空区（`24x16 px`），并确保完全包含终点。
- 同步更新 `assets/levels` 镜像关卡为同像素规格（`cellSize=4` 下对应 `goal=3x3`、挖空区 `6x4`）。
- 终点标记渲染尺寸改为优先跟随 `goal` 区域，保证视觉尺寸与配置一致。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `assets/levels/level_001.json`
- `assets/levels/level_002.json`
- `assets/scripts/render/TerrainDebugRenderer.ts`
- 验证结果：
- 自动校验通过（两关均为 `goal=12x12 px`，挖空区 `24x16 px`，且 `contains=true`）
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-终点像素尺寸查询，仅讨论）

- 用户询问：当前终点占多少像素。
- 查询结论：
- 运行关卡（`assets/resources/levels`）两关终点均为 `24x24` 格，`cellSize=2`，因此终点尺寸为 `48x48` 像素（面积 `2304 px²`）。
- 旧镜像关卡（`assets/levels`）终点为 `16x16` 格，`cellSize=4`，因此是 `64x64` 像素（面积 `4096 px²`）。
- 本次仅查询，无代码改动。

### 2026-02-17（会话续记-参数化地形 + 自动生成 terrain）

- 用户需求：采用“参数化地形 + 自动生成 terrain”替代逐行字符串手写。
- 已完成改动：
- `LevelLoader` 新增 `terrainTemplate` 支持，并保留旧 `terrain` 兼容：
- 支持 `terrainTemplate.kind = \"layered\"`
- 支持 `topAirRows`（顶部空气层）
- 支持 `carveEditableRects`（生成后改为 `o`）
- 支持 `forceSolidRects` / `forceSkyRects`（可选覆盖）
- 运行关卡 `assets/resources/levels/level_001.json`、`level_002.json` 已迁移为 `terrainTemplate`，删除了大段 `terrain` 字符串。
- 同步更新关卡内 `_effectGuide`，新增 `terrainTemplate` 字段说明。
- 文档同步：
- `docs/level-json-format.md` 改为推荐 `terrainTemplate` 写法，`terrain` 标注为旧格式兼容。
- `docs/GameSpec.md` 增加参数化地形说明。
- 影响文件：
- `assets/scripts/core/LevelLoader.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 验证结果：
- 运行关卡检查通过（已无 `terrain`，存在 `terrainTemplate`）。
- `npm run test:replay` 5/5 通过。
- 备注：
- 由于项目未安装 TypeScript CLI，未执行 `tsc --noEmit`（`npx tsc` 提示未安装）。

### 2026-02-17（会话续记-terrain 方案讨论，仅讨论）

- 用户反馈：`terrain` 逐行字符串方式不够优雅，询问是否有替代方案。
- 本次结论（无代码改动）：
- 建议后续改为“参数化地形描述 + 构建期生成 terrain”：
- 用结构化字段描述基础土层与挖空区（如 `baseSoilTopY`、`voidRects`、`protectedRects`）。
- 在加载前统一展开成当前 `terrain` 网格，兼容现有模拟逻辑。
- 优点：配置更短、更直观、更易维护，且不破坏现有玩法代码。

### 2026-02-17（会话续记-参数化地形正式落地）

- 用户确认采用“参数化地形 + 自动生成 terrain”。
- 已完成改动：
- `LevelLoader` 支持 `terrainTemplate` 自动展开（并保留旧 `terrain` 兼容）：
- 新增 `kind: layered` 生成器
- 支持 `topAirRows`
- 支持 `carveEditableRects`（生成 `o`）
- 支持 `forceSolidRects` / `forceSkyRects`（可选覆盖）
- 运行关卡已迁移为模板格式：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 两关移除了大段 `terrain` 字符串，改为 `terrainTemplate` 参数配置。
- 文档已同步更新：
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 影响文件：
- `assets/scripts/core/LevelLoader.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 验证结果：
- 关卡 JSON 检查通过（已无 `terrain`、模板参数完整）
- `npm run test:replay` 5/5 通过
- 附注：
- 本地未安装 TypeScript CLI，`npx tsc --noEmit` 未执行成功（提示未安装 `typescript`）。

### 2026-02-17（会话续记-protectedCells 升级为参数化矩形）

- 用户需求：将 `protectedCells` 升级成参数化矩形。
- 已完成改动：
- `LevelLoader` 新增 `protectedRects` 支持，并与旧 `protectedCells` 合并去重：
- 关卡可同时写 `protectedRects` 与 `protectedCells`
- 加载时统一展开为最终受保护格列表
- `protectedRects` 超界部分自动裁剪到地图范围
- 运行关卡已迁移到矩形写法，移除逐格 `protectedCells`：
- `assets/resources/levels/level_001.json` -> `protectedRects: [{ x: 16, y: 308, width: 12, height: 16 }]`
- `assets/resources/levels/level_002.json` -> `protectedRects: [{ x: 144, y: 308, width: 12, height: 16 }]`
- 文档已同步：
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 影响文件：
- `assets/scripts/core/LevelLoader.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 验证结果：
- `npm run test:replay` 5/5 通过

### 2026-02-17（会话续记-终点大小与贴图替换咨询，仅讨论）

- 用户询问：调整终点大小应修改哪个字段，以及如何更换终点贴图。
- 结论（无代码改动）：
- 运行关卡请修改 `assets/resources/levels/*.json` 中 `goal.width / goal.height`（单位是格，像素 = 格数 * `gridSize.cellSize`）。
- 当前终点视觉由 `TerrainDebugRenderer.drawGoalMarker` 用 Graphics 绘制，不是 Sprite 贴图；要换贴图需改为 Sprite 节点渲染方案。

### 2026-02-17（会话续记-关卡数据源合并为单源）

- 用户需求：`assets/resources/levels` 与 `assets/levels` 合并，只保留一个数据源。
- 已完成改动：
- 保留 `assets/resources/levels` 作为唯一运行关卡源。
- 删除冗余镜像目录 `assets/levels` 与 `assets/levels.meta`，避免双份配置继续漂移。
- 文档同步改为单源口径（接入步骤与任务文档均指向 `assets/resources/levels`）。
- 影响文件：
- `README.md`
- `docs/first-level-tasks.md`
- `docs/PROJECT_PROGRESS.md`
- 删除文件：
- `assets/levels.meta`
- `assets/levels/level_001.json`
- `assets/levels/level_001.json.meta`
- `assets/levels/level_002.json`
- `assets/levels/level_002.json.meta`

### 2026-02-17（会话续记-终点贴图替换为 goal.png）

- 用户需求：将终点贴图替换为 `assets/images/goal.png`。
- 已完成改动：
- `GameController` 新增终点 Sprite 渲染链路：
- 新增开关 `useGoalSprite`（默认 `true`）
- 新增资源路径 `goalSpriteResourcePath`（默认 `images/goal/spriteFrame`）
- 关卡加载时自动创建/更新 `GoalSprite` 节点，并按 `goal.width/height * cellSize` 设置显示尺寸
- 终点贴图加载成功后自动隐藏 `TerrainDebugRenderer` 中的门形 marker；加载失败自动回退 marker
- 将 `assets/images/goal.png` 同步到 `assets/resources/images/goal.png`，用于运行时 `resources.load`。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `assets/resources/images/goal.png`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。
- 说明：
- 若 Cocos 资源面板未立即显示 `assets/resources/images/goal.png`，在编辑器中执行一次资源刷新或重开项目即可。

### 2026-02-18（会话续记-清理未使用终点源文件）

- 用户需求：清理用不上的源文件。
- 已完成改动：
- 删除重复资源目录 `assets/images`（含 `goal.png` 及其 `.meta`）。
- 保留唯一运行资源 `assets/resources/images/goal.png`（及其 `.meta`），继续由 `GameController.goalSpriteResourcePath = images/goal/spriteFrame` 加载。
- 影响文件：
- 删除文件：
- `assets/images.meta`
- `assets/images/goal.png`
- `assets/images/goal.png.meta`
- `docs/PROJECT_PROGRESS.md`

### 2026-02-18（会话续记-终点透明区域显示为白色问题定位，仅排查）

- 用户问题：原图有透明区域，但游戏中显示为白色。
- 排查结论（无代码改动）：
- 检查 `assets/resources/images/goal.png` 的 alpha 数据后确认：该图虽然是 RGBA，但 alpha 通道全为 `255`（2048/2048 像素均不透明）。
- 因此白色区域并非“透明被渲染错误”，而是贴图本身就是不透明白底。
- 验证命令（本地已执行）：
- `python3 - <<'PY' ... Image.open(...).convert('RGBA') ... alpha 统计 ... PY`
- 输出要点：`unique alpha 1`、`a0 0`、`a255 2048`。

### 2026-02-18（会话续记-终点贴图引用切换为 goal_house_transparent_80k）

- 用户需求：将 `goal.png` 的引用切换为 `goal_house_transparent_80k.png`。
- 已完成改动：
- `GameController.goalSpriteResourcePath` 默认值从 `images/goal/spriteFrame` 改为 `images/goal_house_transparent_80k/spriteFrame`。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-预览仍显示旧终点贴图修复）

- 用户问题：资源已导入但预览仍未显示新图。
- 根因修复：
- `GameController` 增加“终点贴图路径变更检测”，当路径变化时强制丢弃旧缓存并重新 `resources.load`，避免预览热更新沿用旧 `SpriteFrame`。
- 增加旧路径自动迁移：若检测到历史路径 `images/goal/spriteFrame`，自动切换到 `images/goal_house_transparent_80k/spriteFrame`。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-按图片尺寸重调终点显示大小）

- 用户需求：根据新终点图片尺寸重新调整场景中显示大小。
- 已完成改动：
- `GameController` 新增 `goalSpriteLongSideScale`（默认 `2`），用于控制终点贴图在场景中的长边缩放倍率。
- 终点贴图尺寸计算改为：
- 读取原图尺寸（`SpriteFrame.originalSize`）
- 保持原始宽高比
- 以“目标区长边 × `goalSpriteLongSideScale`”为显示长边进行缩放
- 这样可避免大图被压成正方形，视觉尺寸与图片比例一致。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-goalSpriteLongSideScale 调整后观感不变修复）

- 用户问题：把 `goalSpriteLongSideScale` 调成 `0.5`，场景内看起来没有变化。
- 原因与修复：
- 原因 1：旧实现里终点高亮框（固定按 `goal.width/height`）始终显示，容易掩盖 Sprite 尺寸变化。
- 原因 2：`goalSpriteLongSideScale` 改动时不是每帧重算，运行中调整不够直观。
- 修复：
- `TerrainDebugRenderer` 新增 `showGoalArea`，并将目标高亮框绘制改为可开关。
- `GameController` 在终点 Sprite 加载成功时，自动关闭 `showGoalMarker` 与 `showGoalArea`；加载失败时恢复。
- `GameController.drawFrame` 增加终点 Sprite 尺寸实时更新（运行中改倍率可见）。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-终点尺寸未生效深度排查与强兜底）

- 用户问题：`goalSpriteLongSideScale` 调整后仍看不出变化。
- 深排结论与修复：
- `goalSpriteResourcePath` 改为基路径 `images/goal_house_transparent_80k`，避免仅依赖单一路径格式。
- 终点贴图加载改为多路径尝试（按顺序）：
- `<path>`
- `<path>/spriteFrame`
- 若传入本身是 `/spriteFrame`，再回退尝试去后缀路径
- 路径历史兼容：若检测到旧值 `images/goal` 或 `images/goal/spriteFrame`，自动迁移到 `images/goal_house_transparent_80k`。
- 新增调试日志开关 `goalSpriteDebugLog`（默认 `true`）：
- 贴图加载成功打印 `path` 与原图尺寸
- 尺寸更新打印 `goalSpriteLongSideScale` 与当前实际显示尺寸（像素）
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-场景实例值覆盖默认值修复）

- 用户问题：日志持续显示 `scale=2.0000`，与代码默认 `0.5` 不一致。
- 根因：Cocos 场景中的组件实例值会覆盖脚本默认值；仅改 `GameController.ts` 默认值不会自动覆盖已有场景实例。
- 已完成改动：
- 在 `assets/scene.scene` 的 `GameController` 组件实例上显式写入：
- `goalSpriteResourcePath = "images/goal_house_transparent_80k"`
- `goalSpriteLongSideScale = 0.5`
- `goalSpriteDebugLog = true`
- 同时显式写入 `showTopButtons=false`、`useGoalSprite=true`，避免实例与代码默认漂移。
- 影响文件：
- `assets/scene.scene`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-恢复终点缩放为可配置）

- 用户反馈：上一版像是把终点缩放“写死为 0.5”，改成 2 也不生效。
- 已完成改动：
- 删除 `assets/scene.scene` 中对 `goalSpriteLongSideScale/goalSpriteResourcePath/useGoalSprite` 的强制实例写入，避免固定覆盖。
- 保持脚本默认值 `goalSpriteLongSideScale = 2`，并允许在 Inspector 正常修改。
- 新增运行时配置日志 `[终点配置] ... scale=...`，每次关卡加载会打印当前实例实际值，便于确认“改值是否生效”。
- 影响文件：
- `assets/scene.scene`
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-终点逻辑区与贴图尺寸解耦）

- 用户需求：终点贴图与关卡 `goal` 逻辑区分开配置。
- 已完成改动：
- `GameController` 新增终点贴图尺寸模式：
- `goalSpriteUseFixedPixelSize`（默认 `true`）：启用固定像素尺寸模式（与 `goal.width/height` 解耦）
- `goalSpriteWidthPx`（默认 `64`）
- `goalSpriteHeightPx`（默认 `56`）
- 旧参数 `goalSpriteLongSideScale` 保留为兼容模式使用（`goalSpriteUseFixedPixelSize=false` 时生效）。
- 运行时日志增强：
- `[终点配置]` 新增 `mode`、`fixed=宽x高`
- `[终点尺寸]` 新增 `mode`、`fixed=宽x高`
- 当前默认行为：
- 终点逻辑判定仍由关卡 JSON 的 `goal` 控制；
- 终点贴图显示大小默认由 `goalSpriteWidthPx/goalSpriteHeightPx` 控制，不再随 `goal.width/height` 改变。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-终点贴图与逻辑区改为关卡 JSON 配置）

- 用户需求：
- 终点贴图参数与终点逻辑区都通过关卡 JSON 配置；
- 终点逻辑区支持可配置调试颜色（方便调试）。
- 已完成改动：
- `LevelLoader` 新增解析：
- `goalVisual`：`spritePath/useFixedPixelSize/widthPx/heightPx/longSideScale`
- `goalDebug`：`showArea/fillRgba/strokeRgba`
- 兼容写法：`goalDebug` 可写在根字段，也可写在 `goal.debug`（根字段优先）。
- `LevelConfig` 新增 `goalVisual` 与 `goalDebug` 类型字段与默认值。
- `GameController` 每次加载关卡时读取并应用 `goalVisual`：
- 终点贴图路径、固定像素尺寸、或按逻辑区倍率缩放都可按关卡独立配置。
- `TerrainDebugRenderer` 支持按关卡应用终点逻辑区调试样式：
- `showArea` 开关
- `fillRgba` 填充色
- `strokeRgba` 描边色
- 两个运行关卡已补齐示例配置：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 文档同步：
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 影响文件：
- `assets/scripts/core/GameTypes.ts`
- `assets/scripts/core/LevelLoader.ts`
- `assets/scripts/controllers/GameController.ts`
- `assets/scripts/render/TerrainDebugRenderer.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-goalDebug 层级提升到 goalVisual 之上）

- 用户需求：`goalDebug` 应显示在 `goalVisual` 上层，避免被终点贴图覆盖。
- 已完成改动：
- `GameController` 新增独立覆盖层节点 `GoalDebugOverlay`（`Graphics`），专门绘制 `goalDebug`。
- 覆盖层每帧强制设置为 `GameRoot` 最后一个子节点（最高同级渲染顺序），确保在 `GoalSprite` 上方。
- `TerrainDebugRenderer` 内部的 `goal area` 绘制在运行时关闭，避免与覆盖层重复绘制。
- 终点调试区颜色继续来自关卡 JSON 的 `goalDebug.fillRgba/strokeRgba`。
- 影响文件：
- `assets/scripts/controllers/GameController.ts`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-goal 与 goalVisual 位置独立配置）

- 用户需求：终点逻辑区位置（`goal`）和终点贴图位置（`goalVisual`）分开独立配置。
- 已完成改动：
- `goalVisual` 新增位置参数（关卡 JSON）：
- `positionMode`: `goal-center` | `absolute-cell`
- `positionCell`: `{ x, y }`（单位：格，贴图中心坐标）
- 行为：
- `positionMode=goal-center`：贴图中心跟随 `goal` 中心（兼容旧行为）
- `positionMode=absolute-cell`：贴图中心使用 `goalVisual.positionCell`，与 `goal` 彻底解耦
- `LevelLoader` 已新增字段解析与校验，`LevelConfig.goalVisual` 同步扩展类型。
- `GameController` 贴图定位逻辑已按新字段计算。
- 两个运行关卡已补齐示例字段（当前都设为 `goal-center`，以保持现有关卡观感不变）。
- 文档同步：
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- 影响文件：
- `assets/scripts/core/GameTypes.ts`
- `assets/scripts/core/LevelLoader.ts`
- `assets/scripts/controllers/GameController.ts`
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `docs/level-json-format.md`
- `docs/GameSpec.md`
- `docs/PROJECT_PROGRESS.md`
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。

### 2026-02-18（会话续记-已挖土地颜色调整）

- 用户需求：将“被挖过的土地”颜色改为 `#5c1b01`。
- 已完成改动：
- `TerrainDebugRenderer.drawEditableHoleRuns` 的填充色由 `Color(36, 130, 24, 255)` 调整为 `Color(92, 27, 1, 255)`（即 `#5c1b01`）。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- `docs/PROJECT_PROGRESS.md`

### 2026-02-18（会话续记-levels 目录新增 JSON 配置说明）

- 用户需求：将关卡 JSON 的配置方法整理成一个 `md`，放在 JSON 同级目录。
- 已完成改动：
- 新增 `assets/resources/levels/LEVEL_JSON_CONFIG.md`。
- 文档包含：
- 坐标与单位说明
- 最小可用 JSON 结构
- 常改字段（spawn/goal/goalVisual/goalDebug/terrainTemplate/protectedRects）
- 常见修改入口与排查建议
- 影响文件：
- `assets/resources/levels/LEVEL_JSON_CONFIG.md`
- `docs/PROJECT_PROGRESS.md`

### 2026-02-18（会话续记-删除关卡内 _effectGuide）

- 用户需求：删除关卡 JSON 中的 `_effectGuide` 字段。
- 已完成改动：
- 从运行关卡配置移除 `_effectGuide`：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- 保留 `_comment` 及所有实际生效字段不变。
- 配置说明统一由同级文档维护：
- `assets/resources/levels/LEVEL_JSON_CONFIG.md`
- 验证结果：
- 两关 JSON 语法校验通过（`JSON.parse`）。
- 影响文件：
- `assets/resources/levels/level_001.json`
- `assets/resources/levels/level_002.json`
- `docs/PROJECT_PROGRESS.md`

### 2026-02-18（会话续记-人物层级提升到终点贴图上方）

- 用户需求：人物模型显示在终点贴图（`GoalSprite`）上面。
- 已完成改动：
- `TerrainDebugRenderer` 新增独立人物覆盖层 `AgentOverlay`（子节点 + `Graphics`）。
- 地形/管道/终点调试区继续在主 `graphics` 绘制；人物改为在 `AgentOverlay` 单独绘制。
- 每帧将 `AgentOverlay` 置为当前最高 sibling，确保人物在 `GoalSprite` 之上。
- `GoalDebugOverlay` 仍由 `GameController` 每帧置顶，因此调试框继续在最上层（不受影响）。
- 验证结果：
- `npm run test:replay` 5/5 通过（玩法逻辑无回归）。
- 影响文件：
- `assets/scripts/render/TerrainDebugRenderer.ts`
- `docs/PROJECT_PROGRESS.md`
