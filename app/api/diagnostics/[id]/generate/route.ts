import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DiagnosticResult } from '@/types/diagnostic'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Cria cliente do Supabase
    const serviceClient = createServiceClient()

    // Verifica se o diagnóstico pertence ao usuário
    const { data: diagnostic, error: diagnosticError } = await serviceClient
      .from('diagnostics')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (diagnosticError || !diagnostic) {
      console.error('Erro ao buscar diagnóstico:', diagnosticError)
      return NextResponse.json({ error: 'Diagnóstico não encontrado' }, { status: 404 })
    }

    // Busca todas as respostas
    const { data: answers, error: answersError } = await serviceClient
      .from('diagnostic_details')
      .select('*')
      .eq('diagnostic_id', params.id)
      .order('area', { ascending: true })

    if (answersError || !answers || answers.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma resposta encontrada' },
        { status: 400 }
      )
    }

    // Monta o prompt para o Gemini
    const prompt = buildPrompt(diagnostic, answers)

    // Chama a API do Gemini
    let geminiResponse: DiagnosticResult | null
    try {
      geminiResponse = await callGeminiAPI(prompt)
    } catch (error: any) {
      console.error('Erro ao chamar Gemini API:', error)
      return NextResponse.json(
        {
          error: error.message || 'Erro ao gerar diagnóstico com IA. Verifique a chave GEMINI_API_KEY.',
        },
        { status: 500 }
      )
    }

    if (!geminiResponse) {
      return NextResponse.json(
        {
          error:
            'Erro ao gerar diagnóstico com IA. A resposta da API não foi válida. Verifique os logs do servidor.',
        },
        { status: 500 }
      )
    }

    // Atualiza o diagnóstico com os resultados
    const { error: updateError } = await serviceClient
      .from('diagnostics')
      .update({
        general_score: geminiResponse.general_score,
        strategic_reading: geminiResponse.strategic_reading,
        status: 'completed',
        realization_date: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Erro ao atualizar diagnóstico:', updateError)
      return NextResponse.json({ error: 'Erro ao salvar resultados' }, { status: 500 })
    }

    // Atualiza feedback por área (opcional)
    if (geminiResponse.charts_data?.areas) {
      for (const area of geminiResponse.charts_data.areas) {
        await serviceClient
          .from('diagnostic_details')
          .update({
            ai_feedback: `Pontuação: ${area.score}/100`,
          })
          .eq('diagnostic_id', params.id)
          .eq('area', area.name.toLowerCase())
      }
    }

    return NextResponse.json({ success: true, result: geminiResponse })
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

function buildPrompt(diagnostic: any, answers: any[]): string {
  const answersByArea: Record<string, any[]> = {}
  answers.forEach((answer) => {
    if (!answersByArea[answer.area]) {
      answersByArea[answer.area] = []
    }
    answersByArea[answer.area].push(answer)
  })

  let prompt = `Você é um consultor especializado em marketing e vendas. Analise as respostas abaixo e gere um diagnóstico completo e acionável.

EMPRESA: ${diagnostic.company_name}
PERÍODO DE ANÁLISE: ${diagnostic.analysis_period}

RESPOSTAS POR ÁREA:

`

  Object.entries(answersByArea).forEach(([area, areaAnswers]) => {
    prompt += `\n## ${area.toUpperCase()}\n`
    areaAnswers.forEach((answer) => {
      prompt += `- ${answer.question}: ${answer.answer}\n`
    })
  })

  prompt += `\n\nGere um diagnóstico JSON com a seguinte estrutura EXATA (sem markdown, apenas JSON válido):

{
  "general_score": <número de 0 a 100>,
  "strategic_reading": "<texto executivo claro e decisório, 2-3 parágrafos>",
  "priorities": [
    {
      "title": "<título da prioridade>",
      "description": "<descrição detalhada>",
      "impact": "high" | "medium" | "low"
    }
  ],
  "bottlenecks": [
    {
      "title": "<título do gargalo>",
      "description": "<descrição>",
      "evidence": ["<evidência 1>", "<evidência 2>"]
    }
  ],
  "charts_data": {
    "areas": [
      {
        "name": "<nome da área>",
        "score": <número de 0 a 100>
      }
    ],
    "revenue_impact": {
      "current": <valor estimado atual>,
      "potential": <valor potencial>,
      "gap": <diferença>
    }
  },
  "lost_revenue_indicators": [
    {
      "category": "<categoria>",
      "estimated_loss": <valor em reais>,
      "description": "<descrição>"
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown, sem explicações adicionais.`

  return prompt
}

async function callGeminiAPI(prompt: string): Promise<DiagnosticResult | null> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não configurada. Adicione a variável GEMINI_API_KEY no arquivo .env.local'
    )
  }

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
      }
      console.error('Erro na API Gemini:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      throw new Error(
        errorData?.error?.message || errorData?.message || `Erro na API Gemini: ${response.status}`
      )
    }

    const data = await response.json()

    // Extrai o texto da resposta
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('Resposta do Gemini sem texto')
      return null
    }

    // Tenta fazer parse do JSON
    let json: DiagnosticResult
    try {
      json = JSON.parse(text)
    } catch (parseError) {
      // Tenta extrair JSON de markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Não foi possível extrair JSON da resposta')
      }
    }

    // Valida estrutura básica
    if (
      typeof json.general_score !== 'number' ||
      !json.strategic_reading ||
      !Array.isArray(json.priorities)
    ) {
      throw new Error('Estrutura JSON inválida')
    }

    return json
  } catch (error: any) {
    console.error('Erro ao chamar Gemini API:', error)
    // Re-lança o erro para ser tratado no endpoint
    throw error
  }
}

