import { _decorator, Component, EventTouch, Node, UITransform, Vec2, Vec3 } from 'cc';
import { ToolMode } from '../core/GameTypes';
import { GameController } from '../controllers/GameController';

const { ccclass, property } = _decorator;

@ccclass('TerrainPainterInput')
export class TerrainPainterInput extends Component {
  @property(GameController)
  controller: GameController | null = null;

  @property
  autoWireController = true;

  @property
  dragPaint = true;

  @property
  brushRadiusCells = 2.4;

  @property
  strokeSpacingCells = 0.45;

  private _lastGridPos: Vec2 | null = null;

  onEnable(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    if (this.autoWireController && !this.controller) {
      this.controller = this.findControllerInParents();
    }
  }

  onDisable(): void {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  setToolMode(mode: ToolMode): void {
    this.controller?.setToolMode(mode);
  }

  private findControllerInParents(): GameController | null {
    let current: Node | null = this.node;
    while (current) {
      const found = current.getComponent(GameController);
      if (found) {
        return found;
      }
      current = current.parent;
    }
    return null;
  }

  private onTouchStart(event: EventTouch): void {
    this.paintAt(event);
  }

  private onTouchMove(event: EventTouch): void {
    if (!this.dragPaint) {
      return;
    }
    this.paintAt(event);
  }

  private onTouchEnd(): void {
    this._lastGridPos = null;
  }

  private paintAt(event: EventTouch): void {
    const controller = this.controller;
    if (!controller) {
      return;
    }

    const cellSize = controller.cellSize;
    if (cellSize <= 0) {
      return;
    }

    const uiTransform = this.getComponent(UITransform);
    if (!uiTransform) {
      return;
    }

    const p = event.getUILocation();
    const local = uiTransform.convertToNodeSpaceAR(new Vec3(p.x, p.y, 0));
    const originX = -uiTransform.width * uiTransform.anchorX;
    const originY = -uiTransform.height * uiTransform.anchorY;
    const gx = (local.x - originX) / cellSize;
    const gy = (local.y - originY) / cellSize;

    const current = new Vec2(gx, gy);
    if (!this._lastGridPos) {
      this.paintBrush(controller, current.x, current.y);
      this._lastGridPos = current;
      return;
    }

    const dx = current.x - this._lastGridPos.x;
    const dy = current.y - this._lastGridPos.y;
    const dist = Math.hypot(dx, dy);
    const spacing = Math.max(0.15, this.strokeSpacingCells);
    const steps = Math.max(1, Math.ceil(dist / spacing));

    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const x = this._lastGridPos.x + dx * t;
      const y = this._lastGridPos.y + dy * t;
      this.paintBrush(controller, x, y);
    }

    this._lastGridPos = current;
  }

  private paintBrush(controller: GameController, cx: number, cy: number): void {
    const radius = Math.max(0.5, this.brushRadiusCells);
    const r2 = radius * radius;
    const minX = Math.floor(cx - radius);
    const maxX = Math.ceil(cx + radius);
    const minY = Math.floor(cy - radius);
    const maxY = Math.ceil(cy + radius);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        if (dx * dx + dy * dy > r2) {
          continue;
        }
        controller.applyToolAt(x, y);
      }
    }
  }
}
