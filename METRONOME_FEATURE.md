# Feature: Metrônomo com Tap Tempo

## Resumo das Mudanças

### 1. Notificação com Nomes Completos das Seções ✅
Agora, ao clicar em uma seção no SongMap, a notificação exibe o nome completo da seção ao invés do código:
- **Antes**: "Pulou para V1 (0:15)"
- **Depois**: "Pulou para Verso 1 (0:15)"

**Mapeamento de Nomes:**
- `I` → Intro
- `V1`, `V2`, `V3` → Verso 1, Verso 2, Verso 3
- `PR` / `PC` → Pré-Refrão
- `R` / `C` → Refrão
- `R1`, `R2`, `R3` → Refrão 1, Refrão 2, Refrão 3
- `S` → Solo
- `PO` → Ponte
- `B` → Bridge
- `IS` / `IN` → Instrumental
- `O` → Final
- `TA` / `T` → Turnaround
- `TG` → Tag
- `IT` → Interlúdio
- `RF` → Refrão Final

### 2. Metrônomo com Tap Tempo ✅
Substituído o botão "Letras" por um **Metrônomo interativo** com função **Tap Tempo**.

#### Funcionalidades do Metrônomo

1. **Carrega o BPM Original da Música**
   - O BPM é lido do banco de dados (coluna `bpm`)
   - Valor padrão: 120 BPM se não estiver configurado

2. **Toggle Simples (Liga/Desliga)**
   - **1º clique**: Liga o metrônomo
   - **2º clique** (após 2+ segundos): Desliga o metrônomo
   - Indicador visual: Botão fica verde (#1DB954) quando ligado

3. **Tap Tempo (3+ Cliques Rápidos)**
   - Quando o metrônomo está ligado, clique 3+ vezes no ritmo desejado
   - O metrônomo calcula automaticamente o BPM médio
   - Cliques devem ser feitos em menos de 2 segundos entre cada um
   - Limite: 40-240 BPM
   - Indicador visual: Ponto azul piscando durante o tap

#### Interface do Metrônomo

```
┌───────────────────────┐
│ TAP 120 BPM      ●   │  ← Tocando (verde) + indicador de tap
└───────────────────────┘

┌───────────────────────┐
│ TAP 120 BPM          │  ← Pausado (branco/transparente)
└───────────────────────┘
```

**Design:**
- "TAP" à esquerda (9px, uppercase, semibold)
- Número BPM no centro (texto-xl, extrabold)
- "BPM" à direita (9px, uppercase, semibold)
- Sem ícones de som
- Visual clean e minimalista

## Arquivos Criados/Modificados

### Novos Arquivos
- [`src/components/Metronome.tsx`](src/components/Metronome.tsx) - Componente do metrônomo
- [`supabase/migrations/20251223_add_bpm_column.sql`](supabase/migrations/20251223_add_bpm_column.sql) - Migração do banco
- `METRONOME_FEATURE.md` - Esta documentação

### Arquivos Modificados
- [`src/pages/TrackDetails.tsx`](src/pages/TrackDetails.tsx)
  - Adicionado função `getSectionDisplayName()` para converter códigos em nomes
  - Substituído botão "Letras" pelo componente `<Metronome />`
  - Atualizada query para incluir coluna `bpm`
  - Corrigida notificação para exibir nomes completos

## Como Usar

### 1. Executar a Migração do Banco de Dados

No **Supabase SQL Editor**, execute:

```sql
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;

COMMENT ON COLUMN tracks.bpm IS 'BPM (Batidas Por Minuto) da música para uso no metrônomo. Valor padrão: 120 BPM';
```

### 2. Configurar BPM de uma Música

```sql
-- Exemplo: Configurar "Sublime" com 140 BPM
UPDATE tracks
SET bpm = 140
WHERE id = 'dfeb98a9-a1ed-476d-957f-2052489181f2';
```

### 3. Usar o Metrônomo na Aplicação

1. **Abra uma música** no app
2. **Veja o metrônomo** no topo da tela (substituindo o botão "Letras")
3. **Clique para iniciar** o metrônomo no BPM da música
4. **Use Tap Tempo**: Com o metrônomo ligado, clique 3+ vezes rapidamente no ritmo desejado para ajustar o BPM
5. **Desligar**: Aguarde 2 segundos e clique novamente para desligar

## Detalhes Técnicos

### AudioContext API
O metrônomo usa a **Web Audio API** para gerar sons precisos:
- Frequência: 800 Hz (tom agudo)
- Duração: 100ms
- Volume: 30% (para não incomodar)
- Tipo de onda: Sine (som limpo)

### Cálculo do Tap Tempo
1. Registra o timestamp de cada clique
2. Calcula o intervalo médio entre os cliques
3. Converte para BPM: `BPM = 60000 / intervalo_médio`
4. Limita entre 40-240 BPM
5. Reseta se passar 3 segundos sem clicar

### Performance
- Intervalo recalculado dinamicamente baseado no BPM
- Usa `setInterval` para precisão consistente
- Cleanup automático ao desmontar o componente
- AudioContext reutilizado para eficiência

## Exemplos de BPM Comuns

| Estilo Musical | BPM Típico |
|----------------|------------|
| Balada Lenta | 60-80 |
| Balada | 80-100 |
| Pop/Rock | 100-130 |
| Dance/EDM | 120-140 |
| Upbeat Pop | 140-160 |
| Drum & Bass | 160-180 |

## Melhorias Futuras

Possíveis aprimoramentos:
1. **Acentuação de Batidas** - Destacar o primeiro tempo do compasso
2. **Compasso Configurável** - 4/4, 3/4, 6/8, etc.
3. **Sons Customizáveis** - Diferentes timbres (palma, caixa, etc.)
4. **Subdivisões** - Colcheias, semicolcheias
5. **Sincronização com YouTube** - Detectar BPM automaticamente
6. **Salvar BPM do Tap Tempo** - Atualizar o banco de dados
7. **Controle de Volume** - Ajustar intensidade do som
8. **Visual Sync** - Animação pulsante sincronizada

## Testes

### Manual
1. ✅ Metrônomo inicia ao clicar pela primeira vez
2. ✅ Som tocando no BPM configurado
3. ✅ Tap Tempo funciona com 3+ cliques
4. ✅ BPM atualiza corretamente
5. ✅ Pausar/retomar funciona
6. ✅ Indicador visual de estado (verde/branco)
7. ✅ Indicador de tap (ponto azul)
8. ✅ Notificações mostram nomes completos das seções

### Build
```bash
npm run build
# ✓ built in 2.46s
```

## Suporte

Para reportar problemas ou sugestões:
- Verifique o console do navegador para logs de debug
- Certifique-se de que o navegador suporta Web Audio API
- Teste em modo incógnito se houver problemas de som
