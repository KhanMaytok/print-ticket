// Post-install: copy .env template if missing, create additional_data.js if missing
import { existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const envTemplate = join(root, '.env.template');
const envFile = join(root, '.env');
const additionalTemplate = join(root, 'additional_data.js.template');
const additionalFile = join(root, 'additional_data.js');

if (!existsSync(envFile) && existsSync(envTemplate)) {
  copyFileSync(envTemplate, envFile);
  console.log('[setup] .env creado desde .env.template');
}

if (!existsSync(additionalFile) && existsSync(additionalTemplate)) {
  copyFileSync(additionalTemplate, additionalFile);
  console.log('[setup] additional_data.js creado desde template');
}

console.log('[setup] Instalación completada');
