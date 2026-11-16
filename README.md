# Portfolio Mundo 🏢

Portfólio interativo em pixel art: um escritório que você explora andando com um personagem. Cada sala é uma seção e cada objeto abre um conteúdo: projetos, skills, experiência e contato.

**▶ Acesse:** https://bernardop-d.github.io
**📄 Currículo direto:** https://bernardop-d.github.io/?abrir=all

## O mapa

| Lugar | Objeto | Conteúdo |
|---|---|---|
| Sala de Projetos | Monitores | Um projeto por monitor |
| Biblioteca | Estantes | Skills por categoria |
| Sala de Reuniões | Quadro branco / diploma | Experiência / formação |
| Recepção | Balcão / fliperama | Sobre mim / hobbies |
| Lado de fora | Placa / caixa de correio | Como jogar / contato |

**Controles:** WASD ou setas para andar · `E` / `Espaço` para interagir · clique ou toque para ir até um lugar · `Esc` para fechar.

Para quem prefere o formato tradicional, o botão **Currículo** abre o portfólio completo numa janela, com opção de salvar em PDF.

## Tecnologias

- [Phaser 3](https://phaser.io/): engine do jogo, física arcade e tilemap
- TypeScript + [Vite](https://vitejs.dev/)
- Toda a arte (tiles, móveis, árvores e personagens) é **gerada por código**, pixel a pixel, sem arquivos de imagem
- Interface (etiquetas, painéis, diálogos) em HTML/CSS sobre o canvas
- Deploy automático no GitHub Pages via GitHub Actions

## Rodando localmente

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # gera a pasta dist/
```

## Estrutura

```
src/
├── data/portfolio.ts    # TODO o conteúdo (projetos, skills, experiência...)
├── game/world.ts        # planta do escritório (paredes, portas, pisos)
├── game/textures.ts     # arte em pixel gerada por código
├── game/characters.ts   # sprites dos personagens (desenhados em texto)
├── scenes/GameScene.ts  # mundo, móveis, NPCs, movimento e interação
└── ui/ui.ts             # HUD, painéis, diálogos e currículo
```

Para atualizar o conteúdo, basta editar `src/data/portfolio.ts`: os monitores, as estantes e o currículo se ajustam sozinhos.

## Licença

[MIT](LICENSE) © 2026 bernardop-d
