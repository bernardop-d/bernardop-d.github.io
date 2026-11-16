import Phaser from 'phaser';
import { T, COLS, ROWS, SPAWN, buildMap } from '../game/world';
import { generateTextures } from '../game/textures';
import { makeCharacter, PALETTES, FRAME } from '../game/characters';
import { ui, SECTION_COLORS } from '../ui/ui';
import { projects, skills, npcs, type NpcData } from '../data/portfolio';

type Dir = keyof typeof FRAME;

interface Interactable {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  action: () => void;
  /** só pode ser usado por quem está ao sul (objetos de parede/estantes) */
  fromBelow?: boolean;
  /** desenhar contorno amarelo */
  box?: boolean;
  /** onde o jogador deve parar ao clicar no objeto */
  approach?: { x: number; y: number };
  /** altura extra da etiqueta de foco */
  tagLift?: number;
}

const SPEED = 85;
const REACH = 24;
const WORLD_W = COLS * T;
const WORLD_H = ROWS * T;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private wallLayer!: Phaser.Tilemaps.TilemapLayer;
  private solids: Phaser.GameObjects.GameObject[] = [];
  private interactables: Interactable[] = [];
  private focus: Interactable | null = null;
  private highlight!: Phaser.GameObjects.Graphics;
  private focusTag!: HTMLElement;
  private labels: { el: HTMLElement; get: () => { x: number; y: number } }[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'W' | 'A' | 'S' | 'D' | 'E' | 'SPACE' | 'ENTER', Phaser.Input.Keyboard.Key>;

  private dir: Dir = 'up';
  private target: { x: number; y: number } | null = null;
  private pending: Interactable | null = null;
  private lastPos = { x: 0, y: 0 };
  private stuckFrames = 0;

  constructor() {
    super('GameScene');
  }

  create() {
    generateTextures(this);
    for (const [key, pal] of Object.entries(PALETTES)) makeCharacter(this, key, pal);

    this.buildTilemap();
    this.buildProjectsRoom();
    this.buildLibrary();
    this.buildMeetingRoom();
    this.buildLobby();
    this.buildOutside();
    this.createPlayer();

    this.addNpc('dev', 336, 178, npcs.dev, SECTION_COLORS.project);
    this.addNpc('mentor', 262, 322, npcs.mentor, '#5b6070');
    this.addNpc('guide', 506, 404, npcs.guide, SECTION_COLORS.help);

    this.highlight = this.add.graphics().setDepth(1e6);
    this.focusTag = ui.createTag('', SECTION_COLORS.project, 'focus');
    ui.place(this.focusTag, 0, 0, false);

    this.setupInput();
    this.setupCamera();

    this.game.events.on(Phaser.Core.Events.POST_RENDER, this.syncLabels, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.POST_RENDER, this.syncLabels, this);
    });
  }

  // ── Mundo ────────────────────────────────────────────────────────

  private buildTilemap() {
    const { ground, walls } = buildMap();
    const map = this.make.tilemap({ tileWidth: T, tileHeight: T, width: COLS, height: ROWS });
    const tileset = map.addTilesetImage('tiles', 'tiles', T, T, 0, 0);
    if (!tileset) throw new Error('tileset não carregou');
    const g = map.createBlankLayer('ground', tileset)!.setDepth(-100);
    const w = map.createBlankLayer('walls', tileset)!.setDepth(-50);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        g.putTileAt(ground[r][c], c, r);
        if (walls[r][c] >= 0) w.putTileAt(walls[r][c], c, r);
      }
    }
    w.setCollisionByExclusion([-1]);
    this.wallLayer = w;
  }

  /** Coloca um objeto com origem no pé (x, y = base, centro) */
  private put(key: string, x: number, y: number, opts: { solid?: [number, number]; depth?: number } = {}) {
    const img = this.add.image(x, y, key).setOrigin(0.5, 1);
    img.setDepth(opts.depth ?? y);
    if (opts.solid) this.addSolid(x, y - opts.solid[1] / 2, opts.solid[0], opts.solid[1]);
    return img;
  }

  private addSolid(cx: number, cy: number, w: number, h: number) {
    const z = this.add.zone(cx, cy, w, h);
    this.physics.add.existing(z, true);
    this.solids.push(z);
  }

  private addInteractable(img: Phaser.GameObjects.Image | null, it: Omit<Interactable, 'x' | 'y' | 'w' | 'h'> & Partial<Interactable>) {
    const b = img?.getBounds();
    this.interactables.push({
      box: true,
      x: b?.x ?? 0,
      y: b?.y ?? 0,
      w: b?.width ?? 0,
      h: b?.height ?? 0,
      ...it,
    });
  }

  private buildProjectsRoom() {
    // sala: x 240-464, y 80-224
    const desks: [number, number][] = [
      [280, 128],
      [392, 128],
      [280, 200],
      [392, 200],
    ];
    desks.forEach(([x, y], d) => {
      this.put('desk', x, y, { solid: [62, 22] });
      [-16, 16].forEach((dx, side) => {
        const idx = d * 2 + side;
        const mx = x + dx;
        this.put('chair', mx, y + 16);
        const p = projects[idx];
        if (!p) {
          this.put('monitor_off', mx, y - 14, { depth: y + 0.5 });
          return;
        }
        const mon = this.put(`monitor${idx % 3}`, mx, y - 14, { depth: y + 0.5 });
        this.addInteractable(mon, {
          label: p.title,
          color: SECTION_COLORS.project,
          action: () => ui.open(`project:${idx}`),
          approach: { x: mx, y: y + 10 },
        });
      });
    });
    this.put('plant', 452, 98);
    this.put('plant', 252, 222);
    this.put('plant_tall', 452, 222);
  }

  private buildLibrary() {
    // sala: x 480-704, y 80-224
    const shelfX = [508, 548, 588, 628, 668];
    shelfX.forEach((x, i) => {
      const shelf = this.put(`bookshelf${i % 4}`, x, 106, { solid: [32, 14] });
      const group = skills[i];
      if (!group) return;
      this.addInteractable(shelf, {
        label: group.title,
        color: SECTION_COLORS.skills,
        action: () => ui.open(`skills:${i}`),
        fromBelow: true,
        approach: { x, y: 118 },
      });
    });
    this.put('rug_a', 588, 200, { depth: -40 });
    this.put('sofa', 588, 160, { solid: [44, 12] });
    this.put('plant', 694, 222);
    this.put('plant', 492, 222);
  }

  private buildMeetingRoom() {
    // sala: x 240-384, y 256-432
    const board = this.put('whiteboard', 270, 263, { solid: [52, 4] });
    this.addInteractable(board, {
      label: 'Experiência',
      color: SECTION_COLORS.experience,
      action: () => ui.open('experience'),
      fromBelow: true,
      approach: { x: 270, y: 276 },
    });
    const diploma = this.put('diploma', 366, 258, { depth: 258 });
    this.addInteractable(diploma, {
      label: 'Formação',
      color: SECTION_COLORS.education,
      action: () => ui.open('education'),
      fromBelow: true,
      approach: { x: 366, y: 272 },
    });

    this.put('chair', 296, 344);
    this.put('chair', 328, 344);
    this.put('meeting_table', 312, 380, { solid: [70, 24] });
    this.put('chair', 296, 398);
    this.put('chair', 328, 398);
    this.put('plant', 372, 428);
    this.put('plant', 252, 428);
  }

  private buildLobby() {
    // sala: x 400-704, y 256-432
    this.put('rug_b', 552, 360, { depth: -40 });
    const desk = this.put('reception', 552, 318, { solid: [72, 20] });
    this.put('monitor1', 532, 300, { depth: 318.5 });
    this.put('plant', 578, 302, { depth: 318.4 });
    this.addInteractable(desk, {
      label: 'Sobre mim',
      color: SECTION_COLORS.about,
      action: () => ui.open('about'),
      approach: { x: 552, y: 332 },
    });

    this.put('plant', 412, 290);
    this.put('sofa', 446, 292, { solid: [44, 12] });
    this.put('cooler', 662, 286, { solid: [12, 6] });

    const arcade = this.put('arcade', 688, 290, { solid: [20, 10] });
    this.addInteractable(arcade, {
      label: 'Hobbies',
      color: SECTION_COLORS.hobbies,
      action: () => ui.open('hobbies'),
      approach: { x: 688, y: 302 },
    });

    this.put('plant_tall', 412, 430);
    this.put('plant_tall', 692, 430);
    this.put('doormat', 552, 462, { depth: -40 });
  }

  private buildOutside() {
    const sign = this.put('sign', 506, 500, { solid: [20, 6] });
    this.addInteractable(sign, {
      label: 'Como jogar',
      color: SECTION_COLORS.help,
      action: () => ui.open('help'),
      approach: { x: 506, y: 512 },
    });
    const mail = this.put('mailbox', 600, 500, { solid: [12, 6] });
    this.addInteractable(mail, {
      label: 'Contato',
      color: SECTION_COLORS.contact,
      action: () => ui.open('contact'),
      approach: { x: 600, y: 512 },
    });

    this.put('bench', 440, 478, { solid: [36, 8] });
    this.put('bench', 664, 478, { solid: [36, 8] });

    const trees: [number, number][] = [
      [2, 5], [7, 3], [11, 6], [4, 10], [9, 11], [1, 16], [6, 15], [11, 18],
      [3, 21], [8, 22], [12, 26], [2, 27], [7, 30], [11, 33], [1, 33],
      [46, 8], [46, 17], [46, 25], [46, 33], [20, 34], [27, 34], [41, 34],
    ];
    const kinds = ['tree', 'tree_orange', 'tree', 'tree_apple'];
    trees.forEach(([c, r], i) => {
      this.put(kinds[i % kinds.length], c * T + 8, r * T, { solid: [12, 6] });
    });

    const bushes: [number, number][] = [
      [17, 2], [22, 2], [27, 2], [32, 2], [37, 2], [42, 2],
      [16, 29], [42, 29], [13, 12], [13, 20], [24, 33], [38, 33],
    ];
    bushes.forEach(([c, r]) => this.put('bush', c * T + 8, r * T + 14, { solid: [18, 6] }));
  }

  // ── Personagens ──────────────────────────────────────────────────

  private createPlayer() {
    // Em dev: ?spawn=x,y (em tiles) para começar em outro lugar
    let { x: sx, y: sy } = SPAWN;
    const spawnParam = import.meta.env.DEV && new URLSearchParams(location.search).get('spawn');
    if (spawnParam) [sx, sy] = spawnParam.split(',').map((n) => Number(n) * T + 8);

    this.playerShadow = this.add.image(sx, sy, 'shadow');
    this.player = this.physics.add.sprite(sx, sy, 'player', FRAME.up).setOrigin(0.5, 1);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 6).setOffset(3, 14);
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.player, this.solids);

    const tag = ui.createTag('Você', '#2f6fe0');
    this.labels.push({ el: tag, get: () => ({ x: this.player.x, y: this.player.y - 22 }) });
  }

  private addNpc(key: string, x: number, y: number, data: NpcData, color: string) {
    this.add.image(x, y - 1, 'shadow').setDepth(y - 0.1);
    const npc = this.add.sprite(x, y, key, FRAME.down).setOrigin(0.5, 1).setDepth(y);
    this.addSolid(x, y - 3, 10, 6);

    const tag = ui.createTag(data.name, color);
    this.labels.push({ el: tag, get: () => ({ x, y: y - 22 }) });

    this.addInteractable(null, {
      x: x - 8,
      y: y - 20,
      w: 16,
      h: 20,
      box: false,
      tagLift: 20,
      label: `Falar com ${data.name}`,
      color,
      approach: { x, y: y + 12 },
      action: () => {
        // vira para o jogador
        const dx = this.player.x - x;
        const dy = this.player.y - y;
        if (Math.abs(dx) > Math.abs(dy)) npc.setFrame(FRAME.side).setFlipX(dx < 0);
        else npc.setFrame(dy < 0 ? FRAME.up : FRAME.down).setFlipX(false);
        ui.openDialog(data, color);
      },
    });
  }

  // ── Entrada e câmera ─────────────────────────────────────────────

  private setupInput() {
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = kb.addKeys('W,A,S,D,E,SPACE,ENTER') as GameScene['keys'];

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (ui.isBusy()) return;
      const wx = p.worldX;
      const wy = p.worldY;
      const hit = this.interactables.find((i) => wx >= i.x && wx <= i.x + i.w && wy >= i.y && wy <= i.y + i.h);
      if (hit) {
        if (hit === this.focus) return this.trigger(hit);
        this.pending = hit;
        this.target = hit.approach ?? { x: hit.x + hit.w / 2, y: hit.y + hit.h + 8 };
      } else {
        this.pending = null;
        this.target = { x: wx, y: wy };
      }
      this.stuckFrames = 0;
    });
  }

  private setupCamera() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.setRoundPixels(true);
    cam.startFollow(this.player, true, 0.12, 0.12, 0, 10);
    this.fitZoom();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.fitZoom, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.fitZoom, this));
  }

  private fitZoom() {
    const { width, height } = this.scale;
    this.cameras.main.setSize(width, height);
    const z = Math.max(2, Math.ceil(width / WORLD_W), Math.ceil(height / WORLD_H), Math.round(height / 330));
    this.cameras.main.setZoom(z);
  }

  // ── Loop ─────────────────────────────────────────────────────────

  update() {
    const busy = ui.isBusy();
    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.E) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.ENTER);

    let vx = 0;
    let vy = 0;
    if (!busy) {
      if (this.cursors.left.isDown || this.keys.A.isDown) vx = -1;
      else if (this.cursors.right.isDown || this.keys.D.isDown) vx = 1;
      if (this.cursors.up.isDown || this.keys.W.isDown) vy = -1;
      else if (this.cursors.down.isDown || this.keys.S.isDown) vy = 1;
    }

    if (vx || vy) {
      this.target = null;
      this.pending = null;
      if (vx && vy) {
        vx *= Math.SQRT1_2;
        vy *= Math.SQRT1_2;
      }
    } else if (this.target && !busy) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 2) this.target = null;
      else {
        vx = dx / d;
        vy = dy / d;
        // destrava se ficar preso numa parede/móvel
        const moved = Math.hypot(this.player.x - this.lastPos.x, this.player.y - this.lastPos.y);
        this.stuckFrames = moved < 0.25 ? this.stuckFrames + 1 : 0;
        if (this.stuckFrames > 12) {
          this.target = null;
          vx = vy = 0;
        }
      }
    }
    this.lastPos = { x: this.player.x, y: this.player.y };

    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(vx * SPEED, vy * SPEED);
    this.animate(vx, vy);
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y - 1).setDepth(this.player.y - 0.1);

    // foco no objeto mais próximo
    const next = busy ? null : this.findFocus();
    if (next !== this.focus) {
      this.focus = next;
      if (next) ui.setFocusTag(this.focusTag, next.label, next.color);
    }

    if (this.focus && this.pending === this.focus) this.trigger(this.focus);
    else if (interactPressed && this.focus && !busy && performance.now() - ui.lastClosed > 250) this.trigger(this.focus);

    this.drawHighlight();
  }

  private animate(vx: number, vy: number) {
    if (!vx && !vy) {
      this.player.anims.stop();
      this.player.setFrame(FRAME[this.dir]);
      return;
    }
    if (Math.abs(vx) > Math.abs(vy)) {
      this.dir = 'side';
      this.player.setFlipX(vx < 0);
    } else {
      this.dir = vy < 0 ? 'up' : 'down';
      this.player.setFlipX(false);
    }
    this.player.anims.play(`player-${this.dir}`, true);
  }

  private findFocus() {
    const px = this.player.x;
    const py = this.player.y - 3;
    let best: Interactable | null = null;
    let bestD = REACH;
    for (const it of this.interactables) {
      if (it.fromBelow && py < it.y + it.h - 6) continue;
      const cx = Phaser.Math.Clamp(px, it.x, it.x + it.w);
      const cy = Phaser.Math.Clamp(py, it.y, it.y + it.h);
      const d = Math.hypot(px - cx, py - cy);
      if (d < bestD) {
        best = it;
        bestD = d;
      }
    }
    return best;
  }

  private trigger(it: Interactable) {
    this.target = null;
    this.pending = null;
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.animate(0, 0);
    it.action();
  }

  private drawHighlight() {
    const g = this.highlight;
    g.clear();
    const f = this.focus;
    if (!f || !f.box) return;
    const a = 0.75 + Math.sin(this.time.now / 180) * 0.25;
    g.fillStyle(0xffe14d, 0.18 * a);
    g.fillRect(f.x - 1, f.y - 1, f.w + 2, f.h + 2);
    g.lineStyle(1, 0xffe14d, a);
    g.strokeRect(f.x - 1.5, f.y - 1.5, f.w + 3, f.h + 3);
  }

  /** Posiciona etiquetas HTML em cima dos objetos do mundo (após a câmera mover) */
  private syncLabels() {
    const cam = this.cameras.main;
    const z = cam.zoom;
    const ox = cam.worldView.x;
    const oy = cam.worldView.y;
    for (const l of this.labels) {
      const p = l.get();
      ui.place(l.el, (p.x - ox) * z, (p.y - oy) * z);
    }
    const f = this.focus;
    if (f && !ui.isBusy()) {
      ui.place(this.focusTag, (f.x + f.w / 2 - ox) * z, (f.y - (f.tagLift ?? 0) - oy) * z - 6);
    } else {
      ui.place(this.focusTag, 0, 0, false);
    }
  }
}
