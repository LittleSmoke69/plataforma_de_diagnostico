'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Diagnostic {
  id: string
  company_name: string
  general_score: number | null
  strategic_reading: string | null
  realization_date: string | null
  created_at: string
}

interface DiagnosticDetail {
  id: string
  area: string
  question: string
  answer: string
  ai_feedback: string | null
}

interface DiagnosticResultViewProps {
  diagnostic: Diagnostic
  details: DiagnosticDetail[]
}

export function DiagnosticResultView({ diagnostic, details }: DiagnosticResultViewProps) {
  // Agrupa detalhes por área para gráficos
  const areasData = details.reduce((acc: Record<string, number>, detail) => {
    if (!acc[detail.area]) {
      acc[detail.area] = 0
    }
    // Tenta extrair score do ai_feedback se disponível
    if (detail.ai_feedback) {
      const scoreMatch = detail.ai_feedback.match(/(\d+)/)
      if (scoreMatch) {
        acc[detail.area] += parseInt(scoreMatch[1])
      }
    }
    return acc
  }, {})

  const chartData = Object.entries(areasData).map(([name, total]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    score: Math.min(100, total / (details.filter((d) => d.area === name).length || 1)),
  }))

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Score Geral */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Pontuação Geral</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100">
            <span className="text-4xl sm:text-5xl font-bold text-primary-500">
              {diagnostic.general_score || 0}
            </span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              {diagnostic.general_score && diagnostic.general_score >= 80
                ? 'Excelente! Seu negócio está bem estruturado.'
                : diagnostic.general_score && diagnostic.general_score >= 60
                ? 'Bom, mas há espaço para melhorias significativas.'
                : 'Há oportunidades importantes de otimização.'}
            </p>
            {diagnostic.realization_date && (
              <p className="text-xs text-gray-500 mt-3">
                Realizado em{' '}
                {format(new Date(diagnostic.realization_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leitura Estratégica */}
      {diagnostic.strategic_reading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Leitura Estratégica</h2>
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {diagnostic.strategic_reading}
            </p>
          </div>
        </div>
      )}

      {/* Gráfico por Área */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Pontuação por Área</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} className="sm:text-xs" />
              <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={11} className="sm:text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="score" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Respostas por Área */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Respostas Detalhadas</h2>
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(
            details.reduce((acc: Record<string, DiagnosticDetail[]>, detail) => {
              if (!acc[detail.area]) {
                acc[detail.area] = []
              }
              acc[detail.area].push(detail)
              return acc
            }, {})
          ).map(([area, areaDetails]) => (
            <div key={area} className="border-b border-gray-100 last:border-b-0 pb-4 sm:pb-6 last:pb-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4 capitalize">{area}</h3>
              <div className="space-y-3">
                {areaDetails.map((detail) => (
                  <div key={detail.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-2">{detail.question}</p>
                    <p className="text-sm text-gray-600 mb-2">{detail.answer}</p>
                    {detail.ai_feedback && (
                      <p className="text-xs text-primary-600 mt-2 italic leading-relaxed">
                        {detail.ai_feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

