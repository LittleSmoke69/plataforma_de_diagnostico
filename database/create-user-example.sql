-- ============================================
-- QUERY PARA CRIAR USUÁRIO MANUALMENTE
-- ============================================

-- Passo 1: Criar o usuário
INSERT INTO public.users (email, password, diagnostics_limit)
VALUES ('usuario@exemplo.com', 'senha123', 4)
RETURNING id, email, created_at;

-- Passo 2: Obter o ID do usuário criado e o ID de um plano
-- (Execute o Passo 1 primeiro e copie o ID retornado)

-- Passo 3: Criar assinatura ativa para o usuário
-- Substitua 'ID_DO_USUARIO' pelo ID retornado no Passo 1
-- Substitua 'ID_DO_PLANO' pelo ID de um plano (execute: SELECT id FROM access_plans;)

INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
VALUES (
  'ID_DO_USUARIO',  -- Substitua pelo ID do usuário
  (SELECT id FROM access_plans LIMIT 1),  -- Pega o primeiro plano disponível
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Passo 4: Atualizar current_plan_id do usuário
UPDATE users
SET current_plan_id = (SELECT id FROM access_plans LIMIT 1)
WHERE id = 'ID_DO_USUARIO';  -- Substitua pelo ID do usuário

-- ============================================
-- QUERY COMPLETA EM UMA ÚNICA EXECUÇÃO
-- ============================================

DO $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
BEGIN
  -- Criar usuário
  INSERT INTO public.users (email, password, diagnostics_limit)
  VALUES ('usuario@exemplo.com', 'senha123', 4)
  RETURNING id INTO v_user_id;

  -- Obter primeiro plano disponível
  SELECT id INTO v_plan_id FROM access_plans LIMIT 1;

  -- Criar assinatura
  INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
  VALUES (v_user_id, v_plan_id, 'active', NOW(), NOW() + INTERVAL '30 days');

  -- Atualizar current_plan_id
  UPDATE users
  SET current_plan_id = v_plan_id
  WHERE id = v_user_id;

  RAISE NOTICE 'Usuário criado com sucesso! ID: %', v_user_id;
END $$;

