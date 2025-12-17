# Setup de Autenticação Customizada

## ⚠️ Aviso de Segurança

**Este sistema usa senhas em texto plano, o que NÃO é seguro para produção!**

Para produção, você deve:
- Usar hash de senha (bcrypt, argon2, etc.)
- Implementar rate limiting
- Adicionar proteção contra ataques de força bruta
- Considerar usar JWT tokens ao invés de cookies simples

## 📋 Passo a Passo

### 1. Executar Migração SQL

Execute o arquivo `database/migration-custom-auth.sql` no Supabase SQL Editor:

```sql
-- Adiciona coluna password
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Remove dependência de auth.users
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Gera IDs automaticamente
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Cria índice
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
```

### 2. Criar Usuário Manualmente

Use o arquivo `database/create-user-example.sql` ou execute:

```sql
-- Opção 1: Query simples
INSERT INTO public.users (email, password, diagnostics_limit)
VALUES ('usuario@exemplo.com', 'senha123', 4)
RETURNING id, email, created_at;

-- Opção 2: Query completa com assinatura (veja create-user-example.sql)
```

### 3. Testar Login

1. Acesse `/login`
2. Use o email e senha criados
3. Você será redirecionado para `/app/dashboard`

## 🔄 Como Funciona

### Registro
- Endpoint: `POST /api/auth/register`
- Valida email e senha
- Cria usuário na tabela `users`
- Senha é salva em texto plano

### Login
- Endpoint: `POST /api/auth/login`
- Verifica email e senha
- Cria cookies de sessão (`session_token` e `user_id`)
- Retorna dados do usuário

### Autenticação
- Middleware verifica cookie `user_id`
- `getCurrentUser()` busca usuário no banco
- Todas as rotas protegidas usam `getCurrentUser()`

### Logout
- Endpoint: `POST /api/auth/logout`
- Remove cookies de sessão

## 📝 Exemplo de Uso

### Criar Usuário via SQL

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
BEGIN
  -- Criar usuário
  INSERT INTO public.users (email, password, diagnostics_limit)
  VALUES ('teste@exemplo.com', 'senha123', 4)
  RETURNING id INTO v_user_id;

  -- Obter plano
  SELECT id INTO v_plan_id FROM access_plans LIMIT 1;

  -- Criar assinatura
  INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
  VALUES (v_user_id, v_plan_id, 'active', NOW(), NOW() + INTERVAL '30 days');

  -- Atualizar current_plan_id
  UPDATE users
  SET current_plan_id = v_plan_id
  WHERE id = v_user_id;

  RAISE NOTICE 'Usuário criado! ID: %', v_user_id;
END $$;
```

## 🔐 Melhorias Recomendadas

1. **Hash de Senha**: Use bcrypt antes de salvar
2. **JWT Tokens**: Substitua cookies simples por JWT
3. **Refresh Tokens**: Implemente renovação de sessão
4. **Rate Limiting**: Limite tentativas de login
5. **2FA**: Adicione autenticação de dois fatores

