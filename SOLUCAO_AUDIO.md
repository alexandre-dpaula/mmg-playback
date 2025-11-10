# Solução para Reprodução de Áudio

## Problema Atual

O Google Drive tem restrições CORS (Cross-Origin Resource Sharing) que impedem a reprodução direta de arquivos de áudio em navegadores web de outros domínios.

## ⚠️ Limitações do Google Drive

Mesmo com arquivos públicos, o Google Drive:
- Bloqueia requisições de áudio cross-origin
- Não permite streaming direto para players HTML5
- Exige autenticação ou API keys para acesso programático

## ✅ Soluções Recomendadas

### Opção 1: Hospedagem Alternativa (Mais Confiável)

**Serviços gratuitos para hospedar arquivos de áudio:**

1. **GitHub** (Melhor opção!)
   - Crie um repositório público
   - Faça upload dos arquivos MP3
   - Use a URL raw do GitHub
   - Exemplo: `https://raw.githubusercontent.com/usuario/repo/main/audio.mp3`
   - ✅ Sem limite de largura de banda
   - ✅ Sem restrições CORS
   - ✅ Confiável e rápido

2. **Internet Archive** (https://archive.org)
   - Upload gratuito
   - URLs diretas funcionam
   - Ideal para arquivos maiores

3. **Dropbox**
   - Compartilhe o arquivo
   - Troque `www.dropbox.com` por `dl.dropboxusercontent.com`
   - Troque `?dl=0` por `?dl=1`

### Opção 2: Google Drive com Apps Script Proxy

**Limitações:**
- Arquivos até 10MB
- Pode ser lento
- Consome cota do Apps Script

**Como implementar:**
1. Use o arquivo `AppScript-Proxy.gs`
2. Substitua o código atual no Apps Script
3. Faça nova implantação

### Opção 3: Converter para Base64 (Apenas para arquivos pequenos)

**Limitações:**
- Apenas para áudios muito pequenos (< 1MB)
- Aumenta o tamanho do arquivo em ~33%
- Não recomendado

## 🎯 Solução Recomendada: GitHub

### Passo a Passo:

1. **Criar Repositório no GitHub:**
   ```bash
   # Criar novo repositório público
   # Nome sugerido: mmg-ensaios-audio
   ```

2. **Fazer Upload dos Arquivos:**
   - Acesse o repositório
   - Clique em "Add file" > "Upload files"
   - Faça upload dos arquivos MP3

3. **Obter URL Direta:**
   - Clique no arquivo MP3
   - Clique em "Raw"
   - Copie a URL (será algo como):
   ```
   https://raw.githubusercontent.com/usuario/mmg-ensaios-audio/main/cancao-ao-cordeiro.mp3
   ```

4. **Atualizar a Planilha:**
   - Cole a URL do GitHub na coluna "URL"
   - O sistema funcionará automaticamente!

## 📝 Exemplo de Estrutura do Repositório GitHub

```
mmg-ensaios-audio/
├── README.md
├── soprano/
│   ├── cancao-ao-cordeiro.mp3
│   └── hinei-ma-tov.mp3
├── tenor/
│   ├── cancao-ao-cordeiro.mp3
│   └── hinei-ma-tov.mp3
└── baixo/
    ├── cancao-ao-cordeiro.mp3
    └── hinei-ma-tov.mp3
```

## 🔄 Atualização da Planilha

Após hospedar no GitHub, atualize a planilha:

| Título | URL | Voz/Artista |
|--------|-----|-------------|
| Canção ao Cordeiro | https://raw.githubusercontent.com/usuario/repo/main/soprano/cancao.mp3 | Soprano |
| Hinei Ma Tov | https://raw.githubusercontent.com/usuario/repo/main/soprano/hinei.mp3 | Soprano |

## ⚡ Por que GitHub é Melhor?

1. **Gratuito** e ilimitado para repositórios públicos
2. **Sem restrições CORS** - funciona perfeitamente
3. **Confiável** - 99.9% de uptime
4. **Versionamento** - histórico de alterações
5. **Fácil de gerenciar** - interface web ou git
6. **Rápido** - CDN global do GitHub

## 🛠️ Alternativa: Se Realmente Quiser Usar o Google Drive

O código atual tenta extrair o ID do arquivo. Para funcionar minimamente, você precisaria:

1. Implementar o Apps Script Proxy (arquivo `AppScript-Proxy.gs`)
2. Modificar o player para usar o proxy
3. Aceitar as limitações de tamanho e performance

**Mas honestamente, usar GitHub é 100x melhor!**
