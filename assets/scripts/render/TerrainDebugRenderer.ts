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

    // 非实体区：可编辑土区空洞、天空区。
    for (let y = 0; y < terrain.rows; y += 1) {
      for (let x = 0; x < terrain.cols; x += 1) {
        if (terrain.isSolid(x, y)) {
          continue;
        }
        if (terrain.isEditable(x, y)) {
          g.fillColor = new Color(36, 130, 24, 255); // 已挖空的土洞
        } else {
          g.fillColor = new Color(160, 198, 238, 255); // 天空
        }
        g.rect(x * c, y * c, c, c);
        g.fill();
      }
    }

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

    // 实体土层
    g.fillColor = new Color(42, 184, 22, 255);
    for (let y = 0; y < terrain.rows; y += 1) {
      for (let x = 0; x < terrain.cols; x += 1) {
        if (terrain.isSolid(x, y)) {
          g.rect(x * c, y * c, c, c);
        }
      }
    }
    g.fill();

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

    // 出生管道
    const pipeX = spawn.position.x * c + c * 0.5;
    const pipeY = (spawn.position.y + 0.5) * c;
    const pipeTop = height - c * 0.15;
    g.fillColor = new Color(106, 106, 120, 255);
    g.roundRect(pipeX - c * 0.2, pipeY + c * 0.3, c * 0.4, pipeTop - (pipeY + c * 0.3), 5);
    g.fill();
    g.fillColor = new Color(95, 95, 108, 255);
    g.roundRect(pipeX - c * 0.45, pipeY + c * 0.15, c * 0.9, c * 0.45, 6);
    g.fill();
    g.fillColor = new Color(130, 130, 146, 255);
    g.roundRect(pipeX - c * 0.34, pipeY - c * 0.2, c * 0.68, c * 0.45, 5);
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
      const pulseRadius = Math.max(c * 0.36, c * this.agentHeightCells * 0.35);
      g.fillColor = new Color(255, 245, 180, alpha);
      g.circle(pipeX, pipeY + c * 0.3, pulseRadius);
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

  private drawAgent(g: Graphics, c: number, agent: AgentState, normalLine: number, thinLine: number): void {
    const px = (agent.pos.x + this._agentCollisionWidthCells * 0.5) * c;
    const py = agent.pos.y * c + c * 0.5;
    const bornBlink = agent.ageSec < 0.6;
    const h = Math.max(c * 1.8, c * this.agentHeightCells);
    const w = h * 0.5;
    const bodyW = w * 0.62;
    const bodyH = h * 0.46;
    const bodyX = px - bodyW * 0.5;
    const bodyY = py - h * 0.24;
    const headR = h * 0.18;
    const headX = px;
    const headY = bodyY + bodyH + headR * 0.82;
    const outlineLine = Math.max(normalLine, h * 0.06);
    const legLine = Math.max(thinLine, h * 0.045);

    if (bornBlink) {
      const t = 1 - agent.ageSec / 0.6;
      const radius = h * (0.22 + t * 0.28);
      g.strokeColor = new Color(255, 250, 192, Math.floor(180 * t));
      g.lineWidth = outlineLine;
      g.circle(px, py + h * 0.04, radius);
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
    g.moveTo(px - w * 0.18, bodyY);
    g.lineTo(px - w * 0.06, py - h * 0.5);
    g.moveTo(px + w * 0.06, bodyY);
    g.lineTo(px + stepDir * w * 0.22, py - h * 0.5);
    g.stroke();
  }
}
