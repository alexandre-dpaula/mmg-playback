/**
 * App Script COM PROXY de áudio para Google Drive
 * Este script serve tanto os metadados quanto faz proxy dos arquivos de áudio
 * para contornar problemas de CORS do Google Drive
 *
 * INSTRUÇÕES:
 * 1. Substitua o código anterior por este
 * 2. Faça uma nova implantação (Nova versão)
 * 3. A URL permanece a mesma
 */

function doGet(e) {
  // Se for requisição de proxy de áudio
  if (e.parameter.fileId) {
    return proxyAudioFile(e.parameter.fileId);
  }

  // Se não, retorna os metadados da playlist
  return getPlaylistMetadata();
}

/**
 * Retorna os metadados da playlist (mesma função anterior)
 */
function getPlaylistMetadata() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = spreadsheet.getSheetByName("Config");
    const config = getConfigData(configSheet);
    const tracksSheet = spreadsheet.getSheetByName("Tracks");
    const tracks = getTracksData(tracksSheet);

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
 * Faz proxy de arquivo de áudio do Google Drive
 * Isso contorna problemas de CORS
 */
function proxyAudioFile(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();

    return ContentService
      .createTextOutput(Utilities.base64Encode(blob.getBytes()))
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    Logger.log("Erro ao fazer proxy do arquivo: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
 * Retorna os dados das faixas com URLs de proxy
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

  const headers = data[0].map(h => h.toString().toLowerCase());

  const titleIndex = headers.findIndex(h =>
    h.includes("titulo") || h.includes("título") || h.includes("nome") || h.includes("faixa")
  );
  const urlIndex = headers.findIndex(h =>
    h.includes("url") || h.includes("link")
  );
  const artistIndex = headers.findIndex(h =>
    h.includes("voz") || h.includes("cantor") || h.includes("artista")
  );

  // Pega a URL deste script para criar URLs de proxy
  const scriptUrl = ScriptApp.getService().getUrl();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const title = titleIndex >= 0 ? row[titleIndex]?.toString().trim() : "";
    const url = urlIndex >= 0 ? row[urlIndex]?.toString().trim() : "";
    const artist = artistIndex >= 0 ? row[artistIndex]?.toString().trim() : "";

    if (title && url) {
      // Extrai o ID do arquivo do Drive
      const fileIdMatch = url.match(/[-\w]{25,}/);

      if (fileIdMatch) {
        const fileId = fileIdMatch[0];

        tracks.push({
          id: `track-${i}`,
          title: title,
          url: url, // URL original do Drive
          driveId: fileId, // ID do arquivo
          artist: artist || undefined,
          order: i - 1
        });
      }
    }
  }

  Logger.log(`Total de faixas encontradas: ${tracks.length}`);
  return tracks;
}

function testScript() {
  const result = getPlaylistMetadata();
  Logger.log(result.getContent());
}
