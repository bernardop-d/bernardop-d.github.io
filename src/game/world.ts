// Layout do mundo: grade de tiles 16×16.
//
//   cols 0-13  : jardim
//   cols 14-44 : prédio
//     ┌──────────────┬──────────────┐  rows 3-4   parede de cima
//     │  Projetos    │  Biblioteca  │  rows 5-13
//     ├────┬─────────┴──────────────┤  rows 14-15 parede do meio
//     │Reun│      Recepção          │  rows 16-26
//     └────┴────────[porta]─────────┘  rows 27-28 parede de baixo
//   rows 29-33 : praça / caminho de entrada

export const T = 16;
export const COLS = 48;
export const ROWS = 34;

export const TILE = {
  GRASS: 0,
  GRASS2: 1,
  FLOWERS: 2,
  PATH: 3,
  FLOOR: 4,
  WOOD: 5,
  CARPET: 6,
  LOBBY: 7,
  WALL_TOP: 8,
  WALL_FACE: 9,
  GLASS: 10,
} as const;
export const TILE_COUNT = 11;

export const SPAWN = { x: 34 * T + 8, y: 32 * T + 8 };

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function buildMap() {
  const ground: number[][] = [];
  const wall: boolean[][] = [];
  const glass: boolean[][] = [];

  for (let r = 0; r < ROWS; r++) {
    ground[r] = [];
    wall[r] = [];
    glass[r] = [];
    for (let c = 0; c < COLS; c++) {
      const h = hash(c, r);
      ground[r][c] = h < 0.07 ? TILE.FLOWERS : h < 0.55 ? TILE.GRASS : TILE.GRASS2;
      wall[r][c] = false;
      glass[r][c] = false;
    }
  }

  const each = (c0: number, r0: number, c1: number, r1: number, fn: (c: number, r: number) => void) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) fn(c, r);
  };
  const fill = (c0: number, r0: number, c1: number, r1: number, t: number) =>
    each(c0, r0, c1, r1, (c, r) => (ground[r][c] = t));
  const setWall = (c0: number, r0: number, c1: number, r1: number, v = true) =>
    each(c0, r0, c1, r1, (c, r) => (wall[r][c] = v));
  const setGlass = (c0: number, r0: number, c1: number, r1: number) =>
    each(c0, r0, c1, r1, (c, r) => (glass[r][c] = true));

  // Pisos
  fill(15, 5, 43, 26, TILE.LOBBY);
  fill(15, 5, 28, 13, TILE.FLOOR); // projetos
  fill(30, 5, 43, 13, TILE.WOOD); // biblioteca
  fill(15, 16, 23, 26, TILE.CARPET); // reuniões
  fill(20, 14, 21, 15, TILE.FLOOR);
  fill(36, 14, 37, 15, TILE.WOOD);
  fill(29, 9, 29, 10, TILE.FLOOR);
  fill(24, 21, 24, 22, TILE.LOBBY);
  fill(33, 27, 35, 28, TILE.LOBBY);

  // Caminhos externos
  fill(16, 30, 42, 31, TILE.PATH);
  fill(33, 29, 35, 33, TILE.PATH);

  // Paredes
  setWall(14, 3, 44, 4);
  setWall(14, 27, 44, 28);
  setWall(14, 3, 14, 28);
  setWall(44, 3, 44, 28);
  setWall(15, 14, 43, 15);
  setWall(29, 5, 29, 13);
  setWall(24, 16, 24, 26);

  // Portas
  setWall(20, 14, 21, 15, false);
  setWall(36, 14, 37, 15, false);
  setWall(29, 9, 29, 10, false);
  setWall(24, 21, 24, 22, false);
  setWall(33, 27, 35, 28, false);

  // Janelas de vidro
  setGlass(17, 4, 19, 4);
  setGlass(24, 4, 26, 4);
  setGlass(16, 28, 22, 28);
  setGlass(26, 28, 31, 28);
  setGlass(37, 28, 42, 28);

  // Parede com algo embaixo = topo; parede com chão embaixo = face (o lado visível)
  const walls: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    walls[r] = [];
    for (let c = 0; c < COLS; c++) {
      if (!wall[r][c]) {
        walls[r][c] = -1;
        continue;
      }
      const below = r + 1 < ROWS && wall[r + 1][c];
      walls[r][c] = below ? TILE.WALL_TOP : glass[r][c] ? TILE.GLASS : TILE.WALL_FACE;
    }
  }

  return { ground, walls };
}
