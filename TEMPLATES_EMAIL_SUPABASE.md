# Templates de Email para Supabase Auth

Configure estes templates em: **Supabase Dashboard → Authentication → Email Templates**

---

## 1. Confirm Signup (Confirmação de Cadastro)

**Subject:** Confirme seu cadastro no MMG Playback

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu cadastro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                MMG Playback
              </h1>
              <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
                Ensaio Vocal
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                Bem-vindo ao MMG Playback! 🎵
              </h2>

              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Obrigado por se cadastrar. Para começar a usar a plataforma, confirme seu endereço de email clicando no botão abaixo:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Confirmar Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #666; font-size: 14px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>

              <p style="margin: 0 0 24px; padding: 12px; background-color: #f5f5f5; border-radius: 4px; word-break: break-all; color: #666; font-size: 13px;">
                {{ .ConfirmationURL }}
              </p>

              <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6;">
                Este link expira em 24 horas. Se você não solicitou este cadastro, pode ignorar este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                MMG Playback - Plataforma de Ensaio Vocal<br>
                © 2025 Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Invite User (Convite de Usuário)

**Subject:** Você foi convidado para {{ .ChurchName }} no MMG Playback

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para MMG Playback</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                MMG Playback
              </h1>
              <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
                Ensaio Vocal
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                Você recebeu um convite! 🎵
              </h2>

              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Você foi convidado para participar da equipe de ensaio vocal. Aceite o convite para começar:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #666; font-size: 14px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>

              <p style="margin: 0 0 24px; padding: 12px; background-color: #f5f5f5; border-radius: 4px; word-break: break-all; color: #666; font-size: 13px;">
                {{ .ConfirmationURL }}
              </p>

              <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6;">
                Este convite expira em 7 dias. Se você não esperava este convite, pode ignorar este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                MMG Playback - Plataforma de Ensaio Vocal<br>
                © 2025 Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Reset Password (Recuperação de Senha)

**Subject:** Recuperação de senha - MMG Playback

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                MMG Playback
              </h1>
              <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
                Ensaio Vocal
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                Recuperação de Senha 🔒
              </h2>

              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 14px 32px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #666; font-size: 14px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>

              <p style="margin: 0 0 24px; padding: 12px; background-color: #f5f5f5; border-radius: 4px; word-break: break-all; color: #666; font-size: 13px;">
                {{ .ConfirmationURL }}
              </p>

              <div style="margin: 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Segurança:</strong> Este link expira em 1 hora. Se você não solicitou a recuperação de senha, ignore este email e sua senha permanecerá a mesma.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                MMG Playback - Plataforma de Ensaio Vocal<br>
                © 2025 Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Como Aplicar os Templates

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication → Email Templates**
3. Para cada template acima:
   - Selecione o tipo de template (Confirm signup, Invite user, Reset password)
   - Cole o **Subject** no campo de assunto
   - Cole o **Body (HTML)** no editor de template
   - Clique em **Save**

---

## Variáveis Disponíveis

O Supabase fornece estas variáveis que podem ser usadas nos templates:

- `{{ .ConfirmationURL }}` - URL de confirmação/ação
- `{{ .Token }}` - Token de confirmação
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site configurada
- `{{ .Email }}` - Email do destinatário
- `{{ .ChurchName }}` - Nome da igreja (para convites, se configurado)

---

## Configurações Adicionais Necessárias

No **Supabase Dashboard → Authentication → URL Configuration**, configure:

- **Site URL**: `https://setlistgo.com`
- **Redirect URLs**: Adicione todas as URLs permitidas para redirect após confirmação/login
