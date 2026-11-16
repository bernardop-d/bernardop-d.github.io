import Phaser from 'phaser';
import { Painter } from './textures';

// Personagens chibi 16×20 desenhados em texto.
// o = contorno · h/H = cabelo · s/S = pele · e = olhos · t/T = camisa · p = calça · b = sapato

export const CHAR_W = 16;
export const CHAR_H = 20;

const DOWN_TOP = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhhhhhhhho..',
  '.ohhhhhhhhhhhho.',
  '.ohhhhhhhhhhhho.',
  '.ohHssssssssHho.',
  '.ohssssssssssho.',
  '.ohssessssessho.',
  '.ohssessssessho.',
  '..osSssssssSso..',
  '...osssSSssso...',
  '....oooooooo....',
  '...otttttttto...',
  '..otTttttttTto..',
  '..otTttttttTto..',
  '..osTttttttTso..',
  '...oppppppppo...',
  '...opppoopppo...',
];

const UP_TOP = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhhhhhhhho..',
  '.ohhhhhhhhhhhho.',
  '.ohhhhhhhhhhhho.',
  '.ohhhhhhhhhhhho.',
  '.ohhhhhhhhhhhho.',
  '.ohhhhhhhhhhhho.',
  '.ohhHhhhhhhhHho.',
  '..ohhhhhhhhhho..',
  '...oHhhhhhhHo...',
  '....oooooooo....',
  '...otttttttto...',
  '..otTttttttTto..',
  '..otTttttttTto..',
  '..osTttttttTso..',
  '...oppppppppo...',
  '...opppoopppo...',
];

const SIDE_TOP = [
  '......ooooo.....',
  '....oohhhhhoo...',
  '...ohhhhhhhhho..',
  '..ohhhhhhhhhhho.',
  '..ohhhhhhhhhhho.',
  '..ohhhhhHssssso.',
  '..ohhhhHsssssso.',
  '..ohhhhssssseso.',
  '..ohhhhssssseso.',
  '...ohhhssssssso.',
  '....osssssSSo...',
  '.....ooooooo....',
  '....otttttto....',
  '....otTTttto....',
  '....otTTttto....',
  '....otssttto....',
  '....opppppo.....',
  '....opppppo.....',
];

const LEGS_FRONT = {
  stand: ['...oppo..oppo...', '...obbo..obbo...'],
  a: ['...obbo..oppo...', '.........obbo...'],
  b: ['...oppo..obbo...', '...obbo.........'],
};

const LEGS_SIDE = {
  stand: ['.....oppo.......', '.....obbbo......'],
  a: ['....opo.opo.....', '...obo...obo....'],
  b: ['.....opo.opo....', '....obo..obo....'],
};

export interface CharPalette {
  hair: string;
  hairShade: string;
  skin?: string;
  skinShade?: string;
  shirt: string;
  shirtShade: string;
  pants: string;
  shoes?: string;
}

export const PALETTES: Record<string, CharPalette> = {
  player: { hair: '#3b2a20', hairShade: '#261a14', shirt: '#4c7fe0', shirtShade: '#3461b8', pants: '#2e3346' },
  guide: { hair: '#6b4a2e', hairShade: '#4b321e', shirt: '#efe6d6', shirtShade: '#d2c6b0', pants: '#4a4c5a' },
  dev: {
    hair: '#9a5b33',
    hairShade: '#71401f',
    skin: '#f2c19a',
    shirt: '#f2a93b',
    shirtShade: '#d48a1f',
    pants: '#3a3d4e',
  },
  mentor: {
    hair: '#8d8f99',
    hairShade: '#6a6c76',
    skin: '#e0a979',
    skinShade: '#c98c5e',
    shirt: '#34343f',
    shirtShade: '#24242c',
    pants: '#24242c',
  },
};

/** Frames: 0-2 frente · 3-5 costas · 6-8 lado (direita; esquerda = flipX) */
export const FRAME = { down: 0, up: 3, side: 6 } as const;

export function makeCharacter(scene: Phaser.Scene, key: string, pal: CharPalette) {
  if (scene.textures.exists(key)) return;

  const colors: Record<string, string> = {
    o: '#2a2230',
    h: pal.hair,
    H: pal.hairShade,
    s: pal.skin ?? '#f6c9a2',
    S: pal.skinShade ?? '#e2a07c',
    e: '#2a2230',
    t: pal.shirt,
    T: pal.shirtShade,
    p: pal.pants,
    b: pal.shoes ?? '#1f1b26',
  };

  const frames = [
    [...DOWN_TOP, ...LEGS_FRONT.stand],
    [...DOWN_TOP, ...LEGS_FRONT.a],
    [...DOWN_TOP, ...LEGS_FRONT.b],
    [...UP_TOP, ...LEGS_FRONT.stand],
    [...UP_TOP, ...LEGS_FRONT.a],
    [...UP_TOP, ...LEGS_FRONT.b],
    [...SIDE_TOP, ...LEGS_SIDE.stand],
    [...SIDE_TOP, ...LEGS_SIDE.a],
    [...SIDE_TOP, ...LEGS_SIDE.b],
  ];

  const tex = scene.textures.createCanvas(key, CHAR_W * frames.length, CHAR_H);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const painter = new Painter(ctx);
  frames.forEach((rows, i) => {
    if (import.meta.env.DEV) {
      rows.forEach((r, y) => r.length !== CHAR_W && console.warn(`[sprite] frame ${i} linha ${y}: ${r.length}px`));
    }
    painter.pixels(rows, colors, i * CHAR_W, 0);
    tex.add(i, 0, i * CHAR_W, 0, CHAR_W, CHAR_H);
  });
  tex.refresh();

  for (const dir of ['down', 'up', 'side'] as const) {
    const b = FRAME[dir];
    scene.anims.create({
      key: `${key}-${dir}`,
      frames: [b + 1, b, b + 2, b].map((frame) => ({ key, frame })),
      frameRate: 8,
      repeat: -1,
    });
  }
}
