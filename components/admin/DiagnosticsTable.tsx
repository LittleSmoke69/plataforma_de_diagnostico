'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Download, Clock, CheckCircle, XCircle, Filter } from 'lucide-react'
import { DiagnosticDetailsModal } from './DiagnosticDetailsModal'

interface Diagnostic {
  id: string
  user_id: string
  user_email: string
  company_name: string
  analysis_period: string
  status: 'pending' | 'completed' | 'failed'
  general_score: number | null
  realization_date: string | null
  created_at: string
  updated_at: string
}

interface DiagnosticsTableProps {
  initialDiagnostics?: Diagnostic[]
  initialPagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function DiagnosticsTable({
  initialDiagnostics = [],
  initialPagination,
}: DiagnosticsTableProps) {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>(initialDiagnostics)
  const [pagination, setPagination] = useState(
    initialPagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    user_id: '',
    start_date: '',
    end_date: '',
  })

  const fetchDiagnostics = async (page: number = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.user_id) params.append('user_id', filters.user_id)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await fetch(`/api/admin/diagnostics?${params.toString()}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar análises')
      }

      const data = await response.json()
      setDiagnostics(data.diagnostics)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao buscar análises:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics(1)
  }, [filters.status, filters.user_id, filters.start_date, filters.end_date])

  const handleViewDetails = (diagnosticId: string) => {
    setSelectedDiagnostic(diagnosticId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-primary-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary-50 text-primary-700 border-primary-200'
      case 'pending':
        return 'bg-gray-50 text-gray-600 border-gray-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header com filtros */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Todas as Análises</h2>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="failed">Falhou</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Final</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Limpar Filtros</label>
              <button
                onClick={() =>
                  setFilters({ status: '', user_id: '', start_date: '', end_date: '' })
                }
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-4 sm:p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading && diagnostics.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : diagnostics.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma análise encontrada
                </td>
              </tr>
            ) : (
              diagnostics.map((diagnostic) => (
                <tr key={diagnostic.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {diagnostic.company_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{diagnostic.user_email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getPeriodLabel(diagnostic.analysis_period)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        diagnostic.status
                      )}`}
                    >
                      {getStatusIcon(diagnostic.status)}
                      <span>
                        {diagnostic.status === 'completed'
                          ? 'Concluído'
                          : diagnostic.status === 'pending'
                          ? 'Pendente'
                          : 'Falhou'}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {diagnostic.general_score !== null ? (
                      <span className="font-semibold">{diagnostic.general_score}/100</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(diagnostic.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(diagnostic.id)}
                        className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {diagnostic.status === 'completed' && (
                        <a
                          href={`/api/diagnostics/${diagnostic.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                          title="Baixar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            Mostrando {diagnostics.length} de {pagination.total} análises
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchDiagnostics(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchDiagnostics(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {selectedDiagnostic && (
        <DiagnosticDetailsModal
          diagnosticId={selectedDiagnostic}
          onClose={() => setSelectedDiagnostic(null)}
        />
      )}
    </div>
  )
}

