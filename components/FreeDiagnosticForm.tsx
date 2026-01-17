'use client'

import { useState } from 'react'
import { FREE_DIAGNOSTIC_QUESTIONS, calculateProgress, type FreeDiagnosticQuestion } from '@/lib/utils/free-diagnostic-questions'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface Answer {
  questionId: number
  value: string
  label: string
}

export function FreeDiagnosticForm() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentInsight, setCurrentInsight] = useState<string | null>(null)
  const [showFinalForm, setShowFinalForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    instagram: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = FREE_DIAGNOSTIC_QUESTIONS[currentQuestionIndex]
  const progress = calculateProgress(answers.length)
  const isLastQuestion = currentQuestionIndex === FREE_DIAGNOSTIC_QUESTIONS.length - 1

  const handleAnswer = (value: string, label: string) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      value,
      label,
    }

    // Remove resposta anterior se existir para esta pergunta
    const filteredAnswers = answers.filter((a) => a.questionId !== currentQuestion.id)
    const newAnswers = [...filteredAnswers, newAnswer]
    setAnswers(newAnswers)

    // Mostra micro-insight
    const insight = currentQuestion.insightMap[value]
    if (insight) {
      setCurrentInsight(insight)

      // Avança automaticamente após 2.5 segundos mostrando o insight
      setTimeout(() => {
        setCurrentInsight(null)
        if (isLastQuestion) {
          // Última pergunta - vai para formulário final
          setTimeout(() => {
            setShowFinalForm(true)
          }, 300)
        } else {
          // Próxima pergunta
          setCurrentQuestionIndex((prev) => prev + 1)
        }
      }, 2500)
    }
  }

  const handleSubmitFinalForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/diagnostico-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          contactInfo: formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao processar diagnóstico')
      }

      // Download do PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diagnostico-gratuito-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Mostra mensagem de sucesso
      alert('🎉 Diagnóstico gerado com sucesso! O PDF foi baixado.')
    } catch (error: any) {
      console.error('Erro:', error)
      alert('Erro ao gerar diagnóstico. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tela de finalização
  if (showFinalForm) {
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

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Confetes animados */}
          <div className="fixed inset-0 pointer-events-none z-20">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="confetti" style={{ left: `${i * 10}%` }} />
            ))}
          </div>

          {/* Card de Parabéns melhorado */}
          <div className="success-card rounded-3xl shadow-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
            {/* Decoração de fundo do card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-200/30 to-blue-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/30 to-purple-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              {/* Ícone central melhorado */}
              <div className="flex justify-center mb-6">
                <div className="success-icon-container inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 animate-ping opacity-20" />
                  <span className="text-6xl relative z-10">🎉</span>
                </div>
              </div>

              {/* Título principal */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 text-center leading-tight">
                Parabéns! 🎊
              </h2>
              
              {/* Subtítulo */}
              <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 text-center">
                Seu diagnóstico foi concluído com{' '}
                <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                  sucesso!
                </span>
              </p>

              {/* Badge de conclusão */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-full border-2 border-sky-200">
                  <CheckCircle2 className="w-6 h-6 text-sky-600" />
                  <span className="text-base font-bold text-sky-700">
                    {FREE_DIAGNOSTIC_QUESTIONS.length} perguntas respondidas
                  </span>
                </div>
              </div>

              {/* Barra de progresso final melhorada */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-600">Progresso Completo</span>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                    100%
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: '100%' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Mensagem motivacional */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Você está pronto para receber insights personalizados! 🚀
              </p>
            </div>
          </div>

          {/* Formulário de contato */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Receba seu relatório gratuito
            </h3>
            <p className="text-gray-600 mb-6">
              Preencha seus dados abaixo para receber o PDF com insights personalizados e recomendações
              claras baseadas nas suas respostas.
            </p>

            <form onSubmit={handleSubmitFinalForm} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Melhor e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  @Instagram da empresa
                </label>
                <input
                  type="text"
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="@suaempresa"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Gerando seu relatório...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Receber meu relatório gratuito
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Rodapé */}
          <div className="text-center mt-8 mb-4">
            <p className="text-sm text-white/70">
              © 2025 AGÊNCIA PONTO DE IGNIÇÃO. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Tela principal do formulário
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
        {/* Barra de progresso */}
        <div className="mb-8">
          <div className="w-full h-8 bg-blue-200/40 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-blue-300/30 relative">
            <div
              className="h-full bg-gradient-to-r from-blue-300/60 via-blue-400/70 to-indigo-400/80 rounded-full transition-all duration-500 ease-out flex items-center justify-center relative"
              style={{ width: `${progress}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm absolute whitespace-nowrap">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Card da pergunta - altura fixa para manter tamanho constante */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 mb-6 min-h-[500px] flex flex-col">
          {/* Título do bloco */}
          <div className="mb-4">
            <span className="text-sm font-semibold text-sky-600 uppercase tracking-wide">
              {currentQuestion.blockTitle}
            </span>
          </div>

          {/* Pergunta */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {currentQuestion.question}
          </h2>

          {/* Opções */}
          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option) => {
              const isSelected = answers.find(
                (a) => a.questionId === currentQuestion.id && a.value === option.value
              )

              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value, option.label)}
                  disabled={!!currentInsight}
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
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-8 mb-4">
          <p className="text-sm text-white/70">
            © 2025 AGÊNCIA PONTO DE IGNIÇÃO. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Modal de Micro-Insight com Overlay */}
      {currentInsight && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative transform transition-all">
              {/* Ícone decorativo */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Conteúdo do insight */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  💡 Insight Personalizado
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {currentInsight}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

