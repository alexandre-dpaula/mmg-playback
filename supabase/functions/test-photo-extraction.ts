// Script de teste para verificar extração de foto do artista

const html = `
<div id="side-menu">
  <img src="https://akam.cdn.juno.rocks/artist-images/abc123/julliany-souza.jpg" alt="Julliany Souza">
</div>
`;

// Procurar pela imagem do artista
const patterns = [
  // Padrão 1: img dentro de #side-menu
  /<div[^>]+id="side-menu"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
  // Padrão 2: img com akam ou cdn
  /<img[^>]+src="(https:\/\/[^"]*(?:akam|cdn)[^"]+\.(?:jpg|jpeg|png|webp))"/i,
  // Padrão 3: img dentro de side-menu (class)
  /<div[^>]+class="[^"]*side-menu[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
];

for (const pattern of patterns) {
  const match = html.match(pattern);
  if (match && match[1]) {
    console.log('✅ Foto encontrada:', match[1]);
    break;
  }
}
