/**
 * App Script para expor dados da planilha do Google Sheets
 * como API JSON para o player de música
 *
 * INSTRUÇÕES DE USO:
 * 1. Crie uma planilha no Google Sheets com duas abas: "Config" e "Tracks"
 * 2. Abra Extensões > Apps Script
 * 3. Cole este código
 * 4. Clique em Implantar > Nova implantação > Aplicativo da Web
 * 5. Configure "Quem tem acesso" como "Qualquer pessoa"
 * 6. Copie a URL gerada e cole no arquivo .env do projeto
 */

function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Buscar dados da aba "Config"
    const configSheet = spreadsheet.getSheetByName("Config");
    const config = getConfigData(configSheet);

    // Buscar dados da aba "Thumb" (mapeamento de artista para imagem)
    const thumbSheet = spreadsheet.getSheetByName("Thumb");
    const thumbMap = getThumbData(thumbSheet);

    // Buscar dados da aba "Tracks"
    const tracksSheet = spreadsheet.getSheetByName("Tracks");
    const tracks = getTracksData(tracksSheet, thumbMap);

    // Montar resposta JSON
    const response = {
      playlistTitle: config.playlistTitle || "MMG - Festa dos Tabernáculos",
      playlistDescription: config.playlistDescription || "Playlist de vozes para ensaio das Músicas de Tabernáculos.",
      coverUrl: config.coverUrl || "https://i.pinimg.com/736x/ec/9b/b2/ec9bb2fde5e3cbba195ee0db0e3d2576.jpg",
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
        coverUrl: "https://i.pinimg.com/736x/ec/9b/b2/ec9bb2fde5e3cbba195ee0db0e3d2576.jpg",
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
 * Busca mapeamento de artista para imagem da aba "Thumb"
 * Formato esperado:
 *   Linha 1: Cabeçalhos (Voz/Artista, Valor)
 *   Linhas seguintes: Mapeamento artista -> URL da imagem
 */
function getThumbData(sheet) {
  const thumbMap = {};

  if (!sheet) {
    Logger.log("Aba 'Thumb' não encontrada");
    return thumbMap;
  }

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log("Nenhum mapeamento de thumb encontrado");
    return thumbMap;
  }

  // Primeira linha são os cabeçalhos
  const headers = data[0].map(h => h.toString().toLowerCase());

  // Encontrar índices das colunas
  const artistIndex = headers.findIndex(h =>
    h.includes("voz") || h.includes("artista")
  );
  const valueIndex = headers.findIndex(h =>
    h.includes("valor") || h.includes("url") || h.includes("imagem")
  );

  // Processar cada linha de dados
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const artist = artistIndex >= 0 ? row[artistIndex]?.toString().trim() : "";
    const value = valueIndex >= 0 ? row[valueIndex]?.toString().trim() : "";

    // Cria o mapeamento
    if (artist && value) {
      thumbMap[artist] = value;
    }
  }

  Logger.log(`Total de mapeamentos de thumb: ${Object.keys(thumbMap).length}`);
  return thumbMap;
}

/**
 * Busca dados das faixas da aba "Tracks"
 * Formato esperado:
 *   Linha 1: Cabeçalhos (Título, URL, Voz/Artista)
 *   Linhas seguintes: Dados das faixas
 */
function getTracksData(sheet, thumbMap) {
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
  const tomIndex = headers.findIndex(h =>
    h.includes("tom")
  );
  const pautaIndex = headers.findIndex(h =>
    h.includes("pauta") || h.includes("cifra")
  );

  // Processar cada linha de dados
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const title = titleIndex >= 0 ? row[titleIndex]?.toString().trim() : "";
    const url = urlIndex >= 0 ? row[urlIndex]?.toString().trim() : "";
    const artist = artistIndex >= 0 ? row[artistIndex]?.toString().trim() : "";
    const tom = tomIndex >= 0 ? row[tomIndex]?.toString().trim() : "";
    const pauta = pautaIndex >= 0 ? row[pautaIndex]?.toString().trim() : "";

    // Adiciona se tiver título (URL é opcional para faixas de cifra)
    if (title) {
      const track = {
        id: `track-${i}`,
        title: title,
        artist: artist || undefined,
        order: i - 1
      };

      // Adiciona URL apenas se existir
      if (url) {
        track.url = url;
      }

      // Se existe um mapeamento de thumb para este artista, adiciona a coverUrl
      if (artist && thumbMap[artist]) {
        track.coverUrl = thumbMap[artist];
      }

      // Adiciona tom e pauta se existirem
      if (tom) {
        track.tom = tom;
      }
      if (pauta) {
        track.pauta = pauta;
      }

      tracks.push(track);
    }
  }

  Logger.log(`Total de faixas encontradas: ${tracks.length}`);
  return tracks;
}

/**
 * Função para testar o script manualmente
 * Vá em Executar > Executar função > testScript
 */
function testScript() {
  const result = doGet();
  Logger.log(result.getContent());
}
