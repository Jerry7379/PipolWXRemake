import {
  _decorator,
  BlockInputEvents,
  Color,
  Component,
  Graphics,
  JsonAsset,
  Label,
  Node,
  UITransform,
  Vec3,
  Widget,
  log,
  resources,
  warn,
} from 'cc';
import { loadLevelConfig } from '../core/LevelLoader';
import { TerrainGrid } from '../core/TerrainGrid';
import { LevelConfig, ToolMode } from '../core/GameTypes';
import { TerrainDebugRenderer } from '../render/TerrainDebugRenderer';
import { GameSimulator } from '../sim/GameSimulator';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
  @property(JsonAsset)
  levelJson: JsonAsset | null = null;

  @property
  levelResourcePath = 'levels/level_001';

  @property([String])
  levelResourcePaths: string[] = ['levels/level_001', 'levels/level_002'];

  @property(TerrainDebugRenderer)
  renderer: TerrainDebugRenderer | null = null;

  @property
  autoWireDependencies = true;

  @property
  autoFitToLevel = true;

  @property
  autoCreateRuntimeUI = true;

  @property
  fixedStepSec = 0.0125;

  @property
  printStatsIntervalSec = 1.0;

  private _toolMode: ToolMode = ToolMode.Dig;
  private _levelAsset: JsonAsset | null = null;
  private _level: LevelConfig | null = null;
  private _terrain: TerrainGrid | null = null;
  private _sim: GameSimulator | null = null;
  private _levelCache = new Map<string, JsonAsset>();
  private _currentLevelIndex = 0;
  private _levelTimeLeft = 0;
  private _acc = 0;
  private _statsTimer = 0;
  private _ended = false;
  private _ready = false;
  private _uiRoot: Node | null = null;
  private _hudLabel: Label | null = null;
  private _resultPanel: Node | null = null;
  private _resultLabel: Label | null = null;

  get cellSize(): number {
    return this._terrain?.cellSize ?? 0;
  }

  onLoad(): void {
    void this.bootstrap();
  }

  async restartLevel(): Promise<void> {
    const ok = await this.loadCurrentLevel();
    if (ok) {
      log(`[重开] 第 ${this._currentLevelIndex + 1} 关`);
    }
  }

  async nextLevel(): Promise<void> {
    if (this.levelJson) {
      await this.restartLevel();
      return;
    }

    if (!this.hasNextLevel()) {
      log('[关卡] 已是最后一关');
      return;
    }

    this._currentLevelIndex += 1;
    const ok = await this.loadCurrentLevel();
    if (ok) {
      log(`[关卡] 进入第 ${this._currentLevelIndex + 1} 关`);
    }
  }

  private async bootstrap(): Promise<void> {
    if (this.autoWireDependencies) {
      this.wireDependencies();
    }

    const ok = await this.loadCurrentLevel();
    if (!ok) {
      warn('[启动失败] 请绑定 GameController.levelJson 或确保 resources/levels 下有关卡 JSON');
      return;
    }
  }

  private wireDependencies(): void {
    if (!this.renderer) {
      this.renderer = this.getComponent(TerrainDebugRenderer) ?? this.addComponent(TerrainDebugRenderer);
    }

    const painter =
      (this.getComponent('TerrainPainterInput') as Component | null) ??
      this.addComponent('TerrainPainterInput');
    if (painter && !(painter as any).controller) {
      (painter as any).controller = this;
    }
  }

  private async loadCurrentLevel(): Promise<boolean> {
    let asset: JsonAsset | null = null;

    if (this.levelJson) {
      asset = this.levelJson;
    } else {
      const path = this.getCurrentLevelPath();
      if (!path) {
        return false;
      }
      asset = await this.resolveLevelAsset(path);
    }

    if (!asset) {
      return false;
    }

    this.setupLevel(asset);
    return true;
  }

  private getCurrentLevelPath(): string {
    if (this.levelResourcePaths.length > 0) {
      return this.levelResourcePaths[this._currentLevelIndex] ?? '';
    }
    return this.levelResourcePath;
  }

  private hasNextLevel(): boolean {
    if (this.levelJson) {
      return false;
    }
    return this._currentLevelIndex < this.levelResourcePaths.length - 1;
  }

  private getLevelProgressText(): string {
    if (this.levelJson) {
      return this._level?.id ?? 'single';
    }
    const total = this.levelResourcePaths.length;
    const index = this._currentLevelIndex + 1;
    return `${index}/${Math.max(total, 1)}`;
  }

  private async resolveLevelAsset(path: string): Promise<JsonAsset | null> {
    if (this._levelCache.has(path)) {
      return this._levelCache.get(path) ?? null;
    }

    return await new Promise((resolve) => {
      resources.load(path, JsonAsset, (err, asset) => {
        if (err || !asset) {
          warn(`[关卡加载失败] resources/${path}，${err?.message ?? 'asset 为空'}`);
          resolve(null);
          return;
        }
        this._levelCache.set(path, asset);
        resolve(asset);
      });
    });
  }

  private setupLevel(asset: JsonAsset): void {
    this._levelAsset = asset;
    this._level = loadLevelConfig(asset);
    this._terrain = new TerrainGrid(this._level);
    const spawnW = Math.max(1, Math.floor(this._level.simulationRules.agentCollisionWidthCells));
    const spawnH = Math.max(1, Math.floor(this._level.simulationRules.agentCollisionHeightCells));
    let spawnBlocked = false;
    for (let dy = 0; dy < spawnH; dy += 1) {
      for (let dx = 0; dx < spawnW; dx += 1) {
        const x = this._level.spawn.position.x + dx;
        const y = this._level.spawn.position.y + dy;
        if (!this._terrain.inBounds(x, y) || this._terrain.isSolid(x, y)) {
          spawnBlocked = true;
          break;
        }
      }
      if (spawnBlocked) {
        break;
      }
    }
    if (spawnBlocked) {
      warn(
        `[关卡配置错误] 出生区域被地形占用 id=${this._level.id} spawn=(${this._level.spawn.position.x},${this._level.spawn.position.y}) size=${spawnW}x${spawnH}`,
      );
    }
    this._sim = new GameSimulator(this._level, this._terrain);
    this._toolMode = ToolMode.Dig;
    this._levelTimeLeft = this._level.timeLimitSec;
    this._acc = 0;
    this._statsTimer = 0;
    this._ended = false;
    this._ready = true;

    if (this.autoFitToLevel) {
      this.fitNodeToLevel();
    }

    if (this.renderer) {
      this.renderer.setCellSize(this._level.gridSize.cellSize);
      this.renderer.setAgentCollisionFootprint(
        this._level.simulationRules.agentCollisionWidthCells,
        this._level.simulationRules.agentCollisionHeightCells,
      );
      this.drawFrame();
    }

    if (this.autoCreateRuntimeUI) {
      this.ensureRuntimeUI();
      this.hideResultPanel();
      this.refreshHud();
    }

    log(`[关卡加载] ${this._level.id} ${this._level.name}`);
  }

  private fitNodeToLevel(): void {
    if (!this._level) {
      return;
    }
    const ui = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    const width = this._level.gridSize.cols * this._level.gridSize.cellSize;
    const height = this._level.gridSize.rows * this._level.gridSize.cellSize;

    ui.setAnchorPoint(0, 0);
    ui.setContentSize(width, height);
    if (this.node.parent) {
      this.node.setPosition(new Vec3(-width * 0.5, -height * 0.5, 0));
    }
  }

  private drawFrame(): void {
    if (!this._level || !this._terrain || !this._sim || !this.renderer) {
      return;
    }
    this.renderer.draw(this._terrain, this._sim.getAgents(), this._level.goal, this._level.spawn);
  }

  private ensureRuntimeUI(): void {
    const canvas = this.node.parent;
    if (!canvas) {
      return;
    }

    let root = canvas.getChildByName('RuntimeUI');
    if (!root) {
      root = new Node('RuntimeUI');
      canvas.addChild(root);
    }
    root.layer = canvas.layer;
    this._uiRoot = root;

    const rootTransform = root.getComponent(UITransform) ?? root.addComponent(UITransform);
    const canvasTransform = canvas.getComponent(UITransform);
    if (canvasTransform) {
      rootTransform.setContentSize(canvasTransform.width, canvasTransform.height);
    }

    const rootWidget = root.getComponent(Widget) ?? root.addComponent(Widget);
    rootWidget.isAlignLeft = true;
    rootWidget.isAlignRight = true;
    rootWidget.isAlignTop = true;
    rootWidget.isAlignBottom = true;
    rootWidget.left = 0;
    rootWidget.right = 0;
    rootWidget.top = 0;
    rootWidget.bottom = 0;

    this.ensureHudLabel(root);
    this.ensureButtons(root);
    this.ensureResultPanel(root);
  }

  private ensureHudLabel(root: Node): void {
    let labelNode = root.getChildByName('HudLabel');
    if (!labelNode) {
      labelNode = new Node('HudLabel');
      root.addChild(labelNode);
    }
    labelNode.layer = root.layer;

    const transform = labelNode.getComponent(UITransform) ?? labelNode.addComponent(UITransform);
    transform.setContentSize(780, 36);

    const widget = labelNode.getComponent(Widget) ?? labelNode.addComponent(Widget);
    widget.isAlignLeft = true;
    widget.isAlignTop = true;
    widget.left = 16;
    widget.top = 14;

    const label = labelNode.getComponent(Label) ?? labelNode.addComponent(Label);
    label.useSystemFont = true;
    label.fontSize = 20;
    label.lineHeight = 26;
    label.horizontalAlign = Label.HorizontalAlign.LEFT;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.color = new Color(245, 245, 245, 255);
    this._hudLabel = label;
  }

  private ensureButtons(root: Node): void {
    let group = root.getChildByName('ButtonGroup');
    if (!group) {
      group = new Node('ButtonGroup');
      root.addChild(group);
    }
    group.layer = root.layer;

    const transform = group.getComponent(UITransform) ?? group.addComponent(UITransform);
    transform.setContentSize(360, 48);

    const widget = group.getComponent(Widget) ?? group.addComponent(Widget);
    widget.isAlignRight = true;
    widget.isAlignTop = true;
    widget.right = 16;
    widget.top = 10;

    this.ensureButton(group, 'BtnDig', 'Dig', -120, new Color(58, 126, 237, 255), this.onClickDig);
    this.ensureButton(group, 'BtnFill', 'Fill', 0, new Color(238, 162, 57, 255), this.onClickFill);
    this.ensureButton(group, 'BtnRestart', 'Restart', 120, new Color(223, 87, 87, 255), this.onClickRestart);
  }

  private ensureButton(
    parent: Node,
    name: string,
    text: string,
    x: number,
    color: Color,
    onClick: () => void,
  ): void {
    let buttonNode = parent.getChildByName(name);
    if (!buttonNode) {
      buttonNode = new Node(name);
      parent.addChild(buttonNode);
    }
    buttonNode.layer = parent.layer;
    buttonNode.setPosition(x, 0, 0);

    const transform = buttonNode.getComponent(UITransform) ?? buttonNode.addComponent(UITransform);
    const width = 104;
    const height = 40;
    transform.setContentSize(width, height);

    const graphics = buttonNode.getComponent(Graphics) ?? buttonNode.addComponent(Graphics);
    this.drawButtonBackground(graphics, width, height, color);

    buttonNode.getComponent(BlockInputEvents) ?? buttonNode.addComponent(BlockInputEvents);
    buttonNode.off(Node.EventType.TOUCH_END, onClick, this);
    buttonNode.on(Node.EventType.TOUCH_END, onClick, this);

    let labelNode = buttonNode.getChildByName('Label');
    if (!labelNode) {
      labelNode = new Node('Label');
      buttonNode.addChild(labelNode);
    }
    labelNode.layer = buttonNode.layer;
    labelNode.setPosition(0, 0, 0);

    const labelTransform = labelNode.getComponent(UITransform) ?? labelNode.addComponent(UITransform);
    labelTransform.setContentSize(width, height);

    const label = labelNode.getComponent(Label) ?? labelNode.addComponent(Label);
    label.useSystemFont = true;
    label.string = text;
    label.fontSize = 18;
    label.lineHeight = 22;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.color = new Color(255, 255, 255, 255);
  }

  private drawButtonBackground(graphics: Graphics, width: number, height: number, color: Color): void {
    graphics.clear();
    graphics.fillColor = color;
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, 8);
    graphics.fill();

    graphics.strokeColor = new Color(255, 255, 255, 120);
    graphics.lineWidth = 2;
    graphics.roundRect(-width * 0.5, -height * 0.5, width, height, 8);
    graphics.stroke();
  }

  private ensureResultPanel(root: Node): void {
    let panel = root.getChildByName('ResultPanel');
    if (!panel) {
      panel = new Node('ResultPanel');
      root.addChild(panel);
    }
    panel.layer = root.layer;
    panel.active = false;
    this._resultPanel = panel;

    const panelTransform = panel.getComponent(UITransform) ?? panel.addComponent(UITransform);
    const rootTransform = root.getComponent(UITransform);
    if (rootTransform) {
      panelTransform.setContentSize(rootTransform.width, rootTransform.height);
    }

    const panelWidget = panel.getComponent(Widget) ?? panel.addComponent(Widget);
    panelWidget.isAlignLeft = true;
    panelWidget.isAlignRight = true;
    panelWidget.isAlignTop = true;
    panelWidget.isAlignBottom = true;
    panelWidget.left = 0;
    panelWidget.right = 0;
    panelWidget.top = 0;
    panelWidget.bottom = 0;

    panel.getComponent(BlockInputEvents) ?? panel.addComponent(BlockInputEvents);

    let mask = panel.getChildByName('Mask');
    if (!mask) {
      mask = new Node('Mask');
      panel.addChild(mask);
    }
    mask.layer = panel.layer;
    const maskTransform = mask.getComponent(UITransform) ?? mask.addComponent(UITransform);
    if (rootTransform) {
      maskTransform.setContentSize(rootTransform.width, rootTransform.height);
    }
    const maskWidget = mask.getComponent(Widget) ?? mask.addComponent(Widget);
    maskWidget.isAlignLeft = true;
    maskWidget.isAlignRight = true;
    maskWidget.isAlignTop = true;
    maskWidget.isAlignBottom = true;
    maskWidget.left = 0;
    maskWidget.right = 0;
    maskWidget.top = 0;
    maskWidget.bottom = 0;
    const maskGraphics = mask.getComponent(Graphics) ?? mask.addComponent(Graphics);
    maskGraphics.clear();
    maskGraphics.fillColor = new Color(0, 0, 0, 150);
    maskGraphics.rect(-maskTransform.width * 0.5, -maskTransform.height * 0.5, maskTransform.width, maskTransform.height);
    maskGraphics.fill();

    let card = panel.getChildByName('Card');
    if (!card) {
      card = new Node('Card');
      panel.addChild(card);
    }
    card.layer = panel.layer;
    card.setPosition(0, 0, 0);
    const cardTransform = card.getComponent(UITransform) ?? card.addComponent(UITransform);
    cardTransform.setContentSize(420, 220);
    const cardGraphics = card.getComponent(Graphics) ?? card.addComponent(Graphics);
    cardGraphics.clear();
    cardGraphics.fillColor = new Color(38, 43, 56, 245);
    cardGraphics.roundRect(-210, -110, 420, 220, 12);
    cardGraphics.fill();
    cardGraphics.strokeColor = new Color(255, 255, 255, 90);
    cardGraphics.lineWidth = 2;
    cardGraphics.roundRect(-210, -110, 420, 220, 12);
    cardGraphics.stroke();

    let titleNode = card.getChildByName('Title');
    if (!titleNode) {
      titleNode = new Node('Title');
      card.addChild(titleNode);
    }
    titleNode.layer = card.layer;
    titleNode.setPosition(0, 50, 0);
    const titleTransform = titleNode.getComponent(UITransform) ?? titleNode.addComponent(UITransform);
    titleTransform.setContentSize(360, 56);
    const titleLabel = titleNode.getComponent(Label) ?? titleNode.addComponent(Label);
    titleLabel.useSystemFont = true;
    titleLabel.fontSize = 32;
    titleLabel.lineHeight = 36;
    titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
    titleLabel.verticalAlign = Label.VerticalAlign.CENTER;
    titleLabel.color = new Color(255, 255, 255, 255);
    this._resultLabel = titleLabel;

    this.ensureButton(card, 'BtnResultRestart', 'Restart', -80, new Color(223, 87, 87, 255), this.onClickRestart);
    this.ensureButton(card, 'BtnResultNext', 'Next', 80, new Color(64, 172, 109, 255), this.onClickNext);
    const restart = card.getChildByName('BtnResultRestart');
    const next = card.getChildByName('BtnResultNext');
    if (restart) {
      restart.setPosition(-80, -50, 0);
    }
    if (next) {
      next.setPosition(80, -50, 0);
    }
  }

  private showResultPanel(success: boolean): void {
    if (!this._resultPanel || !this._resultLabel) {
      return;
    }
    this._resultPanel.active = true;
    this._resultLabel.string = success ? '过关' : '失败';

    const card = this._resultPanel.getChildByName('Card');
    const next = card?.getChildByName('BtnResultNext') ?? null;
    const restart = card?.getChildByName('BtnResultRestart') ?? null;
    const canNext = success && this.hasNextLevel();

    if (next) {
      next.active = canNext;
    }
    if (restart) {
      restart.setPosition(canNext ? -80 : 0, -50, 0);
    }
  }

  private hideResultPanel(): void {
    if (this._resultPanel) {
      this._resultPanel.active = false;
    }
  }

  private refreshHud(): void {
    if (!this._hudLabel) {
      return;
    }

    if (!this._level || !this._sim) {
      this._hudLabel.string = '加载中...';
      return;
    }

    const stats = this._sim.getStats();
    const timeLeft = Math.max(0, Math.ceil(this._levelTimeLeft));
    const tool = this._toolMode === ToolMode.Dig ? '挖' : '填';

    let stateText = '进行中';
    if (this._ended) {
      stateText = this._sim.isSuccess() ? '胜利' : '失败';
    }

    this._hudLabel.string =
      `关卡 ${this.getLevelProgressText()} ${stateText}  已救 ${stats.saved}/${this._level.requiredSaved}` +
      `  存活 ${stats.alive}  出生 ${stats.spawned}  剩余 ${timeLeft}s  工具 ${tool}`;
  }

  private onClickDig(): void {
    this.setToolMode(ToolMode.Dig);
  }

  private onClickFill(): void {
    this.setToolMode(ToolMode.Fill);
  }

  private onClickRestart(): void {
    void this.restartLevel();
  }

  private onClickNext(): void {
    void this.nextLevel();
  }

  update(dt: number): void {
    if (!this._ready || this._ended || !this._level || !this._terrain || !this._sim) {
      return;
    }

    this._levelTimeLeft -= dt;
    if (this._levelTimeLeft <= 0) {
      this._ended = true;
      this._levelTimeLeft = 0;
      this.refreshHud();
      this.showResultPanel(false);
      log('[失败] 时间耗尽');
      return;
    }

    this._acc += dt;
    while (this._acc >= this.fixedStepSec) {
      this._sim.tick(this.fixedStepSec);
      this._acc -= this.fixedStepSec;
    }

    this.drawFrame();
    this.refreshHud();

    this._statsTimer += dt;
    if (this._statsTimer >= this.printStatsIntervalSec) {
      const s = this._sim.getStats();
      log(`[状态] 已出生:${s.spawned} 存活:${s.alive} 已到达:${s.saved} 死亡:${s.dead} 剩余:${Math.ceil(this._levelTimeLeft)}s`);
      this._statsTimer = 0;
    }

    if (this._sim.isSuccess()) {
      this._ended = true;
      this.refreshHud();
      this.showResultPanel(true);
      log('[胜利] 达到目标人数');
      return;
    }

    if (this._sim.isFinished()) {
      this._ended = true;
      this.refreshHud();
      this.showResultPanel(false);
      log('[失败] 小人已全部结算，未达成目标');
    }
  }

  setToolMode(mode: ToolMode): void {
    this._toolMode = mode;
    this.refreshHud();
    log(`[工具] ${mode}`);
  }

  setDigMode(): void {
    this.setToolMode(ToolMode.Dig);
  }

  setFillMode(): void {
    this.setToolMode(ToolMode.Fill);
  }

  toggleToolMode(): void {
    this.setToolMode(this._toolMode === ToolMode.Dig ? ToolMode.Fill : ToolMode.Dig);
  }

  applyToolAt(x: number, y: number): boolean {
    if (!this._terrain || !this._sim || this._ended) {
      return false;
    }

    if (!this._terrain.inBounds(x, y)) {
      return false;
    }

    if (this._toolMode === ToolMode.Fill && this._sim.hasAgentAtCell(x, y)) {
      return false;
    }

    let changed = false;
    if (this._toolMode === ToolMode.Dig) {
      changed = this._terrain.dig(x, y);
    } else {
      changed = this._terrain.fill(x, y);
    }

    return changed;
  }
}
