# 🎵 Como Funciona o Sistema de Transpose + Capotraste

## 🎯 Conceito Musical Correto

### Exemplo Real: Música em D tocada em C com Capo 2

**Situação:**
- Tom Original da Música: **D**
- Tom que você quer tocar: **C**
- Capotraste: **Casa 2**

### ❌ O Que Está Acontecendo ERRADO Agora

```
1. Tom Original: D
2. Você seleciona: C
3. Sistema transpõe D → C (-2 semitons)
4. Cifra mostra: D vira C, A vira G, etc.
5. Você coloca capo na casa 2
6. Sistema transpõe NOVAMENTE C → Bb (-2 semitons) ❌ ERRADO!
7. Resultado: Bb (que é 1 tom abaixo de C) ❌ ERRADO MUSICALMENTE!
```

**Problema:** O sistema está transpondo DUAS VEZES!

### ✅ Como DEVERIA Funcionar (Correto Musicalmente)

```
CENÁRIO 1: SEM CAPOTRASTE
─────────────────────────
Tom Original: D
Tom Selecionado: C
Capotraste: 0 (sem capo)

→ Cifra transposta: D → C
→ Você toca: C (sem capo)
→ Som que sai: C ✓
```

```
CENÁRIO 2: COM CAPOTRASTE (Simplificar Acordes)
────────────────────────────────────────────────
Tom Original: D
Tom Selecionado: D (mesmo tom, mas quer acordes mais fáceis)
Capotraste: Casa 2

→ Cifra transposta: D → C (-2 semitons para simplificar)
→ Você toca: C (com capo na casa 2)
→ Som que sai: D ✓ (porque capo +2 = C vira D)
```

```
CENÁRIO 3: TOM DIFERENTE + CAPOTRASTE
──────────────────────────────────────
Tom Original: D
Tom Selecionado: E (quer tocar 1 tom acima)
Capotraste: Casa 2

→ Cifra transposta: D → C# (E - 2 semitons = C#)
→ Você toca: C# (com capo na casa 2)
→ Som que sai: E ✓ (porque capo +2 = C# vira E)
```

## 🧮 Fórmula Matemática Correta

```
CIFRA_EXIBIDA = TOM_ORIGINAL - (TOM_SELECIONADO - CAPOTRASTE)

Ou seja:
CIFRA_EXIBIDA = TOM_ORIGINAL - TOM_SELECIONADO + CAPOTRASTE
```

### Exemplos:

**Exemplo 1:**
- Tom Original: D (índice 2)
- Tom Selecionado: C (índice 0)
- Capotraste: 0

```
Diferença = 2 - 0 + 0 = 2 semitons para BAIXO
D (2) - 2 = C (0) ✓
```

**Exemplo 2:**
- Tom Original: D (índice 2)
- Tom Selecionado: D (índice 2)
- Capotraste: 2

```
Diferença = 2 - 2 + 2 = 2 semitons para BAIXO
D (2) - 2 = C (0) ✓
(C com capo 2 = D) ✓
```

**Exemplo 3:**
- Tom Original: D (índice 2)
- Tom Selecionado: E (índice 4)
- Capotraste: 2

```
Diferença = 2 - 4 + 2 = 0 semitons
D (2) - 0 = D (2) ✓
(D com capo 2 = E) ✓
```

**Exemplo 4:**
- Tom Original: G (índice 7)
- Tom Selecionado: F (índice 5)
- Capotraste: 3

```
Diferença = 7 - 5 + 3 = 5 semitons para BAIXO
G (7) - 5 = D (2) ✓
(D com capo 3 = F) ✓
```

## 🔧 Correção do Código

### ❌ Código ERRADO (Atual)

```typescript
// Primeiro transpõe para o tom selecionado
let result = transposeContent(contentToUse, originalKey, selectedKey);

// Se houver capotraste, transpõe para baixo (subtrai semitons)
if (capo > 0) {
  const targetIndex = (currentKeyIndex - capo + 12) % 12;
  const targetKey = keys[targetIndex];
  result = transposeContent(result, selectedKey, targetKey); // ❌ ERRADO!
}
```

**Problema:** Transpõe DUAS VEZES separadamente!

### ✅ Código CORRETO

```typescript
// Calcula a diferença total considerando tom + capotraste
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const originalIndex = keys.indexOf(originalKey);
const selectedIndex = keys.indexOf(selectedKey);

if (originalIndex !== -1 && selectedIndex !== -1) {
  // Fórmula: diferença = original - selecionado + capo
  const semitonesDifference = ((originalIndex - selectedIndex + capo) % 12 + 12) % 12;

  // Calcula o tom alvo da cifra
  const targetIndex = (originalIndex - semitonesDifference + 12) % 12;
  const targetKey = keys[targetIndex];

  // Transpõe UMA VEZ APENAS
  result = transposeContent(contentToUse, originalKey, targetKey);
}
```

**Vantagem:** Transpõe UMA VEZ APENAS, considerando tom + capo juntos!

## 📊 Tabela de Exemplos

| Tom Original | Tom Selecionado | Capo | Cifra Exibida | Som que Sai |
|--------------|-----------------|------|---------------|-------------|
| D | C | 0 | C | C ✓ |
| D | D | 2 | C | D ✓ |
| D | E | 2 | D | E ✓ |
| G | F | 3 | D | F ✓ |
| A | G | 2 | F | G ✓ |
| E | E | 4 | C | E ✓ |

## 🎸 Caso de Uso Real

**Música: "Só Tu és Santo" (MORADA)**

**Versão Original:**
- Tom: D
- Acordes: D, A, Bm, G, etc.

**Você quer tocar em C (mais fácil para cantar):**
- Tom Selecionado: C
- Capo: 0
- Cifra Exibida: C, G, Am, F ✓
- Som que Sai: C ✓

**Você quer tocar em D, mas com acordes de C (mais fáceis):**
- Tom Selecionado: D
- Capo: 2
- Cifra Exibida: C, G, Am, F ✓
- Som que Sai: D ✓ (porque capo +2 semitonsTranspõe C→D)

**Você quer tocar em E (voz mais aguda):**
- Tom Selecionado: E
- Capo: 0
- Cifra Exibida: E, B, C#m, A ✓
- Som que Sai: E ✓

**Você quer tocar em E, mas com acordes de C:**
- Tom Selecionado: E
- Capo: 4
- Cifra Exibida: C, G, Am, F ✓
- Som que Sai: E ✓ (porque capo +4 = C→E)

## ✅ Resumo

1. **Tom Original**: Tom real da música gravada
2. **Tom Selecionado**: Tom que você quer que a música soe
3. **Capotraste**: Simplifica os acordes (você toca acordes mais fáceis)
4. **Cifra Exibida**: `Original - (Selecionado - Capo)`

**Fórmula Musical:**
```
SOM_FINAL = CIFRA_EXIBIDA + CAPOTRASTE
SOM_FINAL = TOM_SELECIONADO ✓
```
