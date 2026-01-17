import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FREE_DIAGNOSTIC_QUESTIONS } from '@/lib/utils/free-diagnostic-questions'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type FreeDiagnostic = Database['public']['Tables']['free_diagnostics']['Row']

interface Answer {
  questionId: number
  value: string
  label: string
}

interface ContactInfo {
  name: string
  email: string
  whatsapp: string
  instagram?: string
}

async function generatePDFWithPuppeteer(htmlContent: string): Promise<Buffer> {
  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    await browser.close()
    return Buffer.from(pdfBuffer)
  } catch (error: any) {
    console.error('Erro ao gerar PDF com puppeteer:', error)
    throw new Error(
      `Erro ao gerar PDF: ${error.message || 'Puppeteer não disponível. Em ambientes serverless, considere usar uma API externa de geração de PDF.'}`
    )
  }
}

function generateFreeDiagnosticPDFHTML(
  answers: Answer[],
  contactInfo: ContactInfo
): string {
  const date = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  // Agrupa respostas por bloco
  const answersByBlock: Record<string, { question: string; answer: string }[]> = {}

  answers.forEach((answer) => {
    const question = FREE_DIAGNOSTIC_QUESTIONS.find((q) => q.id === answer.questionId)
    if (question) {
      if (!answersByBlock[question.block]) {
        answersByBlock[question.block] = []
      }
      answersByBlock[question.block].push({
        question: question.question,
        answer: answer.label,
      })
    }
  })

  // Nomes dos blocos
  const blockNames: Record<string, string> = {
    financeiro: '🔹 RAIO-X FINANCEIRO',
    vendas: '🔹 A MÁQUINA DE VENDAS',
    marketing: '🔹 INTELIGÊNCIA DE MARKETING',
    futuro: '🔹 FUTURO E VISÃO',
  }

  // Gera insights personalizados baseados nas respostas
  const generateInsights = (): string => {
    const insights: string[] = []

    // Análise financeira
    const faturamentoAnswer = answers.find((a) => a.questionId === 1)
    if (faturamentoAnswer?.value === 'ate_10k') {
      insights.push(
        '🎯 <strong>Faturamento em crescimento:</strong> Você está na fase inicial. Foque em estruturação de processos e automação de marketing para acelerar seu crescimento.'
      )
    }

    // Análise de vendas
    const crmAnswer = answers.find((a) => a.questionId === 4)
    if (crmAnswer?.value === 'planilha' || crmAnswer?.value === 'cabeca') {
      insights.push(
        '📊 <strong>Organização é fundamental:</strong> Implementar um sistema de gestão (CRM) pode dobrar sua capacidade de conversão e aumentar significativamente as vendas.'
      )
    }

    // Análise de marketing
    const cacAnswer = answers.find((a) => a.questionId === 9)
    if (cacAnswer?.value === 'nao_sei') {
      insights.push(
        '📈 <strong>Métrica essencial:</strong> Conhecer seu CAC (Custo de Aquisição de Cliente) permite tomar decisões estratégicas sobre onde investir em marketing.'
      )
    }

    // Análise de tecnologia
    const techAnswer = answers.find((a) => a.questionId === 10)
    if (techAnswer?.value === 'basico') {
      insights.push(
        '⚙️ <strong>Automação libera tempo:</strong> Implementar automações básicas pode liberar 10-20 horas semanais, permitindo focar em estratégias de crescimento.'
      )
    }

    // Análise de metas
    const metasAnswer = answers.find((a) => a.questionId === 12)
    if (metasAnswer?.value !== 'sim_escrevi') {
      insights.push(
        '✍️ <strong>Metas escritas funcionam:</strong> Pessoas com metas escritas têm 42% mais chances de alcançá-las. Crie um plano de ação específico para cada meta.'
      )
    }

    return insights.length > 0
      ? insights.map((insight) => `<p style="margin-bottom: 12px;">${insight}</p>`).join('')
      : '<p>Continue focado em otimizar processos, medir resultados e estruturar estratégias de crescimento sustentável.</p>'
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Diagnóstico Gratuito - ${contactInfo.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 0;
      color: #1f2937;
      background: #ffffff;
      line-height: 1.6;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 30mm 20mm;
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-size: 14px;
      opacity: 0.95;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #0ea5e9;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #0ea5e9;
    }
    .insights-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 25px;
      border-radius: 8px;
      border-left: 4px solid #0ea5e9;
      line-height: 1.8;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .area-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .area-title {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 15px;
      padding: 10px;
      background: #f1f5f9;
      border-radius: 6px;
    }
    .answer-card {
      margin-bottom: 15px;
      padding: 15px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      border-left: 4px solid #0ea5e9;
    }
    .question {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .answer {
      color: #475569;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      .container {
        padding: 15mm 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Diagnóstico Gratuito de Marketing & Vendas</h1>
      <div class="header-info">
        <div><strong>Nome:</strong> ${contactInfo.name}</div>
        <div><strong>Data:</strong> ${date}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">💡 Insights e Recomendações Personalizadas</div>
      <div class="insights-box">
        ${generateInsights()}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 Suas Respostas por Bloco</div>
      ${Object.entries(answersByBlock)
        .map(
          ([block, blockAnswers]) => `
        <div class="area-section">
          <div class="area-title">${blockNames[block] || block}</div>
          ${blockAnswers
            .map(
              (item) => `
            <div class="answer-card">
              <div class="question">${item.question}</div>
              <div class="answer">${item.answer}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `
        )
        .join('')}
    </div>

    <div class="footer">
      <p>Este relatório foi gerado automaticamente - Diagnóstico Gratuito de Marketing & Vendas</p>
      <p>Data de geração: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
      ${contactInfo.email ? `<p>E-mail: ${contactInfo.email}</p>` : ''}
      ${contactInfo.whatsapp ? `<p>WhatsApp: ${contactInfo.whatsapp}</p>` : ''}
      ${contactInfo.instagram ? `<p>Instagram: ${contactInfo.instagram}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { answers, contactInfo }: { answers: Answer[]; contactInfo: ContactInfo } = body

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Respostas não fornecidas' }, { status: 400 })
    }

    if (!contactInfo || !contactInfo.name || !contactInfo.email || !contactInfo.whatsapp) {
      return NextResponse.json({ error: 'Informações de contato incompletas' }, { status: 400 })
    }

    // Salva os dados no banco de dados
    const serviceClient = createServiceClient()

    // Insere o diagnóstico gratuito
    const insertData = {
      name: contactInfo.name,
      email: contactInfo.email,
      whatsapp: contactInfo.whatsapp,
      instagram: contactInfo.instagram || null,
      pdf_generated: true,
    }

    const { data: freeDiagnosticData, error: diagnosticError } = await serviceClient
      .from('free_diagnostics')
      .insert(insertData as any)
      .select()
      .single()

    const freeDiagnostic = freeDiagnosticData as FreeDiagnostic | null

    if (diagnosticError || !freeDiagnostic) {
      console.error('Erro ao salvar diagnóstico gratuito:', diagnosticError)
      // Continua o processo mesmo se houver erro ao salvar no banco
    } else {
      // Insere as respostas
      const answerInserts = answers.map((answer) => {
        const question = FREE_DIAGNOSTIC_QUESTIONS.find((q) => q.id === answer.questionId)
        const blockValue = (question?.block || 'financeiro') as 'financeiro' | 'vendas' | 'marketing' | 'futuro'
        return {
          free_diagnostic_id: freeDiagnostic.id,
          question_id: answer.questionId,
          block: blockValue,
          question_text: question?.question || '',
          answer_value: answer.value,
          answer_label: answer.label,
        }
      })

      const { error: answersError } = await serviceClient
        .from('free_diagnostic_answers')
        .insert(answerInserts as any)

      if (answersError) {
        console.error('Erro ao salvar respostas do diagnóstico gratuito:', answersError)
        // Continua o processo mesmo se houver erro ao salvar as respostas
      }
    }

    // Gera o HTML do PDF
    const htmlContent = generateFreeDiagnosticPDFHTML(answers, contactInfo)

    // Gera PDF com puppeteer
    const pdfBuffer = await generatePDFWithPuppeteer(htmlContent)

    // Retorna o PDF diretamente como resposta HTTP
    const fileName = `diagnostico-gratuito-${contactInfo.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('Erro ao gerar PDF do diagnóstico gratuito:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}

