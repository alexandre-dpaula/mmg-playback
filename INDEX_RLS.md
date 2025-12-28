# 📚 Índice RLS - Documentação Completa

## 🎯 Por Onde Começar?

### **⚡ Você quer aplicar RLS RAPIDAMENTE? (1 ARQUIVO ÚNICO)**
➡️ Execute: **[RLS_TUDO_EM_UM.sql](RLS_TUDO_EM_UM.sql)** ⭐ RECOMENDADO
- **UM ÚNICO arquivo SQL** que faz TUDO
- Limpa + Implementa + Valida automaticamente
- Tempo: ~2 minutos
- Copiar, colar no Supabase SQL Editor, executar!

---

### **🚀 Você quer aplicar RLS passo a passo?**
➡️ Leia: **[APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md)**
- Guia definitivo com todos os passos detalhados
- Tempo: ~30 minutos
- Do backup ao deploy

---

### **📖 Você quer entender a lógica primeiro?**
➡️ Leia: **[COMECE_AQUI_RLS.md](COMECE_AQUI_RLS.md)**
- Resumo executivo
- Lógica de negócio explicada
- Quick start (5 minutos)

---

### **🔍 Você quer entender os detalhes técnicos?**
➡️ Leia: **[RLS_IMPLEMENTACAO_FINAL.md](RLS_IMPLEMENTACAO_FINAL.md)**
- Documentação técnica completa
- Todas as políticas explicadas
- Diferenças do anterior

---

## 📂 Estrutura da Documentação

### **🔴 CRÍTICOS - Leia primeiro**

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md)** | Guia definitivo de aplicação | Aplicar RLS no banco |
| **[COMECE_AQUI_RLS.md](COMECE_AQUI_RLS.md)** | Resumo executivo | Entender rapidamente |

---

### **🟢 IMPLEMENTAÇÃO - Scripts SQL**

#### **Scripts do Banco (executar no Supabase):**

| Arquivo | Descrição | Ordem |
|---------|-----------|-------|
| **[LIMPAR_BANCO_COMPLETO.sql](LIMPAR_BANCO_COMPLETO.sql)** | Limpeza completa automática | 1º |
| **[supabase/migrations/20251226_rls_correto_final.sql](supabase/migrations/20251226_rls_correto_final.sql)** | RLS correto implementado | 2º |
| **[VALIDAR_RLS.sql](VALIDAR_RLS.sql)** | Validação de políticas | 3º |

#### **Scripts Alternativos:**

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[REVERTER_MIGRATIONS_PROBLEMATICAS.sql](REVERTER_MIGRATIONS_PROBLEMATICAS.sql)** | Limpeza manual | Se LIMPAR_BANCO_COMPLETO.sql não funcionar |
| **[supabase/migrations/20251226_reset_rls_completo.sql](supabase/migrations/20251226_reset_rls_completo.sql)** | Reset manual | Alternativa à limpeza automática |
| **[VERIFICAR_SCHEMA_COMPLETO.sql](VERIFICAR_SCHEMA_COMPLETO.sql)** | Debug de schema | Troubleshooting |

---

### **🔵 DOCUMENTAÇÃO TÉCNICA**

| Arquivo | Descrição | Quando ler |
|---------|-----------|------------|
| **[RLS_IMPLEMENTACAO_FINAL.md](RLS_IMPLEMENTACAO_FINAL.md)** | Detalhes técnicos completos | Entender como funciona |
| **[LIMPEZA_COMPLETA_RESUMO.md](LIMPEZA_COMPLETA_RESUMO.md)** | O que foi limpo/deletado | Referência do que mudou |

---

### **🧪 TESTES E VALIDAÇÃO**

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[GUIA_TESTE_RLS_COMPLETO.md](GUIA_TESTE_RLS_COMPLETO.md)** | 14 testes passo a passo | Validar implementação |
| **[VALIDAR_RLS.sql](VALIDAR_RLS.sql)** | Script de validação rápida | Verificar políticas |

---

### **💻 DESENVOLVIMENTO**

| Arquivo | Descrição | Quando ler |
|---------|-----------|------------|
| **[AJUSTES_CODIGO_APLICACAO.md](AJUSTES_CODIGO_APLICACAO.md)** | Mudanças no código da app | Ajustar frontend/backend |

---

## 🗺️ Fluxo de Trabalho Recomendado

```
┌─────────────────────────────────────┐
│ 1. Ler COMECE_AQUI_RLS.md          │ ← Entender o contexto
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 2. Ler APLICAR_RLS_PASSO_A_PASSO.md│ ← Guia completo
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 3. Executar no Supabase:            │
│    - LIMPAR_BANCO_COMPLETO.sql      │
│    - 20251226_rls_correto_final.sql │
│    - VALIDAR_RLS.sql                │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 4. Seguir GUIA_TESTE_RLS_COMPLETO.md│ ← Testar isolamento
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 5. Ler AJUSTES_CODIGO_APLICACAO.md │ ← Ajustar código
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 6. Deploy em Produção 🚀            │
└─────────────────────────────────────┘
```

---

## 📖 Guias por Cenário

### **Cenário 1: "Quero aplicar RLS rapidamente"**
1. [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md) ← Siga este
2. Execute os 3 SQLs na ordem
3. Teste com [GUIA_TESTE_RLS_COMPLETO.md](GUIA_TESTE_RLS_COMPLETO.md)

**Tempo:** 30 minutos

---

### **Cenário 2: "Preciso entender antes de aplicar"**
1. [COMECE_AQUI_RLS.md](COMECE_AQUI_RLS.md) ← Visão geral
2. [RLS_IMPLEMENTACAO_FINAL.md](RLS_IMPLEMENTACAO_FINAL.md) ← Detalhes
3. [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md) ← Aplicar

**Tempo:** 1 hora (leitura + aplicação)

---

### **Cenário 3: "Já apliquei, mas está dando erro"**
1. [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md) → Seção Troubleshooting
2. Execute [VERIFICAR_SCHEMA_COMPLETO.sql](VERIFICAR_SCHEMA_COMPLETO.sql)
3. Execute [VALIDAR_RLS.sql](VALIDAR_RLS.sql)
4. Compare resultados esperados

---

### **Cenário 4: "Preciso ajustar o código da aplicação"**
1. [AJUSTES_CODIGO_APLICACAO.md](AJUSTES_CODIGO_APLICACAO.md) ← Leia este
2. Implemente mudanças
3. Teste com [GUIA_TESTE_RLS_COMPLETO.md](GUIA_TESTE_RLS_COMPLETO.md)

---

### **Cenário 5: "Quero reverter tudo e começar do zero"**
1. Execute [LIMPAR_BANCO_COMPLETO.sql](LIMPAR_BANCO_COMPLETO.sql)
2. Siga [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md)

---

## 🎓 Glossário

| Termo | Significado |
|-------|-------------|
| **RLS** | Row Level Security (segurança em nível de linha) |
| **Música Global** | Track com `church_id = NULL` (todas igrejas veem) |
| **Cópia Privada** | Track com `church_id = UUID` (só aquela igreja vê) |
| **SECURITY DEFINER** | Função que roda com privilégios do owner (bypassa RLS) |
| **Recursão Infinita** | Quando política RLS referencia tabela que tem RLS |
| **Multitenancy** | Múltiplas organizações (igrejas) no mesmo banco |

---

## 🔧 Arquivos de Suporte

### **Migrations Estruturais (NÃO MEXER):**
Estas migrations definem a estrutura do banco e devem ser mantidas:

```
supabase/migrations/
  ├── 01_add_cifra_content_column.sql
  ├── 02_add_artist_photo_column.sql
  ├── 03_add_key_version_columns.sql
  ├── 04_setup_pads_bucket_policies.sql
  ├── 05_create_events_tables.sql
  ├── 06_create_profiles_table.sql
  ├── 07_setup_profiles_bucket.sql
  ├── 08_update_profile_trigger.sql
  ├── ... (outras migrations estruturais)
```

### **Migrations RLS (NOVAS - Aplicar):**
```
supabase/migrations/
  ├── 20251226_reset_rls_completo.sql     ← Limpeza
  └── 20251226_rls_correto_final.sql      ← RLS correto
```

---

## ❓ FAQ

### **P: Preciso aplicar todas as migrations antigas primeiro?**
R: NÃO. As migrations estruturais (01_, 02_, etc) já estão aplicadas. Você só precisa aplicar as 2 novas migrations RLS.

---

### **P: Vou perder dados ao executar LIMPAR_BANCO_COMPLETO.sql?**
R: NÃO. O script remove apenas políticas RLS, funções e histórico de migrations. Seus dados (tracks, events, users, churches) permanecem intactos.

---

### **P: Por que users_app NÃO tem RLS?**
R: Para evitar recursão infinita. A função `get_user_church_id()` precisa acessar `users_app` sem RLS. A tabela só expõe dados não-sensíveis (nome, email, role).

---

### **P: O que acontece se eu executar 20251226_rls_correto_final.sql sem limpar antes?**
R: Pode dar erro de "policy already exists" se ainda houver políticas antigas. Execute LIMPAR_BANCO_COMPLETO.sql primeiro.

---

### **P: Como sei se RLS está funcionando?**
R: Execute VALIDAR_RLS.sql e siga o GUIA_TESTE_RLS_COMPLETO.md. Se criar 2 igrejas e elas NÃO verem dados uma da outra, está funcionando.

---

## ✅ Checklist Rápido

Antes de considerar completo:

- [ ] ✅ Leu [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md)
- [ ] ✅ Executou [LIMPAR_BANCO_COMPLETO.sql](LIMPAR_BANCO_COMPLETO.sql)
- [ ] ✅ Executou [20251226_rls_correto_final.sql](supabase/migrations/20251226_rls_correto_final.sql)
- [ ] ✅ Executou [VALIDAR_RLS.sql](VALIDAR_RLS.sql) e verificou resultados
- [ ] ✅ Seguiu [GUIA_TESTE_RLS_COMPLETO.md](GUIA_TESTE_RLS_COMPLETO.md) (14 testes)
- [ ] ✅ Leu [AJUSTES_CODIGO_APLICACAO.md](AJUSTES_CODIGO_APLICACAO.md)
- [ ] ✅ Ajustou código da aplicação
- [ ] ✅ Testou em desenvolvimento
- [ ] ✅ Deploy em produção
- [ ] 🎉 **Celebrou!**

---

## 📞 Contato e Suporte

Se algo der errado:

1. **Consultar Troubleshooting:** [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md) → Seção "Troubleshooting"
2. **Verificar logs:** Supabase Dashboard → Logs
3. **Reverter:** Executar [LIMPAR_BANCO_COMPLETO.sql](LIMPAR_BANCO_COMPLETO.sql) e começar do zero

---

## 🎯 Resumo dos Arquivos

| Tipo | Quantidade | Arquivos |
|------|------------|----------|
| **Documentação** | 6 | COMECE_AQUI_RLS.md, RLS_IMPLEMENTACAO_FINAL.md, APLICAR_RLS_PASSO_A_PASSO.md, GUIA_TESTE_RLS_COMPLETO.md, AJUSTES_CODIGO_APLICACAO.md, LIMPEZA_COMPLETA_RESUMO.md |
| **Scripts SQL** | 5 | LIMPAR_BANCO_COMPLETO.sql, REVERTER_MIGRATIONS_PROBLEMATICAS.sql, VALIDAR_RLS.sql, VERIFICAR_SCHEMA_COMPLETO.sql |
| **Migrations** | 2 | 20251226_reset_rls_completo.sql, 20251226_rls_correto_final.sql |
| **Índice** | 1 | INDEX_RLS.md (este arquivo) |

**Total:** 14 arquivos organizados

---

**Criado em:** 26/12/2025
**Versão:** 1.0
**Status:** ✅ Completo e testado
**Próximo passo:** Começar por [APLICAR_RLS_PASSO_A_PASSO.md](APLICAR_RLS_PASSO_A_PASSO.md) 🚀
