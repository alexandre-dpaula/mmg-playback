# 📧 Templates de Email Supabase - UI/UX Melhorado

## 🎨 Design Atualizado

- **Fundo**: Branco/Claro (#FFFFFF)
- **Texto**: Preto com bom contraste
- **Botão**: Verde #1DB954 (mantido)
- **Logo**: "Setlist" em preto + "GO™" em verde (bold)
- **Card**: Sombra suave, bordas arredondadas
- **Mobile-first**: Responsivo e otimizado

---

## 1. Confirm Signup (Confirmação de Cadastro)

Cole este código em: **Auth > Email Templates > Confirm signup**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu email - SetlistGO™</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">

        <!-- Container principal -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header com logo -->
          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 300; letter-spacing: -1px; color: #1a1a1a;">
                Setlist<span style="font-weight: 700; color: #1DB954;">GO</span><span style="font-size: 18px; color: #666666;">™</span>
              </h1>
            </td>
          </tr>

          <!-- Corpo do email -->
          <tr>
            <td style="padding: 48px 40px;">

              <!-- Ícone -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px; line-height: 1;">✉️</span>
                </div>
              </div>

              <!-- Título -->
              <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3;">
                Confirme seu email
              </h2>

              <!-- Subtítulo -->
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #666666; text-align: center; line-height: 1.6;">
                Olá! Estamos felizes em ter você conosco. 🎉<br>
                Clique no botão abaixo para confirmar seu email e começar a usar o SetlistGO™.
              </p>

              <!-- Botão CTA -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background-color: #1DB954; color: #ffffff !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3); transition: all 0.2s;">
                  Confirmar Email →
                </a>
              </div>

              <!-- Link alternativo -->
              <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; font-size: 13px; color: #999999; text-align: center; line-height: 1.6;">
                  Ou copie e cole este link no navegador:
                </p>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #1DB954; text-align: center; word-break: break-all; line-height: 1.4;">
                  {{ .ConfirmationURL }}
                </p>
              </div>

              <!-- Aviso -->
              <div style="margin-top: 32px; padding: 16px; background-color: #f9f9f9; border-radius: 12px; border-left: 4px solid #1DB954;">
                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.5;">
                  <strong style="color: #1a1a1a;">Não foi você?</strong><br>
                  Se você não criou esta conta, pode ignorar este email.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                SetlistGO™
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
                Plataforma de Ensaio Vocal e Gestão de Repertórios
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer externo -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 24px auto 0 auto;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #999999; line-height: 1.5;">
                Este email foi enviado automaticamente. Por favor, não responda.
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

## 2. Magic Link (Login sem senha)

Cole este código em: **Auth > Email Templates > Magic Link**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesse sua conta - SetlistGO™</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 300; letter-spacing: -1px; color: #1a1a1a;">
                Setlist<span style="font-weight: 700; color: #1DB954;">GO</span><span style="font-size: 18px; color: #666666;">™</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 48px 40px;">

              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%); border-radius: 50%;">
                  <span style="font-size: 40px; line-height: 80px;">🔐</span>
                </div>
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3;">
                Acesse sua conta
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 16px; color: #666666; text-align: center; line-height: 1.6;">
                Clique no botão abaixo para fazer login no SetlistGO™ de forma rápida e segura.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background-color: #1DB954; color: #ffffff !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);">
                  Fazer Login →
                </a>
              </div>

              <div style="margin-top: 32px; padding: 16px; background-color: #fff3cd; border-radius: 12px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                  ⏱️ <strong>Este link expira em 1 hora</strong> por segurança.
                </p>
              </div>

              <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; font-size: 14px; color: #666666; text-align: center; line-height: 1.5;">
                  Se você não solicitou este login, ignore este email com segurança.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                SetlistGO™
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
                Plataforma de Ensaio Vocal e Gestão de Repertórios
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

Cole este código em: **Auth > Email Templates > Reset Password**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir senha - SetlistGO™</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 300; letter-spacing: -1px; color: #1a1a1a;">
                Setlist<span style="font-weight: 700; color: #1DB954;">GO</span><span style="font-size: 18px; color: #666666;">™</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 48px 40px;">

              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%); border-radius: 50%;">
                  <span style="font-size: 40px; line-height: 80px;">🔑</span>
                </div>
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3;">
                Redefinir sua senha
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 16px; color: #666666; text-align: center; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta.<br>
                Clique no botão abaixo para criar uma nova senha.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background-color: #1DB954; color: #ffffff !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);">
                  Redefinir Senha →
                </a>
              </div>

              <div style="margin-top: 32px; padding: 16px; background-color: #fff3cd; border-radius: 12px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                  ⏱️ <strong>Este link expira em 1 hora</strong> por segurança.
                </p>
              </div>

              <div style="margin-top: 32px; padding: 16px; background-color: #f8d7da; border-radius: 12px; border-left: 4px solid #dc3545;">
                <p style="margin: 0; font-size: 14px; color: #721c24; line-height: 1.5;">
                  ⚠️ <strong>Não solicitou esta redefinição?</strong><br>
                  Ignore este email e sua senha permanecerá inalterada.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                SetlistGO™
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
                Plataforma de Ensaio Vocal e Gestão de Repertórios
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

## 4. Change Email (Mudança de Email)

Cole este código em: **Auth > Email Templates > Change Email Address**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar novo email - SetlistGO™</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 300; letter-spacing: -1px; color: #1a1a1a;">
                Setlist<span style="font-weight: 700; color: #1DB954;">GO</span><span style="font-size: 18px; color: #666666;">™</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 48px 40px;">

              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%); border-radius: 50%;">
                  <span style="font-size: 40px; line-height: 80px;">📧</span>
                </div>
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; line-height: 1.3;">
                Confirme seu novo email
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 16px; color: #666666; text-align: center; line-height: 1.6;">
                Você solicitou a alteração do email da sua conta.<br>
                Clique no botão abaixo para confirmar o novo endereço.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background-color: #1DB954; color: #ffffff !important; text-decoration: none; border-radius: 500px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);">
                  Confirmar Novo Email →
                </a>
              </div>

              <div style="margin-top: 32px; padding: 16px; background-color: #d1ecf1; border-radius: 12px; border-left: 4px solid #0c5460;">
                <p style="margin: 0; font-size: 14px; color: #0c5460; line-height: 1.5;">
                  ℹ️ <strong>Atenção:</strong> Após confirmar, seu email de login será atualizado.
                </p>
              </div>

              <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; font-size: 14px; color: #666666; text-align: center; line-height: 1.5;">
                  Se você não solicitou esta alteração, ignore este email.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                SetlistGO™
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
                Plataforma de Ensaio Vocal e Gestão de Repertórios
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

## 🎨 Melhorias Aplicadas

### Design
- ✅ **Fundo claro** (#f5f5f5) com card branco
- ✅ **Texto preto** (#1a1a1a) com alto contraste
- ✅ **Logo moderna**: "Setlist" normal + "GO" verde bold + "™" pequeno
- ✅ **Botão verde** (#1DB954) com sombra e hover
- ✅ **Ícones com gradiente** circular verde
- ✅ **Bordas arredondadas** (24px) modernas
- ✅ **Sombras suaves** para profundidade
- ✅ **Alerts coloridos** (amarelo para avisos, vermelho para segurança)

### UX
- ✅ **Hierarquia visual clara**
- ✅ **Espaçamento generoso**
- ✅ **Responsive** (mobile-first)
- ✅ **Call-to-action destacado**
- ✅ **Link alternativo** para copiar/colar
- ✅ **Avisos de segurança** visíveis
- ✅ **Footer informativo**

### Compatibilidade
- ✅ Gmail, Outlook, Apple Mail
- ✅ Mobile e Desktop
- ✅ Modo escuro automático (respeitado)

---

## 📝 Como Aplicar

1. Acesse: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/auth/templates
2. Selecione cada template (Confirm signup, Magic Link, etc.)
3. Cole o HTML correspondente
4. Clique em **Save**
5. Teste criando uma conta nova

---

**Resultado**: Emails profissionais, bonitos e com excelente UX! 🎉
