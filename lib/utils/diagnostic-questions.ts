import { DiagnosticQuestion } from '@/types/diagnostic'

export const DIAGNOSTIC_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  faturamento: [
    {
      area: 'faturamento',
      question: 'Qual foi o faturamento médio mensal no período analisado?',
      type: 'number',
    },
    {
      area: 'faturamento',
      question: 'Como está a tendência de crescimento do faturamento?',
      type: 'select',
      options: ['Crescendo consistentemente', 'Estável', 'Em declínio', 'Muito volátil'],
    },
    {
      area: 'faturamento',
      question: 'Qual a principal fonte de receita?',
      type: 'text',
    },
  ],
  vendas: [
    {
      area: 'vendas',
      question: 'Quantos leads qualificados você recebe por mês?',
      type: 'number',
    },
    {
      area: 'vendas',
      question: 'Qual a taxa de conversão de leads em clientes?',
      type: 'number',
    },
    {
      area: 'vendas',
      question: 'Qual o ticket médio por venda?',
      type: 'number',
    },
    {
      area: 'vendas',
      question: 'Como você qualifica seus leads?',
      type: 'text',
    },
    {
      area: 'vendas',
      question: 'Você tem um processo de vendas estruturado?',
      type: 'select',
      options: ['Sim, muito bem definido', 'Parcialmente estruturado', 'Não, é informal'],
    },
  ],
  marketing: [
    {
      area: 'marketing',
      question: 'Quais canais de marketing você utiliza?',
      type: 'text',
    },
    {
      area: 'marketing',
      question: 'Você mede o ROI de cada canal de marketing?',
      type: 'select',
      options: ['Sim, detalhadamente', 'Parcialmente', 'Não'],
    },
    {
      area: 'marketing',
      question: 'Como você gera conteúdo para atrair clientes?',
      type: 'text',
    },
    {
      area: 'marketing',
      question: 'Você tem uma estratégia de marketing definida?',
      type: 'select',
      options: ['Sim, muito clara', 'Parcialmente', 'Não'],
    },
  ],
  processos: [
    {
      area: 'processos',
      question: 'Seus processos de trabalho estão documentados?',
      type: 'select',
      options: ['Sim, totalmente', 'Parcialmente', 'Não'],
    },
    {
      area: 'processos',
      question: 'Como você gerencia o relacionamento com clientes?',
      type: 'text',
    },
    {
      area: 'processos',
      question: 'Você tem automações implementadas?',
      type: 'text',
    },
  ],
  ferramentas: [
    {
      area: 'ferramentas',
      question: 'Quais ferramentas você usa para gestão de vendas?',
      type: 'text',
    },
    {
      area: 'ferramentas',
      question: 'Quais ferramentas você usa para marketing?',
      type: 'text',
    },
    {
      area: 'ferramentas',
      question: 'Como você integra suas ferramentas?',
      type: 'text',
    },
  ],
  desafios: [
    {
      area: 'desafios',
      question: 'Qual o maior desafio atual na geração de leads?',
      type: 'text',
    },
    {
      area: 'desafios',
      question: 'Qual o maior desafio na conversão de leads?',
      type: 'text',
    },
    {
      area: 'desafios',
      question: 'O que mais te impede de escalar o negócio?',
      type: 'text',
    },
  ],
}

export const AREAS_ORDER = [
  'faturamento',
  'vendas',
  'marketing',
  'processos',
  'ferramentas',
  'desafios',
]

export function getAllQuestions(): DiagnosticQuestion[] {
  return AREAS_ORDER.flatMap((area) => DIAGNOSTIC_QUESTIONS[area] || [])
}

export function getQuestionsByArea(area: string): DiagnosticQuestion[] {
  return DIAGNOSTIC_QUESTIONS[area] || []
}

