# 🎸 Guia de Testes - Transpose + Capotraste

## ✅ CORREÇÃO APLICADA

O sistema de transpose foi corrigido para funcionar **musicalmente correto** com Tom + Capotraste.

### O que foi corrigido:
- ❌ **Antes**: Sistema transpunha DUAS VEZES (tom + capo separadamente)
- ✅ **Agora**: Sistema transpõe UMA VEZ (considerando tom + capo juntos)

---

## 🧪 Casos de Teste

### Teste 1: Sem Capotraste ✅

**Música: "Só Tu és Santo" (Tom Original: D)**

| Tom Selecionado | Capo | Cifra que deve aparecer | Som que sai |
|-----------------|------|-------------------------|-------------|
| D | 0 | D, A, Bm, G | D ✓ |
| C | 0 | C, G, Am, F | C ✓ |
| E | 0 | E, B, C#m, A | E ✓ |
| G | 0 | G, D, Em, C | G ✓ |

**Como testar:**
1. Abra a música "Só Tu és Santo"
2. Selecione tom **C**
3. Capo: **0** (sem capo)
4. ✅ **Resultado esperado**: Cifra deve mostrar **C, G, Am, F**

---

### Teste 2: Com Capotraste (Simplificar Acordes) ✅

**Música: "Só Tu és Santo" (Tom Original: D)**

**Objetivo:** Tocar em D, mas com acordes mais fáceis (C, G, Am, F)

| Tom Selecionado | Capo | Cifra que deve aparecer | Som que sai |
|-----------------|------|-------------------------|-------------|
| D | 2 | C, G, Am, F | D ✓ |
| E | 4 | C, G, Am, F | E ✓ |
| F | 5 | C, G, Am, F | F ✓ |

**Como testar:**
1. Abra a música "Só Tu és Santo"
2. Selecione tom **D** (mesmo tom original)
3. Capo: **2**
4. ✅ **Resultado esperado**: Cifra deve mostrar **C, G, Am, F**
5. ✅ **Som musical**: Se você tocar C com capo 2 = soa D ✓

---

### Teste 3: Tom Diferente + Capotraste ✅

**Música: "Só Tu és Santo" (Tom Original: D)**

**Objetivo:** Tocar em E (1 tom acima), com acordes de D

| Tom Selecionado | Capo | Cifra que deve aparecer | Som que sai |
|-----------------|------|-------------------------|-------------|
| E | 2 | D, A, Bm, G | E ✓ |
| F | 3 | D, A, Bm, G | F ✓ |

**Como testar:**
1. Abra a música "Só Tu és Santo"
2. Selecione tom **E**
3. Capo: **2**
4. ✅ **Resultado esperado**: Cifra deve mostrar **D, A, Bm, G**
5. ✅ **Som musical**: Se você tocar D com capo 2 = soa E ✓

---

### Teste 4: Tom Abaixo + Capotraste ✅

**Música: "Só Tu és Santo" (Tom Original: D)**

**Objetivo:** Tocar em C (1 tom abaixo), com acordes de A

| Tom Selecionado | Capo | Cifra que deve aparecer | Som que sai |
|-----------------|------|-------------------------|-------------|
| C | 3 | A, E, F#m, D | C ✓ |
| D | 5 | A, E, F#m, D | D ✓ |

**Como testar:**
1. Abra a música "Só Tu és Santo"
2. Selecione tom **C**
3. Capo: **3**
4. ✅ **Resultado esperado**: Cifra deve mostrar **A, E, F#m, D**
5. ✅ **Som musical**: Se você tocar A com capo 3 = soa C ✓

---

## 📊 Tabela de Validação Musical

Use esta tabela para validar que o transpose está correto:

| Tom Original | Tom Selecionado | Capo | Target (cifra) | Verificação |
|--------------|-----------------|------|----------------|-------------|
| D (2) | C (0) | 0 | C (0) | 2 - (0 - 0) = 2 → C ✓ |
| D (2) | D (2) | 2 | C (0) | 2 - (2 - 2) = 2 → C ✓ |
| D (2) | E (4) | 2 | D (2) | 2 - (4 - 2) = 0 → D ✓ |
| D (2) | C (0) | 3 | A (9) | 2 - (0 - 3) = 5 → A ✓ |
| G (7) | F (5) | 0 | F (5) | 7 - (5 - 0) = 2 → F ✓ |

**Fórmula:** `semitones = originalIndex - (selectedIndex - capo)`

---

## 🔍 Como Verificar no Console

Abra o **Console do navegador** (F12) e procure por logs:

```
[CifraDisplay] Transpose calculation: { originalKey: 'D', selectedKey: 'C', capo: 0 }
[CifraDisplay] Transposing: {
  from: 'D',
  to: 'C',
  willSound: 'C',
  capo: 0
}
```

**Valores esperados para cada teste:**

### Teste 1: Tom C, Capo 0
```
from: 'D'
to: 'C'
willSound: 'C'
capo: 0
```

### Teste 2: Tom D, Capo 2
```
from: 'D'
to: 'C'
willSound: 'D'
capo: 2
```

### Teste 3: Tom E, Capo 2
```
from: 'D'
to: 'D'
willSound: 'E'
capo: 2
```

### Teste 4: Tom C, Capo 3
```
from: 'D'
to: 'A'
willSound: 'C'
capo: 3
```

---

## ✅ Checklist de Validação

Teste cada cenário e marque:

- [ ] **Teste 1**: Tom C, Capo 0 → Cifra mostra C, G, Am, F
- [ ] **Teste 2**: Tom D, Capo 2 → Cifra mostra C, G, Am, F
- [ ] **Teste 3**: Tom E, Capo 2 → Cifra mostra D, A, Bm, G
- [ ] **Teste 4**: Tom C, Capo 3 → Cifra mostra A, E, F#m, D
- [ ] **Console**: Logs mostram valores corretos

---

## 🎯 O Que Mudou?

### ❌ Código Antigo (ERRADO)
```typescript
// Transpõe para o tom selecionado
let result = transposeContent(contentToUse, originalKey, selectedKey);

// Se houver capo, transpõe NOVAMENTE
if (capo > 0) {
  const targetIndex = (currentKeyIndex - capo + 12) % 12;
  const targetKey = keys[targetIndex];
  result = transposeContent(result, selectedKey, targetKey); // ❌ ERRADO!
}
```
**Problema:** Transpõe DUAS VEZES!

### ✅ Código Novo (CORRETO)
```typescript
// Calcula o tom alvo considerando selectedKey - capo
const targetIndex = (selectedIndex - capo + 12) % 12;
const targetKey = keys[targetIndex];

// Transpõe UMA VEZ APENAS
const result = transposeContent(contentToUse, originalKey, targetKey);
```
**Correto:** Transpõe UMA VEZ, já considerando tom + capo!

---

## 📖 Documentação Completa

Veja a explicação musical completa em:
- [TRANSPOSE_LOGIC_EXPLICACAO.md](TRANSPOSE_LOGIC_EXPLICACAO.md)

---

## 🚀 Próximo Passo

1. **Recarregue a página** do app
2. **Execute os testes** acima
3. **Verifique o console** para confirmar os logs
4. **Me avise** se algo não estiver funcionando musicalmente correto!
