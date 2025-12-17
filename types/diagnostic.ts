export interface DiagnosticResult {
  general_score: number
  strategic_reading: string
  priorities: Array<{
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
  }>
  bottlenecks: Array<{
    title: string
    description: string
    evidence: string[]
  }>
  charts_data: {
    areas: Array<{
      name: string
      score: number
    }>
    revenue_impact: {
      current: number
      potential: number
      gap: number
    }
  }
  lost_revenue_indicators: Array<{
    category: string
    estimated_loss: number
    description: string
  }>
}

export interface DiagnosticFormData {
  company_name: string
  analysis_period: 'last_week' | 'last_month' | 'last_quarter' | 'last_semester' | 'last_year'
}

export interface DiagnosticQuestion {
  area: string
  question: string
  type: 'text' | 'select' | 'number'
  options?: string[]
}

