import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const version = {
  version: Date.now().toString(),
  timestamp: Date.now(),
  build: new Date().toISOString()
};

const versionPath = join(__dirname, '../public/version.json');
writeFileSync(versionPath, JSON.stringify(version, null, 2));

console.log('✅ Versão atualizada:', version);
