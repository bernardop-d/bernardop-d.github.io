// ✏️ EDITE ESTE ARQUIVO com as suas informações.
// O mundo inteiro (monitores, estantes, NPCs, painéis) é montado a partir daqui.

export type SectionId =
  | 'about'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'hobbies'
  | 'contact'
  | 'help'
  | 'all';

export interface Project {
  title: string;
  year?: string;
  summary: string;
  description: string[];
  tech: string[];
  links?: { label: string; url: string }[];
  /** caminho de uma imagem em /public (ex.: '/projetos/app.png') */
  image?: string;
}

const GH = 'https://github.com/bernardop-d';

export const profile = {
  name: 'Bernardo Pereira Dutra',
  role: 'Desenvolvedor Back-End',
  location: 'Rio de Janeiro, RJ',
  bio: [
    'Desenvolvedor Back-End com foco em Python e Java, especializado em APIs RESTful com FastAPI e Spring Boot.',
    'Tenho experiência real em ambiente corporativo e em projeto freelance entregue do zero: automatizei processos que cobrem uma frota de 11 navios e desenvolvi um sistema de gestão que eliminou 80% do trabalho manual de uma pequena empresa, permitindo atender o dobro de clientes na alta temporada sem aumentar a equipe.',
    'Também tenho experiência prática com sistemas multi-agente usando Google ADK e Gemini 2.5 Flash.',
    'Estou buscando oportunidade como desenvolvedor júnior ou estágio em back-end.',
  ],
};

// Cada projeto vira um monitor nas mesas da Sala de Projetos (até 8).
export const projects: Project[] = [
  {
    title: 'Sistema Hércules Festas',
    year: '2025',
    summary: 'Sistema web que digitalizou uma empresa de locação de artigos para festas. Projeto freelance.',
    description: [
      'A empresa operava no papel, com pedidos anotados à mão, erros constantes e nenhum controle de estoque.',
      'Desenvolvi do zero o back-end em Python (servidor HTTP da Standard Library), modelei o banco relacional em SQLite e integrei com a API do WhatsApp para enviar notificações e confirmações automáticas após cada atendimento.',
      'Resultado: 80% do trabalho manual eliminado e o dobro de atendimentos na alta temporada, sem aumentar a equipe.',
    ],
    tech: ['Python', 'SQLite', 'API do WhatsApp'],
    links: [
      { label: 'Código', url: `${GH}/Hercules-festas.v3` },
      { label: 'Landing page', url: 'https://bernardop-d.github.io/landingpage-hf/' },
    ],
  },
  {
    title: 'Agente Executor de Código',
    year: '2026',
    summary: 'Sistema multi-agente que resolve problemas de forma autônoma.',
    description: [
      'Um agente pesquisa na web, outro escreve e executa código Python, e um agente raiz orquestra tudo.',
      'O sistema analisa os erros da execução e itera sozinho até chegar a uma solução.',
    ],
    tech: ['Python', 'Google ADK', 'Gemini 2.5 Flash', 'Multi-agente'],
    links: [{ label: 'Código', url: `${GH}/agent-executor-codigo` }],
  },
  {
    title: 'Bot de Automação de Vagas',
    summary: 'API REST que varre o LinkedIn e filtra vagas automaticamente.',
    description: [
      'Usa Selenium para coletar vagas do LinkedIn e filtra por regime de trabalho, cargo, localização e data.',
      'Exporta os resultados para CSV, com os dados validados por Pydantic.',
    ],
    tech: ['Python', 'FastAPI', 'Selenium', 'Pydantic'],
    links: [{ label: 'Código', url: `${GH}/linkedin-job-scraper` }],
  },
  {
    title: 'Sistema de Gestão de Loja',
    summary: 'Back-end para controle de estoque e vendas.',
    description: [
      'Aplicação em Java com MySQL, organizada em camadas: model, DAO e API REST, com Bean Validation nas entidades.',
      'Transações garantem consistência entre o registro da venda e a atualização do estoque, e BigDecimal garante precisão nos valores monetários.',
    ],
    tech: ['Java', 'Spring Boot 3', 'Spring Data JPA', 'MySQL'],
    links: [{ label: 'Código', url: `${GH}/gestao-loja-java-mysql` }],
  },
  {
    title: 'Blog Tech IA',
    summary: 'Blog técnico que publica conteúdo sozinho via CI/CD.',
    description: [
      'Um script Python gera os posts automaticamente e o GitHub Actions publica no ar sem intervenção manual.',
      'Artigos sobre desenvolvimento, automação e inteligência artificial.',
    ],
    tech: ['Python', 'Jekyll', 'GitHub Actions'],
    links: [{ label: 'Código', url: `${GH}/blog-tech-IA-main` }],
  },
  {
    title: 'Professora Anna',
    summary: 'Chatbot de terminal que ajuda iniciantes a aprender programação.',
    description: [
      'Analisa código Java e Python em tempo real, aponta erros, explica conceitos e dá dicas por comandos simples.',
      'Construída com POO, classes de responsabilidade única e estruturas de controle.',
    ],
    tech: ['Java', 'POO'],
    links: [{ label: 'Código', url: `${GH}/codigo-chatbot` }],
  },
  {
    title: 'Portfolio Mundo',
    year: '2026',
    summary: 'Este portfólio: um escritório em pixel art que dá para explorar.',
    description: [
      'Feito com Phaser 3, TypeScript e Vite. Toda a arte é desenhada por código, pixel a pixel.',
      'Cada sala do escritório é uma seção do portfólio e cada objeto abre um conteúdo diferente.',
    ],
    tech: ['TypeScript', 'Phaser 3', 'Vite'],
    links: [
      { label: 'Código', url: `${GH}/bernardop-d.github.io` },
      { label: 'Site', url: 'https://bernardop-d.github.io' },
    ],
  },
];

// Cada grupo vira uma estante na Biblioteca (até 5).
export const skills: { title: string; items: string[] }[] = [
  {
    title: 'Back-End',
    items: ['Java', 'Python', 'SQL', 'Spring Boot 3', 'Spring Data JPA', 'Bean Validation', 'FastAPI', 'Flask', 'APIs RESTful'],
  },
  {
    title: 'Dados',
    items: ['PostgreSQL', 'MySQL', 'SQLite', 'H2', 'Modelagem Relacional', 'Otimização de Queries', 'DBeaver'],
  },
  {
    title: 'Agentes de IA',
    items: ['Google ADK', 'Gemini 2.5 Flash', 'Sistemas Multi-Agente', 'Prompt Engineering'],
  },
  {
    title: 'Ferramentas & Práticas',
    items: [
      'Git',
      'GitHub Actions (CI/CD)',
      'Maven',
      'Postman',
      'Docker (básico)',
      'POO',
      'MVC',
      'SOLID',
      'Clean Code',
      'Scrum',
      'Kanban',
      'Versionamento Semântico',
    ],
  },
  { title: 'Idiomas', items: ['Inglês avançado', 'Espanhol básico'] },
];

export const experience: { role: string; place: string; period: string; description: string[] }[] = [
  {
    role: 'Desenvolvedor Back-End Freelancer',
    place: 'Hércules Festas',
    period: 'Set/2025 — Nov/2025',
    description: [
      'Desenvolvi do zero um sistema web para digitalizar a operação de uma empresa de locação de artigos para festas, que antes funcionava no papel.',
      'Back-end em Python (servidor HTTP da Standard Library), banco relacional em SQLite e integração com a API do WhatsApp para notificações e confirmação de pedidos.',
      'Resultado: 80% do trabalho manual eliminado e o dobro de atendimentos na alta temporada.',
    ],
  },
  {
    role: 'Auxiliar Técnico (Jovem Aprendiz)',
    place: 'Empresa de Navegação Elcano SA',
    period: 'Set/2024 — Mar/2026',
    description: [
      'Automação com Batch: scripts que processavam de 300 a 700 arquivos por navio. O que levava 15–20 min por embarcação passou a cobrir a frota inteira de 11 navios em 30 minutos.',
      'SQL: queries de análise e correção de inconsistências, cruzando o banco central com os bancos de cada navio.',
      'QA: testei 3 aplicativos usados pela tripulação e pelo escritório, documentando bugs com casos de teste e passos de reprodução.',
      'Suporte remoto via RDC Manager para atualizações técnicas e acompanhamento de ações preditivas na frota.',
    ],
  },
];

export const education: { course: string; place: string; period: string }[] = [
  { course: 'Análise e Desenvolvimento de Sistemas', place: 'Universidade Estácio de Sá', period: 'Previsão de conclusão: Jun/2027' },
  { course: 'Princípios de Desenvolvimento Ágil de Software', place: 'ITA', period: 'Curso' },
  { course: 'Do Prompt ao Agente (35h)', place: 'CI&T', period: 'Curso' },
  { course: 'Engenharia de Dados e ML (61h)', place: 'TOTVS + DIO', period: 'Bootcamp' },
  { course: 'Python do Básico ao Avançado', place: 'Udemy', period: 'Curso' },
  { course: 'Fundamentos de Java e POO (40h)', place: 'Curso em Vídeo', period: 'Curso' },
  { course: 'Banco de Dados MySQL', place: 'Curso em Vídeo', period: 'Curso' },
  { course: 'Introduction to Cybersecurity', place: 'Cisco', period: 'Certificação' },
  { course: 'Excel e Análise de Dados', place: 'Excelera', period: 'Curso' },
];

// TODO: trocar pelos seus hobbies reais (aparecem no fliperama da recepção)
export const hobbies: string[] = ['Jogos', 'Tecnologia e IA', 'Aprender coisas novas'];

export const contact = {
  email: 'contato.bernardopd@gmail.com',
  github: 'https://github.com/bernardop-d',
  linkedin: 'https://www.linkedin.com/in/bernardop-d/',
};

export interface NpcData {
  name: string;
  lines: string[];
  actions?: { label: string; section: SectionId }[];
}

export const npcs: Record<'guide' | 'dev' | 'mentor', NpcData> = {
  guide: {
    name: 'Guia',
    lines: [
      'Bem-vindo(a) ao escritório do Bernardo! 👋',
      'Lá em cima à esquerda fica a Sala de Projetos. À direita, a Biblioteca de skills. Aqui do lado, a Sala de Reuniões com a experiência e a formação.',
      'Chegue perto de algo brilhando e aperte E. Com pressa? Dá para abrir o currículo completo direto.',
    ],
    actions: [
      { label: 'Ver currículo', section: 'all' },
      { label: 'Sobre o Bernardo', section: 'about' },
    ],
  },
  dev: {
    name: 'Dev',
    lines: [
      'Cada monitor nestas mesas é um projeto: APIs, agentes de IA, automações e o sistema da Hércules Festas.',
      'Chegue perto de um e aperte E para ver detalhes, tecnologias e o código no GitHub.',
    ],
    actions: [{ label: 'Lista de projetos', section: 'projects' }],
  },
  mentor: {
    name: 'Mentor',
    lines: [
      'O quadro branco tem a experiência profissional: da automação de uma frota de 11 navios ao sistema freelance da Hércules Festas.',
      'O quadro na parede tem a formação em ADS e os cursos.',
    ],
    actions: [
      { label: 'Experiência', section: 'experience' },
      { label: 'Formação', section: 'education' },
    ],
  },
};
