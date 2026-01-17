-- Tabela para armazenar diagnósticos gratuitos
CREATE TABLE IF NOT EXISTS public.free_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  pdf_generated BOOLEAN DEFAULT false,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar as respostas das perguntas do diagnóstico gratuito
CREATE TABLE IF NOT EXISTS public.free_diagnostic_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  free_diagnostic_id UUID NOT NULL REFERENCES public.free_diagnostics(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  block TEXT NOT NULL CHECK (block IN ('financeiro', 'vendas', 'marketing', 'futuro')),
  question_text TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_free_diagnostics_email ON public.free_diagnostics(email);
CREATE INDEX IF NOT EXISTS idx_free_diagnostics_created_at ON public.free_diagnostics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_free_diagnostic_answers_diagnostic_id ON public.free_diagnostic_answers(free_diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_free_diagnostic_answers_question_id ON public.free_diagnostic_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_free_diagnostic_answers_block ON public.free_diagnostic_answers(block);

-- RLS (Row Level Security)
ALTER TABLE public.free_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_diagnostic_answers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para free_diagnostics
-- Permite inserção pública (formulário gratuito não requer autenticação)
CREATE POLICY "Anyone can create free diagnostics" ON public.free_diagnostics
  FOR INSERT WITH CHECK (true);

-- Apenas administradores podem visualizar (ou você pode ajustar conforme necessário)
-- Por padrão, bloqueamos SELECT para manter privacidade dos dados
CREATE POLICY "No public read access to free diagnostics" ON public.free_diagnostics
  FOR SELECT USING (false);

-- Políticas RLS para free_diagnostic_answers
CREATE POLICY "Anyone can create free diagnostic answers" ON public.free_diagnostic_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "No public read access to free diagnostic answers" ON public.free_diagnostic_answers
  FOR SELECT USING (false);

-- Comentários para documentação
COMMENT ON TABLE public.free_diagnostics IS 'Armazena dados de contato dos diagnósticos gratuitos';
COMMENT ON TABLE public.free_diagnostic_answers IS 'Armazena as respostas das perguntas de cada diagnóstico gratuito';
COMMENT ON COLUMN public.free_diagnostics.pdf_generated IS 'Indica se o PDF foi gerado e enviado';
COMMENT ON COLUMN public.free_diagnostic_answers.question_id IS 'ID da pergunta (1-12)';
COMMENT ON COLUMN public.free_diagnostic_answers.block IS 'Bloco da pergunta: financeiro, vendas, marketing ou futuro';

