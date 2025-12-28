# 🔧 Configurar Templates de Email do Supabase Auth

## Problema Identificado

O email de "Confirm Your Signup" está vindo com conteúdo SQL porque o Supabase Auth está usando templates padrão incorretos.

## Solução: Customizar Templates no Dashboard

### 1. Acessar Configurações de Email

👉 https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/auth/templates

### 2. Configurar Template de Confirmação

Clique em **"Confirm signup"** e substitua o conteúdo por:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu email - SetlistGO™</title>
  <style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #121212; border-radius: 16px; padding: 40px; text-align: center; }
    h1 { color: #ffffff; font-size: 28px; margin: 0 0 16px 0; }
    .brand { color: #1DB954; font-weight: 700; }
    p { color: #b3b3b3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; padding: 16px 40px; background-color: #1DB954; color: #000000 !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .btn:hover { background-color: #1ed760; }
    .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 32px;">
        <span class="brand">Setlist</span>GO™
      </h1>
    </div>

    <div class="card">
      <div style="font-size: 48px; margin-bottom: 20px;">✉️</div>

      <h1>Confirme seu email</h1>

      <p>Olá! Clique no botão abaixo para confirmar seu email e ativar sua conta no SetlistGO™.</p>

      <a href="{{ .ConfirmationURL }}" class="btn">Confirmar Email →</a>

      <p style="font-size: 14px; color: #666666; margin-top: 32px;">
        Ou copie e cole este link:<br>
        <span style="color: #1DB954; word-break: break-all;">{{ .ConfirmationURL }}</span>
      </p>

      <div style="border-top: 1px solid #282828; margin-top: 32px; padding-top: 24px;">
        <p style="font-size: 14px;">
          Se você não criou esta conta, pode ignorar este email.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>SetlistGO™ - Plataforma de Ensaio Vocal</p>
      <p>Este email foi enviado automaticamente, não responda.</p>
    </div>
  </div>
</body>
</html>
```

### 3. Configurar Template de Convite (Magic Link)

Clique em **"Magic Link"** e substitua por:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login no SetlistGO™</title>
  <style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #121212; border-radius: 16px; padding: 40px; text-align: center; }
    h1 { color: #ffffff; font-size: 28px; margin: 0 0 16px 0; }
    .brand { color: #1DB954; font-weight: 700; }
    p { color: #b3b3b3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; padding: 16px 40px; background-color: #1DB954; color: #000000 !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .btn:hover { background-color: #1ed760; }
    .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 32px;">
        <span class="brand">Setlist</span>GO™
      </h1>
    </div>

    <div class="card">
      <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>

      <h1>Acesse sua conta</h1>

      <p>Clique no botão abaixo para fazer login no SetlistGO™.</p>

      <a href="{{ .ConfirmationURL }}" class="btn">Fazer Login →</a>

      <p style="font-size: 14px; color: #666666; margin-top: 32px;">
        Este link expira em 1 hora.
      </p>

      <div style="border-top: 1px solid #282828; margin-top: 32px; padding-top: 24px;">
        <p style="font-size: 14px;">
          Se você não solicitou este login, ignore este email.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>SetlistGO™ - Plataforma de Ensaio Vocal</p>
    </div>
  </div>
</body>
</html>
```

### 4. Configurar Template de Recuperação de Senha

Clique em **"Reset Password"** e substitua por:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - SetlistGO™</title>
  <style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #121212; border-radius: 16px; padding: 40px; text-align: center; }
    h1 { color: #ffffff; font-size: 28px; margin: 0 0 16px 0; }
    .brand { color: #1DB954; font-weight: 700; }
    p { color: #b3b3b3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; padding: 16px 40px; background-color: #1DB954; color: #000000 !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .btn:hover { background-color: #1ed760; }
    .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 32px;">
        <span class="brand">Setlist</span>GO™
      </h1>
    </div>

    <div class="card">
      <div style="font-size: 48px; margin-bottom: 20px;">🔑</div>

      <h1>Redefinir sua senha</h1>

      <p>Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha.</p>

      <a href="{{ .ConfirmationURL }}" class="btn">Redefinir Senha →</a>

      <p style="font-size: 14px; color: #666666; margin-top: 32px;">
        Este link expira em 1 hora.
      </p>

      <div style="border-top: 1px solid #282828; margin-top: 32px; padding-top: 24px;">
        <p style="font-size: 14px; color: #FFC107;">
          ⚠️ Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>SetlistGO™ - Plataforma de Ensaio Vocal</p>
    </div>
  </div>
</body>
</html>
```

### 5. Configurar Template de Mudança de Email

Clique em **"Change Email Address"** e substitua por:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar novo email - SetlistGO™</title>
  <style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #121212; border-radius: 16px; padding: 40px; text-align: center; }
    h1 { color: #ffffff; font-size: 28px; margin: 0 0 16px 0; }
    .brand { color: #1DB954; font-weight: 700; }
    p { color: #b3b3b3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; padding: 16px 40px; background-color: #1DB954; color: #000000 !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .btn:hover { background-color: #1ed760; }
    .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 32px;">
        <span class="brand">Setlist</span>GO™
      </h1>
    </div>

    <div class="card">
      <div style="font-size: 48px; margin-bottom: 20px;">📧</div>

      <h1>Confirme seu novo email</h1>

      <p>Você solicitou a alteração do email da sua conta. Clique no botão abaixo para confirmar o novo endereço.</p>

      <a href="{{ .ConfirmationURL }}" class="btn">Confirmar Novo Email →</a>

      <div style="border-top: 1px solid #282828; margin-top: 32px; padding-top: 24px;">
        <p style="font-size: 14px;">
          Se você não solicitou esta alteração, ignore este email.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>SetlistGO™ - Plataforma de Ensaio Vocal</p>
    </div>
  </div>
</body>
</html>
```

### 6. Salvar Todas as Mudanças

Clique em **"Save"** em cada template.

## 🚫 Desativar Confirmação de Email (Opcional)

Se você NÃO quer que os usuários precisem confirmar email:

1. Vá em: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/auth/providers
2. Role até **"Email"**
3. Desmarque **"Enable email confirmations"**
4. Clique em **"Save"**

## ✅ Testar

Após configurar os templates:

1. Crie uma nova conta de teste
2. Verifique se o email chega bonito e formatado
3. Teste o link de confirmação

## 📧 Resultado Esperado

Os emails agora terão:
- ✅ Design profissional preto com verde
- ✅ Logo SetlistGO™
- ✅ Botões estilizados
- ✅ Responsivo para mobile
- ✅ Sem código SQL estranho!
