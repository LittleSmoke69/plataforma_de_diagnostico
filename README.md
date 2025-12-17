# Plataforma de Diagnóstico de Marketing & Vendas com IA

SaaS desenvolvido com Next.js App Router + TypeScript para diagnóstico inteligente de marketing e vendas.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Auth + Database + Storage)
- **Gemini API** (Google AI)
- **Tailwind CSS**
- **React Hook Form + Zod**

## 📋 Funcionalidades

- ✅ Autenticação com Supabase Auth
- ✅ Controle de assinaturas e limites de diagnósticos
- ✅ Dashboard com histórico e métricas
- ✅ Formulário multi-step guiado
- ✅ Geração de diagnóstico com IA (Gemini)
- ✅ Visualização de resultados com gráficos
- ✅ Geração e download de PDF

## 🛠️ Setup

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

3. Execute o projeto:
```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:
- `users` - Usuários e configurações de plano
- `access_plans` - Planos de acesso disponíveis
- `user_subscriptions` - Assinaturas ativas dos usuários
- `diagnostics` - Diagnósticos criados
- `diagnostic_details` - Detalhes e respostas dos diagnósticos

## 🔐 Segurança

- RLS (Row Level Security) habilitado
- Service Role Key usado apenas no backend
- Validação de assinaturas e limites em todas as operações

