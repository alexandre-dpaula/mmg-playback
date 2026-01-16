# 🇧🇷 Guia Visual: Configurar Google OAuth em Português

## 📍 Passo a Passo

### 1. Acesse o Google Cloud Console

**URL:** https://console.cloud.google.com/

---

### 2. Menu Lateral → APIs e Serviços

1. Clique no **menu hambúrguer** (☰) no canto superior esquerdo
2. Procure por: **"APIs e serviços"** ou **"APIs & Services"**
3. Clique em: **"Tela de consentimento OAuth"** ou **"OAuth consent screen"**

**URL Direta:**
```
https://console.cloud.google.com/apis/credentials/consent
```

---

### 3. Campos em Português vs Inglês

A interface pode estar em **inglês** ou **português**. Veja a correspondência:

| Em Português | Em Inglês |
|--------------|-----------|
| **Nome do app** | **App name** |
| **E-mail de suporte do usuário** | **User support email** |
| **Página inicial do aplicativo** | **Application home page** |
| **Link da política de privacidade do app** | **Application privacy policy link** |
| **Link dos termos de serviço do app** | **Application terms of service link** |
| **Domínios autorizados** | **Authorized domains** |

---

## 🎯 O Que Preencher

### Seção 1: Informações do app

#### Nome do app
```
SetlistGO
```

#### E-mail de suporte do usuário
```
seu-email@gmail.com
```
*(Use o email que você usa no Google Cloud)*

---

### Seção 2: Domínio do app (App domain)

**⚠️ ATENÇÃO:** Esta seção pode estar **OCULTA** ou **COLAPSADA**!

Procure por um dos seguintes textos:
- **"Domínio do app"**
- **"App domain"**
- **"Links do app"**
- Uma seção que você pode expandir clicando

#### Se você não vê esta seção:

1. **Role a página para baixo**
2. Procure por **setas/ícones para expandir** (▼ ou ⌄)
3. Pode estar com o título: **"Informações do domínio do app"** ou similar

---

#### Quando encontrar, preencha:

**Página inicial do aplicativo** (Application home page):
```
https://setlistgo.com
```

**Link da política de privacidade do app**:
```
https://setlistgo.com/privacy
```
*(Se não tiver esta página, use apenas https://setlistgo.com)*

**Link dos termos de serviço do app**:
```
https://setlistgo.com/terms
```
*(Se não tiver esta página, use apenas https://setlistgo.com)*

---

### Seção 3: Domínios autorizados (Authorized domains)

**⚠️ Esta seção também pode estar oculta!**

Procure por:
- **"Domínios autorizados"**
- **"Authorized domains"**
- Um campo onde você pode adicionar domínios

#### Adicione (sem https://):
```
setlistgo.com
```

**Nota:** Digite **apenas** `setlistgo.com` (sem `https://` e sem `www.`)

---

## 🔍 Onde Encontrar "Domínios Autorizados"

Se você não consegue encontrar, tente:

1. **Na página de OAuth consent screen:**
   - Role até o final da página
   - Procure por uma seção chamada "Domínios" ou "Domains"

2. **Ou pode estar em "Configurações adicionais":**
   - Procure por texto tipo: "Mostrar configurações avançadas" ou "Show advanced"
   - Clique para expandir

3. **Alternativa:**
   - Às vezes o campo só aparece depois que você salva o nome do app
   - Tente salvar primeiro e depois editar novamente

---

## 💾 Salvar

No final da página, clique em:
- **"Salvar"** ou **"Save"**
- Ou **"Salvar e continuar"** / **"Save and Continue"**

---

## 📸 Referência Visual

A estrutura da página deve ser mais ou menos assim:

```
┌─────────────────────────────────────────┐
│ Tela de consentimento OAuth             │
├─────────────────────────────────────────┤
│                                         │
│ Informações do app                      │
│ ┌─────────────────────────────────┐    │
│ │ Nome do app: SetlistGO          │    │
│ │ E-mail: seu@email.com           │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Domínio do app ▼ (clique para abrir)   │
│ ┌─────────────────────────────────┐    │
│ │ Página inicial do aplicativo:   │    │
│ │ https://setlistgo.com           │    │
│ │                                 │    │
│ │ Política de privacidade:        │    │
│ │ https://setlistgo.com/privacy   │    │
│ │                                 │    │
│ │ Termos de serviço:              │    │
│ │ https://setlistgo.com/terms     │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Domínios autorizados ▼                  │
│ ┌─────────────────────────────────┐    │
│ │ setlistgo.com                   │    │
│ │ + Adicionar domínio             │    │
│ └─────────────────────────────────┘    │
│                                         │
│         [Salvar]   [Cancelar]          │
└─────────────────────────────────────────┘
```

---

## ❓ Não Encontrou os Campos?

### Opção 1: Campos Obrigatórios vs Opcionais

Alguns campos podem ser **opcionais**. O mais importante é:
- ✅ **Nome do app** (obrigatório)
- ⚠️ **Domínio do app** (pode ser opcional, mas melhora a aparência)
- ⚠️ **Domínios autorizados** (pode ser opcional)

Se você **não encontrar** "Domínio do app" ou "Domínios autorizados":
- Não se preocupe! Configure apenas o **Nome do app**
- O texto "supabase.co" pode continuar aparecendo, mas pelo menos o nome "SetlistGO" vai aparecer

### Opção 2: Verificar Status da Tela de Consentimento

Se a tela estiver em modo **"Teste"** ou **"Testing"**:
1. Procure no topo da página por **"Status da publicação"**
2. Alguns campos avançados só aparecem no modo **"Em produção"** / **"Production"**

---

## ✅ Checklist Mínimo

Para melhorar a aparência do login, você precisa **no mínimo**:

- [ ] Nome do app: **SetlistGO** ✅ (obrigatório)
- [ ] E-mail de suporte: **seu@email.com** ✅ (obrigatório)
- [ ] Página inicial: **https://setlistgo.com** ⚠️ (recomendado)
- [ ] Domínios autorizados: **setlistgo.com** ⚠️ (recomendado)

Se você conseguir configurar pelo menos os 2 primeiros, já vai melhorar bastante!

---

## 🎯 Resultado Final

**Antes:**
```
Fazer Login com o Google
Prosseguir para
sffebcfgkthjcfnpgjvz.supabase.co
```

**Depois (mínimo):**
```
SetlistGO
Fazer Login com o Google
Prosseguir para
sffebcfgkthjcfnpgjvz.supabase.co
```

**Depois (ideal):**
```
SetlistGO
Fazer Login com o Google
Prosseguir para
setlistgo.com
```

---

## 💡 Dica Final

Se você **realmente não encontrar** os campos de domínio:
1. Configure apenas o **Nome do app** para "SetlistGO"
2. Salve
3. O login já vai ficar melhor!
4. Você pode voltar depois para adicionar os outros campos

O mais importante é ter o nome correto! 🎉
