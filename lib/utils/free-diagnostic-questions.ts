export interface FreeDiagnosticQuestion {
  id: number
  block: 'financeiro' | 'vendas' | 'marketing' | 'futuro'
  blockTitle: string
  question: string
  options: { value: string; label: string; icon?: string }[]
  insightMap: Record<string, string> // Mapeia valor da opção para micro-insight
}

export const FREE_DIAGNOSTIC_QUESTIONS: FreeDiagnosticQuestion[] = [
  // BLOCO 1: RAIO-X FINANCEIRO
  {
    id: 1,
    block: 'financeiro',
    blockTitle: '🔹 RAIO-X FINANCEIRO',
    question: 'Qual é a sua faixa de faturamento mensal médio atualmente?',
    options: [
      { value: 'ate_10k', label: 'Até R$ 10.000', icon: '📊' },
      { value: '10k_50k', label: 'R$ 10.000 a R$ 50.000', icon: '💼' },
      { value: '50k_200k', label: 'R$ 50.000 a R$ 200.000', icon: '🚀' },
      { value: 'acima_200k', label: 'Acima de R$ 200.000', icon: '🌟' },
    ],
    insightMap: {
      ate_10k: 'Ótimo! Você está no início. Com estratégias certas, é possível dobrar esse faturamento em poucos meses.',
      '10k_50k': 'Excelente base! Este é o momento ideal para estruturar processos e escalar de forma sustentável.',
      '50k_200k': 'Parabéns! Você já tem tração. Agora é hora de otimizar processos e maximizar a lucratividade.',
      acima_200k: 'Impressionante! Foco em automações e sistemas pode liberar mais tempo para estratégias de crescimento.',
    },
  },
  {
    id: 2,
    block: 'financeiro',
    blockTitle: '🔹 RAIO-X FINANCEIRO',
    question: 'Qual é o seu modelo de negócio principal?',
    options: [
      { value: 'ecommerce', label: 'E-commerce / Vendas Online', icon: '🛒' },
      { value: 'servicos', label: 'Prestação de Serviços', icon: '🔧' },
      { value: 'saas', label: 'SaaS / Software como Serviço', icon: '💻' },
      { value: 'fisico', label: 'Varejo Físico / Loja', icon: '🏪' },
    ],
    insightMap: {
      ecommerce: 'Perfeito! O digital oferece escalabilidade quase infinita com as estratégias certas de marketing.',
      servicos: 'Foco em recorrência e upsell pode transformar serviços em um negócio altamente lucrativo.',
      saas: 'Excelente modelo! Automação e retenção são as chaves para crescer de forma exponencial.',
      fisico: 'Ótimo! Integrar físico + digital cria uma experiência única e aumenta significativamente as vendas.',
    },
  },
  {
    id: 3,
    block: 'financeiro',
    blockTitle: '🔹 RAIO-X FINANCEIRO',
    question: 'Qual é o seu Ticket Médio (valor médio por venda)?',
    options: [
      { value: 'ate_500', label: 'Até R$ 500', icon: '💰' },
      { value: '500_5000', label: 'R$ 500 a R$ 5.000', icon: '💎' },
      { value: 'acima_5000', label: 'Acima de R$ 5.000', icon: '👑' },
    ],
    insightMap: {
      ate_500: 'Tickets menores exigem volume. Foque em automação de vendas e marketing para escalar rapidamente.',
      '500_5000': 'Ticket médio equilibrado! Com processos bem estruturados, você pode aumentar conversão e frequência.',
      acima_5000: 'Ticket alto = ótimo! Foque em qualificação de leads e relacionamento para maximizar conversões.',
    },
  },

  // BLOCO 2: A MÁQUINA DE VENDAS
  {
    id: 4,
    block: 'vendas',
    blockTitle: '🔹 A MÁQUINA DE VENDAS',
    question: 'Onde ficam salvos os dados dos seus clientes (Leads)?',
    options: [
      { value: 'planilha', label: 'Planilhas (Excel/Google Sheets)', icon: '📋' },
      { value: 'crm', label: 'CRM / Sistema de Gestão', icon: '📊' },
      { value: 'cabeca', label: 'Na cabeça / Anotações soltas', icon: '🧠' },
    ],
    insightMap: {
      planilha: 'Planilhas funcionam no início, mas um CRM pode multiplicar sua capacidade de conversão.',
      crm: 'Excelente! Você está organizado. Agora é otimizar processos dentro do sistema para resultados melhores.',
      cabeca: 'Organizar dados em um sistema pode dobrar suas vendas. Cada lead tem potencial!',
    },
  },
  {
    id: 5,
    block: 'vendas',
    blockTitle: '🔹 A MÁQUINA DE VENDAS',
    question: 'Quem é responsável por fechar as vendas hoje?',
    options: [
      { value: 'proprio', label: 'Eu mesmo(a) / Sócio(a)', icon: '👤' },
      { value: 'equipe', label: 'Tenho equipe de vendas', icon: '👥' },
    ],
    insightMap: {
      proprio: 'Automation é sua aliada! Sistemas podem qualificar leads e permitir que você foque apenas no que fecha.',
      equipe: 'Ótimo! Com processos estruturados, sua equipe pode converter muito mais leads em clientes.',
    },
  },
  {
    id: 6,
    block: 'vendas',
    blockTitle: '🔹 A MÁQUINA DE VENDAS',
    question: 'Qual é o canal de vendas que mais converte para você?',
    options: [
      { value: 'redes_sociais', label: 'Redes Sociais (Instagram, Facebook)', icon: '📱' },
      { value: 'site_landing', label: 'Site / Landing Page', icon: '🌐' },
      { value: 'indicacao', label: 'Indicação / Word of Mouth', icon: '🤝' },
    ],
    insightMap: {
      redes_sociais: 'Redes sociais têm poder! Com estratégia de conteúdo + anúncios, você pode escalar ainda mais.',
      site_landing: 'Digital primeiro! Otimizar landing pages pode aumentar conversões em até 300%.',
      indicacao: 'Indicações são ouro! Sistematizar essa estratégia pode criar uma máquina de crescimento contínuo.',
    },
  },

  // BLOCO 3: INTELIGÊNCIA DE MARKETING
  {
    id: 7,
    block: 'marketing',
    blockTitle: '🔹 INTELIGÊNCIA DE MARKETING',
    question: 'Com que frequência sua empresa posta conteúdo nas redes sociais?',
    options: [
      { value: 'diario', label: 'Diariamente ou mais', icon: '🔥' },
      { value: 'semanal', label: 'Algumas vezes por semana', icon: '📅' },
      { value: 'irregular', label: 'Irregular / Quando dá tempo', icon: '⏰' },
    ],
    insightMap: {
      diario: 'Consistência é sua força! Agora é hora de otimizar conteúdo para conversão e não apenas engajamento.',
      semanal: 'Bom ritmo! Aumentar frequência com automação pode atrair muito mais leads qualificados.',
      irregular: 'Consistência transforma. Um calendário de conteúdo pode dobrar seus resultados sem mais esforço.',
    },
  },
  {
    id: 8,
    block: 'marketing',
    blockTitle: '🔹 INTELIGÊNCIA DE MARKETING',
    question: 'Qual é a sua relação com Tráfego Pago (Anúncios)?',
    options: [
      { value: 'usa_regular', label: 'Uso regularmente e vejo resultados', icon: '✅' },
      { value: 'tentei_sem_resultado', label: 'Tentei, mas sem resultados claros', icon: '❓' },
      { value: 'nao_usa', label: 'Ainda não uso tráfego pago', icon: '🆕' },
    ],
    insightMap: {
      usa_regular: 'Excelente! Otimizar campanhas e landing pages pode reduzir custos e aumentar ROI significativamente.',
      tentei_sem_resultado: 'Tráfego pago funciona, mas precisa de estratégia certa. Análise e ajustes fazem toda diferença.',
      nao_usa: 'Tráfego pago escalável é possível! Com estratégia certa, pode ser seu canal de crescimento principal.',
    },
  },
  {
    id: 9,
    block: 'marketing',
    blockTitle: '🔹 INTELIGÊNCIA DE MARKETING',
    question: 'Você sabe quanto custa para trazer um novo cliente (CAC)?',
    options: [
      { value: 'sim_sei', label: 'Sim, tenho esse número', icon: '📈' },
      { value: 'nao_sei', label: 'Não sei exatamente', icon: '🤔' },
    ],
    insightMap: {
      sim_sei: 'Fantástico! Medir CAC é fundamental. Agora é otimizar para reduzir custos e aumentar lifetime value.',
      nao_sei: 'Conhecer CAC muda tudo! Com esse número, você pode decidir onde investir para crescer com lucro.',
    },
  },

  // BLOCO 4: FUTURO E VISÃO
  {
    id: 10,
    block: 'futuro',
    blockTitle: '🔹 FUTURO E VISÃO',
    question: 'Qual nível de tecnologia seu negócio usa hoje?',
    options: [
      { value: 'basico', label: 'Básico / Manual ainda', icon: '📝' },
      { value: 'intermediario', label: 'Intermediário / Algumas automações', icon: '⚙️' },
      { value: 'avancado', label: 'Avançado / Bem automatizado', icon: '🤖' },
    ],
    insightMap: {
      basico: 'Automação pode liberar 10-20 horas semanais! Essas horas aplicadas em estratégia = crescimento exponencial.',
      intermediario: 'Boa base! Conectar ferramentas e criar fluxos completos pode transformar sua operação.',
      avancado: 'Você está à frente! Foco em otimização contínua e análise de dados para decisões estratégicas.',
    },
  },
  {
    id: 11,
    block: 'futuro',
    blockTitle: '🔹 FUTURO E VISÃO',
    question: 'Se você pudesse resolver UM problema com uma varinha mágica hoje, qual seria?',
    options: [
      { value: 'mais_vendas', label: 'Gerar mais vendas e leads', icon: '🎯' },
      { value: 'organizar_processos', label: 'Organizar e automatizar processos', icon: '🔄' },
      { value: 'aumentar_lucro', label: 'Aumentar lucratividade e reduzir custos', icon: '💵' },
    ],
    insightMap: {
      mais_vendas: 'Vendas são resultado de sistema! Com processos estruturados, leads qualificados viram clientes naturalmente.',
      organizar_processos: 'Processos organizados liberam tempo e aumentam resultados. É a base de qualquer negócio escalável.',
      aumentar_lucro: 'Lucratividade vem de eficiência + estratégia. Cada otimização multiplica seu resultado final.',
    },
  },
  {
    id: 12,
    block: 'futuro',
    blockTitle: '🔹 FUTURO E VISÃO',
    question: 'Você escreveu suas metas para os próximos 12 meses no papel?',
    options: [
      { value: 'sim_escrevi', label: 'Sim, tenho metas claras escritas', icon: '✍️' },
      { value: 'tenho_mental', label: 'Tenho mentalmente, mas não escrevi', icon: '🧠' },
      { value: 'nao_tenho', label: 'Ainda não tenho metas definidas', icon: '📝' },
    ],
    insightMap: {
      sim_escrevi: 'Metas escritas têm 42% mais chances de serem alcançadas! Agora é criar plano de ação para cada uma.',
      tenho_mental: 'Escrever metas transforma sonhos em planos! Metas claras + ações específicas = resultados garantidos.',
      nao_tenho: 'Definir metas é o primeiro passo! Metas claras criam foco e direcionam todo esforço para resultados.',
    },
  },
]

// Função para calcular progresso com curva específica
export function calculateProgress(answeredQuestions: number): number {
  const progressMap: Record<number, number> = {
    1: 15, // +15%
    2: 30, // +15%
    3: 40, // +10%
    4: 50, // +10%
    5: 60, // +10%
    6: 67, // +7%
    7: 74, // +7%
    8: 81, // +7%
    9: 86, // +5%
    10: 91, // +5%
    11: 95, // +4%
    12: 100, // +5%
  }

  return progressMap[answeredQuestions] || 0
}

