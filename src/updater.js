import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

export function getCurrentVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

export async function checkForUpdates() {
  const current = getCurrentVersion();
  console.log(`[Updater] Versión actual: ${current}`);

  try {
    const res = await fetch(
      'https://api.github.com/repos/KhanMaytok/print-ticket/releases/latest',
      { signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      console.log('[Updater] No se pudo verificar actualización');
      return null;
    }

    const release = await res.json();
    const latest = release.tag_name.replace(/^v/, '');

    if (compareVersions(latest, current) > 0) {
      console.log(`[Updater] Nueva versión disponible: ${latest}`);
      return {
        version: latest,
        url: release.html_url,
        downloadUrl: release.assets?.[0]?.browser_download_url || null,
        notes: release.body || '',
      };
    }

    console.log('[Updater] Ya tienes la última versión');
    return null;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
      console.log('[Updater] Sin conexión a internet, se omite actualización');
    } else {
      console.error('[Updater] Error al verificar actualización:', err.message);
    }
    return null;
  }
}

export async function downloadUpdate(downloadUrl, version) {
  if (!downloadUrl) {
    console.log('[Updater] No hay asset para descargar. Ve a:', `https://github.com/KhanMaytok/print-ticket/releases/tag/v${version}`);
    return null;
  }

  const tmpDir = join(root, '.update');
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const zipPath = join(tmpDir, `meliprinter-${version}.zip`);

  console.log(`[Updater] Descargando ${version}...`);
  const res = await fetch(downloadUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(zipPath, buffer);
  console.log('[Updater] Descarga completa');

  return zipPath;
}

export function createUpdateScript(version) {
  const scriptPath = join(root, 'actualizar.bat');
  const content = `@echo off
title ACTUALIZANDO MELIPRINTER a v${version}
echo Cerrando instancias anteriores...
taskkill /f /im meliprinter.exe 2>nul
taskkill /f /im node.exe 2>nul
echo Instalando actualizacion...
cd /d "%~dp0"
git stash
git pull origin master
npm install
echo Actualizacion completada a v${version}
pause
`;
  writeFileSync(scriptPath, content, 'utf-8');
  console.log('[Updater] Script de actualización generado');
  return scriptPath;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}
