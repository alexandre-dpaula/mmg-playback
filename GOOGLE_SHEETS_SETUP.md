# Configuração do Google Sheets e App Script

Este documento explica como configurar a planilha do Google Sheets e o App Script para carregar automaticamente as faixas de áudio no player.

## Estrutura da Planilha

### 1. Criar a Planilha no Google Sheets

Acesse [Google Sheets](https://sheets.google.com) e crie uma nova planilha com a seguinte estrutura:

#### Aba: "Config" (Configurações da Playlist)

| Campo | Valor |
|-------|-------|
| playlistTitle | MMG - Festa dos Tabernáculos |
| playlistDescription | Playlist de vozes para ensaio das Músicas de Tabernáculos. |
| coverUrl | [URL da imagem de capa da playlist] |

#### Aba: "Tracks" (Faixas de Áudio)

| Título | URL | Voz/Artista |
|--------|-----|-------------|
| HINEI MA TOV | [ID ou URL do arquivo no Drive] | Soprano |
| Segunda Faixa | [ID ou URL do arquivo no Drive] | Tenor |
| Terceira Faixa | [ID ou URL do arquivo no Drive] | Baixo |

**Importante sobre URLs do Google Drive:**
- Você pode usar o ID do arquivo (ex: `1a2b3c4d5e6f7g8h9i0j`)
- Ou a URL completa do Drive (ex: `https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view`)
- Os arquivos devem estar compartilhados publicamente ou com "Qualquer pessoa com o link"

### 2. Como obter o ID do arquivo no Google Drive

1. Faça upload do arquivo de áudio para o Google Drive
2. Clique com o botão direito no arquivo e selecione "Compartilhar"
3. Configure como "Qualquer pessoa com o link"
4. Copie o link - o ID está entre `/d/` e `/view`:
   ```
   https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view
                                 ^^^^^^^^^^^^^^^^^ (este é o ID)
   ```
5. Cole o ID ou a URL completa na coluna "URL" da planilha

## Código do App Script

### 1. Abrir o Editor de Script

1. Na sua planilha, vá em **Extensões > Apps Script**
2. Apague o código padrão que aparecer
3. Cole o código abaixo

### 2. Código do App Script

```javascript
/**
 * App Script para expor dados da planilha do Google Sheets
 * como API JSON para o player de música
 */

function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Buscar dados da aba "Config"
    const configSheet = spreadsheet.getSheetByName("Config");
    const config = getConfigData(configSheet);

    // Buscar dados da aba "Tracks"
    const tracksSheet = spreadsheet.getSheetByName("Tracks");
    const tracks = getTracksData(tracksSheet);

    // Montar resposta JSON
    const response = {
      playlistTitle: config.playlistTitle || "MMG - Festa dos Tabernáculos",
      playlistDescription: config.playlistDescription || "Playlist de vozes para ensaio das Músicas de Tabernáculos.",
      coverUrl: config.coverUrl || "",
      tracks: tracks
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Erro: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString(),
        playlistTitle: "MMG - Festa dos Tabernáculos",
        playlistDescription: "Playlist de vozes para ensaio das Músicas de Tabernáculos.",
        coverUrl: "",
        tracks: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Busca dados de configuração da aba "Config"
 * Formato esperado:
 *   Coluna A: Nome do campo (playlistTitle, playlistDescription, coverUrl)
 *   Coluna B: Valor
 */
function getConfigData(sheet) {
  const config = {
    playlistTitle: "",
    playlistDescription: "",
    coverUrl: ""
  };

  if (!sheet) {
    Logger.log("Aba 'Config' não encontrada");
    return config;
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 0; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];

    if (key && value) {
      config[key.toString().trim()] = value.toString().trim();
    }
  }

  return config;
}

/**
 * Busca dados das faixas da aba "Tracks"
 * Formato esperado:
 *   Linha 1: Cabeçalhos (Título, URL, Voz/Artista)
 *   Linhas seguintes: Dados das faixas
 */
function getTracksData(sheet) {
  const tracks = [];

  if (!sheet) {
    Logger.log("Aba 'Tracks' não encontrada");
    return tracks;
  }

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log("Nenhuma faixa encontrada");
    return tracks;
  }

  // Primeira linha são os cabeçalhos
  const headers = data[0].map(h => h.toString().toLowerCase());

  // Encontrar índices das colunas
  const titleIndex = headers.findIndex(h =>
    h.includes("titulo") || h.includes("título") || h.includes("nome") || h.includes("faixa")
  );
  const urlIndex = headers.findIndex(h =>
    h.includes("url") || h.includes("link")
  );
  const artistIndex = headers.findIndex(h =>
    h.includes("voz") || h.includes("cantor") || h.includes("artista")
  );

  // Processar cada linha de dados
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const title = titleIndex >= 0 ? row[titleIndex]?.toString().trim() : "";
    const url = urlIndex >= 0 ? row[urlIndex]?.toString().trim() : "";
    const artist = artistIndex >= 0 ? row[artistIndex]?.toString().trim() : "";

    // Só adiciona se tiver título e URL
    if (title && url) {
      tracks.push({
        id: `track-${i}`,
        title: title,
        url: url,
        artist: artist || undefined,
        order: i - 1
      });
    }
  }

  Logger.log(`Total de faixas encontradas: ${tracks.length}`);
  return tracks;
}
```

### 3. Fazer Deploy do Script

1. Clique em **Implantar > Nova implantação**
2. Clique no ícone de engrenagem ⚙️ ao lado de "Selecione o tipo"
3. Selecione **Aplicativo da Web**
4. Configure:
   - **Descrição:** API de Playlist MMG
   - **Executar como:** Eu (seu email)
   - **Quem tem acesso:** Qualquer pessoa
5. Clique em **Implantar**
6. Copie a **URL do aplicativo da Web** que aparecerá
7. Clique em **Concluído**

### 4. Configurar a URL no Projeto

1. Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`)
2. Cole a URL do App Script:
   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_SCRIPT_ID/exec
   ```
3. Reinicie o servidor de desenvolvimento

## Testando

### 1. Testar o App Script

Abra a URL do App Script no navegador. Você deve ver um JSON com os dados da planilha:

```json
{
  "playlistTitle": "MMG - Festa dos Tabernáculos",
  "playlistDescription": "Playlist de vozes para ensaio das Músicas de Tabernáculos.",
  "coverUrl": "https://...",
  "tracks": [
    {
      "id": "track-1",
      "title": "HINEI MA TOV",
      "url": "https://drive.google.com/uc?export=download&id=...",
      "artist": "Soprano",
      "order": 0
    }
  ]
}
```

### 2. Testar no Aplicativo

1. Execute `npm run dev`
2. Abra o aplicativo no navegador
3. As faixas devem aparecer automaticamente
4. Clique para reproduzir

## Solução de Problemas

### Erro: "VITE_GOOGLE_APPS_SCRIPT_URL não configurada"
- Verifique se o arquivo `.env` existe e contém a URL correta
- Reinicie o servidor de desenvolvimento

### Erro: "Erro ao carregar a faixa"
- Verifique se o arquivo no Google Drive está compartilhado publicamente
- Confirme que o arquivo é um formato de áudio suportado (MP3, WAV, OGG)
- Teste a URL diretamente no navegador

### Faixas não aparecem
- Verifique se a aba "Tracks" existe na planilha
- Confirme que os cabeçalhos estão corretos
- Verifique os logs do App Script (Ver > Logs)

### Atualizar dados após mudanças na planilha
- O aplicativo busca os dados a cada 10 minutos automaticamente
- Para forçar atualização imediata, recarregue a página

## Estrutura de Arquivos do Projeto

```
src/
├── hooks/
│   └── useGooglePlaylist.ts    # Hook que busca dados do Google Sheets
├── components/
│   └── SpotifyPlayer.tsx       # Player de música
└── pages/
    └── Index.tsx               # Página principal
```

## Formato de URL do Google Drive

O sistema aceita três formatos:
1. **ID do arquivo**: `1a2b3c4d5e6f7g8h9i0j`
2. **URL completa**: `https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view`
3. **URL de download direto**: `https://drive.google.com/uc?export=download&id=1a2b3c4d5e6f7g8h9i0j`

Todos os formatos são convertidos automaticamente para URL de download direto.
