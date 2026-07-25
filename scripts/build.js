import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

function copyRecursive(src, dest) {
  if (!existsSync(src)) return;
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    if (entry.isDirectory()) copyRecursive(s, d);
    else copyFileSync(s, d);
  }
}

function copyModules(srcName, destDir) {
  const src = join(root, 'node_modules', srcName);
  if (existsSync(src)) {
    copyRecursive(src, join(destDir, 'node_modules', srcName));
    // Copy all transitive deps
    const pkg = JSON.parse(readFileSync(join(src, 'package.json'), 'utf-8'));
    for (const dep of Object.keys(pkg.dependencies || {})) {
      copyModules(dep, destDir);
    }
  }
}

async function build() {
  console.log('=== BUILD MELIPRINTER ===\n');

  if (existsSync(distDir)) {
    // Kill any node.exe running from dist folder (Windows EPERM fix)
    try {
      execSync(
        `Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq '${join(distDir, 'node.exe').replace(/'/g, "''")}' } | Stop-Process -Force`,
        { shell: 'powershell', encoding: 'utf-8', timeout: 5000 }
      );
    } catch (_) { /* no process to kill */ }

    // Retry deletion up to 3 times with delay
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        rmSync(distDir, { recursive: true, force: true });
        break;
      } catch (e) {
        if (attempt === 2) throw e;
        console.log(`  [retry] Error al eliminar dist/ (intento ${attempt + 1}): ${e.message}`);
        execSync('ping -n 2 127.0.0.1 >nul', { stdio: 'ignore', timeout: 3000 });
      }
    }
  }
  mkdirSync(distDir, { recursive: true });

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));

  // 1. Bundle to CJS (externalizes native/CJS modules)
  console.log('[1/4] Bundling JS...');
  execSync(
    `npx esbuild src/index.js --bundle --platform=node --format=cjs ` +
    `--outfile=${join(distDir, 'bundle.cjs')} ` +
    `--external:node-thermal-printer`,
    { cwd: root, stdio: 'inherit' }
  );

  // 2. Copy runtime files
  console.log('[2/4] Copying runtime files...');
  copyFileSync(join(root, 'logo.png'), join(distDir, 'logo.png'));
  copyFileSync(join(root, 'additional_data.js.template'), join(distDir, 'additional_data.js.template'));

  // Create default additional_data.js
  writeFileSync(join(distDir, 'additional_data.js'),
    readFileSync(join(root, 'additional_data.js.template'), 'utf-8'));

  // Copy printer driver (must remain as separate file for native usage)
  copyFileSync(join(root, 'src', 'printer-driver.cjs'), join(distDir, 'printer-driver.cjs'));

  // 3. Copy required node_modules (native/CJS packages that can't be bundled)
  console.log('[3/4] Copying node_modules...');
  mkdirSync(join(distDir, 'node_modules'), { recursive: true });
  copyModules('node-thermal-printer', distDir);

  // 4. Create launcher
  console.log('[4/4] Creating launcher...');

  // Node.exe bundler (portable launcher)
  const batContent = `@echo off
title MeliPrinter v${pkg.version}
cd /d "%~dp0"
echo Iniciando MeliPrinter v${pkg.version}...
echo.
:: Use bundled node.exe if available
if exist "%~dp0node.exe" (
    "%~dp0node.exe" bundle.cjs
) else (
    node bundle.cjs
)
echo Presiona cualquier tecla para cerrar...
pause >nul
`;
  writeFileSync(join(distDir, 'iniciar.bat'), batContent);

  // Optional: copy node.exe for standalone use
  const nodeExe = process.execPath;
  if (existsSync(nodeExe)) {
    try {
      copyFileSync(nodeExe, join(distDir, 'node.exe'));
      console.log('  [node.exe] Copiado para uso standalone');
    } catch (e) {
      console.log('  [node.exe] No se pudo copiar:', e.message);
    }
  }

  // Size
  let totalSize = 0;
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else totalSize += statSync(p).size;
    }
  })(distDir);

  console.log(`\n=== BUILD COMPLETE ===`);
  console.log(`Carpeta: ${distDir}\\`);
  console.log(`Tamaño: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`\nPara distribuir:`);
  console.log(`  1. Copia toda la carpeta dist/ a la PC cliente`);
  console.log(`  2. Ejecuta iniciar.bat`);
  console.log(`\nPara que funcione sin Node.js instalado:`);
  console.log(`  Copia node.exe (v22+) desde tu instalacion a dist/`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
