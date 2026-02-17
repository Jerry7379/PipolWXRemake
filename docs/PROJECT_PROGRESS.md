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
