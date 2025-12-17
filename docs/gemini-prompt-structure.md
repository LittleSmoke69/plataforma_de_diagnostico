# Estrutura de Resposta do Gemini

Este documento descreve a estrutura esperada da resposta JSON do Gemini API para o diagnóstico.

## Formato de Resposta

O endpoint `/api/diagnostics/[id]/generate` espera receber do Gemini um JSON com a seguinte estrutura:

```json
{
  "general_score": 75,
  "strategic_reading": "Texto executivo claro e decisório, com 2-3 parágrafos explicando a situação geral do negócio...",
  "priorities": [
    {
      "title": "Otimizar processo de qualificação de leads",
      "description": "Descrição detalhada da prioridade e como implementá-la",
      "impact": "high"
    },
    {
      "title": "Implementar automação de marketing",
      "description": "Descrição detalhada...",
      "impact": "medium"
    },
    {
      "title": "Melhorar documentação de processos",
      "description": "Descrição detalhada...",
      "impact": "low"
    }
  ],
  "bottlenecks": [
    {
      "title": "Falta de processo estruturado de vendas",
      "description": "Descrição do gargalo identificado",
      "evidence": [
        "Taxa de conversão abaixo da média do mercado",
        "Tempo médio de fechamento muito alto"
      ]
    }
  ],
  "charts_data": {
    "areas": [
      {
        "name": "faturamento",
        "score": 80
      },
      {
        "name": "vendas",
        "score": 65
      },
      {
        "name": "marketing",
        "score": 70
      },
      {
        "name": "processos",
        "score": 60
      },
      {
        "name": "ferramentas",
        "score": 75
      },
      {
        "name": "desafios",
        "score": 50
      }
    ],
    "revenue_impact": {
      "current": 50000,
      "potential": 75000,
      "gap": 25000
    }
  },
  "lost_revenue_indicators": [
    {
      "category": "Leads não qualificados",
      "estimated_loss": 15000,
      "description": "Estimativa de receita perdida por falta de qualificação adequada"
    },
    {
      "category": "Taxa de conversão baixa",
      "estimated_loss": 10000,
      "description": "Receita potencial não realizada devido à baixa conversão"
    }
  ]
}
```

## Campos Obrigatórios

- `general_score`: Número inteiro de 0 a 100
- `strategic_reading`: String com texto executivo
- `priorities`: Array com pelo menos 3 prioridades
- `bottlenecks`: Array (pode estar vazio)
- `charts_data`: Objeto com `areas` e `revenue_impact`
- `lost_revenue_indicators`: Array (pode estar vazio)

## Validação

O endpoint valida:
1. Se `general_score` é um número entre 0 e 100
2. Se `strategic_reading` existe e não está vazio
3. Se `priorities` é um array com pelo menos 1 item
4. Se a estrutura geral do JSON está correta

## Tratamento de Erros

Se o Gemini retornar um formato inválido:
1. O sistema tenta extrair JSON de markdown code blocks
2. Se falhar, retorna erro 500
3. O diagnóstico fica com status `failed`

## Exemplo de Prompt

O prompt enviado ao Gemini inclui:
- Nome da empresa
- Período de análise
- Todas as respostas organizadas por área
- Instruções claras sobre o formato JSON esperado
- Exemplo de estrutura

