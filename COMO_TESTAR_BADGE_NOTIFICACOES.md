# Como Testar o Badge de Notificações

## 🎯 Objetivo
Fazer o badge vermelho com contador de notificações aparecer no ícone de sino (Bell).

---

## 📋 Passo a Passo

### 1️⃣ Abrir o Console do Navegador
- **Safari iOS**: Conecte o iPhone ao Mac, abra Safari > Develop > [Seu iPhone] > [SetlistGO]
- **Chrome/Safari Desktop**: Pressione `F12` ou `Command+Option+I`
- **Firefox**: Pressione `F12` ou `Command+Option+K`

### 2️⃣ Fazer Login no App
- Acesse: https://setlist-mxzlfzu41-alexandre-dpaulas-projects.vercel.app
- Faça login com sua conta
- **Observe os logs no Console** que começam com `[useUnreadNotifications]`

Você deve ver algo como:
```
[useUnreadNotifications] Carregando notificações para church_id: abc123...
[useUnreadNotifications] Notificações não lidas: 0
```

### 3️⃣ Verificar Church ID no Supabase

1. Abra o **Supabase SQL Editor**
2. Execute este comando para pegar seu `church_id`:

```sql
SELECT
  u.id as user_id,
  u.email,
  u.church_id,
  c.name as church_name
FROM public.users_app u
LEFT JOIN public.churches c ON u.church_id = c.id
WHERE u.auth_user_id = auth.uid();
```

3. **Copie o `church_id`** que aparecer (vai ser um UUID tipo: `123e4567-e89b-12d3-a456-426614174000`)

### 4️⃣ Criar Notificações de Teste

1. No **Supabase SQL Editor**, execute este comando:
2. **IMPORTANTE**: Substitua `SEU_CHURCH_ID_AQUI` pelo UUID que você copiou

```sql
INSERT INTO public.notifications (church_id, title, message, type, read, metadata)
VALUES
  ('SEU_CHURCH_ID_AQUI', 'Bem-vindo ao Sistema de Notificações! 🎉', 'Esta é sua primeira notificação. O badge vermelho deve aparecer agora!', 'success', false, '{"test": true}'),
  ('SEU_CHURCH_ID_AQUI', 'Nova Música Adicionada', 'A música "Amazing Grace" foi adicionada ao repertório de domingo', 'info', false, '{"track_id": "123"}'),
  ('SEU_CHURCH_ID_AQUI', 'Ensaio Amanhã', 'Não esqueça do ensaio amanhã às 19h!', 'warning', false, '{"event_id": "456"}');
```

### 5️⃣ Verificar o Badge

1. Volte para o app
2. Atualize a página (F5 ou Command+R)
3. **O badge vermelho com "3" deve aparecer** no ícone do sino!

---

## 🔍 Diagnóstico de Problemas

### Problema: Badge não aparece

**Verifique o Console:**
```
[useUnreadNotifications] Sem church_id no perfil
```
→ Significa que o perfil não tem `church_id`. Execute o passo 3 acima.

```
[useUnreadNotifications] Notificações não lidas: 0
```
→ Significa que não há notificações no banco. Execute o passo 4 acima.

```
[useUnreadNotifications] Erro ao carregar: ...
```
→ Pode ser um problema de permissões RLS. Verifique se executou o `CRIAR_TABELA_NOTIFICACOES.sql` corretamente.

### Problema: "Tabela não existe"

Execute novamente o arquivo `CRIAR_TABELA_NOTIFICACOES.sql` no Supabase SQL Editor.

---

## 🧹 Limpar Notificações de Teste

Depois de testar, você pode deletar as notificações de teste:

```sql
DELETE FROM public.notifications
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
AND metadata->>'test' = 'true';
```

---

## ✅ Resultado Esperado

Após seguir todos os passos:

1. ✅ Badge vermelho aparece no ícone do sino
2. ✅ Badge mostra o número "3"
3. ✅ Console mostra: `[useUnreadNotifications] Notificações não lidas: 3`
4. ✅ Ao clicar no sino, você vê as 3 notificações
5. ✅ Ao abrir a página de notificações, o badge desaparece (marcadas como lidas)

---

## 📞 Precisa de Ajuda?

Se o badge ainda não aparecer depois de seguir todos os passos:

1. Tire um print do Console mostrando os logs `[useUnreadNotifications]`
2. Tire um print do resultado da query do passo 3 (mostrando seu church_id)
3. Tire um print mostrando o resultado da query de verificação:

```sql
SELECT COUNT(*) as unread_count
FROM public.notifications
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
AND read = false;
```
