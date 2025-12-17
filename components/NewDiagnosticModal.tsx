'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface NewDiagnosticModalProps {
  canCreate: boolean
  reason?: string
}

export function NewDiagnosticModal({ canCreate, reason }: NewDiagnosticModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    analysis_period: 'last_month' as
      | 'last_week'
      | 'last_month'
      | 'last_quarter'
      | 'last_semester'
      | 'last_year',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar diagnóstico')
      }

      const { id } = await response.json()
      router.push(`/app/diagnostics/${id}/form`)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao criar diagnóstico')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={!canCreate}
        className="bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Novo Diagnóstico
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Novo Diagnóstico</h2>

            {!canCreate && reason && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm">
                {reason}
              </div>
            )}

            {canCreate && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-all"
                    placeholder="Ex: Minha Empresa LTDA"
                  />
                </div>

                <div>
                  <label
                    htmlFor="analysis_period"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Período de Análise
                  </label>
                  <select
                    id="analysis_period"
                    value={formData.analysis_period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analysis_period: e.target.value as any,
                      })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 transition-all"
                  >
                    <option value="last_week">Última Semana</option>
                    <option value="last_month">Último Mês</option>
                    <option value="last_quarter">Último Trimestre</option>
                    <option value="last_semester">Último Semestre</option>
                    <option value="last_year">Último Ano</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isLoading ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </form>
            )}

            {!canCreate && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

