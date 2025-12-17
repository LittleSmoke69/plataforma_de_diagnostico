-- Tabela de usuários (extensão da auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  current_plan_id UUID REFERENCES public.access_plans(id),
  diagnostics_limit INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos de acesso
CREATE TABLE IF NOT EXISTS public.access_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  diagnostics_limit INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.access_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de diagnósticos
CREATE TABLE IF NOT EXISTS public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  analysis_period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  general_score INTEGER CHECK (general_score >= 0 AND general_score <= 100),
  strategic_reading TEXT,
  pdf_report_url TEXT,
  realization_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de detalhes do diagnóstico
CREATE TABLE IF NOT EXISTS public.diagnostic_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_status ON public.diagnostics(status);
CREATE INDEX IF NOT EXISTS idx_diagnostic_details_diagnostic_id ON public.diagnostic_details(diagnostic_id);

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_details ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para access_plans (público para leitura)
CREATE POLICY "Anyone can view plans" ON public.access_plans
  FOR SELECT USING (true);

-- Políticas RLS para user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para diagnostics
CREATE POLICY "Users can view own diagnostics" ON public.diagnostics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diagnostics" ON public.diagnostics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostics" ON public.diagnostics
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para diagnostic_details
CREATE POLICY "Users can view own diagnostic details" ON public.diagnostic_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE diagnostics.id = diagnostic_details.diagnostic_id
      AND diagnostics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own diagnostic details" ON public.diagnostic_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE diagnostics.id = diagnostic_details.diagnostic_id
      AND diagnostics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own diagnostic details" ON public.diagnostic_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE diagnostics.id = diagnostic_details.diagnostic_id
      AND diagnostics.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own diagnostic details" ON public.diagnostic_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE diagnostics.id = diagnostic_details.diagnostic_id
      AND diagnostics.user_id = auth.uid()
    )
  );

-- Função para criar usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário na tabela users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir plano padrão (exemplo)
INSERT INTO public.access_plans (name, duration_days, diagnostics_limit, price, is_recurring)
VALUES 
  ('Plano Mensal', 30, 4, 97.00, true),
  ('Plano Avulso', 30, 4, 97.00, false)
ON CONFLICT DO NOTHING;

