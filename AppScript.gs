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

const SPREADSHEET_ID = "11vl4pBX-XOQCpRZdzbRPGwSR9xGP2ai4TS_14qtwYxc";

function getSpreadsheet() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    return active;
  }

  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  throw new Error("Planilha não encontrada. Defina SPREADSHEET_ID.");
}

function doGet(e) {
  try {
    const spreadsheet = getSpreadsheet();

    // Buscar dados da aba "Config"
    const configSheet = spreadsheet.getSheetByName("Config");
    const config = getConfigData(configSheet);

    // Buscar dados da aba "Thumb" (mapeamento de categoria para imagem)
    const thumbSheet = spreadsheet.getSheetByName("Thumb");
    const thumbMap = getThumbData(thumbSheet);

    // Buscar dados da aba "Tracks"
    const tracksSheet = spreadsheet.getSheetByName("Tracks");
    const tracks = getTracksData(tracksSheet);

    // Montar resposta JSON
    const response = {
      playlistTitle: config.playlistTitle || "MMG - Festa dos Tabernáculos",
      playlistDescription: config.playlistDescription || "Playlist de vozes para ensaio das Músicas de Tabernáculos.",
      coverUrl: config.coverUrl || "",
      tracks: tracks,
      thumbs: thumbMap
    };

    return withCors(ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON));

  } catch (error) {
    Logger.log("Erro: " + error.toString());
    return withCors(ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString(),
        playlistTitle: "MMG - Festa dos Tabernáculos",
        playlistDescription: "Playlist de vozes para ensaio das Músicas de Tabernáculos.",
        coverUrl: "",
        tracks: []
      }))
      .setMimeType(ContentService.MimeType.JSON));
  }
}

/**
 * Handler para requisições OPTIONS (preflight CORS).
 */
function doOptions() {
  return withCors(
    ContentService.createTextOutput("")
      .setMimeType(ContentService.MimeType.TEXT)
  );
}

/**
 * Recebe dados via POST e adiciona uma nova faixa na aba "Tracks"
 * Também atualiza o campo playlistTitle na aba "Config", se enviado.
 *
 * Formato esperado do payload JSON:
 * {
 *   "playlistTitle": "Evento MMG",
 *   "title": "Hinei Ma Tov",
 *   "versao": "Playback",
 *   "tom": "E",
 *   "url": "https://drive.google.com/...",
 *   "tag": "Vocal",
 *   "pauta": "https://docs.google.com/..."
 * }
 */
function doPost(e) {
  try {
    const payload = parseRequestPayload(e);

    if (!payload) {
      throw new Error("Payload inválido ou ausente.");
    }

    const spreadsheet = getSpreadsheet();
    const result = addTrackEntry(spreadsheet, payload);

    return createJsonResponse({
      success: true,
      message: "Faixa adicionada com sucesso.",
      rowNumber: result.rowNumber,
    });
  } catch (error) {
    Logger.log("Erro no doPost: " + error.toString());
    return createJsonResponse({
      success: false,
      message: error.toString(),
    });
  }
}

/**
 * Lê o payload enviado no POST.
 */
function parseRequestPayload(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (parseError) {
      Logger.log("Erro ao parsear payload JSON: " + parseError);
      throw new Error("Não foi possível ler o payload JSON enviado.");
    }
  }

  if (e && e.parameter && e.parameter.payload) {
    try {
      return JSON.parse(e.parameter.payload);
    } catch (parseError) {
      Logger.log("Erro ao parsear payload (parameter): " + parseError);
      throw new Error("Não foi possível ler o payload enviado via parâmetro.");
    }
  }

  return null;
}

/**
 * Gera uma resposta JSON padronizada.
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return withCors(output);
}

function withCors(output) {
  return output
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
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
 * Busca mapeamento de categoria para imagem da aba "Thumb"
 * Formato esperado:
 *   Linha 1: Cabeçalhos (Categoria, Valor)
 *   Linhas seguintes: Mapeamento categoria (Vocal, Instrumental, Cifras) -> URL da imagem
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
  const categoryIndex = headers.findIndex(h =>
    h.includes("categoria") || h.includes("tipo") || h.includes("filtro")
  );
  const valueIndex = headers.findIndex(h =>
    h.includes("valor") || h.includes("url") || h.includes("imagem")
  );

  // Processar cada linha de dados
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const category = categoryIndex >= 0 ? row[categoryIndex]?.toString().trim() : "";
    const value = valueIndex >= 0 ? row[valueIndex]?.toString().trim() : "";

    // Cria o mapeamento (capitaliza a categoria para padronizar)
    if (category && value) {
      thumbMap[category] = value;
    }
  }

  Logger.log(`Total de mapeamentos de thumb: ${Object.keys(thumbMap).length}`);
  return thumbMap;
}

/**
 * Retorna a URL de um valor RichText (inclui hyperlinks parciais).
 */
function getLinkFromRichText(richValue) {
  if (!richValue) {
    return "";
  }

  if (typeof richValue.getLinkUrl === "function") {
    const link = richValue.getLinkUrl();
    if (link) {
      return link;
    }
  }

  if (typeof richValue.getRuns === "function") {
    const runs = richValue.getRuns();
    if (runs && runs.length) {
      for (let i = 0; i < runs.length; i++) {
        const runLink = runs[i].getLinkUrl();
        if (runLink) {
          return runLink;
        }
      }
    }
  }

  return "";
}

/**
 * Obtém o valor textual de uma célula e, se preferido, extrai o hyperlink real.
 */
function getCellValue(row, rowRich, index, options) {
  const opts = options || {};
  if (index < 0) {
    return "";
  }

  const rawValue = row[index];
  const stringValue = rawValue !== null && rawValue !== undefined
    ? rawValue.toString().trim()
    : "";

  if (opts.preferLink && rowRich && rowRich[index]) {
    const linkValue = getLinkFromRichText(rowRich[index]);
    if (linkValue) {
      return linkValue.trim();
    }
  }

  return stringValue;
}

/**
 * Busca dados das faixas da aba "Tracks"
 * Formato esperado:
 *   Linha 1: Cabeçalhos (Título, URL, Tag, Versão, Tom, Pauta/Cifra)
 *   Linhas seguintes: Dados das faixas
 */
function getTracksData(sheet) {
  const tracks = [];

  if (!sheet) {
    Logger.log("Aba 'Tracks' não encontrada");
    return tracks;
  }

  const range = sheet.getDataRange();
  const data = range.getValues();
  const richData = range.getRichTextValues();

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
  const tagIndex = headers.findIndex(h =>
    h.includes("tag")
  );
  const versaoIndex = headers.findIndex(h =>
    h.includes("versão") || h.includes("versao") || h.includes("version")
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
    const rowRich = richData[i] || [];

    const title = getCellValue(row, rowRich, titleIndex);
    const url = getCellValue(row, rowRich, urlIndex, { preferLink: true });
    const artist = getCellValue(row, rowRich, artistIndex);
    const tag = getCellValue(row, rowRich, tagIndex);
    const versao = getCellValue(row, rowRich, versaoIndex);
    const tom = getCellValue(row, rowRich, tomIndex);
    const pauta = getCellValue(row, rowRich, pautaIndex, { preferLink: true });

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

      // Adiciona tag e versao se existirem
      if (tag) {
        track.tag = tag;
      }
      if (versao) {
        track.versao = versao;
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

/**
 * Adiciona uma nova faixa na aba "Tracks" e atualiza o título do evento se informado.
 */
function addTrackEntry(spreadsheet, payload) {
  const cleaned = sanitizeIncomingPayload(payload);

  if (!cleaned.title) {
    throw new Error("Campo 'title' é obrigatório.");
  }

  if (!cleaned.url && !cleaned.pauta) {
    throw new Error("Informe pelo menos uma URL de áudio ou cifra.");
  }

  const configSheet = spreadsheet.getSheetByName("Config") || spreadsheet.insertSheet("Config");
  if (cleaned.playlistTitle) {
    upsertConfigValue(configSheet, "playlistTitle", cleaned.playlistTitle);
  }

  const tracksSheet = spreadsheet.getSheetByName("Tracks") || spreadsheet.insertSheet("Tracks");
  ensureTracksHeader(tracksSheet);

  const headerRow = getHeaderRow(tracksSheet);
  const newRow = buildTrackRow(tracksSheet, headerRow, cleaned);

  const rowNumber = tracksSheet.getLastRow() + 1;
  tracksSheet.getRange(rowNumber, 1, 1, newRow.length).setValues([newRow]);

  return { rowNumber: rowNumber };
}

/**
 * Garante que a aba "Tracks" tenha um cabeçalho básico.
 */
function ensureTracksHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Título", "URL", "Tag", "Versão", "Tom", "Pauta"]);
    return;
  }

  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const hasAnyHeader = header.some(function(cell) {
    return cell && cell.toString().trim().length > 0;
  });

  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, 6).setValues([["Título", "URL", "Tag", "Versão", "Tom", "Pauta"]]);
  }
}

/**
 * Retorna a primeira linha (cabeçalho) como array normalizado para lower-case.
 */
function getHeaderRow(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 6);
  const headerData = sheet.getRange(1, 1, 1, lastColumn).getValues();
  if (!headerData || !headerData.length) {
    return [];
  }
  return headerData[0].map(function(cell) {
    return cell ? cell.toString() : "";
  });
}

/**
 * Constrói a linha que será inserida na planilha respeitando os cabeçalhos existentes.
 */
function buildTrackRow(sheet, headerRow, track) {
  var headerLower = headerRow.map(function(cell) {
    return cell.toLowerCase();
  });

  var row = new Array(headerRow.length || 6).fill("");

  setValueForHeader(sheet, row, headerRow, headerLower, track.title, ["titulo", "título", "nome", "faixa"], "Título");
  setValueForHeader(sheet, row, headerRow, headerLower, track.url, ["url", "link"], "URL");
  setValueForHeader(sheet, row, headerRow, headerLower, track.tag, ["tag"], "Tag");
  setValueForHeader(sheet, row, headerRow, headerLower, track.versao, ["versão", "versao", "version"], "Versão");
  setValueForHeader(sheet, row, headerRow, headerLower, track.tom, ["tom"], "Tom");
  setValueForHeader(sheet, row, headerRow, headerLower, track.pauta, ["pauta", "cifra"], "Pauta");

  return row;
}

/**
 * Adiciona o valor ao array conforme os possíveis nomes de cabeçalhos.
 */
function setValueForHeader(sheet, row, headerRow, headers, value, keywords, defaultLabel) {
  if (!value) {
    return;
  }
  var index = findHeaderIndex(headers, keywords);
  if (index === -1) {
    // Se o cabeçalho não existir, cria uma nova coluna com rótulo padrão
    index = headers.length;
    headers.push(keywords[0]);
    headerRow.push(defaultLabel || keywords[0]);
    sheet.getRange(1, index + 1).setValue(defaultLabel || keywords[0]);
    row[index] = value;
    return;
  }
  row[index] = value;
}

/**
 * Procura o índice do cabeçalho baseado em possíveis palavras-chave.
 */
function findHeaderIndex(headers, keywords) {
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (!header) continue;
    for (var j = 0; j < keywords.length; j++) {
      if (header.indexOf(keywords[j]) !== -1) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Normaliza dados recebidos do front-end.
 */
function sanitizeIncomingPayload(payload) {
  return {
    playlistTitle: (payload.playlistTitle || payload.event || "").toString().trim(),
    title: (payload.title || "").toString().trim(),
    versao: (payload.versao || "").toString().trim(),
    tom: (payload.tom || "").toString().trim(),
    url: (payload.url || "").toString().trim(),
    tag: (payload.tag || "").toString().trim(),
    pauta: (payload.pauta || payload.cifra || "").toString().trim(),
  };
}

/**
 * Atualiza ou cria um registro na aba "Config".
 */
function upsertConfigValue(sheet, key, value) {
  if (!key || !value) {
    return;
  }

  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();

  for (var i = 0; i < data.length; i++) {
    var existingKey = data[i][0];
    if (existingKey && existingKey.toString().trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  sheet.appendRow([key, value]);
}
