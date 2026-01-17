-- Migration: Adicionar campos role, status e name na tabela users
-- Data: 2024

-- Adicionar coluna name (opcional)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Adicionar coluna role (padrão: 'user')
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Adicionar coluna status (padrão: 'active')
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked'));

-- Adicionar índice para melhor performance nas consultas por role e status
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Comentários para documentação
COMMENT ON COLUMN public.users.name IS 'Nome completo do usuário (opcional)';
COMMENT ON COLUMN public.users.role IS 'Papel do usuário: user (comum) ou admin (administrador)';
COMMENT ON COLUMN public.users.status IS 'Status do usuário: active (ativo), inactive (inativo) ou blocked (bloqueado)';

