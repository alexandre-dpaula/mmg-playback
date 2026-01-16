# 🔐 Checklist de Segurança - SetlistGO

## ✅ Implementações Atuais

### 1. **Row Level Security (RLS)**
- [x] RLS ativado em todas as tabelas sensíveis
- [x] Políticas baseadas em `church_id` para isolamento entre igrejas
- [x] Políticas baseadas em `auth.uid()` para dados pessoais
- [x] Verificação de role (líder) para operações administrativas

### 2. **Autenticação**
- [x] Autenticação via Supabase Auth (Google, Apple, Email/Password)
- [x] Tokens JWT gerenciados automaticamente
- [x] Session management com refresh tokens
- [x] Proteção de rotas com `ProtectedRoute` component

### 3. **Validação de Dados**
- [ ] **TODO:** Adicionar validação de input no frontend (Zod ou Yup)
- [ ] **TODO:** Adicionar sanitização de dados antes de salvar
- [ ] **TODO:** Validar tamanho de uploads (imagens, etc)

---

## 🚨 Vulnerabilidades Identificadas e Correções

### 1. **SQL Injection** ✅ PROTEGIDO
- ✅ Usando Supabase client (queries parametrizadas)
- ✅ Nunca concatenando strings SQL manualmente
- ✅ RLS aplicado em todas as queries

### 2. **XSS (Cross-Site Scripting)** ⚠️ ATENÇÃO
```typescript
// ❌ VULNERÁVEL (se estiver usando dangerouslySetInnerHTML)
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SEGURO (React escapa automaticamente)
<div>{userInput}</div>
```

**Ação:** Verificar se há uso de `dangerouslySetInnerHTML` no código.

### 3. **CSRF (Cross-Site Request Forgery)** ✅ PROTEGIDO
- ✅ Supabase Auth usa tokens Bearer no header
- ✅ SameSite cookies configurados automaticamente

### 4. **Exposição de Dados Sensíveis**
```typescript
// ❌ NÃO FAZER
console.log('User data:', user); // Em produção!

// ✅ FAZER
if (import.meta.env.DEV) {
  console.log('User data:', user);
}
```

**Ação:** Remover console.logs desnecessários em produção.

### 5. **Rate Limiting** ⚠️ IMPLEMENTAR
```sql
-- TODO: Adicionar no Supabase
-- Limitar tentativas de login, cadastro, etc.
```

---

## 📋 Recomendações de Segurança

### **1. Variáveis de Ambiente**
```env
# ✅ BOM: Variáveis públicas com prefixo VITE_
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# ❌ NUNCA expor keys privadas no frontend
SUPABASE_SERVICE_ROLE_KEY=... # APENAS backend!
```

### **2. HTTPS**
- [x] ✅ Vercel fornece HTTPS automaticamente
- [x] ✅ Supabase usa HTTPS por padrão

### **3. Content Security Policy (CSP)**
```typescript
// Adicionar no index.html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://*.supabase.co;
  "
/>
```

### **4. Upload de Arquivos**
```typescript
// ✅ Validar tipo e tamanho
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Tipo de arquivo não permitido');
}
if (file.size > MAX_FILE_SIZE) {
  throw new Error('Arquivo muito grande');
}
```

### **5. Sanitização de Dados**
```typescript
import DOMPurify from 'dompurify';

// Sanitizar input do usuário antes de exibir
const cleanHTML = DOMPurify.sanitize(userInput);
```

### **6. API Keys e Secrets**
- [x] ✅ Nunca commitar `.env` no git
- [x] ✅ Usar variáveis de ambiente no Vercel
- [ ] ⚠️ Rotacionar keys periodicamente

---

## 🔍 Auditoria de Segurança

### **Verificar Periodicamente:**

1. **Dependências Vulneráveis**
```bash
npm audit
npm audit fix
```

2. **Logs de Acesso**
- Monitorar tentativas de login suspeitas
- Verificar queries anormais no Supabase

3. **Backups**
- [ ] **TODO:** Configurar backups automáticos no Supabase
- [ ] **TODO:** Testar restauração de backups

4. **Monitoramento**
- [ ] **TODO:** Configurar alertas para erros críticos
- [ ] **TODO:** Monitorar uso de recursos (quota Supabase)

---

## 🎯 Próximos Passos de Segurança

### **Prioridade ALTA:**
1. ✅ Implementar RLS seguro (CONCLUÍDO)
2. [ ] Adicionar validação de input com Zod
3. [ ] Remover console.logs de produção
4. [ ] Implementar rate limiting

### **Prioridade MÉDIA:**
1. [ ] Adicionar Content Security Policy
2. [ ] Configurar backups automáticos
3. [ ] Implementar monitoramento de erros (Sentry)

### **Prioridade BAIXA:**
1. [ ] Penetration testing
2. [ ] Security headers adicionais
3. [ ] Documentação de segurança para equipe

---

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security Best Practices](https://react.dev/learn/keeping-components-pure)
