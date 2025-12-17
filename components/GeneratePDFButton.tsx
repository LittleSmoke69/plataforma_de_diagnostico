'use client'

import { useState } from 'react'

interface GeneratePDFButtonProps {
  diagnosticId: string
  hasPDF?: boolean // Mantido para compatibilidade, mas não é mais usado
}

export function GeneratePDFButton({ diagnosticId }: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/diagnostics/${diagnosticId}/pdf`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar PDF')
      }

      // Converte a resposta para blob e faz download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diagnostico-${diagnosticId}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      alert(error.message || 'Erro ao gerar PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className="bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
    </button>
  )
}

