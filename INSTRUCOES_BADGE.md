# 🎯 Como Ver o Badge de Notificações

## Problema Identificado

A página de notificações marca **automaticamente** todas as notificações como lidas quando você abre. Por isso o badge some!

---

## ✅ Solução Rápida (3 passos)

### 1️⃣ Execute este SQL no Supabase

Abra o **SQL Editor** do Supabase e execute:

```sql
UPDATE public.notifications
SET read = false
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
);
```

### 2️⃣ Abra o App

Acesse: https://setlist-mxzlfzu41-alexandre-dpaulas-projects.vercel.app

### 3️⃣ Veja o Badge!

**O badge vermelho deve aparecer** no ícone do sino com o número de notificações!

---

## ⚠️ IMPORTANTE

**NÃO ABRA a página de notificações** ainda, pois ela vai marcar tudo como lido novamente.

Se quiser testar o badge múltiplas vezes:
1. Veja o badge na tela inicial
2. Execute o SQL acima novamente
3. Atualize a página (F5)
4. O badge aparece novamente

---

## 🔍 Como Verificar no Console

1. Abra o Console do navegador (F12)
2. Faça login
3. Procure por logs `[useUnreadNotifications]`

Você deve ver:
```
[useUnreadNotifications] Carregando notificações para church_id: abc123...
[useUnreadNotifications] Notificações não lidas: 5
```

Se aparecer `Notificações não lidas: 0`, execute o SQL do passo 1 novamente.

---

## 📸 Onde o Badge Aparece

O badge vermelho aparece em **2 lugares**:

1. **Sidebar Desktop**: No ícone do sino (Bell)
2. **Menu Mobile**: No botão "Notificações"

---

## 🐛 Se Não Funcionar

Execute o diagnóstico completo:

```sql
-- Ver seu church_id
SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid();

-- Ver suas notificações
SELECT id, title, read, church_id
FROM public.notifications
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
);

-- Contar não lidas
SELECT COUNT(*) FROM public.notifications
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
AND read = false;
```

E me envie o resultado!
