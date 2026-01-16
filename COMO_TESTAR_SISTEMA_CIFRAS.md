# 🧪 Como Testar o Sistema de Cifras

Guia completo para testar todas as funcionalidades do ecossistema musical.

---

## 🚀 Opção 1: Teste Rápido (Recomendado)

### Passo 1: Adicionar a rota de teste

Abra o arquivo de rotas e adicione:

```tsx
// src/App.tsx ou seu arquivo de rotas
import ChordStudyDemo from '@/features/study-mode/ChordStudyDemo';

// Adicione a rota
<Route path="/teste-cifras" element={<ChordStudyDemo />} />
```

### Passo 2: Acessar a página

```
http://localhost:5173/teste-cifras
```

### Passo 3: Testar funcionalidades

1. **Selecione um exemplo** - Clique em uma das músicas pré-carregadas
2. **Teste a transposição** - Use os botões + e - ou selecione uma tonalidade
3. **Clique nos acordes** - Veja os diagramas CAGED aparecerem
4. **Digite cifra personalizada** - Clique em "Cifra Personalizada" e cole sua própria cifra

---

## 🎯 Opção 2: Integrar em Página Existente

### Em qualquer página/componente:

```tsx
import { IntegratedChordStudy } from '@/features/study-mode/components/IntegratedChordStudy';

function MinhaPage() {
  const cifra = `
    G            D
    Quão grande é o meu Deus
    Em7          C
    Cantarei quão grande é o meu Deus
  `;

  return (
    <div className="p-6">
      <IntegratedChordStudy text={cifra} />
    </div>
  );
}
```

---

## 🧪 Opção 3: Console do Browser

### Abra o console (F12) e teste diretamente:

```javascript
// Importar funções (se estiverem expostas globalmente)
// Ou adicionar um botão de teste na página

// Teste 1: Parser
const { parseChordSheet } = await import('./src/features/study-mode/services/chordParser.ts');

const cifra = `
  G    D    Em   C
  Quão grande é o meu Deus
`;

const result = parseChordSheet(cifra);
console.log('Acordes encontrados:', result.uniqueChords);
console.log('Tom detectado:', result.key);

// Teste 2: Transposição
const { transposeChordSheet } = await import('./src/features/study-mode/services/chordTransposer.ts');

const transposta = transposeChordSheet(cifra, 2);
console.log('Cifra transposta:', transposta);
```

---

## 📋 Checklist de Testes

### ✅ Parser de Cifras

- [ ] **Detecta acordes maiores** (C, D, E, F, G, A, B)
  ```
  C    D    E    F
  G    A    B
  ```

- [ ] **Detecta acordes menores** (Cm, Dm, Em)
  ```
  Cm   Dm   Em   Fm
  Gm   Am   Bm
  ```

- [ ] **Detecta acordes de 7ª** (C7, Cmaj7, Cm7)
  ```
  C7   D7   G7
  Cmaj7  Dmaj7  Gmaj7
  Cm7  Dm7  Em7
  ```

- [ ] **Detecta acordes complexos** (C°, C+, Csus4, C6, C9, Cadd9)
  ```
  C°   C+   Csus4
  C6   Cm6
  C9   Cadd9
  ```

- [ ] **Detecta acordes com sustenidos e bemóis**
  ```
  C#   Db   D#   Eb
  F#   Gb   G#   Ab
  A#   Bb
  ```

- [ ] **Detecta tonalidade automaticamente**
  - Cole uma cifra em G maior → Deve mostrar "Tom: G"
  - Cole uma cifra em Am → Deve mostrar "Tom: Am"

- [ ] **Separa cifra de letra**
  - Linhas só com acordes devem aparecer em azul
  - Linhas com letra devem aparecer em branco

---

### ✅ Transposição

- [ ] **Transpor para cima** (+1 semitom)
  - C → C#
  - G → Ab
  - D → Eb

- [ ] **Transpor para baixo** (-1 semitom)
  - C → B
  - G → F#
  - D → C#

- [ ] **Transpor múltiplos semitons**
  - C → D (+2)
  - C → E (+4)
  - C → G (+7)

- [ ] **Seletor de tonalidade**
  - Clicar em "D" deve transpor de C para D
  - Tom original e atual devem ser exibidos

- [ ] **Botão reset**
  - Deve voltar ao tom original

- [ ] **Preservar layout**
  - Texto transposto deve manter espaçamento original

---

### ✅ Modo Integrado

- [ ] **Clique em acorde**
  - Clicar em "G" deve mostrar diagrama de G
  - Clicar em "Em7" deve mostrar diagrama de Em7

- [ ] **Diagrama CAGED**
  - Deve mostrar o acorde no braço do violão
  - Números devem indicar os dedos (1-4)
  - Círculo azul deve marcar a tônica

- [ ] **Informações do acorde**
  - Deve mostrar notas (ex: G, B, D)
  - Deve mostrar intervalos (ex: 1, 3, 5)
  - Deve mostrar dificuldade (Fácil/Médio/Difícil)

- [ ] **Múltiplas formas CAGED**
  - Deve mostrar botões C, A, G, E, D
  - Clicar em cada botão deve mudar o diagrama

- [ ] **Layout responsivo**
  - Em desktop: 2 colunas (cifra | diagrama)
  - Em mobile: 1 coluna (empilhado)

---

## 🎸 Exemplos de Teste

### Exemplo 1: Música Simples

```
C          Am
Aleluia, aleluia
F              G
Louvado seja o Senhor
C          Am
Aleluia, aleluia
F       G        C
Para sempre cantarei
```

**Resultado esperado:**
- Tom detectado: C
- 4 acordes únicos: C, Am, F, G
- Total de acordes: 8
- Deve permitir transpor para qualquer tonalidade

---

### Exemplo 2: Música com Acordes de 7ª

```
Cmaj7        Dm7
Intro instrumental
G7              Cmaj7
Progressão de jazz
Am7         D7
Acordes com sétima
Gmaj7       Em7    Am7   D7
Final da progressão
```

**Resultado esperado:**
- Tom detectado: C
- Acordes com 7ª detectados corretamente
- Diagramas de 7ª devem aparecer ao clicar

---

### Exemplo 3: Música com Sustenidos/Bemóis

```
C#m7        F#7
Acordes com sustenido
Bbmaj7      Ebm6
Acordes com bemol
```

**Resultado esperado:**
- Todos os acordes detectados
- Transposição deve preservar enarmônicos

---

### Exemplo 4: Acordes Complexos

```
C°       C+      Csus4
Cadd9    C6      Cm6
C9       Cmaj7   Cm7
```

**Resultado esperado:**
- Todos os 9 tipos de acordes detectados
- Cada um deve ter diagrama disponível

---

## 🐛 Testes de Edge Cases

### Teste com texto sem cifras
```
Esta é apenas uma letra
Sem nenhum acorde
Apenas texto
```
**Esperado:** Mensagem "Nenhuma cifra detectada"

---

### Teste com cifras misturadas na letra
```
Quão C grande é o Am meu Deus F G
```
**Esperado:** Acordes detectados inline (C, Am, F, G)

---

### Teste com linhas vazias
```
C    Am

F    G

C    Am
```
**Esperado:** Espaçamento preservado

---

### Teste de transposição extrema
- Transpor +12 (1 oitava acima) → C → C
- Transpor -12 (1 oitava abaixo) → C → C
- Transpor +6 (trítono) → C → F#
- Transpor +13 (além do limite) → Deve limitar em +12

---

## 📊 Verificação de Performance

### Build
```bash
npm run build
```
**Esperado:** Build bem-sucedido em ~7s

### Bundle size
```bash
ls -lh dist/assets/index-*.js
```
**Esperado:** ~900KB (~180KB gzipped)

### Memory usage
- Abra DevTools → Performance Monitor
- Carregar página de teste
**Esperado:** < 50MB de memória

---

## 🎯 Teste Completo do Fluxo

1. ✅ **Abrir página de teste**
2. ✅ **Selecionar exemplo "Quão Grande É o Meu Deus"**
3. ✅ **Verificar que tom detectado é G**
4. ✅ **Clicar no botão "+" duas vezes** (transpor +2)
5. ✅ **Verificar que tom mudou para A**
6. ✅ **Clicar em "D" no seletor de tonalidade**
7. ✅ **Verificar que tom mudou para D**
8. ✅ **Clicar no acorde "D" na cifra**
9. ✅ **Verificar que diagrama de D apareceu**
10. ✅ **Clicar no botão "A" das formas CAGED**
11. ✅ **Verificar que diagrama mudou para forma A**
12. ✅ **Clicar em "Reset"**
13. ✅ **Verificar que voltou ao tom original (G)**

---

## 🆘 Troubleshooting

### Problema: "Nenhuma cifra detectada"
**Solução:** Verifique se os acordes estão escritos corretamente (C, Dm, G7, etc.)

### Problema: Diagrama não aparece
**Solução:** Verifique se o acorde existe na biblioteca (156 acordes suportados)

### Problema: Transposição não funciona
**Solução:** Verifique se há acordes válidos no texto

### Problema: Tom não é detectado
**Solução:** Normal para cifras muito curtas. Adicione mais acordes para melhor detecção.

---

## 📱 Teste em Dispositivos

### Desktop (Chrome/Firefox/Safari)
- [ ] Funciona corretamente
- [ ] Layout em 2 colunas
- [ ] Diagramas legíveis

### Tablet
- [ ] Funciona corretamente
- [ ] Layout responsivo
- [ ] Touch funciona nos botões

### Mobile
- [ ] Funciona corretamente
- [ ] Layout em 1 coluna
- [ ] Diagramas visíveis
- [ ] Controles acessíveis

---

## ✅ Critérios de Sucesso

O sistema está funcionando corretamente se:

1. ✅ Parser detecta os 156 acordes
2. ✅ Tonalidade é detectada automaticamente
3. ✅ Transposição funciona de -12 a +12
4. ✅ Diagramas aparecem ao clicar
5. ✅ Todas as 5 formas CAGED estão disponíveis
6. ✅ Layout é responsivo
7. ✅ Build é bem-sucedido
8. ✅ Performance é boa (< 50MB RAM)

---

**Pronto para testar! 🎸**

Se encontrar algum problema, verifique:
1. Console do browser (F12)
2. Network tab (se algo não carregou)
3. Build logs (se houve erro de compilação)
