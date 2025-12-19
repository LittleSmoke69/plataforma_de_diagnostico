# Guia de Setup - Plataforma de Diagnóstico de Marketing & Vendas

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Chave de API do Gemini (Google AI)

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Gemini API
GEMINI_API_KEY=sua_gemini_api_key_aqui

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar Banco de Dados no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o script `database/schema.sql` para criar todas as tabelas e políticas RLS

### 4. Configurar Storage no Supabase

1. No Supabase Dashboard, vá em **Storage**
2. Crie um bucket chamado `pdf-reports`
3. Configure as políticas de acesso:
   - **Public**: Desabilitado (recomendado para produção)
   - **Authenticated**: Habilitado para upload e leitura

### 5. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔐 Configuração de Autenticação

O projeto usa Supabase Auth. Os usuários são criados automaticamente na tabela `users` após o signup através do trigger `on_auth_user_created`.

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Extensão da auth.users com configurações de plano
- **access_plans**: Planos de assinatura disponíveis
- **user_subscriptions**: Assinaturas ativas dos usuários
- **diagnostics**: Diagnósticos criados
- **diagnostic_details**: Respostas detalhadas de cada diagnóstico

### RLS (Row Level Security)

Todas as tabelas têm RLS habilitado. Os usuários só podem acessar seus próprios dados.

## 🔧 Configuração de Planos

Planos padrão são criados automaticamente pelo script SQL:
- **Plano Mensal**: 30 dias, 4 diagnósticos, R$ 97,00 (recorrente)
- **Plano Avulso**: 30 dias, 4 diagnósticos, R$ 97,00 (não recorrente)

## 🧪 Testando a Aplicação

1. Crie uma conta em `/login`
2. Acesse o dashboard em `/app/dashboard`
3. Crie um novo diagnóstico
4. Preencha o formulário multi-step
5. Visualize o resultado gerado pela IA
6. Gere o PDF do diagnóstico

## 📝 Notas Importantes

- **Puppeteer**: Requer dependências do sistema (Chromium). Em produção, considere usar uma solução serverless ou containerizada.
- **Gemini API**: Certifique-se de que a chave de API está válida e tem créditos disponíveis.
- **Supabase Storage**: Configure as políticas de acesso adequadamente para produção.

## 🐛 Troubleshooting

### Erro ao gerar PDF
- Verifique se o Puppeteer está instalado corretamente
- Em ambientes serverless, considere usar uma API externa de geração de PDF

### Erro de autenticação
- Verifique se as variáveis de ambiente do Supabase estão corretas
- Confirme que o RLS está configurado corretamente

### Erro ao chamar Gemini API
- Verifique se a chave de API está correta
- Confirme que o modelo `gemini-1.5-flash` está disponível na sua região

