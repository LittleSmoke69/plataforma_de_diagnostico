# Integração com Hotmart

## Estado Atual

Atualmente, a compra via Hotmart é **simulada**. O sistema está preparado para receber webhooks do Hotmart, mas a ativação manual de assinaturas é necessária.

## Como Simular uma Compra

### Opção 1: Via SQL (Desenvolvimento)

Execute no Supabase SQL Editor:

```sql
-- 1. Obtenha o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'usuario@exemplo.com';

-- 2. Obtenha o ID do plano
SELECT id, name FROM access_plans;

-- 3. Crie uma assinatura ativa
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  start_date,
  end_date
) VALUES (
  'USER_ID_AQUI',
  'PLAN_ID_AQUI',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- 4. Atualize o usuário com o plano atual
UPDATE users
SET current_plan_id = 'PLAN_ID_AQUI'
WHERE id = 'USER_ID_AQUI';
```

### Opção 2: Via API (Futuro)

Quando a integração com Hotmart estiver pronta, o webhook deve:

1. Receber POST em `/api/webhooks/hotmart`
2. Validar a assinatura do webhook (HMAC)
3. Criar/atualizar `user_subscriptions`
4. Atualizar `users.current_plan_id`

## Estrutura do Webhook (Futuro)

```typescript
// app/api/webhooks/hotmart/route.ts
export async function POST(req: Request) {
  // 1. Validar HMAC signature
  // 2. Processar evento (purchase, refund, etc.)
  // 3. Criar/atualizar assinatura
  // 4. Retornar 200 OK
}
```

## Eventos do Hotmart

- `PURCHASE_APPROVED`: Criar assinatura
- `PURCHASE_REFUNDED`: Cancelar assinatura
- `PURCHASE_CHARGEBACK`: Marcar como problema
- `SUBSCRIPTION_CANCELLED`: Cancelar assinatura recorrente

## Variáveis de Ambiente Necessárias

```env
HOTMART_WEBHOOK_SECRET=seu_secret_aqui
```

## Próximos Passos

1. Configurar webhook no painel do Hotmart
2. Implementar validação HMAC
3. Mapear eventos do Hotmart para ações no sistema
4. Testar com eventos reais

