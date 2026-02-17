import { _decorator, Color, Component, Graphics } from 'cc';
import { AgentState, Rect, SpawnConfig } from '../core/GameTypes';
import { TerrainGrid } from '../core/TerrainGrid';

const { ccclass, property } = _decorator;

@ccclass('TerrainDebugRenderer')
export class TerrainDebugRenderer extends Component {
  @property(Graphics)
  graphics: Graphics | null = null;

  @property
  agentHeightCells = 5.2;

  @property
  agentVisualScale = 1.5;

  private _cellSize = 32;
  private _agentCollisionWidthCells = 1;
  private _agentCollisionHeightCells = 1;

  onLoad(): void {
    if (!this.graphics) {
      this.graphics = this.getComponent(Graphics);
    }
    if (!this.graphics) {
      this.graphics = this.addComponent(Graphics);
    }
  }

  setCellSize(cellSize: number): void {
    this._cellSize = cellSize;
  }

  setAgentCollisionFootprint(widthCells: number, heightCells: number): void {
    this._agentCollisionWidthCells = Math.max(1, Math.floor(widthCells));
    this._agentCollisionHeightCells = Math.max(1, Math.floor(heightCells));
  }

  draw(terrain: TerrainGrid, agents: readonly AgentState[], goal: Rect, spawn: SpawnConfig): void {
    if (!this.graphics) {
      return;
    }

    const g = this.graphics;
    const c = this._cellSize;
    const thinLine = Math.max(1, c * 0.06);
    const normalLine = Math.max(1, c * 0.1);
    const boldLine = Math.max(2, c * 0.16);
    const width = terrain.cols * c;
    const height = terrain.rows * c;
    g.clear();

    // 天空底色
    g.fillColor = new Color(150, 190, 235, 255);
    g.rect(0, 0, width, height);
    g.fill();

    // 非实体可编辑区（挖空土洞）。天空由底色一次性绘制，不再按格绘制以降低顶点量。
    this.drawEditableHoleRuns(g, terrain, c);

    // 土层分界线，强调“上方通道 / 下方土地”。
    let editableTop = -1;
    for (let y = terrain.rows - 1; y >= 0; y -= 1) {
      let hasEditable = false;
      for (let x = 0; x < terrain.cols; x += 1) {
        if (terrain.isEditable(x, y)) {
          hasEditable = true;
          break;
        }
      }
      if (hasEditable) {
        editableTop = y;
        break;
      }
    }

    if (editableTop >= 0) {
      g.fillColor = new Color(124, 160, 96, 160);
      g.rect(0, (editableTop + 1) * c - 2, width, 4);
      g.fill();
    }

    // 实体土层：按行合并连续区段绘制，避免细网格导致 Graphics 顶点爆炸。
    this.drawSolidRuns(g, terrain, c);
    this.drawSoilBoundarySmoothing(g, terrain, c);

    // 表层草地线（找出每列可编辑区最高点）
    g.strokeColor = new Color(24, 98, 16, 255);
    g.lineWidth = normalLine;
    for (let x = 0; x < terrain.cols; x += 1) {
      for (let y = terrain.rows - 1; y >= 0; y -= 1) {
        if (terrain.isEditable(x, y)) {
          g.moveTo(x * c, (y + 1) * c);
          g.lineTo((x + 1) * c, (y + 1) * c);
          break;
        }
      }
    }
    g.stroke();

    // 出生管道（加厚金属风格）
    const pipeX = spawn.position.x * c + c * 0.5;
    const pipeMouthY = (spawn.position.y + 0.5) * c;
    const shaftBottom = pipeMouthY + c * 0.24;
    const shaftTop = height - c * 0.12;
    const shaftW = c * 0.74;
    const shaftH = Math.max(c * 1.2, shaftTop - shaftBottom);
    const rimW = c * 1.22;
    const rimH = c * 0.46;
    const rimY = pipeMouthY + c * 0.06;
    const shaftRadius = Math.max(2, c * 0.15);

    g.fillColor = new Color(70, 76, 94, 255);
    g.roundRect(pipeX - shaftW * 0.5, shaftBottom, shaftW, shaftH, shaftRadius);
    g.fill();

    g.fillColor = new Color(126, 136, 165, 220);
    g.roundRect(
      pipeX - shaftW * 0.36,
      shaftBottom + c * 0.18,
      shaftW * 0.2,
      Math.max(c * 0.4, shaftH - c * 0.34),
      Math.max(1, c * 0.08),
    );
    g.fill();

    g.fillColor = new Color(62, 67, 84, 255);
    g.roundRect(pipeX - rimW * 0.5, rimY, rimW, rimH, Math.max(2, c * 0.2));
    g.fill();

    g.fillColor = new Color(138, 148, 176, 255);
    g.roundRect(pipeX - rimW * 0.45, rimY + rimH * 0.46, rimW * 0.9, rimH * 0.38, Math.max(2, c * 0.15));
    g.fill();

    const openingW = rimW * 0.56;
    const openingH = Math.max(c * 0.12, rimH * 0.24);
    g.fillColor = new Color(40, 43, 54, 255);
    g.roundRect(pipeX - openingW * 0.5, rimY + rimH * 0.4, openingW, openingH, Math.max(1, openingH * 0.4));
    g.fill();

    const boltR = Math.max(0.9, c * 0.05);
    g.fillColor = new Color(175, 185, 214, 235);
    g.circle(pipeX - rimW * 0.34, rimY + rimH * 0.42, boltR);
    g.circle(pipeX + rimW * 0.34, rimY + rimH * 0.42, boltR);
    g.fill();

    const spawnPulse = agents.some(
      (agent) =>
        !agent.dead &&
        !agent.reachedGoal &&
        agent.ageSec < 0.45 &&
        agent.pos.x <= spawn.position.x &&
        spawn.position.x < agent.pos.x + this._agentCollisionWidthCells,
    );
    if (spawnPulse) {
      const alpha = 90 + Math.floor(Math.random() * 90);
      const visualHeightCells = Math.max(1, this.agentHeightCells * this.agentVisualScale);
      const pulseRadius = Math.max(c * 0.36, c * visualHeightCells * 0.35);
      g.fillColor = new Color(255, 245, 180, alpha);
      g.circle(pipeX, pipeMouthY + c * 0.28, pulseRadius);
      g.fill();
    }

    // 目标区（埋在土里的目的地锚点）
    g.fillColor = new Color(255, 243, 150, 70);
    g.rect(goal.x * c, goal.y * c, goal.width * c, goal.height * c);
    g.fill();
    g.strokeColor = new Color(255, 246, 138, 255);
    g.lineWidth = boldLine;
    g.rect(goal.x * c, goal.y * c, goal.width * c, goal.height * c);
    g.stroke();
    this.drawGoalMarker(g, goal, c);

    // 小人（比纯圆点更醒目）
    for (const agent of agents) {
      if (agent.dead || agent.reachedGoal) {
        continue;
      }
      this.drawAgent(g, c, agent, normalLine, thinLine);
    }
  }

  private drawGoalMarker(g: Graphics, goal: Rect, c: number): void {
    const cx = (goal.x + goal.width * 0.5) * c;
    const cy = (goal.y + goal.height * 0.5) * c;
    const goalW = goal.width * c;
    const goalH = goal.height * c;
    const doorW = Math.max(c * 1.8, Math.min(goalW * 0.72, c * 3.2));
    const doorH = Math.max(c * 1.8, Math.min(goalH * 0.8, c * 3.2));

    g.fillColor = new Color(122, 78, 44, 245);
    g.roundRect(cx - doorW * 0.5, cy - doorH * 0.5, doorW, doorH, 5);
    g.fill();

    g.fillColor = new Color(255, 220, 76, 255);
    g.circle(cx + doorW * 0.23, cy - doorH * 0.05, c * 0.06);
    g.fill();

    g.fillColor = new Color(255, 160, 76, 245);
    g.moveTo(cx - c * 0.35, cy + doorH * 0.55);
    g.lineTo(cx + c * 0.35, cy + doorH * 0.55);
    g.lineTo(cx, cy + c * 0.62);
    g.lineTo(cx - c * 0.35, cy + doorH * 0.55);
    g.fill();
  }

  private drawEditableHoleRuns(g: Graphics, terrain: TerrainGrid, c: number): void {
    const holeInset = Math.max(0.4, c * 0.08);
    const holeRadius = Math.max(1, c * 0.34);
    let hasHole = false;
    g.fillColor = new Color(36, 130, 24, 255);

    for (let y = 0; y < terrain.rows; y += 1) {
      let x = 0;
      while (x < terrain.cols) {
        const isHole = !terrain.isSolid(x, y) && terrain.isEditable(x, y);
        if (!isHole) {
          x += 1;
          continue;
        }

        const start = x;
        x += 1;
        while (x < terrain.cols && !terrain.isSolid(x, y) && terrain.isEditable(x, y)) {
          x += 1;
        }
        const run = x - start;
        g.roundRect(
          start * c - holeInset * 0.5,
          y * c - holeInset * 0.5,
          run * c + holeInset,
          c + holeInset,
          holeRadius,
        );
        hasHole = true;
      }
    }

    if (hasHole) {
      g.fill();
    }
  }

  private drawSolidRuns(g: Graphics, terrain: TerrainGrid, c: number): void {
    let hasSolid = false;
    g.fillColor = new Color(42, 184, 22, 255);

    for (let y = 0; y < terrain.rows; y += 1) {
      let x = 0;
      while (x < terrain.cols) {
        if (!terrain.isSolid(x, y)) {
          x += 1;
          continue;
        }

        const start = x;
        x += 1;
        while (x < terrain.cols && terrain.isSolid(x, y)) {
          x += 1;
        }
        g.rect(start * c, y * c, (x - start) * c, c);
        hasSolid = true;
      }
    }

    if (hasSolid) {
      g.fill();
    }
  }

  private drawSoilBoundarySmoothing(g: Graphics, terrain: TerrainGrid, c: number): void {
    // 细网格+大地图时跳过圆角平滑，防止 Graphics 在 Web/微信环境顶点溢出。
    if (terrain.cols * terrain.rows >= 28000 && c <= 3) {
      return;
    }

    const edgeExpand = Math.max(0.6, c * 0.28);
    const roundRadius = Math.max(1, c * 0.42);
    g.fillColor = new Color(42, 184, 22, 255);

    for (let y = 0; y < terrain.rows; y += 1) {
      for (let x = 0; x < terrain.cols; x += 1) {
        if (!terrain.isSolid(x, y)) {
          continue;
        }

        const exposed =
          !terrain.isSolid(x - 1, y) ||
          !terrain.isSolid(x + 1, y) ||
          !terrain.isSolid(x, y - 1) ||
          !terrain.isSolid(x, y + 1);
        if (!exposed) {
          continue;
        }

        g.roundRect(
          x * c - edgeExpand * 0.5,
          y * c - edgeExpand * 0.5,
          c + edgeExpand,
          c + edgeExpand,
          roundRadius,
        );
      }
    }
    g.fill();
  }

  private drawAgent(g: Graphics, c: number, agent: AgentState, normalLine: number, thinLine: number): void {
    const px = (agent.pos.x + this._agentCollisionWidthCells * 0.5) * c;
    const footY = agent.pos.y * c + 0.5;
    const bornBlink = agent.ageSec < 0.6;
    const visualHeightCells = Math.max(1, this.agentHeightCells * this.agentVisualScale);
    const h = Math.max(c * 1.8, c * visualHeightCells);
    const w = h * 0.5;
    const bodyW = w * 0.62;
    const bodyH = h * 0.44;
    const bodyX = px - bodyW * 0.5;
    const bodyY = footY + h * 0.19;
    const headR = h * 0.18;
    const headX = px;
    const headY = bodyY + bodyH + headR * 0.86;
    const outlineLine = Math.max(normalLine, h * 0.06);
    const legLine = Math.max(thinLine, h * 0.045);

    if (bornBlink) {
      const t = 1 - agent.ageSec / 0.6;
      const radius = h * (0.22 + t * 0.28);
      g.strokeColor = new Color(255, 250, 192, Math.floor(180 * t));
      g.lineWidth = outlineLine;
      g.circle(px, footY + h * 0.5, radius);
      g.stroke();
    }

    // 身体
    g.fillColor = bornBlink ? new Color(255, 199, 81, 255) : new Color(245, 218, 95, 255);
    g.roundRect(bodyX, bodyY, bodyW, bodyH, Math.max(2, h * 0.08));
    g.fill();

    // 头
    g.fillColor = new Color(255, 234, 196, 255);
    g.circle(headX, headY, headR);
    g.fill();

    // 描边，确保不被绿土吞色
    g.strokeColor = new Color(53, 53, 53, 255);
    g.lineWidth = outlineLine;
    g.roundRect(bodyX, bodyY, bodyW, bodyH, Math.max(2, h * 0.08));
    g.stroke();
    g.circle(headX, headY, headR);
    g.stroke();

    // 行走方向小脚线
    const stepDir = agent.direction > 0 ? 1 : -1;
    g.strokeColor = new Color(45, 45, 45, 255);
    g.lineWidth = legLine;
    const legStartY = bodyY + h * 0.03;
    g.moveTo(px - w * 0.18, legStartY);
    g.lineTo(px - w * 0.06, footY);
    g.moveTo(px + w * 0.06, legStartY);
    g.lineTo(px + stepDir * w * 0.22, footY);
    g.stroke();
  }
}
