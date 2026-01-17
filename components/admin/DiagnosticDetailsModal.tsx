'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, Download, Clock, CheckCircle, XCircle } from 'lucide-react'

interface DiagnosticDetail {
  id: string
  user_id: string
  user_email: string
  company_name: string
  analysis_period: string
  status: 'pending' | 'completed' | 'failed'
  general_score: number | null
  strategic_reading: string | null
  pdf_report_url: string | null
  realization_date: string | null
  created_at: string
  updated_at: string
  details: Array<{
    id: string
    area: string
    question: string
    answer: string
    ai_feedback: string | null
    created_at: string
  }>
}

interface DiagnosticDetailsModalProps {
  diagnosticId: string
  onClose: () => void
}

export function DiagnosticDetailsModal({ diagnosticId, onClose }: DiagnosticDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diagnostic, setDiagnostic] = useState<DiagnosticDetail | null>(null)

  useEffect(() => {
    const fetchDiagnostic = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/diagnostics/${diagnosticId}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erro ao carregar detalhes')
        }

        const data = await response.json()
        setDiagnostic(data)
      } catch (err: any) {
        setError(err.message)
        console.error('Erro ao buscar detalhes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDiagnostic()
  }, [diagnosticId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Concluído
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
            <Clock className="w-4 h-4 mr-1.5" />
            Pendente
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4 mr-1.5" />
            Falhou
          </span>
        )
      default:
        return null
    }
  }

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      last_week: 'Última semana',
      last_month: 'Último mês',
      last_quarter: 'Último trimestre',
      last_semester: 'Último semestre',
      last_year: 'Último ano',
    }
    return labels[period] || period
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-4xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes da Análise</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando detalhes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        ) : diagnostic ? (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
                <p className="text-sm font-medium text-gray-900">{diagnostic.company_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Usuário</label>
                <p className="text-sm text-gray-900">{diagnostic.user_email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
                <p className="text-sm text-gray-900">{getPeriodLabel(diagnostic.analysis_period)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <div>{getStatusBadge(diagnostic.status)}</div>
              </div>
              {diagnostic.general_score !== null && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Score Geral</label>
                  <p className="text-2xl font-bold text-primary-600">{diagnostic.general_score}/100</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Criado em</label>
                <p className="text-sm text-gray-900">
                  {format(new Date(diagnostic.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {/* Strategic Reading */}
            {diagnostic.strategic_reading && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Leitura Estratégica
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {diagnostic.strategic_reading}
                  </p>
                </div>
              </div>
            )}

            {/* Detalhes */}
            {diagnostic.details && diagnostic.details.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-3">
                  Respostas e Feedback ({diagnostic.details.length})
                </label>
                <div className="space-y-4">
                  {diagnostic.details.map((detail, index) => (
                    <div
                      key={detail.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-primary-600">
                          {detail.area}
                        </span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">{detail.question}</p>
                        <p className="text-sm text-gray-700">{detail.answer}</p>
                      </div>
                      {detail.ai_feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Feedback IA:</p>
                          <p className="text-sm text-gray-700">{detail.ai_feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão PDF */}
            {diagnostic.status === 'completed' && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <a
                  href={`/api/diagnostics/${diagnostic.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

