export type ModuleType = 'traffic' | 'brand' | 'social' | 'funnel'

export interface Radar360Question {
  id: string
  module: ModuleType
  block?: string
  question: string
  type: 'select' | 'number' | 'text' | 'checkbox' | 'conditional'
  options?: { value: string; label: string; icon?: string }[]
  dependsOn?: { questionId: string; values: string[] } // Para lógica condicional
  conditionalPaths?: Record<string, Radar360Question[]> // Caminhos baseados em resposta
  insightMap?: Record<string, string> // Micro-insights por resposta
  calculate?: (answers: Record<string, any>) => any // Função de cálculo (ex: ROAS, CPL)
}

export const RADAR360_MODULES = {
  traffic: {
    id: 'traffic' as ModuleType,
    name: 'Tráfego & Performance',
    icon: '📊',
    description: 'Diagnosticar eficiência real de mídia paga',
  },
  brand: {
    id: 'brand' as ModuleType,
    name: 'Marca & Posicionamento',
    icon: '🎯',
    description: 'Medir poder de marca e precificação',
  },
  social: {
    id: 'social' as ModuleType,
    name: 'Redes Sociais & Comunidade',
    icon: '👥',
    description: 'Avaliar se redes sociais geram valor ou só ocupam tempo',
  },
  funnel: {
    id: 'funnel' as ModuleType,
    name: 'Funis, Vendas & Retenção',
    icon: '💰',
    description: 'Encontrar exatamente onde o dinheiro vaza',
  },
}

// MÓDULO 1: TRÁFEGO & PERFORMANCE
export const TRAFFIC_QUESTIONS: Radar360Question[] = [
  {
    id: 'traffic-objective',
    module: 'traffic',
    block: 'universal',
    question: 'Qual é o objetivo primário da sua campanha?',
    type: 'select',
    options: [
      { value: 'venda_direta', label: 'Venda Direta', icon: '💳' },
      { value: 'leads', label: 'Geração de Leads', icon: '📋' },
      { value: 'branding', label: 'Branding', icon: '🏷️' },
    ],
    insightMap: {
      venda_direta: 'Venda direta exige rastreamento de conversão completo. Cada clique precisa se transformar em receita mensurável.',
      leads: 'Geração de leads é um jogo de qualificação. Volume sem qualidade é apenas custo.',
      branding: 'Branding sem métrica de retenção costuma virar custo invisível. Como você mede impacto?',
    },
  },
  {
    id: 'traffic-platforms',
    module: 'traffic',
    block: 'universal',
    question: 'Quais plataformas você utiliza para tráfego pago?',
    type: 'checkbox',
    options: [
      { value: 'google', label: 'Google Ads' },
      { value: 'meta', label: 'Meta (Facebook/Instagram)' },
      { value: 'tiktok', label: 'TikTok Ads' },
      { value: 'linkedin', label: 'LinkedIn Ads' },
      { value: 'outras', label: 'Outras plataformas' },
    ],
  },
  // CAMINHO A - VENDA DIRETA
  {
    id: 'traffic-venda-investimento',
    module: 'traffic',
    block: 'venda_direta',
    question: 'Qual o investimento mensal médio em tráfego pago?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['venda_direta'] },
  },
  {
    id: 'traffic-venda-receita',
    module: 'traffic',
    block: 'venda_direta',
    question: 'Qual a receita mensal gerada por esse tráfego?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['venda_direta'] },
    calculate: (answers) => {
      const investimento = parseFloat(answers['traffic-venda-investimento'] || '0')
      const receita = parseFloat(answers['traffic-venda-receita'] || '0')
      if (investimento > 0) {
        return { roas: (receita / investimento).toFixed(2) }
      }
      return null
    },
  },
  {
    id: 'traffic-venda-conversao',
    module: 'traffic',
    block: 'venda_direta',
    question: 'Qual a taxa de conversão média?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['venda_direta'] },
    insightMap: {
      '1-3': 'Taxa abaixo de 3% indica possível problema de landing page ou oferta.',
      '3-5': 'Taxa entre 3-5% está na média de mercado. Há espaço para otimização.',
      '5+': 'Taxa acima de 5% é forte. Foque em escalar mantendo qualidade.',
    },
  },
  {
    id: 'traffic-venda-ticket',
    module: 'traffic',
    block: 'venda_direta',
    question: 'Qual o ticket médio por venda?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['venda_direta'] },
  },
  {
    id: 'traffic-venda-gargalo',
    module: 'traffic',
    block: 'venda_direta',
    question: 'Qual o principal gargalo que limita suas vendas?',
    type: 'select',
    dependsOn: { questionId: 'traffic-objective', values: ['venda_direta'] },
    options: [
      { value: 'volume_trafego', label: 'Volume de tráfego' },
      { value: 'conversao', label: 'Taxa de conversão' },
      { value: 'ticket_medio', label: 'Ticket médio' },
      { value: 'frequencia', label: 'Frequência de compra' },
    ],
    insightMap: {
      volume_trafego: 'Gargalo de volume sugere problema de alcance ou budget, não de performance.',
      conversao: 'Gargalo de conversão indica que tráfego chega, mas não converte. Landing page e oferta são prioridades.',
      ticket_medio: 'Ticket baixo sugere oportunidade de upsell ou repensar proposta de valor.',
      frequencia: 'Frequência baixa indica necessidade de estratégia de retenção ou recorrência.',
    },
  },
  // CAMINHO B - LEADS
  {
    id: 'traffic-leads-investimento',
    module: 'traffic',
    block: 'leads',
    question: 'Qual o investimento mensal médio em tráfego pago?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['leads'] },
  },
  {
    id: 'traffic-leads-volume',
    module: 'traffic',
    block: 'leads',
    question: 'Quantos leads você gera por mês?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['leads'] },
    calculate: (answers) => {
      const investimento = parseFloat(answers['traffic-leads-investimento'] || '0')
      const volume = parseFloat(answers['traffic-leads-volume'] || '0')
      if (investimento > 0 && volume > 0) {
        return { cpl: (investimento / volume).toFixed(2) }
      }
      return null
    },
  },
  {
    id: 'traffic-leads-qualidade',
    module: 'traffic',
    block: 'leads',
    question: 'Como avalia a qualidade dos leads?',
    type: 'select',
    dependsOn: { questionId: 'traffic-objective', values: ['leads'] },
    options: [
      { value: 'excelente', label: 'Excelente - Maioria converte' },
      { value: 'boa', label: 'Boa - Taxa de conversão aceitável' },
      { value: 'regular', label: 'Regular - Poucos convertem' },
      { value: 'ruim', label: 'Ruim - Quase nenhum converte' },
    ],
    insightMap: {
      excelente: 'Leads de qualidade são ouro. Foque em volume mantendo a qualidade.',
      boa: 'Qualidade boa pode melhorar com qualificação prévia ou ajuste de targeting.',
      regular: 'Qualidade regular indica desalinhamento entre anúncio e oferta.',
      ruim: 'Leads ruins são dinheiro jogado fora. Reavalie criativos e targeting urgentemente.',
    },
  },
  {
    id: 'traffic-leads-sla',
    module: 'traffic',
    block: 'leads',
    question: 'Qual o tempo médio de atendimento de um lead? (em horas)',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['leads'] },
  },
  {
    id: 'traffic-leads-perda',
    module: 'traffic',
    block: 'leads',
    question: 'Qual o principal motivo de perda de leads?',
    type: 'select',
    dependsOn: { questionId: 'traffic-objective', values: ['leads'] },
    options: [
      { value: 'demora_atendimento', label: 'Demora no atendimento' },
      { value: 'falta_qualificacao', label: 'Falta de qualificação' },
      { value: 'proposta_nao_atende', label: 'Proposta não atende necessidade' },
      { value: 'preco', label: 'Preço' },
    ],
  },
  // CAMINHO C - BRANDING
  {
    id: 'traffic-branding-alcance',
    module: 'traffic',
    block: 'branding',
    question: 'Qual o alcance mensal médio das campanhas?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['branding'] },
  },
  {
    id: 'traffic-branding-frequencia',
    module: 'traffic',
    block: 'branding',
    question: 'Qual a frequência média de impressões por pessoa?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['branding'] },
  },
  {
    id: 'traffic-branding-cpm',
    module: 'traffic',
    block: 'branding',
    question: 'Qual o CPM médio das campanhas?',
    type: 'number',
    dependsOn: { questionId: 'traffic-objective', values: ['branding'] },
  },
  {
    id: 'traffic-branding-busca',
    module: 'traffic',
    block: 'branding',
    question: 'Você monitora busca por nome da marca?',
    type: 'select',
    dependsOn: { questionId: 'traffic-objective', values: ['branding'] },
    options: [
      { value: 'sim_detalhado', label: 'Sim, com detalhamento completo' },
      { value: 'sim_basico', label: 'Sim, basicamente' },
      { value: 'nao', label: 'Não monitoro' },
    ],
  },
]

// Função para calcular progresso psicológico não-linear
export function calculateRadar360Progress(answeredQuestions: number, totalQuestions: number): number {
  const percentage = (answeredQuestions / totalQuestions) * 100

  // Primeiros 20% → sobe até 45%
  if (percentage <= 20) {
    return (percentage / 20) * 45
  }

  // 20% a 80% → sobe até 80% (60% do caminho)
  if (percentage <= 80) {
    const remaining = percentage - 20 // 0 a 60
    return 45 + (remaining / 60) * 35 // 45 até 80
  }

  // Últimos 20% → sobe lentamente até 100%
  const remaining = percentage - 80 // 0 a 20
  return 80 + (remaining / 20) * 20 // 80 até 100
}

// Textos dinâmicos da barra de progresso
export function getProgressText(answeredQuestions: number, totalQuestions: number): string {
  const percentage = (answeredQuestions / totalQuestions) * 100

  if (percentage < 25) {
    return 'Diagnóstico em processamento…'
  }
  if (percentage < 50) {
    return 'Cruzando dados estratégicos…'
  }
  if (percentage < 75) {
    return 'Identificando gaps financeiros…'
  }
  if (percentage < 95) {
    return 'Mapeando oportunidades de crescimento…'
  }
  return 'Finalizando auditoria…'
}

