'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllQuestions, AREAS_ORDER } from '@/lib/utils/diagnostic-questions'
import { DiagnosticQuestion } from '@/types/diagnostic'

interface DiagnosticFormProps {
  diagnosticId: string
  existingAnswers: Array<{
    id: string
    area: string
    question: string
    answer: string
  }>
}

export function DiagnosticForm({ diagnosticId, existingAnswers }: DiagnosticFormProps) {
  const router = useRouter()
  const allQuestions = getAllQuestions()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carrega respostas existentes
  useEffect(() => {
    const existing: Record<string, string> = {}
    existingAnswers.forEach((item) => {
      const key = `${item.area}-${item.question}`
      existing[key] = item.answer
    })
    setAnswers(existing)
  }, [existingAnswers])

  // Agrupa perguntas por área
  const questionsByArea = AREAS_ORDER.map((area) => {
    const areaQuestions = allQuestions.filter((q) => q.area === area)
    return { area, questions: areaQuestions }
  })

  const totalSteps = questionsByArea.length
  const currentArea = questionsByArea[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleAnswerChange = (questionKey: string, value: string) => {
    setAnswers({ ...answers, [questionKey]: value })
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Salva todas as respostas
      const responses = allQuestions.map((question) => ({
        diagnostic_id: diagnosticId,
        area: question.area,
        question: question.question,
        answer: answers[`${question.area}-${question.question}`] || '',
      }))

      const response = await fetch(`/api/diagnostics/${diagnosticId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: responses }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar respostas')
      }

      // Gera o diagnóstico com IA
      const generateResponse = await fetch(`/api/diagnostics/${diagnosticId}/generate`, {
        method: 'POST',
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({}))
        throw new Error(
          errorData.error ||
            `Erro ao gerar diagnóstico (${generateResponse.status}). Verifique se a chave GEMINI_API_KEY está configurada.`
        )
      }

      router.push(`/app/diagnostics/${diagnosticId}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao finalizar diagnóstico')
      setIsSubmitting(false)
    }
  }

  const isCurrentStepComplete = () => {
    return currentArea.questions.every((question) => {
      const key = `${question.area}-${question.question}`
      return answers[key] && answers[key].trim() !== ''
    })
  }

  const isAllComplete = () => {
    return allQuestions.every((question) => {
      const key = `${question.area}-${question.question}`
      return answers[key] && answers[key].trim() !== ''
    })
  }

  const getAreaName = (area: string) => {
    const names: Record<string, string> = {
      faturamento: 'Faturamento',
      vendas: 'Vendas',
      marketing: 'Marketing',
      processos: 'Processos',
      ferramentas: 'Ferramentas',
      desafios: 'Desafios',
    }
    return names[area] || area
  }

  return (
    <>
      {/* Overlay de loading */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-primary-500 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>
            <p className="text-white text-xl font-semibold">Gerando diagnóstico</p>
            <p className="text-white/80 text-sm mt-2">Aguarde enquanto processamos suas respostas...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {getAreaName(currentArea.area)}
            </h1>
            <span className="text-xs text-gray-500 font-medium">
              {currentStep + 1} de {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        {currentArea.questions.map((question) => {
          const key = `${question.area}-${question.question}`
          const value = answers[key] || ''

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {question.question}
              </label>
              {question.type === 'text' && (
                <textarea
                  value={value}
                  onChange={(e) => handleAnswerChange(key, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder="Digite sua resposta..."
                />
              )}
              {question.type === 'number' && (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleAnswerChange(key, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder="Digite um número..."
                />
              )}
              {question.type === 'select' && question.options && (
                <select
                  value={value}
                  onChange={(e) => handleAnswerChange(key, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 transition-all"
                >
                  <option value="">Selecione uma opção</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Voltar
        </button>
        {currentStep < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            disabled={!isCurrentStepComplete()}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isAllComplete() || isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            {isSubmitting ? 'Finalizando...' : 'Finalizar Diagnóstico'}
          </button>
        )}
      </div>
    </div>
    </>
  )
}

