# Checklist: Testes de Autenticação e Isolamento

## ✅ Pré-requisitos

Antes de começar os testes, certifique-se de que:

- [ ] As políticas RLS foram aplicadas (via APLICAR_RLS_FINAL.sql)
- [ ] Os templates de email foram configurados no Supabase
- [ ] As Redirect URLs foram configuradas no Supabase
- [ ] A aplicação está rodando (`npm run dev`)

---

## 📝 Teste 1: Cadastro de Nova Igreja (Líder)

### Objetivo: Testar criação de nova igreja e cadastro de líder

1. [ ] Acesse a aplicação
2. [ ] Clique em "Cadastrar" ou acesse `/role-selection`
3. [ ] Selecione o papel "Líder"
4. [ ] Preencha os dados:
   - Email (use um email real para receber confirmação)
   - Senha
   - Nome da igreja
   - Nome completo
5. [ ] Clique em "Criar Conta"
6. [ ] **Verifique:** Mensagem de sucesso aparece
7. [ ] **Verifique:** Email de confirmação foi recebido (verifique spam)
8. [ ] Clique no link do email de confirmação
9. [ ] **Verifique:** Redirecionado para a aplicação logado
10. [ ] **Verifique:** Perfil do usuário mostra:
    - Role: "lider"
    - Nome da igreja correto
    - Nome completo correto

**Resultado Esperado:** ✅ Líder criado com sucesso, igreja criada, email confirmado

---

## 📝 Teste 2: Convite de Membro (Vocal/Instrumental)

### Objetivo: Testar fluxo de convite por líder

1. [ ] Com o líder logado (do Teste 1)
2. [ ] Acesse a página de Membros/Convites
3. [ ] Envie um convite para outro email (use email real)
4. [ ] Preencha:
   - Email do convidado
   - Role (Vocal ou Instrumental)
   - Nome completo (opcional)
5. [ ] Clique em "Enviar Convite"
6. [ ] **Verifique:** Mensagem de sucesso
7. [ ] **Verifique:** Convite aparece na lista como "pendente"

### Como convidado:

8. [ ] Abra o email de convite
9. [ ] Clique no link de aceitar
10. [ ] **Verifique:** Redirecionado para página de cadastro pré-preenchida
11. [ ] Defina uma senha
12. [ ] Complete o cadastro
13. [ ] **Verifique:** Logado automaticamente
14. [ ] **Verifique:** Perfil mostra:
    - Role correto (vocal/instrumental)
    - Mesma igreja do líder
    - Status "approved"

**Resultado Esperado:** ✅ Membro convidado, cadastrado e vinculado à igreja

---

## 📝 Teste 3: Isolamento de Dados (RLS)

### Objetivo: Verificar se cada igreja vê apenas seus próprios dados

**Preparação:** Você precisa de 2 igrejas diferentes (repita Teste 1 com outro email)

### Igreja A (Líder A):

1. [ ] Login como Líder A
2. [ ] Crie 2-3 tracks (músicas)
3. [ ] Crie 1 evento
4. [ ] Anote os nomes das tracks e evento

### Igreja B (Líder B):

5. [ ] Logout
6. [ ] Login como Líder B
7. [ ] **Verifique:** NÃO vê nenhuma track da Igreja A
8. [ ] **Verifique:** NÃO vê eventos da Igreja A
9. [ ] Crie 1-2 tracks diferentes
10. [ ] Crie 1 evento diferente

### Volta para Igreja A:

11. [ ] Logout
12. [ ] Login como Líder A novamente
13. [ ] **Verifique:** Vê APENAS as tracks da Igreja A
14. [ ] **Verifique:** NÃO vê as tracks da Igreja B
15. [ ] **Verifique:** Vê APENAS eventos da Igreja A

**Resultado Esperado:** ✅ Isolamento completo - cada igreja vê apenas seus dados

---

## 📝 Teste 4: Permissões por Role

### Objetivo: Testar se as permissões estão funcionando

### Como Vocal/Instrumental:

1. [ ] Login como membro vocal ou instrumental
2. [ ] Tente criar uma track
3. [ ] **Verifique:** Consegue criar ✅
4. [ ] Tente editar uma track
5. [ ] **Verifique:** Consegue editar ✅
6. [ ] Tente deletar uma track
7. [ ] **Verifique:** NÃO consegue deletar ❌ (botão desabilitado ou erro)

### Como Líder:

8. [ ] Logout e login como líder
9. [ ] Tente deletar uma track
10. [ ] **Verifique:** Consegue deletar ✅

**Resultado Esperado:** ✅ Permissões corretas por role

---

## 📝 Teste 5: Recuperação de Senha

### Objetivo: Testar fluxo de reset de senha

1. [ ] Acesse a tela de login
2. [ ] Clique em "Esqueci minha senha"
3. [ ] Digite o email de um usuário existente
4. [ ] Clique em "Enviar"
5. [ ] **Verifique:** Email de recuperação recebido
6. [ ] Clique no link do email
7. [ ] **Verifique:** Redirecionado para página de reset
8. [ ] Digite nova senha (2x)
9. [ ] Clique em "Redefinir Senha"
10. [ ] **Verifique:** Senha atualizada com sucesso
11. [ ] Faça login com a nova senha
12. [ ] **Verifique:** Login bem-sucedido ✅

**Resultado Esperado:** ✅ Senha redefinida e login funciona

---

## 📝 Teste 6: Membros da Mesma Igreja

### Objetivo: Verificar que membros veem outros membros da mesma igreja

1. [ ] Login como Líder A
2. [ ] Acesse lista de membros
3. [ ] **Verifique:** Vê todos os membros da Igreja A (incluindo ele mesmo)
4. [ ] **Verifique:** NÃO vê membros de outras igrejas

5. [ ] Login como Membro (vocal/instrumental) da Igreja A
6. [ ] Acesse lista de membros
7. [ ] **Verifique:** Vê todos os membros da Igreja A
8. [ ] **Verifique:** NÃO vê membros de outras igrejas

**Resultado Esperado:** ✅ Membros da mesma igreja se veem, outras igrejas isoladas

---

## 📝 Teste 7: Persistência de Sessão

### Objetivo: Verificar que a sessão permanece após refresh

1. [ ] Faça login
2. [ ] Navegue para uma página interna
3. [ ] Pressione F5 (refresh)
4. [ ] **Verifique:** Continua logado ✅
5. [ ] **Verifique:** Dados do usuário carregam corretamente
6. [ ] Feche a aba
7. [ ] Abra nova aba com a aplicação
8. [ ] **Verifique:** Ainda está logado ✅

**Resultado Esperado:** ✅ Sessão persiste entre refreshes e tabs

---

## 📝 Teste 8: Logout

### Objetivo: Verificar que logout funciona corretamente

1. [ ] Clique em Logout
2. [ ] **Verifique:** Redirecionado para login
3. [ ] Tente acessar uma página protegida diretamente (ex: /tracks)
4. [ ] **Verifique:** Redirecionado para login ❌
5. [ ] Pressione "Voltar" no navegador
6. [ ] **Verifique:** Não consegue acessar página protegida

**Resultado Esperado:** ✅ Logout limpa sessão completamente

---

## 🐛 Problemas Comuns e Soluções

### Email não chega
- Verifique pasta de spam
- Verifique logs no Supabase Dashboard → Logs
- Use email real (Gmail, Outlook, etc.)

### "Invalid redirect URL"
- Adicione a URL em Supabase → Authentication → URL Configuration → Redirect URLs

### Não consegue criar igreja/membro
- Verifique logs do console (F12)
- Verifique se RLS foi aplicado corretamente
- Verifique se os tipos de dados estão corretos (UUID vs TEXT)

### Vê dados de outra igreja
- ⚠️ PROBLEMA CRÍTICO DE SEGURANÇA
- Verifique se aplicou o APLICAR_RLS_FINAL.sql corretamente
- Verifique os logs SQL para ver qual política está sendo aplicada

---

## ✅ Checklist Final

Após todos os testes, verifique:

- [ ] Cadastro funciona (líder e membros)
- [ ] Convites funcionam
- [ ] Emails chegam e links funcionam
- [ ] Isolamento por igreja está perfeito (RLS)
- [ ] Permissões por role funcionam
- [ ] Recuperação de senha funciona
- [ ] Sessão persiste corretamente
- [ ] Logout funciona

**Se todos os testes passaram: 🎉 SISTEMA PRONTO PARA PRODUÇÃO!**
