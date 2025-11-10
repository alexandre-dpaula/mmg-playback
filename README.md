# MMG - Ensaio Vocal - Festa dos Tabernáculos

Player de música para ensaio vocal com integração ao Google Sheets.

## Funcionalidades

- Player de áudio com controles de reprodução (play, pause, próxima, anterior)
- Carregamento automático de faixas do Google Sheets via Apps Script
- Suporte para arquivos de áudio no Google Drive
- Interface estilo Spotify
- Atualização automática da playlist a cada 10 minutos
- Visualização de progresso da música
- Lista de faixas com destaque da música atual

## Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Google Sheets

Veja o arquivo [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) para instruções detalhadas sobre:
- Como criar a planilha no Google Sheets
- Como configurar o Apps Script
- Como fazer o deploy e obter a URL

O código do Apps Script está disponível no arquivo [AppScript.gs](AppScript.gs)

### 3. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Adicione a URL do Apps Script no arquivo .env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_SCRIPT_ID/exec
```

### 4. Executar o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura da Planilha Google Sheets

### Aba "Config"
| Campo | Valor |
|-------|-------|
| playlistTitle | MMG - Festa dos Tabernáculos |
| playlistDescription | Playlist de vozes para ensaio das Músicas de Tabernáculos. |
| coverUrl | [URL da imagem de capa] |

### Aba "Tracks"
| Título | URL | Voz/Artista |
|--------|-----|-------------|
| HINEI MA TOV | [ID ou URL do Drive] | Soprano |
| Segunda Faixa | [ID ou URL do Drive] | Tenor |

## Documentação

- [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) - Guia completo de configuração do Google Sheets
- [AppScript.gs](AppScript.gs) - Código do Apps Script pronto para usar

## Tecnologias Utilizadas

- React + TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Query (TanStack Query)
- Google Apps Script

## Solução de Problemas

Se as faixas não carregarem:
1. Verifique se o arquivo `.env` contém a URL correta do Apps Script
2. Teste a URL do Apps Script no navegador - deve retornar um JSON
3. Confirme que os arquivos no Google Drive estão compartilhados publicamente
4. Verifique os logs do Apps Script (Ver > Logs)

Para mais detalhes, consulte [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
