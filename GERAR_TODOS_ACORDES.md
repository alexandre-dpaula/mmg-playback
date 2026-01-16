# 🎵 Gerar Todos os 156 Acordes de Uma Vez

## 📋 O Que Faz

Este script gera **todos os 156 acordes** (12 tons × 13 variações) e salva no Supabase automaticamente.

Depois de executar, você **nunca mais precisará gerar acordes sob demanda** - todos estarão salvos e prontos para uso instantâneo!

## ⚡ Como Executar

### 1. Verifique as variáveis de ambiente

Certifique-se que seu `.env` tem:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui (opcional)
```

### 2. Execute o script

```bash
npx tsx scripts/generate-all-chords.ts
```

### 3. Aguarde a conclusão

O script vai:
- Gerar todos os 156 acordes com teoria musical
- Salvar em lotes de 10 no Supabase
- Mostrar progresso em tempo real
- Exibir resumo final

## 📊 O Que Será Gerado

### Acordes por Tom (12 tons):
- C, C#, D, D#, E, F, F#, G, G#, A, A#, B

### Variações por Tom (13 tipos):
1. **Maior** - C, D, E, etc.
2. **Menor** - Cm, Dm, Em, etc.
3. **Sétima Dominante** - C7, D7, E7, etc.
4. **Maior com 7ª** - Cmaj7, Dmaj7, etc.
5. **Menor com 7ª** - Cm7, Dm7, etc.
6. **Diminuto** - Cdim, Ddim, etc.
7. **Aumentado** - Caug, Daug, etc.
8. **Suspenso 2** - Csus2, Dsus2, etc.
9. **Suspenso 4** - Csus4, Dsus4, etc.
10. **Sexta** - C6, D6, etc.
11. **Menor com 6ª** - Cm6, Dm6, etc.
12. **Nona** - C9, D9, etc.
13. **Maior com 9ª** - Cadd9, Dadd9, etc.

**Total: 12 × 13 = 156 acordes**

## ✨ Dados Gerados para Cada Acorde

Cada acorde terá:

```typescript
{
  chord_name: "Am7",
  full_name: "A minor 7th",
  quality: "minor7",
  root_note: "A",
  notes: ["A", "C", "E", "G"],

  // Diagrama de violão (forma CAGED)
  caged_shapes: {
    E: {
      name: "Am7 (Forma E)",
      baseFret: 5,
      notes: [...],
      barre: {...}
    }
  },

  // Diagrama de teclado
  keyboard_voicings: {
    root: {
      notes: ["A4", "C4", "E4", "G4"],
      inversion: 0
    }
  },

  reharmonizations: {},
  generated_by: "script",
  verified: false
}
```

## 🎯 Saída Esperada

```
🎵 Gerando todos os 156 acordes...

📊 Total de acordes a gerar: 156

💾 Salvando no Supabase...

✅ Lote 1 salvo (10/156) - 6%
✅ Lote 2 salvo (20/156) - 13%
✅ Lote 3 salvo (30/156) - 19%
...
✅ Lote 16 salvo (156/156) - 100%

==================================================
✨ Processo concluído!
✅ Sucessos: 156
❌ Erros: 0
==================================================

✅ Script finalizado com sucesso!
```

## 🔍 Verificar Acordes Gerados

Após executar, você pode verificar no Supabase SQL Editor:

```sql
-- Ver total de acordes gerados
SELECT COUNT(*) as total FROM chord_diagrams;

-- Ver alguns exemplos
SELECT chord_name, full_name, quality, root_note
FROM chord_diagrams
ORDER BY chord_name
LIMIT 20;

-- Ver acordes de um tom específico
SELECT chord_name, full_name
FROM chord_diagrams
WHERE root_note = 'C'
ORDER BY chord_name;
```

## ⚠️ Notas Importantes

1. **Service Role Key**: Se você tiver a chave `SUPABASE_SERVICE_ROLE_KEY`, o script usará ela (ignora RLS). Caso contrário, usará `VITE_SUPABASE_ANON_KEY` (precisa ter permissão de líder).

2. **Upsert**: O script usa `upsert`, então se você executar novamente, ele **atualizará** os acordes existentes em vez de duplicar.

3. **Performance**: O script salva em lotes de 10 para evitar timeout. Deve levar ~10-15 segundos para completar.

4. **Backup**: Antes de executar em produção, faça backup da tabela `chord_diagrams` se ela já tiver dados importantes.

## 🚀 Depois de Gerar

Após executar este script:

1. ✅ Todos os 156 acordes estarão no banco
2. ✅ O hook `useChordData` buscará do cache instantaneamente
3. ✅ Não haverá mais geração sob demanda
4. ✅ A Biblioteca de Acordes carregará instantaneamente

## 🔄 Atualizar Acordes

Se quiser regenerar todos os acordes (por exemplo, após melhorar a lógica de geração):

```bash
# 1. Limpar tabela (opcional)
# No SQL Editor: DELETE FROM chord_diagrams;

# 2. Executar novamente
npx tsx scripts/generate-all-chords.ts
```

---

**Desenvolvido para MMG - Ensaio Vocal 🎵**
