# 🎵 Instruções para Adicionar Suporte a Acordes

## ❗ AÇÃO NECESSÁRIA

Para o **Modo Ensaio / Sistema CAGED** funcionar corretamente, você precisa aplicar uma migration no Supabase que adiciona a coluna `acordes` à tabela `tracks`.

---

## 📋 Passos para Aplicar a Migration

### 1️⃣ Acesse o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **MMG - Ensaio Vocal**
3. No menu lateral, clique em **SQL Editor**

### 2️⃣ Execute o SQL

Copie e cole o SQL abaixo no editor e clique em **Run**:

```sql
-- ============================================
-- Adiciona coluna 'acordes' à tabela tracks
-- Para suportar o Modo Ensaio / Sistema CAGED
-- ============================================

-- Adiciona coluna acordes se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tracks'
    AND column_name = 'acordes'
  ) THEN
    ALTER TABLE public.tracks
    ADD COLUMN acordes TEXT;
  END IF;
END $$;

-- Comentário explicativo
COMMENT ON COLUMN public.tracks.acordes IS 'Acordes da música (formato: "C, G, Am, F" ou JSON array)';
```

### 3️⃣ Verifique se Funcionou

Após executar, rode este comando para verificar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tracks'
AND column_name = 'acordes';
```

Se retornar uma linha, está funcionando! ✅

---

## 🎸 Como Adicionar Acordes às Músicas

### Opção 1: Manualmente via Supabase

1. Vá em **Table Editor** → **tracks**
2. Clique em uma música
3. No campo `acordes`, adicione os acordes separados por vírgula:
   ```
   C, G, Am, F
   ```

### Opção 2: Via SQL (em massa)

```sql
-- Exemplo: adicionar acordes para uma música específica
UPDATE tracks
SET acordes = 'C, G, Am, F'
WHERE titulo = 'Nome da Música';

-- Adicionar acordes para várias músicas
UPDATE tracks
SET acordes = 'G, D, Em, C'
WHERE titulo IN ('Música 1', 'Música 2');
```

---

## 📝 Formato Suportado

A coluna `acordes` aceita dois formatos:

### Formato 1: String com vírgulas
```
C, G, Am, F, Dm7, G/B
```

### Formato 2: JSON Array
```json
["C", "G", "Am", "F", "Dm7", "G/B"]
```

Ambos funcionam! O sistema detecta automaticamente.

---

## 🔄 Futuro: Extração Automática

Em breve, será implementado um sistema que extrai acordes automaticamente da `cifra_content`, mas por enquanto, você precisa preencher manualmente.

**Por enquanto, o sistema já extrai acordes da `cifra_content` como fallback!** 🎉

---

## ✅ Checklist

- [ ] Executei o SQL no Supabase Dashboard
- [ ] Verifiquei que a coluna `acordes` foi criada
- [ ] Adicionei acordes em pelo menos 1 música de teste
- [ ] Testei acessando `/studies` no app
- [ ] Testei clicando em uma música e vendo os diagramas

---

## 🐛 Problemas?

Se algo não funcionar:

1. Verifique se o SQL rodou sem erros
2. Confirme que você está no projeto correto
3. Tente fazer logout/login no app
4. Limpe o cache do navegador (Ctrl+Shift+R)

---

## 🎯 Próximos Passos

Depois que a migration estiver aplicada:

1. ✅ Busque músicas no `/studies`
2. ✅ Clique em uma música
3. ✅ Veja o Sistema CAGED completo
4. ✅ Teste inversões de teclado
5. ✅ Explore reharmonizações

**Divirta-se estudando! 🎸🎹**
