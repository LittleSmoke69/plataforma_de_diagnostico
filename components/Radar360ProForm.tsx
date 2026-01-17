'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  RADAR360_MODULES,
  TRAFFIC_QUESTIONS,
  calculateRadar360Progress,
  getProgressText,
  type ModuleType,
  type Radar360Question,
} from '@/lib/utils/radar360-questions'
import { CheckCircle2, Sparkles, TrendingUp, Target, Users, DollarSign, ArrowLeft } from 'lucide-react'

interface DiagnosticFormProps {
  diagnosticId: string
}

interface Answer {
  questionId: string
  value: string | string[]
  label?: string
}

const MODULE_ICONS = {
  traffic: TrendingUp,
  brand: Target,
  social: Users,
  funnel: DollarSign,
}

export function Radar360ProForm({ diagnosticId }: DiagnosticFormProps) {
  const router = useRouter()
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([])
  const [showModuleSelection, setShowModuleSelection] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [currentInsight, setCurrentInsight] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressText, setProgressText] = useState('Diagnóstico em processamento…')

  // Filtra perguntas baseadas nos módulos selecionados e lógica condicional
  const activeQuestions = useMemo(() => {
    let questions: Radar360Question[] = []

    // Adiciona perguntas do módulo de tráfego
    if (selectedModules.includes('traffic')) {
      questions = [...questions, ...TRAFFIC_QUESTIONS]
    }

    // Adiciona perguntas dos outros módulos quando implementados
    // if (selectedModules.includes('brand')) { questions = [...questions, ...BRAND_QUESTIONS] }
    // if (selectedModules.includes('social')) { questions = [...questions, ...SOCIAL_QUESTIONS] }
    // if (selectedModules.includes('funnel')) { questions = [...questions, ...FUNNEL_QUESTIONS] }

    // Filtra perguntas condicionais baseado nas respostas atuais
    const filteredQuestions: Radar360Question[] = []

    for (const question of questions) {
      // Perguntas universais sempre aparecem
      if (!question.dependsOn) {
        filteredQuestions.push(question)
        continue
      }

      // Verifica se a dependência foi satisfeita
      const dependentAnswer = answers[question.dependsOn.questionId]
      if (!dependentAnswer) continue

      const answerValue = Array.isArray(dependentAnswer.value)
        ? dependentAnswer.value
        : [dependentAnswer.value]

      const isDependencyMet = question.dependsOn.values.some((val) =>
        answerValue.includes(val)
      )

      if (isDependencyMet) {
        filteredQuestions.push(question)
      }
    }

    return filteredQuestions
  }, [selectedModules, answers])

  const currentQuestion = activeQuestions[currentQuestionIndex]
  const totalQuestions = activeQuestions.length
  const answeredCount = Object.keys(answers).length
  const progress = calculateRadar360Progress(answeredCount, totalQuestions)

  // Atualiza texto de progresso
  useEffect(() => {
    setProgressText(getProgressText(answeredCount, totalQuestions))
  }, [answeredCount, totalQuestions])

  const handleModuleToggle = (moduleId: ModuleType) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  const handleStartDiagnostic = () => {
    if (selectedModules.length === 0) {
      alert('Selecione pelo menos um módulo para iniciar o diagnóstico.')
      return
    }
    setShowModuleSelection(false)
  }

  const handleAnswer = (value: string | string[], label?: string) => {
    if (!currentQuestion) return

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      value,
      label,
    }

    setAnswers({ ...answers, [currentQuestion.id]: newAnswer })

    // Mostra micro-insight se disponível
    if (currentQuestion.insightMap && typeof value === 'string') {
      const insight = currentQuestion.insightMap[value]
      if (insight) {
        setCurrentInsight(insight)

        setTimeout(() => {
          setCurrentInsight(null)
          moveToNextQuestion()
        }, 2500)
        return
      }
    }

    // Calcula métricas se houver função de cálculo
    if (currentQuestion.calculate) {
      const calculation = currentQuestion.calculate({ ...answers, [currentQuestion.id]: newAnswer })
      if (calculation) {
        console.log('Cálculo:', calculation) // Pode ser usado para exibir métricas
      }
    }

    // Move para próxima pergunta
    setTimeout(() => {
      moveToNextQuestion()
    }, 300)
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Converte respostas para formato esperado pela API
      const responses = Object.entries(answers).map(([questionId, answer]) => {
        const question = activeQuestions.find((q) => q.id === questionId)
        return {
          diagnostic_id: diagnosticId,
          area: question?.module || 'radar360',
          question: question?.question || '',
          answer: Array.isArray(answer.value)
            ? answer.value.join(', ')
            : String(answer.value || answer.label || ''),
        }
      })

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
        throw new Error('Erro ao gerar diagnóstico')
      }

      router.push(`/app/diagnostics/${diagnosticId}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Erro ao finalizar diagnóstico')
      setIsSubmitting(false)
    }
  }

  // Tela de seleção de módulos
  if (showModuleSelection) {
    return (
      <div className="min-h-screen py-8 px-4 relative">
        {/* Background animado 3D */}
        <div className="animated-background">
          <div className="floating-element" />
          <div className="floating-element" />
          <div className="floating-element" />
          <svg className="wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              className="wave-path"
              fill="rgba(59, 130, 246, 0.1)"
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Botão Voltar ao Dashboard */}
          <div className="mb-6 animate-slide-in-down">
            <button
              onClick={() => router.push('/app/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              RADAR360 PRO
            </h1>
            <p className="text-xl text-gray-600">
              Auditoria Profunda de Marketing, Vendas, Marca, Funis e Retenção
            </p>
          </div>

          {/* Card de seleção */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 mb-6 card-entrance" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Selecione os Módulos de Auditoria
            </h2>
            <p className="text-gray-600 mb-6">
              Quanto mais módulos selecionados, mais precisa será a Análise de Gap Financeiro.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {Object.values(RADAR360_MODULES).map((module) => {
                const Icon = MODULE_ICONS[module.id]
                const isSelected = selectedModules.includes(module.id)

                return (
                  <button
                    key={module.id}
                    onClick={() => handleModuleToggle(module.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{module.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{module.name}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-sky-500" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleStartDiagnostic}
              disabled={selectedModules.length === 0}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Iniciar Auditoria RADAR360 PRO
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Tela principal do formulário
  if (!currentQuestion) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perguntas...</p>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const currentAnswer = answers[currentQuestion.id]

  return (
    <div className="min-h-screen py-8 px-4 relative">
      {/* Background animado 3D */}
      <div className="animated-background">
        <div className="floating-element" />
        <div className="floating-element" />
        <div className="floating-element" />
        <svg className="wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            className="wave-path"
            fill="rgba(59, 130, 246, 0.1)"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Botão Voltar ao Dashboard */}
        <div className="mb-6 animate-slide-in-down">
          <button
            onClick={() => router.push('/app/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Barra de progresso psicológica */}
        <div className="mb-8 animate-slide-in-down" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white/80">{progressText}</span>
            <span className="text-sm font-bold text-white/90">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-8 bg-blue-200/40 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-blue-300/30 relative">
            <div
              className="h-full bg-gradient-to-r from-blue-300/60 via-blue-400/70 to-indigo-400/80 rounded-full transition-all duration-500 ease-out flex items-center justify-center relative"
              style={{ width: `${progress}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm absolute whitespace-nowrap">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Card da pergunta - altura fixa */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 mb-6 min-h-[500px] flex flex-col card-entrance" style={{ animationDelay: '0.2s' }}>
          {/* Módulo atual */}
          {currentQuestion.module && (
            <div className="mb-4">
              <span className="text-sm font-semibold text-sky-600 uppercase tracking-wide">
                {RADAR360_MODULES[currentQuestion.module].name}
              </span>
            </div>
          )}

          {/* Pergunta */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {currentQuestion.question}
          </h2>

          {/* Opções */}
          <div className="space-y-3 flex-1">
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <>
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    currentAnswer &&
                    (Array.isArray(currentAnswer.value)
                      ? currentAnswer.value.includes(option.value)
                      : currentAnswer.value === option.value)

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value, option.label)}
                      disabled={!!currentInsight || isSubmitting}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 shadow-md transform scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none`}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon && <span className="text-2xl">{option.icon}</span>}
                        <span className="flex-1 text-base md:text-lg font-medium text-gray-900">
                          {option.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-sky-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </>
            )}

            {currentQuestion.type === 'number' && (
              <input
                type="number"
                value={currentAnswer?.value || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value) {
                    handleAnswer(e.target.value)
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-900 text-lg"
                placeholder="Digite o valor..."
              />
            )}

            {currentQuestion.type === 'text' && (
              <textarea
                value={currentAnswer?.value || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value) {
                    handleAnswer(e.target.value)
                  }
                }}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-900 text-base"
                placeholder="Digite sua resposta..."
              />
            )}

            {currentQuestion.type === 'checkbox' && currentQuestion.options && (
              <>
                {currentQuestion.options.map((option) => {
                  const currentValues = Array.isArray(currentAnswer?.value)
                    ? currentAnswer.value
                    : currentAnswer?.value
                    ? [currentAnswer.value]
                    : []
                  const isSelected = currentValues.includes(option.value)

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        const newValues = isSelected
                          ? currentValues.filter((v) => v !== option.value)
                          : [...currentValues, option.value]
                        handleAnswer(newValues)
                      }}
                      disabled={!!currentInsight || isSubmitting}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-sky-500 bg-sky-500'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className="flex-1 text-base md:text-lg font-medium text-gray-900">
                          {option.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Micro-Insight com Overlay */}
      {currentInsight && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative transform transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Insight Estratégico</h3>
                <p className="text-gray-700 leading-relaxed text-base">{currentInsight}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Overlay de submissão */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-primary-500/90 z-50 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
            <p className="text-white text-xl font-semibold">
              Auditoria concluída. Estamos cruzando seus dados com padrões de mercado e
              identificando vazamentos financeiros.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

