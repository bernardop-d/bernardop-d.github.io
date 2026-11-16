import Phaser from 'phaser';
import { T, TILE, TILE_COUNT } from './world';

// ── Utilitários de desenho pixel a pixel ─────────────────────────────

export class Painter {
  constructor(public ctx: CanvasRenderingContext2D) {}

  rect(x: number, y: number, w: number, h: number, c: string) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(x, y, w, h);
  }

  px(x: number, y: number, c: string) {
    this.rect(x, y, 1, 1, c);
  }

  /** Círculo sem antialias */
  disc(cx: number, cy: number, r: number, c: string) {
    this.ctx.fillStyle = c;
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
      this.ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
    }
  }

  /** Desenha um sprite definido por linhas de texto + paleta */
  pixels(rows: string[], pal: Record<string, string>, ox = 0, oy = 0) {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = pal[row[x]];
        if (c) this.px(ox + x, oy + y, c);
      }
    });
  }
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ri = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <V>(r: () => number, arr: V[]) => arr[Math.floor(r() * arr.length)];

export function makeCanvas(scene: Phaser.Scene, key: string, w: number, h: number, draw: (p: Painter) => void) {
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) throw new Error(`Não foi possível criar a textura ${key}`);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  draw(new Painter(ctx));
  tex.refresh();
  return tex;
}

// ── Paleta ───────────────────────────────────────────────────────────

const INK = '#2a2230';
const GREEN = {
  dark: '#2d5f2a',
  mid: '#3c8034',
  base: '#4a9a3f',
  base2: '#438f39',
  light: '#53a646',
  lighter: '#5cb04c',
  shine: '#6cc25a',
};
const BOOKS = ['#e0524f', '#3d6fdc', '#f0a83a', '#5ec27a', '#8b5cf6', '#ec4899', '#14b8a6', '#f3efe6'];

// ── Tiles ────────────────────────────────────────────────────────────

function grass(p: Painter, r: () => number, flowers: boolean) {
  p.rect(0, 0, T, T, '#74c05a');
  for (let i = 0; i < 18; i++) p.px(ri(r, 0, 15), ri(r, 0, 15), r() < 0.5 ? '#68b24f' : '#82cc68');
  for (let i = 0; i < 4; i++) {
    const x = ri(r, 1, 14);
    const y = ri(r, 2, 15);
    p.px(x, y, '#5a9e44');
    p.px(x + 1, y - 1, '#5a9e44');
  }
  if (flowers) {
    for (let i = 0; i < 2; i++) {
      const x = ri(r, 3, 12);
      const y = ri(r, 3, 12);
      const c = pick(r, ['#ffffff', '#ff8fb1', '#a7c7ff']);
      p.px(x - 1, y, c);
      p.px(x + 1, y, c);
      p.px(x, y - 1, c);
      p.px(x, y + 1, c);
      p.px(x, y, '#ffd84a');
    }
  }
}

function path(p: Painter) {
  p.rect(0, 0, T, T, '#bfa97f');
  const stones: [number, number, number, number][] = [
    [1, 1, 6, 5],
    [8, 1, 7, 6],
    [1, 7, 5, 8],
    [7, 8, 8, 7],
  ];
  for (const [x, y, w, h] of stones) {
    p.rect(x, y, w, h, '#ddcdaa');
    p.rect(x, y, w, 1, '#ebdfc2');
    p.rect(x, y + h - 1, w, 1, '#cbb88f');
  }
}

function floorLilac(p: Painter) {
  p.rect(0, 0, T, T, '#ddd4f4');
  p.rect(1, 1, 7, 1, '#e9e3fb');
  p.rect(1, 1, 1, 5, '#e9e3fb');
  p.rect(0, 15, T, 1, '#c8bbec');
  p.rect(15, 0, 1, T, '#c8bbec');
}

function floorLobby(p: Painter) {
  p.rect(0, 0, T, T, '#efebf7');
  p.rect(0, 15, T, 1, '#dcd4ee');
  p.rect(15, 0, 1, T, '#dcd4ee');
  p.px(7, 7, '#e4ddf2');
}

function wood(p: Painter, r: () => number) {
  p.rect(0, 0, T, T, '#c8955f');
  const joints = [10, 4, 13, 7];
  for (let band = 0; band < 4; band++) {
    const y = band * 4;
    p.rect(0, y + 3, T, 1, '#ad7b48');
    p.px(joints[band], y, '#ad7b48');
    p.px(joints[band], y + 1, '#ad7b48');
    p.px(joints[band], y + 2, '#ad7b48');
  }
  for (let i = 0; i < 6; i++) p.px(ri(r, 0, 15), ri(r, 0, 15), '#d4a46f');
}

function carpet(p: Painter) {
  p.rect(0, 0, T, T, '#7486ad');
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if ((x + y * 2) % 5 === 0) p.px(x, y, '#6a7ca3');
}

function wallTop(p: Painter) {
  p.rect(0, 0, T, T, '#585d6e');
  p.rect(0, 0, T, 1, '#6e7489');
  p.px(4, 6, '#5f6577');
  p.px(11, 10, '#5f6577');
}

function baseboard(p: Painter) {
  p.rect(0, 12, T, 3, '#a596d8');
  p.rect(0, 12, T, 1, '#b8abe4');
  p.rect(0, 15, T, 1, '#8576bd');
}

function wallFace(p: Painter) {
  p.rect(0, 0, T, T, '#c6c8d6');
  p.rect(0, 0, T, 2, '#9ea1b3');
  p.rect(0, 2, T, 1, '#b4b7c7');
  p.rect(15, 3, 1, 9, '#bcbfce');
  baseboard(p);
}

function glassFace(p: Painter) {
  p.rect(0, 0, T, T, '#8e93a6');
  p.rect(0, 0, T, 2, '#767b8f');
  p.rect(1, 2, 14, 10, '#bfe4f2');
  p.rect(1, 2, 14, 1, '#a6d3e6');
  for (let i = 0; i < 5; i++) p.px(3 + i, 9 - i, '#eaf8fd');
  p.px(9, 9, '#eaf8fd');
  p.px(10, 8, '#eaf8fd');
  baseboard(p);
}

function makeTiles(scene: Phaser.Scene) {
  makeCanvas(scene, 'tiles', T * TILE_COUNT, T, (p) => {
    const tile = (i: number, fn: () => void) => {
      p.ctx.save();
      p.ctx.translate(i * T, 0);
      fn();
      p.ctx.restore();
    };
    tile(TILE.GRASS, () => grass(p, rng(11), false));
    tile(TILE.GRASS2, () => grass(p, rng(23), false));
    tile(TILE.FLOWERS, () => grass(p, rng(37), true));
    tile(TILE.PATH, () => path(p));
    tile(TILE.FLOOR, () => floorLilac(p));
    tile(TILE.WOOD, () => wood(p, rng(5)));
    tile(TILE.CARPET, () => carpet(p));
    tile(TILE.LOBBY, () => floorLobby(p));
    tile(TILE.WALL_TOP, () => wallTop(p));
    tile(TILE.WALL_FACE, () => wallFace(p));
    tile(TILE.GLASS, () => glassFace(p));
  });
}

// ── Objetos ──────────────────────────────────────────────────────────

function canopy(p: Painter, r: () => number, fruit?: [string, string]) {
  p.disc(24, 24, 21, GREEN.dark);
  p.disc(24, 23, 20, GREEN.mid);
  p.disc(17, 21, 11, GREEN.base);
  p.disc(31, 18, 11, GREEN.base);
  p.disc(24, 30, 11, GREEN.base2);
  p.disc(12, 27, 6, GREEN.light);
  p.disc(35, 25, 6, GREEN.light);
  p.disc(14, 15, 7, GREEN.lighter);
  p.disc(28, 11, 7, GREEN.lighter);
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 17;
    p.px(Math.round(24 + Math.cos(a) * d), Math.round(22 + Math.sin(a) * d), r() < 0.55 ? GREEN.shine : '#34742e');
  }
  if (fruit) {
    for (let i = 0; i < 10; i++) {
      const a = r() * Math.PI * 2;
      const d = 4 + r() * 13;
      const x = Math.round(24 + Math.cos(a) * d);
      const y = Math.round(23 + Math.sin(a) * d);
      p.rect(x, y, 3, 3, fruit[0]);
      p.px(x, y, fruit[1]);
    }
  }
}

function tree(p: Painter, seed: number, fruit?: [string, string]) {
  const r = rng(seed);
  p.rect(12, 53, 24, 2, 'rgba(0,0,0,0.18)');
  p.rect(15, 55, 18, 2, 'rgba(0,0,0,0.18)');
  p.rect(17, 51, 14, 4, '#5a371f');
  p.rect(20, 38, 8, 15, '#6b4226');
  p.rect(21, 38, 3, 15, '#7d5030');
  p.px(26, 46, '#5a371f');
  p.px(25, 47, '#5a371f');
  canopy(p, r, fruit);
}

export function generateTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('tiles')) return;
  makeTiles(scene);

  makeCanvas(scene, 'shadow', 12, 4, (p) => {
    const c = 'rgba(0,0,0,0.22)';
    p.rect(2, 0, 8, 1, c);
    p.rect(0, 1, 12, 2, c);
    p.rect(2, 3, 8, 1, c);
  });

  // Mesa branca
  makeCanvas(scene, 'desk', 64, 34, (p) => {
    p.rect(0, 2, 64, 23, '#4a4e5c');
    p.rect(1, 3, 62, 20, '#f1f2f7');
    p.rect(1, 3, 62, 1, '#ffffff');
    p.rect(1, 19, 62, 4, '#d3d6e0');
    for (const lx of [3, 57]) {
      p.rect(lx, 25, 4, 9, '#4a4e5c');
      p.rect(lx + 1, 25, 2, 8, '#7b8091');
    }
    for (const kx of [9, 41]) {
      p.rect(kx, 12, 14, 4, '#6b7080');
      p.rect(kx + 1, 13, 12, 2, '#a3a8b8');
      p.rect(kx + 17, 13, 2, 3, '#6b7080');
    }
  });

  // Monitores (3 variações de tela + desligado)
  const screens: [string, string, string, string][] = [
    ['#3d6fdc', '#9fc0ff', '#ff6b6b', '#ffd34d'],
    ['#2f9e6e', '#a7f0c9', '#ffd34d', '#ffffff'],
    ['#7b5cd6', '#d4c6ff', '#ff8fb1', '#5ee08a'],
  ];
  screens.forEach(([bg, a, b, c], i) => {
    makeCanvas(scene, `monitor${i}`, 22, 20, (p) => {
      p.rect(9, 14, 4, 4, '#7b8091');
      p.rect(5, 17, 12, 3, '#4a4e5c');
      p.rect(6, 17, 10, 1, '#b9bdc9');
      p.rect(0, 0, 22, 15, '#4a4e5c');
      p.rect(1, 1, 20, 13, '#e9ebf2');
      p.rect(2, 2, 18, 10, bg);
      p.rect(2, 2, 18, 1, a);
      p.rect(3, 4, 7, 5, a);
      p.rect(11, 4, 7, 1, b);
      p.rect(11, 6, 5, 1, c);
      p.rect(11, 8, 6, 1, '#ffffff');
      p.rect(3, 10, 4, 1, b);
    });
  });
  makeCanvas(scene, 'monitor_off', 22, 20, (p) => {
    p.rect(9, 14, 4, 4, '#7b8091');
    p.rect(5, 17, 12, 3, '#4a4e5c');
    p.rect(6, 17, 10, 1, '#b9bdc9');
    p.rect(0, 0, 22, 15, '#4a4e5c');
    p.rect(1, 1, 20, 13, '#e9ebf2');
    p.rect(2, 2, 18, 10, '#2a2f3d');
    p.px(4, 4, '#4a5168');
    p.px(5, 3, '#4a5168');
  });

  // Cadeira de escritório
  makeCanvas(scene, 'chair', 16, 20, (p) => {
    p.rect(3, 0, 10, 10, '#262830');
    p.rect(4, 1, 8, 8, '#4a4c58');
    p.rect(4, 1, 8, 1, '#5d6070');
    p.rect(1, 9, 14, 5, '#262830');
    p.rect(2, 10, 12, 3, '#575a68');
    p.rect(7, 14, 2, 3, '#262830');
    p.rect(3, 17, 10, 2, '#262830');
    p.px(2, 19, '#262830');
    p.px(13, 19, '#262830');
    p.px(7, 19, '#262830');
  });

  // Plantas
  makeCanvas(scene, 'plant', 16, 26, (p) => {
    p.disc(8, 10, 7, GREEN.dark);
    p.disc(8, 10, 6, GREEN.mid);
    p.disc(5, 8, 4, GREEN.base);
    p.disc(11, 7, 4, GREEN.light);
    p.disc(8, 4, 3, GREEN.lighter);
    p.px(6, 6, GREEN.shine);
    p.px(10, 4, GREEN.shine);
    p.rect(3, 16, 10, 2, '#7a3f22');
    p.rect(4, 18, 8, 8, '#7a3f22');
    p.rect(5, 18, 6, 7, '#c8734a');
    p.rect(5, 18, 2, 7, '#d98a5e');
  });
  makeCanvas(scene, 'plant_tall', 16, 32, (p) => {
    const blades: [number, number, string][] = [
      [3, 14, GREEN.mid],
      [5, 20, GREEN.base],
      [7, 23, GREEN.lighter],
      [9, 19, GREEN.light],
      [11, 15, GREEN.base],
    ];
    for (const [x, h, c] of blades) {
      p.rect(x, 24 - h, 2, h, c);
      p.px(x, 24 - h, GREEN.dark);
      p.px(x + 1, 24 - h + 3, '#e8e2a0');
    }
    p.rect(3, 23, 10, 2, '#3b3f4c');
    p.rect(4, 25, 8, 7, '#3b3f4c');
    p.rect(5, 25, 6, 6, '#e9ebf2');
  });

  // Estantes de livros
  for (let v = 0; v < 4; v++) {
    makeCanvas(scene, `bookshelf${v}`, 32, 40, (p) => {
      const r = rng(100 + v);
      p.rect(0, 0, 32, 40, '#4a2f1c');
      p.rect(1, 1, 30, 38, '#7a4e2d');
      p.rect(1, 1, 30, 1, '#9a6a40');
      for (let s = 0; s < 4; s++) {
        const y0 = 2 + s * 9;
        p.rect(2, y0, 28, 7, '#3b2416');
        let x = 3;
        while (x < 28) {
          const w = ri(r, 2, 3);
          const h = ri(r, 4, 7);
          if (x + w > 29) break;
          const c = pick(r, BOOKS);
          p.rect(x, y0 + 7 - h, w, h, c);
          p.px(x, y0 + 7 - h + 1, 'rgba(255,255,255,0.35)');
          x += w + (r() < 0.2 ? 1 : 0);
        }
        p.rect(1, y0 + 7, 30, 2, '#8f5e37');
      }
    });
  }

  // Quadro branco
  makeCanvas(scene, 'whiteboard', 52, 25, (p) => {
    p.rect(0, 0, 52, 22, '#6b7080');
    p.rect(1, 1, 50, 20, '#fbfbfd');
    p.rect(5, 5, 18, 1, '#3d6fdc');
    p.rect(5, 8, 12, 1, '#3d6fdc');
    p.rect(5, 11, 20, 1, '#e0524f');
    p.rect(5, 14, 14, 1, '#2a2230');
    p.rect(30, 4, 1, 13, INK);
    p.rect(30, 16, 17, 1, INK);
    p.rect(33, 11, 3, 5, '#5ec27a');
    p.rect(38, 8, 3, 8, '#f0a83a');
    p.rect(43, 5, 3, 11, '#3d6fdc');
    p.rect(4, 22, 44, 3, '#9aa0b0');
    p.rect(10, 21, 4, 1, '#e0524f');
    p.rect(16, 21, 4, 1, '#3d6fdc');
  });

  // Quadro de diploma
  makeCanvas(scene, 'diploma', 18, 16, (p) => {
    p.rect(0, 0, 18, 16, '#6b4226');
    p.rect(1, 1, 16, 14, '#a0682f');
    p.rect(2, 2, 14, 12, '#fff8e6');
    p.rect(4, 4, 10, 1, '#c9b48a');
    p.rect(4, 6, 8, 1, '#c9b48a');
    p.rect(4, 8, 9, 1, '#c9b48a');
    p.rect(11, 10, 3, 3, '#e0524f');
    p.px(12, 11, '#ffd34d');
  });

  // Mesa de reunião
  makeCanvas(scene, 'meeting_table', 72, 34, (p) => {
    p.rect(2, 0, 68, 26, '#5b3a22');
    p.rect(0, 2, 72, 22, '#5b3a22');
    p.rect(3, 1, 66, 22, '#b07a4a');
    p.rect(1, 3, 70, 18, '#b07a4a');
    p.rect(4, 2, 64, 2, '#c98f5c');
    p.rect(1, 20, 70, 4, '#8a5a35');
    p.rect(3, 23, 66, 2, '#8a5a35');
    p.rect(6, 25, 4, 9, '#5b3a22');
    p.rect(62, 25, 4, 9, '#5b3a22');
    p.rect(14, 8, 9, 6, '#ffffff');
    p.rect(15, 9, 6, 1, '#c9cdd8');
    p.rect(15, 11, 4, 1, '#c9cdd8');
    p.rect(44, 6, 12, 8, '#4a4e5c');
    p.rect(45, 7, 10, 6, '#9fc0ff');
    p.rect(32, 12, 3, 3, '#ffffff');
    p.px(33, 13, '#6b4226');
  });

  // Balcão da recepção
  makeCanvas(scene, 'reception', 72, 30, (p) => {
    p.rect(0, 0, 72, 30, '#3b2a1e');
    p.rect(1, 1, 70, 8, '#ece7f5');
    p.rect(1, 1, 70, 1, '#ffffff');
    p.rect(1, 9, 70, 20, '#8b5e3c');
    for (let x = 13; x < 70; x += 12) p.rect(x, 9, 1, 20, '#77502f');
    p.rect(1, 13, 70, 3, '#a596d8');
    p.rect(1, 13, 70, 1, '#b8abe4');
    p.rect(1, 28, 70, 1, '#5b3a22');
  });

  // Sofá
  makeCanvas(scene, 'sofa', 44, 26, (p) => {
    const o = '#1f3f46';
    p.rect(1, 0, 42, 12, o);
    p.rect(2, 1, 40, 10, '#3f8a96');
    p.rect(2, 1, 40, 2, '#5aa7b2');
    p.rect(0, 8, 8, 16, o);
    p.rect(1, 9, 6, 14, '#3f8a96');
    p.rect(1, 9, 6, 1, '#5aa7b2');
    p.rect(36, 8, 8, 16, o);
    p.rect(37, 9, 6, 14, '#3f8a96');
    p.rect(37, 9, 6, 1, '#5aa7b2');
    p.rect(7, 11, 30, 13, o);
    p.rect(8, 12, 14, 11, '#4b9aa6');
    p.rect(23, 12, 13, 11, '#4b9aa6');
    p.rect(8, 12, 14, 1, '#66b5c0');
    p.rect(23, 12, 13, 1, '#66b5c0');
    p.rect(1, 23, 42, 3, o);
  });

  // Tapetes
  makeCanvas(scene, 'rug_a', 80, 48, (p) => {
    p.rect(0, 0, 80, 48, '#7c6bc4');
    p.rect(2, 2, 76, 44, '#b3a6e6');
    for (let x = 6; x < 74; x += 4) {
      p.px(x, 5, '#f2eefc');
      p.px(x, 42, '#f2eefc');
    }
    p.rect(30, 18, 20, 12, '#9d8edb');
    p.rect(34, 21, 12, 6, '#c8bdf0');
  });
  makeCanvas(scene, 'rug_b', 96, 56, (p) => {
    p.rect(0, 0, 96, 56, '#b9663f');
    p.rect(2, 2, 92, 52, '#e3966a');
    p.rect(6, 6, 84, 44, '#d98a5e');
    for (let x = 8; x < 88; x += 6) {
      p.rect(x, 8, 3, 2, '#f3c49e');
      p.rect(x, 46, 3, 2, '#f3c49e');
    }
  });

  // Fliperama
  makeCanvas(scene, 'arcade', 22, 34, (p) => {
    p.rect(0, 0, 22, 34, '#1d1726');
    p.rect(1, 1, 20, 32, '#6a4fc2');
    p.rect(2, 2, 18, 5, '#ff6bb5');
    p.rect(4, 3, 14, 3, '#ffd34d');
    p.rect(3, 8, 16, 11, '#1d1726');
    p.rect(4, 9, 14, 9, '#22356b');
    p.rect(6, 11, 2, 2, '#5ee08a');
    p.rect(10, 11, 2, 2, '#5ee08a');
    p.rect(14, 11, 2, 2, '#5ee08a');
    p.rect(9, 15, 4, 2, '#ffd34d');
    p.rect(2, 20, 18, 5, '#3a2c5c');
    p.rect(5, 21, 2, 3, '#e0524f');
    p.rect(11, 22, 2, 2, '#ffd34d');
    p.rect(15, 22, 2, 2, '#5ee08a');
    p.rect(3, 26, 16, 6, '#56409e');
    p.rect(10, 28, 2, 3, '#ffd34d');
  });

  // Bebedouro
  makeCanvas(scene, 'cooler', 14, 28, (p) => {
    p.rect(3, 0, 8, 10, '#5b8fa8');
    p.rect(4, 1, 6, 8, '#9fd8f0');
    p.rect(4, 1, 2, 8, '#c6ecfa');
    p.rect(1, 10, 12, 18, '#7b8091');
    p.rect(2, 11, 10, 16, '#e9ebf2');
    p.rect(5, 14, 4, 2, '#3d6fdc');
    p.rect(3, 24, 8, 2, '#c9cdd8');
  });

  // Árvores
  makeCanvas(scene, 'tree', 48, 58, (p) => tree(p, 7));
  makeCanvas(scene, 'tree_orange', 48, 58, (p) => tree(p, 13, ['#ff9a1f', '#ffd08a']));
  makeCanvas(scene, 'tree_apple', 48, 58, (p) => tree(p, 29, ['#e0453a', '#ff9b8f']));

  makeCanvas(scene, 'bush', 24, 18, (p) => {
    p.rect(4, 16, 16, 2, 'rgba(0,0,0,0.18)');
    p.disc(12, 9, 8, GREEN.dark);
    p.disc(12, 9, 7, GREEN.base);
    p.disc(8, 7, 4, GREEN.lighter);
    p.disc(16, 8, 4, GREEN.light);
    p.px(7, 5, GREEN.shine);
    p.px(15, 6, GREEN.shine);
    p.px(11, 11, '#ff8fb1');
    p.px(17, 12, '#ffffff');
  });

  // Caixa de correio
  makeCanvas(scene, 'mailbox', 16, 26, (p) => {
    p.rect(3, 24, 10, 2, 'rgba(0,0,0,0.18)');
    p.rect(7, 12, 3, 13, '#6b4226');
    p.rect(1, 1, 13, 13, '#7a1f1f');
    p.rect(2, 2, 11, 11, '#e0453a');
    p.rect(2, 2, 11, 2, '#f06a5f');
    p.rect(4, 7, 7, 1, '#7a1f1f');
    p.rect(14, 3, 2, 6, '#ffd34d');
    p.px(14, 3, '#c9a21f');
  });

  // Placa de boas-vindas
  makeCanvas(scene, 'sign', 24, 26, (p) => {
    p.rect(4, 24, 16, 2, 'rgba(0,0,0,0.18)');
    p.rect(4, 12, 3, 13, '#6b4226');
    p.rect(17, 12, 3, 13, '#6b4226');
    p.rect(0, 1, 24, 13, '#5a371f');
    p.rect(1, 2, 22, 11, '#c8955f');
    p.rect(1, 2, 22, 1, '#ddb07c');
    p.rect(4, 5, 16, 1, '#7a4e2d');
    p.rect(4, 8, 10, 1, '#7a4e2d');
    p.px(17, 8, '#e0453a');
  });

  // Banco de praça
  makeCanvas(scene, 'bench', 36, 18, (p) => {
    p.rect(0, 0, 36, 5, '#5a371f');
    p.rect(1, 1, 34, 3, '#b07a4a');
    p.rect(0, 6, 36, 6, '#5a371f');
    p.rect(1, 7, 34, 2, '#c98f5c');
    p.rect(1, 9, 34, 2, '#b07a4a');
    p.rect(3, 12, 3, 6, '#3b3f4c');
    p.rect(30, 12, 3, 6, '#3b3f4c');
  });

  // Tapete da porta
  makeCanvas(scene, 'doormat', 44, 14, (p) => {
    p.rect(0, 0, 44, 14, '#5b47a8');
    p.rect(2, 2, 40, 10, '#7b5cd6');
    for (let x = 4; x < 40; x += 3) p.rect(x, 4, 1, 6, '#6a4fc2');
  });
}
