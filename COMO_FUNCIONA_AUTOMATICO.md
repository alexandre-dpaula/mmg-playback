# 🤖 Como Funciona o Sistema Automático

## 🎯 Objetivo

**Você NÃO precisa fazer NADA manualmente!**

Ao adicionar uma música nova → Sistema detecta automaticamente as seções e cria timestamps.

---

## 🔄 Fluxo Automático (Músicas Novas)

### 1. Você Adiciona uma Música

```
Você cola URL: https://www.cifraclub.com.br/u2/one/
```

### 2. Sistema Busca a Cifra

```typescript
// TrackFormModal.tsx detecta que tem URL de cifra
const cifraContent = await fetchCifraPreview(cifraUrl);
```

### 3. Sistema Detecta Seções Automaticamente

```
[INTRO]
Am  D  F  G

[VERSE 1]
Am        D
Is it getting better
F              G
Or do you feel the same

[PRE-CHORUS]
F        G
Did I disappoint you
Am           D
Or leave a bad taste

[CHORUS]
C         Am
One love, one blood
F              G
One life you got to do
```

O sistema encontra: **I, V1, PR, R**

### 4. Sistema Calcula Timestamps Proporcionais

```typescript
// timestampGenerator.ts
// Conta linhas de cada seção:
// - INTRO: 2 linhas
// - VERSE 1: 6 linhas
// - PRE-CHORUS: 4 linhas
// - CHORUS: 6 linhas
// Total: 18 linhas

// Estima duração: ~3 minutos (180s)

// Distribui proporcionalmente:
{
  "I": 0,      // 0s - começo
  "V1": 20,    // 2/18 × 180 = 20s
  "PR": 80,    // (2+6)/18 × 180 = 80s
  "R": 120     // (2+6+4)/18 × 180 = 120s
}
```

### 5. Sistema Salva Automaticamente

```typescript
// TrackFormModal.tsx salva no banco
const trackData = {
  titulo: "One",
  artista: "U2",
  cifra_url: "https://...",
  section_timestamps: { "I": 0, "V1": 20, "PR": 80, "R": 120 }
}

await supabase.from('tracks').insert(trackData)
```

### 6. Você Vê a Notificação

```
✅ 4 seções detectadas automaticamente!
```

---

## 🔧 Para Músicas Antigas (Já Existentes)

### Edge Function Processa em Lote

```typescript
// supabase/functions/auto-generate-timestamps/index.ts

// 1. Busca TODAS as músicas sem timestamps
const tracks = await supabase
  .from('tracks')
  .select('*')
  .is('section_timestamps', null)

// 2. Para cada música:
for (const track of tracks) {
  // Gera timestamps
  const timestamps = autoGenerateTimestamps(track.cifra_content)

  // Salva no banco
  await supabase
    .from('tracks')
    .update({ section_timestamps: timestamps })
    .eq('id', track.id)
}
```

**Você executa UMA VEZ:**

```bash
curl -X POST 'https://.../auto-generate-timestamps'
```

**E pronto!** Todas as músicas antigas ficam com timestamps.

---

## 🎨 Como as Cores São Aplicadas

### SongMap.tsx

```typescript
const getSectionColor = (type: string) => {
  if (type === 'I') return 'bg-yellow-500'    // Intro = Amarelo
  if (type.startsWith('V')) return 'bg-blue-400'  // Verso = Azul
  if (type === 'PR') return 'bg-green-500'    // Pré-Refrão = Verde
  if (type.startsWith('R')) return 'bg-orange-500' // Refrão = Laranja
  if (type === 'S') return 'bg-red-500'       // Solo = Vermelho
  if (type === 'PO') return 'bg-green-600'    // Ponte = Verde escuro
  if (type === 'B') return 'bg-purple-500'    // Bridge = Roxo
  return 'bg-gray-400'                         // Padrão = Cinza
}
```

Cada seção tem uma cor fixa → O SongMap aplica automaticamente.

---

## ⏱️ Como o Auto-Scroll Funciona

### YouTubePlayer.tsx

```typescript
// A cada 1 segundo, verifica o tempo atual do vídeo
useEffect(() => {
  const interval = setInterval(() => {
    const currentTime = player.getCurrentTime()

    // Encontra a seção atual baseado no timestamp
    const currentSection = findSectionByTime(currentTime, section_timestamps)

    // Rola a cifra para a seção
    scrollToSection(currentSection)

    // Atualiza a cor da barra
    updateProgressBarColor(currentSection)
  }, 1000)
}, [])
```

**Você não faz nada!** O sistema sincroniza sozinho.

---

## 🎵 Como o Metrônomo Funciona

### Metronome.tsx

```typescript
// 1. Carrega BPM do banco de dados
const { data: track } = await supabase
  .from('tracks')
  .select('bpm')
  .eq('id', trackId)
  .single()

// 2. Toca som no intervalo correto
const interval = 60000 / bpm  // Ex: 120 BPM = 500ms

setInterval(() => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  oscillator.frequency.value = 800 // Hz
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1) // 100ms
}, interval)
```

**Tap Tempo:**

```typescript
// Quando você clica 3+ vezes rápido:
const clicks = [Date.now(), Date.now() + 500, Date.now() + 1000]

// Calcula intervalo médio
const avgInterval = (clicks[clicks.length - 1] - clicks[0]) / (clicks.length - 1)

// Converte para BPM
const newBPM = Math.round(60000 / avgInterval)  // Ex: 500ms → 120 BPM
```

---

## 🧩 Seções Reconhecidas Automaticamente

| Código na Cifra | Normalizado | Nome Exibido | Cor |
|-----------------|-------------|--------------|-----|
| `[INTRO]` | I | Intro | Amarelo |
| `[PRIMEIRA PARTE]` | V1 | Verso 1 | Azul |
| `[VERSE 1]` | V1 | Verso 1 | Azul |
| `[VERSO 1]` | V1 | Verso 1 | Azul |
| `[V1]` | V1 | Verso 1 | Azul |
| `[PRÉ-REFRÃO]` | PR | Pré-Refrão | Verde |
| `[PRE-CHORUS]` | PR | Pré-Refrão | Verde |
| `[REFRÃO]` | R | Refrão | Laranja |
| `[CHORUS]` | R | Refrão | Laranja |
| `[REFRÃO 1]` | R1 | Refrão 1 | Laranja |
| `[SOLO]` | S | Solo | Vermelho |
| `[PONTE]` | PO | Ponte | Verde escuro |
| `[BRIDGE]` | B | Bridge | Roxo |
| `[INSTRUMENTAL]` | IS | Instrumental | Roxo |
| `[FINAL]` | RF | Refrão Final | Vermelho |

**E muitos mais!** O sistema normaliza automaticamente.

---

## 📊 Exemplo Real: Música "Sublime"

### Cifra Original

```
[INTRO]
E  B  C#m  A

[VERSE 1]
E              B
Summertime, and the livin' is easy
C#m           A
Bradley's on the microphone with Ras MG

[PRE-CHORUS]
F#m           G#m
All the people in the dance will agree
A             B
That we're well-qualified to represent the L.B.C.

[CHORUS]
E        B
Me, me and Louie
C#m            A
We gonna run to the party
```

### Timestamps Gerados

```json
{
  "I": 0,
  "V1": 15,
  "PR": 45,
  "R": 75
}
```

### Resultado no App

```
┌─────────────────────────────────────┐
│ TAP 140 BPM              ● (tocando)│
├─────────────────────────────────────┤
│                                     │
│ ████████░░░░░░░░░░░░░░░ 35%        │ ← Barra verde (Pré-Refrão)
│                                     │
│ ┌─┬──┬──┬─┐                        │
│ │I│V1│PR│R│   ← SongMap colorido   │
│ └─┴──┴──┴─┘                        │
│                                     │
│ [INTRO] ← 0:00                     │
│ E  B  C#m  A                       │
│                                     │
│ [VERSE 1] ← 0:15  ← Auto-scroll    │
│ E              B                   │
│ Summertime, and the livin'...     │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Funcionalidades Automáticas

- [x] **Detecta seções** ao adicionar música
- [x] **Gera timestamps** proporcionais
- [x] **Salva no banco** automaticamente
- [x] **Notifica** número de seções detectadas
- [x] **SongMap** com cores corretas
- [x] **Barra de progresso** muda de cor
- [x] **Auto-scroll** sincronizado
- [x] **Metrônomo** com BPM da música
- [x] **Tap Tempo** para ajustar BPM
- [x] **Nomes completos** nas notificações

---

## 🎯 Você Só Precisa Fazer

1. ✅ Executar as migrações SQL (uma vez)
2. ✅ Deploy da Edge Function (uma vez)
3. ✅ Executar a função para processar músicas antigas (uma vez)

**Depois disso:** Tudo funciona sozinho! 🚀
