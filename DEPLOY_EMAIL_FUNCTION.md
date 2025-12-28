# 📧 Deploy da Função de Email

## Pré-requisitos

1. **Supabase CLI instalado**
   ```bash
   npm install -g supabase
   ```

2. **Login no Supabase**
   ```bash
   supabase login
   ```

3. **Link com o projeto**
   ```bash
   supabase link --project-ref your-project-ref
   ```

## Configurar Variáveis de Ambiente

Antes de fazer deploy, configure as variáveis de ambiente no Supabase:

1. Acesse o Dashboard do Supabase
2. Vá em **Settings** → **Edge Functions**
3. Adicione as seguintes variáveis:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato.setlistgo@gmail.com
SMTP_PASS=xhskmqszkcrlzafk
SMTP_FROM=contato.setlistgo@gmail.com
```

## Deploy da Edge Function

Execute o comando:

```bash
npx supabase functions deploy send-email
```

## Verificar Deploy

Teste a função no Dashboard do Supabase:

1. Vá em **Edge Functions** → **send-email**
2. Clique em **Test**
3. Use este JSON de teste:

```json
{
  "to": "seu-email@gmail.com",
  "subject": "Teste de Email - SetlistGO™",
  "html": "<h1>Teste</h1><p>Email funcionando!</p>"
}
```

## Permissões

A função de email já está configurada para aceitar requisições autenticadas via Supabase Auth.

## Logs

Para ver logs em tempo real:

```bash
npx supabase functions serve send-email
```

## Troubleshooting

### Erro de autenticação SMTP
- Verifique se a senha de app do Gmail está correta
- Confirme que a autenticação de 2 fatores está ativa no Gmail
- Use uma senha de app específica (não a senha normal)

### Email não chega
- Verifique a pasta de spam
- Confirme que o SMTP_USER e SMTP_FROM são iguais
- Verifique os logs da função

### Timeout
- O Gmail pode demorar até 30 segundos para enviar
- Aumente o timeout da função se necessário
