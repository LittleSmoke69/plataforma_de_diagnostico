-- Migração para autenticação customizada com senha em texto
-- ⚠️ ATENÇÃO: Senhas em texto plano não são seguras para produção!

-- Adiciona coluna password na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Remove a referência a auth.users (agora users é independente)
-- Primeiro, vamos modificar a tabela para não depender de auth.users
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Modifica a tabela users para ter id UUID gerado automaticamente
-- Se já tiver dados, mantenha os IDs existentes
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Atualiza tabelas que referenciam users
-- (user_subscriptions e diagnostics já têm ON DELETE CASCADE, então está ok)

-- Cria índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Query para criar um usuário manualmente
-- EXEMPLO DE USO:
/*
INSERT INTO public.users (email, password, diagnostics_limit)
VALUES ('usuario@exemplo.com', 'senha123', 4)
RETURNING id, email, created_at;
*/

-- Query para criar usuário com assinatura ativa
/*
-- 1. Criar usuário
INSERT INTO public.users (email, password, diagnostics_limit)
VALUES ('usuario@exemplo.com', 'senha123', 4)
RETURNING id;

-- 2. Obter ID do plano (exemplo: primeiro plano disponível)
SELECT id FROM access_plans LIMIT 1;

-- 3. Criar assinatura ativa
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
VALUES (
  'ID_DO_USUARIO_AQUI',
  'ID_DO_PLANO_AQUI',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- 4. Atualizar current_plan_id do usuário
UPDATE users
SET current_plan_id = 'ID_DO_PLANO_AQUI'
WHERE id = 'ID_DO_USUARIO_AQUI';
*/

