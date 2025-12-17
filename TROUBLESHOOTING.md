# Troubleshooting - Erros Comuns

## Erro: "Variáveis de ambiente do Supabase não configuradas"

### Causa
As variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e/ou `SUPABASE_SERVICE_ROLE_KEY` não estão definidas.

### Solução

1. **Crie o arquivo `.env.local` na raiz do projeto** (se ainda não existir)

2. **Adicione as seguintes variáveis:**

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

3. **Onde encontrar as chaves do Supabase:**
   - Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
   - Vá em **Settings** → **API**
   - Copie:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantenha secreta!)

4. **Reinicie o servidor de desenvolvimento:**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

## Erro: "SupabaseClient is not a constructor"

### Causa
Problema com import dinâmico ou versão do pacote.

### Solução

1. **Limpe o cache do Next.js:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Reinstale as dependências:**
   ```bash
   rm -rf node_modules
   npm install
   ```

## Erro: "Cannot read property 'get' of undefined" (cookies)

### Causa
Problema com o contexto de cookies no Next.js.

### Solução
Certifique-se de que está usando `await cookies()` corretamente em Server Components.

## Verificação Rápida

Execute este comando para verificar se as variáveis estão carregadas:

```bash
# No terminal, dentro da pasta do projeto
node -e "require('dotenv').config({ path: '.env.local' }); console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'FALTANDO'); console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'FALTANDO');"
```

Se mostrar "FALTANDO", verifique o arquivo `.env.local`.

