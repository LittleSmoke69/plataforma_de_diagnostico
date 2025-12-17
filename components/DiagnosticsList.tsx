'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Download, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Diagnostic {
  id: string
  company_name: string
  realization_date: string | null
  general_score: number | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

interface DiagnosticsListProps {
  diagnostics: Diagnostic[]
}

export function DiagnosticsList({ diagnostics }: DiagnosticsListProps) {
  if (diagnostics.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gray-500">Nenhum diagnóstico criado ainda.</p>
        <p className="text-xs text-gray-400 mt-1">Crie seu primeiro diagnóstico para começar!</p>
      </div>
    )
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

  return (
    <div className="divide-y divide-gray-100">
      {diagnostics.map((diagnostic) => (
        <div
          key={diagnostic.id}
          className="p-4 sm:p-6 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {diagnostic.company_name}
                </h3>
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                    diagnostic.status
                  )} self-start sm:self-center`}
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
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                <span>
                  {diagnostic.realization_date
                    ? format(new Date(diagnostic.realization_date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })
                    : format(new Date(diagnostic.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                </span>
                {diagnostic.general_score !== null && (
                  <span className="font-semibold text-gray-900">
                    {diagnostic.general_score}/100
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-4">
              <Link
                href={`/app/diagnostics/${diagnostic.id}`}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Visualizar</span>
              </Link>
              {diagnostic.status === 'completed' && (
                <a
                  href={`/api/diagnostics/${diagnostic.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

