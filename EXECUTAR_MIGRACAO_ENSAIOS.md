# 🎓 EXECUTAR MIGRAÇÃO - MODO ENSAIO

## ⚠️ IMPORTANTE

Este arquivo contém as instruções para criar as tabelas do **Modo Ensaio / Estudos** no banco de dados Supabase.

---

## 📋 PASSO A PASSO

### **PASSO 1: Abrir Supabase SQL Editor** ⏱️ 1 min

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **MMGPlayback**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**

---

### **PASSO 2: Executar Migration** ⏱️ 2 min

1. Abra o arquivo: `supabase/migrations/20260103_create_study_mode_tables.sql`
2. **COPIE TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)

**✅ Sucesso se aparecer:**
```
Success: Command complete
```

Você verá mensagens como:
- `CREATE TABLE`
- `CREATE INDEX`
- `CREATE POLICY`
- `INSERT`
- `COMMENT ON TABLE`

---

### **PASSO 3: Verificar Criação das Tabelas** ⏱️ 1 min

Execute este SQL para verificar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('chord_shapes', 'song_chords', 'chord_relations');
```

**✅ Deve retornar:**
```
table_name
-----------------
chord_shapes
song_chords
chord_relations
```

---

### **PASSO 4: Verificar RLS Policies** ⏱️ 1 min

Execute este SQL:

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chord_shapes', 'song_chords', 'chord_relations')
ORDER BY tablename;
```

**✅ Deve retornar 12 policies:**
- 4 para `chord_shapes` (select, insert, update, delete)
- 4 para `song_chords` (select, insert, update, delete)
- 4 para `chord_relations` (select, insert, update, delete)

---

### **PASSO 5: Verificar Seed Data** ⏱️ 1 min

Execute este SQL:

```sql
-- Verificar shapes de violão
SELECT chord_name, variation_name
FROM chord_shapes
WHERE instrument = 'guitar'
ORDER BY chord_name;
```

**✅ Deve retornar pelo menos:**
```
chord_name | variation_name
-----------|------------------
C          | Posição Aberta
D          | Posição Aberta
F          | Barre 1ª Casa
G          | Posição Aberta
Am         | Posição Aberta
```

```sql
-- Verificar relações harmônicas
SELECT chord_from, chord_to, relation_type
FROM chord_relations
ORDER BY chord_from;
```

**✅ Deve retornar pelo menos:**
```
chord_from | chord_to | relation_type
-----------|----------|---------------
Am         | C        | relative
C          | Am       | relative
C          | C/E      | altered_bass
F          | Dm       | substitute
G          | G7       | dominant
```

---

## 🎯 RESULTADO ESPERADO

Após executar a migration, você terá:

- ✅ 3 novas tabelas criadas
- ✅ 12 políticas RLS ativas
- ✅ 5 shapes básicos de violão
- ✅ 5 relações harmônicas básicas
- ✅ Isolamento por `church_id` funcionando

---

## 🚨 POSSÍVEIS ERROS

### Erro: "relation already exists"
**Causa:** Tabelas já foram criadas anteriormente.
**Solução:**
1. Não é um problema! As tabelas já existem.
2. Se quiser recriar, execute antes:
```sql
DROP TABLE IF EXISTS chord_shapes CASCADE;
DROP TABLE IF EXISTS song_chords CASCADE;
DROP TABLE IF EXISTS chord_relations CASCADE;
```

### Erro: "permission denied"
**Causa:** Você não tem permissões de admin no Supabase.
**Solução:** Use o acesso de owner do projeto ou peça ao administrador.

### Erro: "foreign key constraint"
**Causa:** Tabela `churches` ou `tracks` não existe.
**Solução:** Certifique-se de que o schema principal do SetlistGO está completo.

---

## ✅ PRÓXIMOS PASSOS

Após executar a migration com sucesso:

1. **Testar no app:**
   - Faça login
   - Abra uma música
   - Clique no botão 🎓 **Ensaio**
   - Veja se os acordes aparecem

2. **Adicionar acordes às músicas (opcional):**
   ```sql
   -- Exemplo: adicionar acordes para uma música
   INSERT INTO song_chords (song_id, chord_name, position, church_id)
   VALUES
     ('UUID_DA_MUSICA', 'C', 1, 'UUID_DA_IGREJA'),
     ('UUID_DA_MUSICA', 'G', 2, 'UUID_DA_IGREJA'),
     ('UUID_DA_MUSICA', 'Am', 3, 'UUID_DA_IGREJA'),
     ('UUID_DA_MUSICA', 'F', 4, 'UUID_DA_IGREJA');
   ```

3. **Adicionar mais shapes (opcional):**
   ```sql
   -- Exemplo: adicionar shape de C maior barre
   INSERT INTO chord_shapes (
     chord_name,
     instrument,
     variation_name,
     shape_data,
     church_id
   )
   VALUES (
     'C',
     'guitar',
     'Barre 3ª Casa',
     '{"frets": [3, 5, 5, 5, 3, 3], "base_fret": 3, "fingers": [1, 3, 4, 3, 1, 1]}'::jsonb,
     NULL -- NULL = global, ou UUID da igreja
   );
   ```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Veja o arquivo: **MODO_ENSAIO_README.md** para:
- Estrutura completa de arquivos
- Explicação dos componentes
- Schema detalhado das tabelas
- Funcionalidades futuras
- Troubleshooting

---

**Última atualização:** 2026-01-03
