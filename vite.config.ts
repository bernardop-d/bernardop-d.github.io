import { defineConfig } from 'vite';

export default defineConfig({
  // caminhos relativos: funciona no GitHub Pages com qualquer nome de repositório
  base: './',
  server: {
    port: 3000,
  },
});
