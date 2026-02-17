import { Int2, LevelConfig } from './GameTypes';

export class TerrainGrid {
  readonly cols: number;
  readonly rows: number;
  readonly cellSize: number;

  private readonly _cells: Uint8Array;
  private readonly _editable: Uint8Array;
  private readonly _protected = new Set<string>();
  private readonly _goal = { x: 0, y: 0, width: 0, height: 0 };

  constructor(level: LevelConfig) {
    this.cols = level.gridSize.cols;
    this.rows = level.gridSize.rows;
    this.cellSize = level.gridSize.cellSize;
    this._cells = new Uint8Array(this.cols * this.rows);
    this._editable = new Uint8Array(this.cols * this.rows);
    this._goal = {
      x: level.goal.x,
      y: level.goal.y,
      width: level.goal.width,
      height: level.goal.height,
    };

    // 关卡 terrain 是从上到下书写，逻辑网格是从下到上索引。
    for (let y = 0; y < this.rows; y += 1) {
      const sourceRow = level.terrain[this.rows - 1 - y];
      for (let x = 0; x < this.cols; x += 1) {
        const i = this.index(x, y);
        const ch = sourceRow[x];
        if (ch === '#') {
          this._cells[i] = 1;
          this._editable[i] = 1;
        } else if (ch === 'o' || ch === 'O') {
          this._cells[i] = 0;
          this._editable[i] = 1;
        } else {
          this._cells[i] = 0;
          this._editable[i] = 0;
        }
      }
    }

    level.protectedCells.forEach((cell) => {
      this._protected.add(this.key(cell.x, cell.y));
    });
  }

  cloneCells(): Uint8Array {
    return new Uint8Array(this._cells);
  }

  index(x: number, y: number): number {
    return y * this.cols + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  isSolid(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) {
      return false;
    }
    return this._cells[this.index(x, y)] === 1;
  }

  isEmpty(x: number, y: number): boolean {
    return !this.isSolid(x, y);
  }

  isEditable(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) {
      return false;
    }
    return this._editable[this.index(x, y)] === 1;
  }

  isProtected(x: number, y: number): boolean {
    return this._protected.has(this.key(x, y)) || TerrainGrid.contains(this._goal, { x, y });
  }

  dig(x: number, y: number): boolean {
    if (!this.inBounds(x, y) || this.isProtected(x, y) || !this.isEditable(x, y)) {
      return false;
    }
    const i = this.index(x, y);
    if (this._cells[i] === 0) {
      return false;
    }
    this._cells[i] = 0;
    return true;
  }

  fill(x: number, y: number): boolean {
    if (!this.inBounds(x, y) || this.isProtected(x, y) || !this.isEditable(x, y)) {
      return false;
    }
    const i = this.index(x, y);
    if (this._cells[i] === 1) {
      return false;
    }
    this._cells[i] = 1;
    return true;
  }

  serializeToRowsTopDown(): string[] {
    const rows: string[] = [];
    for (let sourceY = this.rows - 1; sourceY >= 0; sourceY -= 1) {
      let row = '';
      for (let x = 0; x < this.cols; x += 1) {
        if (this.isSolid(x, sourceY)) {
          row += '#';
        } else {
          row += this.isEditable(x, sourceY) ? 'o' : '.';
        }
      }
      rows.push(row);
    }
    return rows;
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  static contains(rect: { x: number; y: number; width: number; height: number }, p: Int2): boolean {
    return p.x >= rect.x && p.y >= rect.y && p.x < rect.x + rect.width && p.y < rect.y + rect.height;
  }
}
