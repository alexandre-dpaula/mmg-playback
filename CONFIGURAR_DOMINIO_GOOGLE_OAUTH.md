# Configurar Nome do App no Google OAuth

## Problema

A tela de login do Google mostra:
```
Prosseguir para: sffebcfgkthjcfnpgjvz.supabase.co
```

Queremos que mostre:
```
Prosseguir para: SetlistGO ou setlistgo.com
```

---

## Solução: Configurar OAuth Consent Screen

### 1. Acesse Google Cloud Console

**URL:** https://console.cloud.google.com/

---

### 2. Selecione o Projeto Correto

Certifique-se de estar no projeto que contém o OAuth Client ID usado pelo app.

---

### 3. Vá para OAuth Consent Screen

**Caminho:**
```
APIs & Services → OAuth consent screen
```

**URL Direta:**
```
https://console.cloud.google.com/apis/credentials/consent
```

---

### 4. Editar o Application Name

**Encontre os campos:**

#### App name (Nome do App)
**Altere para:**
```
SetlistGO
```

#### App domain (Domínio do App)
**Application home page:**
```
https://setlistgo.com
```

**Application privacy policy link:**
```
https://setlistgo.com/privacy
```
*(Se não tiver uma página de privacidade ainda, pode usar https://setlistgo.com)*

**Application terms of service link:**
```
https://setlistgo.com/terms
```
*(Se não tiver uma página de termos ainda, pode usar https://setlistgo.com)*

---

### 5. Authorized domains (Domínios Autorizados)

**Adicione:**
```
setlistgo.com
supabase.co
```

**Nota:** Mantemos `supabase.co` porque o callback do OAuth ainda passa pelo Supabase.

---

### 6. Salvar

Clique em **Save and Continue** ou **Save** no final da página.

---

## 🧪 Testar

1. Aguarde 5-10 minutos para as configurações propagarem
2. Limpe o cache do navegador
3. Acesse: https://setlistgo.com
4. Tente fazer login com Google
5. A tela de login agora deve mostrar: **"Fazer Login com o Google - SetlistGO"**

---

## 📸 Onde Encontrar

```
Google Cloud Console
  └── [Seu Projeto]
      └── APIs & Services
          └── OAuth consent screen
              ├── App information
              │   └── App name ← ALTERAR AQUI
              └── App domain
                  ├── Application home page ← ADICIONAR
                  ├── Application privacy policy link ← ADICIONAR
                  └── Application terms of service link ← ADICIONAR
```

---

## ⚠️ Importante

O texto "Prosseguir para sffebcfgkthjcfnpgjvz.supabase.co" **pode continuar aparecendo** em texto pequeno, pois o OAuth callback realmente passa pelo Supabase. O que muda é:

1. **Título principal:** Vai mostrar "SetlistGO" em vez do domínio
2. **Logo (se adicionar):** Pode adicionar o logo do app
3. **Nome do desenvolvedor:** Pode configurar também

---

## 🎨 Opcional: Adicionar Logo

Se quiser adicionar o logo do SetlistGO na tela de login:

1. No mesmo painel **OAuth consent screen**
2. Procure por **App logo**
3. Faça upload de uma imagem quadrada (120x120 pixels recomendado)
4. Formatos aceitos: PNG, JPG
5. Salvar

---

## 🔍 Checklist

- [ ] Acessei Google Cloud Console
- [ ] Selecionei o projeto correto
- [ ] Abri OAuth consent screen
- [ ] Alterei App name para "SetlistGO"
- [ ] Adicionei Application home page (setlistgo.com)
- [ ] Adicionei domínios autorizados
- [ ] Salvei as alterações
- [ ] Aguardei 5-10 minutos
- [ ] Limpei cache do navegador
- [ ] Testei login novamente

---

## 💡 Resultado Esperado

**Antes:**
```
Fazer Login com o Google
Prosseguir para
sffebcfgkthjcfnpgjvz.supabase.co
```

**Depois:**
```
SetlistGO
Fazer Login com o Google
Prosseguir para
setlistgo.com
```

---

## ❓ Se o texto do Supabase continuar aparecendo

Isso é **normal** e esperado, pois:
1. O OAuth callback tecnicamente passa pelo Supabase (é a arquitetura do Supabase Auth)
2. O Google mostra o domínio real do callback por segurança
3. O importante é que o **nome do app** e **logo** apareçam destacados

Se você realmente quer remover completamente a menção ao Supabase, seria necessário:
- Implementar um Custom Auth Provider (muito mais complexo)
- Ou usar um domínio customizado no Supabase (recurso enterprise)

Para a maioria dos apps, ter "SetlistGO" como título principal é suficiente! 👍
