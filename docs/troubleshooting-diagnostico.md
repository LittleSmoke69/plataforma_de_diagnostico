# Troubleshooting - Erros na Geração de Diagnóstico

## Erro: "GEMINI_API_KEY não configurada"

### Causa
A variável de ambiente `GEMINI_API_KEY` não está definida no arquivo `.env.local`.

### Solução

1. **Verifique se o arquivo `.env.local` existe** na raiz do projeto

2. **Adicione a chave da API do Gemini:**
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. **Onde obter a chave:**
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma nova chave de API
   - Copie e cole no `.env.local`

4. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

## Erro: "Erro na API Gemini: 400/401/403"

### Possíveis Causas

1. **Chave de API inválida ou expirada**
   - Verifique se a chave está correta
   - Gere uma nova chave se necessário

2. **Modelo não disponível**
   - O modelo `gemini-1.5-flash` pode não estar disponível na sua região
   - Tente usar `gemini-1.5-flash` ou `gemini-pro`

3. **Limite de requisições excedido**
   - Verifique seus limites na Google AI Studio
   - Aguarde alguns minutos antes de tentar novamente

### Solução

1. **Verifique os logs do servidor** para ver o erro completo:
   ```bash
   # No terminal onde o servidor está rodando
   # Procure por "Erro na API Gemini:"
   ```

2. **Teste a chave manualmente:**
   ```bash
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=SUA_CHAVE" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Teste"}]}]}'
   ```

3. **Se necessário, altere o modelo** no arquivo `app/api/diagnostics/[id]/generate/route.ts`:
   ```typescript
   const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
   ```

## Erro: "Nenhuma resposta encontrada"

### Causa
O diagnóstico não tem respostas salvas no banco de dados.

### Solução

1. **Verifique se todas as perguntas foram respondidas**
2. **Verifique no banco de dados:**
   ```sql
   SELECT * FROM diagnostic_details WHERE diagnostic_id = 'ID_DO_DIAGNOSTICO';
   ```

## Erro: "Estrutura JSON inválida"

### Causa
A resposta da API do Gemini não está no formato esperado.

### Solução

1. **Verifique os logs do servidor** para ver a resposta completa
2. **O prompt pode estar muito longo** - tente reduzir o número de perguntas
3. **O modelo pode estar retornando markdown** - o código tenta extrair, mas pode falhar

## Erro: "Diagnóstico não encontrado"

### Causa
O diagnóstico não existe ou não pertence ao usuário logado.

### Solução

1. **Verifique se o ID do diagnóstico está correto**
2. **Verifique se você está logado com a conta correta**
3. **Verifique no banco de dados:**
   ```sql
   SELECT * FROM diagnostics WHERE id = 'ID_DO_DIAGNOSTICO';
   ```

## Verificação Rápida

Execute este checklist:

- [ ] Arquivo `.env.local` existe na raiz do projeto
- [ ] `GEMINI_API_KEY` está definida no `.env.local`
- [ ] Chave de API está válida (teste no Google AI Studio)
- [ ] Servidor foi reiniciado após adicionar a chave
- [ ] Diagnóstico tem respostas salvas
- [ ] Usuário está autenticado
- [ ] Verifique os logs do servidor para erros detalhados

## Logs Úteis

Os logs do servidor mostrarão:
- Erros de conexão com a API
- Respostas inválidas da API
- Problemas de parsing do JSON
- Erros de banco de dados

Sempre verifique o terminal onde o servidor está rodando para ver os erros completos.

