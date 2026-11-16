import Phaser from 'phaser';
import './style.css';
import './ui/ui';
import { GameScene } from './scenes/GameScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#3f7a3a',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [GameScene],
});
