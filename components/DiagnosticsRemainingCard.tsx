import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText } from 'lucide-react'

interface DiagnosticsRemainingCardProps {
  remaining: number
  limit: number
  isActive: boolean
  endDate: string | null
}

export function DiagnosticsRemainingCard({
  remaining,
  limit,
  isActive,
  endDate,
}: DiagnosticsRemainingCardProps) {
  const percentage = (remaining / limit) * 100

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Diagnósticos Restantes</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{remaining}</span>
              <span className="text-xs sm:text-sm text-gray-400">/ {limit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div
          className="h-1.5 rounded-full transition-all bg-primary-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isActive && endDate && (
        <p className="text-xs text-gray-500">
          Válido até {format(new Date(endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      )}

      {!isActive && (
        <p className="text-xs text-red-500 font-medium">Assinatura expirada</p>
      )}
    </div>
  )
}

