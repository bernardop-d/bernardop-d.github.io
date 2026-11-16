import {
  profile,
  projects,
  skills,
  experience,
  education,
  hobbies,
  contact,
  type NpcData,
  type SectionId,
} from '../data/portfolio';

export const SECTION_COLORS = {
  project: '#7b5cd6',
  skills: '#f08a24',
  experience: '#3b82f6',
  education: '#0ea5e9',
  about: '#14b8a6',
  contact: '#e0453a',
  hobbies: '#ec4899',
  help: '#22a35a',
} as const;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const chips = (items: string[]) =>
  `<div class="chips">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join('')}</div>`;

const head = (eyebrow: string, title: string, color: string) =>
  `<p class="eyebrow" style="--c:${color}">${esc(eyebrow)}</p><h2>${esc(title)}</h2>`;

const btn = (label: string, open: string, primary = false) =>
  `<button class="btn${primary ? ' primary' : ''}" data-open="${open}">${esc(label)}</button>`;

const extLink = (label: string, url: string) =>
  `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;

function renderProject(i: number) {
  const p = projects[i];
  if (!p) return '';
  const nav =
    projects.length > 1
      ? `<div class="row spread">
          ${btn('← Anterior', `project:${(i - 1 + projects.length) % projects.length}`)}
          <span class="muted">${i + 1} / ${projects.length}</span>
          ${btn('Próximo →', `project:${(i + 1) % projects.length}`)}
        </div>`
      : '';
  return `
    ${head(`Projeto${p.year ? ' · ' + p.year : ''}`, p.title, SECTION_COLORS.project)}
    <p class="lead">${esc(p.summary)}</p>
    ${p.image ? `<img class="shot" src="${esc(p.image)}" alt="${esc(p.title)}" />` : ''}
    ${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}
    ${chips(p.tech)}
    ${p.links?.length ? `<div class="row">${p.links.map((l) => extLink(l.label, l.url)).join('')}</div>` : ''}
    ${nav}`;
}

function renderProjects() {
  return `
    ${head('Sala de Projetos', 'Projetos', SECTION_COLORS.project)}
    <div class="cards">
      ${projects
        .map(
          (p, i) => `
        <button class="card" data-open="project:${i}">
          <strong>${esc(p.title)}</strong>
          <span>${esc(p.summary)}</span>
          <small>${esc(p.tech.join(' · '))}</small>
        </button>`,
        )
        .join('')}
    </div>`;
}

function renderSkills(index?: number) {
  const groups = index === undefined ? skills : [skills[index]].filter(Boolean);
  return `
    ${head('Biblioteca', index === undefined ? 'Skills' : groups[0]?.title ?? 'Skills', SECTION_COLORS.skills)}
    ${groups.map((g) => `${index === undefined ? `<h3>${esc(g.title)}</h3>` : ''}${chips(g.items)}`).join('')}
    ${index !== undefined ? `<div class="row">${btn('Ver todas as skills', 'skills')}</div>` : ''}`;
}

function renderExperience() {
  return `
    ${head('Sala de Reuniões', 'Experiência', SECTION_COLORS.experience)}
    <ol class="timeline">
      ${experience
        .map(
          (e) => `<li><strong>${esc(e.role)}</strong> <span class="muted">· ${esc(e.place)}</span>
          <small>${esc(e.period)}</small><ul class="bullets">${e.description.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></li>`,
        )
        .join('')}
    </ol>`;
}

function renderEducation() {
  return `
    ${head('Sala de Reuniões', 'Formação', SECTION_COLORS.education)}
    <ol class="timeline">
      ${education
        .map((e) => `<li><strong>${esc(e.course)}</strong> <span class="muted">· ${esc(e.place)}</span><small>${esc(e.period)}</small></li>`)
        .join('')}
    </ol>`;
}

function renderAbout() {
  return `
    ${head('Recepção', profile.name, SECTION_COLORS.about)}
    <p class="lead">${esc(profile.role)} · ${esc(profile.location)}</p>
    ${profile.bio.map((b) => `<p>${esc(b)}</p>`).join('')}
    <div class="row">${btn('Projetos', 'projects', true)}${btn('Contato', 'contact')}</div>`;
}

function renderHobbies() {
  return `
    ${head('Fliperama', 'Fora do código', SECTION_COLORS.hobbies)}
    ${chips(hobbies)}`;
}

function renderContact() {
  const gh = contact.github.replace(/^https?:\/\/(www\.)?/, '');
  const li = contact.linkedin.replace(/^https?:\/\/(www\.)?/, '');
  return `
    ${head('Caixa de correio', 'Contato', SECTION_COLORS.contact)}
    <ul class="contact">
      <li><span>E-mail</span><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
      <li><span>GitHub</span><a href="${esc(contact.github)}" target="_blank" rel="noopener">${esc(gh)}</a></li>
      <li><span>LinkedIn</span><a href="${esc(contact.linkedin)}" target="_blank" rel="noopener">${esc(li)}</a></li>
    </ul>`;
}

function renderHelp() {
  return `
    ${head('Como jogar', 'Controles', SECTION_COLORS.help)}
    <ul class="keys">
      <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ou setas <span>andar</span></li>
      <li><kbd>E</kbd> ou <kbd>Espaço</kbd> <span>interagir com o que brilha</span></li>
      <li>Clique / toque no chão <span>ir até lá</span></li>
      <li>Clique em um objeto <span>ir até ele e abrir</span></li>
      <li><kbd>Esc</kbd> <span>fechar painel</span></li>
    </ul>
    <div class="row">${btn('Ver currículo', 'all', true)}</div>`;
}

/** Currículo / portfólio tradicional em uma janela flutuante */
function renderResume() {
  const words = profile.name.split(' ').filter(Boolean);
  const initials = (words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '');
  const strip = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const [degree, ...courses] = education;

  return `
    <div class="win-bar">
      <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="win-title">${esc(strip(contact.github))} · currículo</span>
      <div class="win-actions">
        <button class="btn sm" data-print>Salvar PDF</button>
        <button class="btn sm primary" data-close>Voltar ao escritório</button>
      </div>
    </div>
    <div class="cv">
      <aside class="cv-side">
        <div class="cv-avatar" aria-hidden="true">${esc(initials.toUpperCase())}</div>
        <h1>${esc(profile.name)}</h1>
        <p class="cv-role">${esc(profile.role)}</p>
        <p class="muted cv-loc">${esc(profile.location)}</p>

        <h4>Contato</h4>
        <ul class="cv-links">
          <li><span>E-mail</span><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
          <li><span>GitHub</span><a href="${esc(contact.github)}" target="_blank" rel="noopener">${esc(strip(contact.github))}</a></li>
          <li><span>LinkedIn</span><a href="${esc(contact.linkedin)}" target="_blank" rel="noopener">${esc(strip(contact.linkedin))}</a></li>
        </ul>

        ${skills
          .map(
            (g) => `<h4>${esc(g.title)}</h4><div class="chips sm">${g.items.map((i) => `<span class="chip">${esc(i)}</span>`).join('')}</div>`,
          )
          .join('')}
      </aside>

      <main class="cv-main">
        <section>
          <h3>Resumo</h3>
          ${profile.bio.map((b) => `<p>${esc(b)}</p>`).join('')}
        </section>

        <section>
          <h3>Experiência</h3>
          ${experience
            .map(
              (e) => `
            <article class="cv-item">
              <header><strong>${esc(e.role)}</strong><small>${esc(e.period)}</small></header>
              <p class="cv-place">${esc(e.place)}</p>
              <ul>${e.description.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
            </article>`,
            )
            .join('')}
        </section>

        <section>
          <h3>Projetos</h3>
          <div class="cv-projects">
            ${projects
              .map(
                (p) => `
              <article class="cv-project">
                <header><strong>${esc(p.title)}</strong>${p.year ? `<small>${esc(p.year)}</small>` : ''}</header>
                <p>${esc(p.summary)}</p>
                <p class="cv-tech">${esc(p.tech.join(' · '))}</p>
                ${p.links?.length ? `<div class="cv-plinks">${p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
              </article>`,
              )
              .join('')}
          </div>
        </section>

        <section>
          <h3>Formação</h3>
          ${
            degree
              ? `<article class="cv-item"><header><strong>${esc(degree.course)}</strong><small>${esc(degree.period)}</small></header><p class="cv-place">${esc(degree.place)}</p></article>`
              : ''
          }
          ${
            courses.length
              ? `<h4 class="cv-sub">Cursos e certificações</h4>
                 <ul class="cv-courses">${courses.map((c) => `<li><strong>${esc(c.course)}</strong> <span class="muted">· ${esc(c.place)}</span></li>`).join('')}</ul>`
              : ''
          }
        </section>
      </main>
    </div>`;
}

type OpenTarget = SectionId | `project:${number}` | `skills:${number}`;

class UI {
  private root: HTMLElement;
  private labels: HTMLElement;
  private modal: HTMLElement;
  private modalBody: HTMLElement;
  private dialog: HTMLElement;
  private dialogName: HTMLElement;
  private dialogText: HTMLElement;
  private dialogActions: HTMLElement;
  private intro: HTMLElement;
  private dialogState: { npc: NpcData; i: number } | null = null;
  /** momento em que o último painel fechou (evita reabrir com a mesma tecla) */
  lastClosed = 0;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'ui';
    this.root.innerHTML = `
      <div class="labels"></div>
      <header class="hud">
        <div class="hud-id">
          <span class="hud-avatar" aria-hidden="true"></span>
          <div><strong>${esc(profile.name)}</strong><small>${esc(profile.role)}</small></div>
        </div>
        <nav>
          ${btn('Currículo', 'all')}
          ${btn('Contato', 'contact')}
          <button class="btn icon" data-open="help" aria-label="Ajuda">?</button>
        </nav>
      </header>
      <div class="hint"><span class="desk-only">WASD / setas para andar · <kbd>E</kbd> para interagir · clique para ir</span><span class="touch-only">Toque no chão para andar · toque nos objetos</span></div>
      <div class="dialog" hidden>
        <div class="tag dialog-name"></div>
        <p class="dialog-text"></p>
        <div class="row dialog-actions"></div>
        <span class="dialog-hint">E / clique ▸</span>
      </div>
      <div class="modal" hidden>
        <div class="modal-card" role="dialog" aria-modal="true">
          <button class="close" data-close aria-label="Fechar">✕</button>
          <div class="modal-body"></div>
        </div>
      </div>
      <div class="intro">
        <div class="intro-card">
          <p class="eyebrow" style="--c:${SECTION_COLORS.help}">Portfólio interativo</p>
          <h1>${esc(profile.name)}</h1>
          <p class="lead">${esc(profile.role)}</p>
          <p>Bem-vindo(a) ao meu escritório! Ande pelas salas e interaja com os objetos que brilham para conhecer meus projetos, skills e experiência.</p>
          <ul class="keys compact">
            <li><kbd>WASD</kbd> / setas <span>andar</span></li>
            <li><kbd>E</kbd> <span>interagir</span></li>
            <li>clique / toque <span>ir até lá</span></li>
          </ul>
          <div class="row">
            <button class="btn primary" data-start>Explorar o escritório</button>
            ${btn('Ver currículo', 'all')}
          </div>
        </div>
      </div>`;
    document.body.appendChild(this.root);

    const q = <E extends HTMLElement>(sel: string) => this.root.querySelector(sel) as E;
    this.labels = q('.labels');
    this.modal = q('.modal');
    this.modalBody = q('.modal-body');
    this.dialog = q('.dialog');
    this.dialogName = q('.dialog-name');
    this.dialogText = q('.dialog-text');
    this.dialogActions = q('.dialog-actions');
    this.intro = q('.intro');
    // Links diretos: ?jogar pula a intro · ?abrir=all abre o currículo (ou about, contact, project:0...)
    const params = new URLSearchParams(location.search);
    if (params.has('jogar')) this.intro.hidden = true;
    const deep = params.get('abrir');
    if (deep && /^(about|projects|skills|experience|education|hobbies|contact|help|all|project:\d+|skills:\d+)$/.test(deep)) {
      this.intro.hidden = true;
      this.open(deep as OpenTarget);
    }

    this.root.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-print]')) return window.print();
      const open = t.closest<HTMLElement>('[data-open]');
      if (open) {
        this.hideIntro();
        this.hideDialog();
        this.open(open.dataset.open as OpenTarget);
        return;
      }
      if (t.closest('[data-close]') || t === this.modal) return this.close();
      if (t.closest('[data-start]')) return this.hideIntro();
      if (t.closest('.dialog') && !t.closest('a,button')) return this.advance();
    });

    window.addEventListener('keydown', (e) => {
      if (!this.intro.hidden) {
        if (['Enter', ' ', 'Escape', 'e', 'E'].includes(e.key)) {
          e.preventDefault();
          this.hideIntro();
        }
        return;
      }
      if (!this.dialog.hidden) {
        if (['e', 'E', ' ', 'Enter'].includes(e.key)) {
          e.preventDefault();
          this.advance();
        } else if (e.key === 'Escape') this.close();
        return;
      }
      if (!this.modal.hidden && e.key === 'Escape') this.close();
    });
  }

  isBusy() {
    return !this.modal.hidden || !this.dialog.hidden || !this.intro.hidden;
  }

  // ── Etiquetas que seguem objetos do mundo ──

  createTag(text: string, color: string, extra = '') {
    const el = document.createElement('div');
    el.className = `tag ${extra}`;
    el.style.setProperty('--tag', color);
    el.textContent = text;
    this.labels.appendChild(el);
    return el;
  }

  setFocusTag(el: HTMLElement, label: string, color: string) {
    el.style.setProperty('--tag', color);
    el.innerHTML = `<kbd>E</kbd>${esc(label)}`;
  }

  place(el: HTMLElement, x: number, y: number, visible = true) {
    el.style.display = visible ? '' : 'none';
    if (visible) el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
  }

  // ── Painéis ──

  open(target: OpenTarget) {
    const [id, n] = target.split(':');
    const index = n === undefined ? undefined : Number(n);
    const html =
      id === 'project'
        ? renderProject(index ?? 0)
        : id === 'projects'
          ? renderProjects()
          : id === 'skills'
            ? renderSkills(index)
            : id === 'experience'
              ? renderExperience()
              : id === 'education'
                ? renderEducation()
                : id === 'about'
                  ? renderAbout()
                  : id === 'hobbies'
                    ? renderHobbies()
                    : id === 'contact'
                      ? renderContact()
                      : id === 'help'
                        ? renderHelp()
                        : renderResume();
    this.modalBody.innerHTML = html;
    this.modal.classList.toggle('resume', id === 'all');
    this.modal.hidden = false;
    this.modal.querySelector<HTMLElement>('.modal-card')!.scrollTop = 0;
    this.modal.querySelector<HTMLElement>('.close')!.focus({ preventScroll: true });
  }

  openDialog(npc: NpcData, color: string) {
    this.dialogState = { npc, i: 0 };
    this.dialogName.textContent = npc.name;
    this.dialogName.style.setProperty('--tag', color);
    this.dialog.hidden = false;
    this.renderDialog();
  }

  private renderDialog() {
    if (!this.dialogState) return;
    const { npc, i } = this.dialogState;
    const last = i >= npc.lines.length - 1;
    this.dialogText.textContent = npc.lines[i];
    this.dialogActions.innerHTML = last && npc.actions ? npc.actions.map((a) => btn(a.label, a.section)).join('') : '';
    this.dialog.querySelector<HTMLElement>('.dialog-hint')!.textContent = last ? 'E / clique para fechar' : 'E / clique ▸';
  }

  private advance() {
    if (!this.dialogState) return;
    this.dialogState.i++;
    if (this.dialogState.i >= this.dialogState.npc.lines.length) this.close();
    else this.renderDialog();
  }

  private hideDialog() {
    this.dialog.hidden = true;
    this.dialogState = null;
  }

  private hideIntro() {
    if (this.intro.hidden) return;
    this.intro.hidden = true;
    this.lastClosed = performance.now();
  }

  close() {
    this.modal.hidden = true;
    this.hideDialog();
    this.lastClosed = performance.now();
    (document.activeElement as HTMLElement | null)?.blur();
  }
}

export const ui = new UI();
