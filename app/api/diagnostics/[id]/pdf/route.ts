import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verifica se o diagnóstico pertence ao usuário
    const serviceClient = createServiceClient()
    const { data: diagnostic, error: diagnosticError } = await serviceClient
      .from('diagnostics')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (diagnosticError || !diagnostic) {
      return NextResponse.json({ error: 'Diagnóstico não encontrado' }, { status: 404 })
    }

    // Busca detalhes
    const { data: details } = await serviceClient
      .from('diagnostic_details')
      .select('*')
      .eq('diagnostic_id', params.id)
      .order('area', { ascending: true })

    // Gera o HTML do PDF
    const htmlContent = generatePDFHTML(diagnostic, details || [])

    // Gera PDF com puppeteer
    const pdfBuffer = await generatePDFWithPuppeteer(htmlContent)

    // Retorna o PDF diretamente como resposta HTTP
    const fileName = `diagnostico-${diagnostic.company_name}-${Date.now()}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: error.message || 'Erro ao gerar PDF' }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verifica se o diagnóstico pertence ao usuário
    const serviceClient = createServiceClient()
    const { data: diagnostic, error: diagnosticError } = await serviceClient
      .from('diagnostics')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (diagnosticError || !diagnostic) {
      return NextResponse.json({ error: 'Diagnóstico não encontrado' }, { status: 404 })
    }

    // Busca detalhes
    const { data: details } = await serviceClient
      .from('diagnostic_details')
      .select('*')
      .eq('diagnostic_id', params.id)
      .order('area', { ascending: true })

    // Gera o HTML do PDF
    const htmlContent = generatePDFHTML(diagnostic, details || [])

    // Gera PDF com puppeteer
    const pdfBuffer = await generatePDFWithPuppeteer(htmlContent)

    // Retorna o PDF diretamente como resposta HTTP
    const fileName = `diagnostico-${diagnostic.company_name}-${Date.now()}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: error.message || 'Erro ao gerar PDF' }, { status: 500 })
  }
}

async function generatePDFWithPuppeteer(htmlContent: string): Promise<Buffer> {
  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
  } catch (error) {
    console.error('Erro ao gerar PDF com puppeteer:', error)
    throw new Error('Erro ao gerar PDF')
  }
}

function generatePDFHTML(diagnostic: any, details: any[]): string {
  const date = diagnostic.realization_date
    ? format(new Date(diagnostic.realization_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(new Date(diagnostic.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const score = diagnostic.general_score || 0
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : 'Precisa Melhorar'

  // Agrupa detalhes por área
  const detailsByArea = details.reduce((acc: any, detail: any) => {
    const area = detail.area || 'Geral'
    if (!acc[area]) {
      acc[area] = []
    }
    acc[area].push(detail)
    return acc
  }, {})

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Diagnóstico - ${diagnostic.company_name}</title>
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
    .score-container {
      text-align: center;
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 2px solid #e2e8f0;
    }
    .score-value {
      font-size: 72px;
      font-weight: 800;
      color: ${scoreColor};
      margin-bottom: 10px;
      line-height: 1;
    }
    .score-label {
      font-size: 24px;
      font-weight: 600;
      color: ${scoreColor};
      margin-bottom: 5px;
    }
    .score-max {
      font-size: 18px;
      color: #64748b;
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
    .strategic-reading {
      background: #f8fafc;
      padding: 25px;
      border-radius: 8px;
      border-left: 4px solid #0ea5e9;
      line-height: 1.8;
      font-size: 14px;
      text-align: justify;
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
      <h1>📊 Diagnóstico de Marketing & Vendas</h1>
      <div class="header-info">
        <div><strong>Empresa:</strong> ${diagnostic.company_name}</div>
        <div><strong>Data:</strong> ${date}</div>
      </div>
    </div>

    <div class="score-container">
      <div class="score-value">${score}</div>
      <div class="score-label">${scoreLabel}</div>
      <div class="score-max">de 100 pontos</div>
    </div>

    ${diagnostic.strategic_reading ? `
    <div class="section">
      <div class="section-title">📈 Leitura Estratégica</div>
      <div class="strategic-reading">
        ${diagnostic.strategic_reading.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">📋 Respostas Detalhadas por Área</div>
      ${Object.entries(detailsByArea)
        .map(
          ([area, areaDetails]: [string, any]) => `
        <div class="area-section">
          <div class="area-title">${area}</div>
          ${areaDetails
            .map(
              (detail: any) => `
            <div class="answer-card">
              <div class="question">${detail.question}</div>
              <div class="answer">${detail.answer}</div>
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
      <p>Este relatório foi gerado automaticamente pela Plataforma de Diagnóstico de Marketing & Vendas</p>
      <p>Data de geração: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
    </div>
  </div>
</body>
</html>
  `
}

