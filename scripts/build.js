import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

async function build() {
  console.log('=== BUILD MELIPRINTER ===\n');

  // Clean dist
  if (existsSync(distDir)) rmSync(distDir, { recursive: true });
  mkdirSync(distDir, { recursive: true });

  // 1. Bundle JS with esbuild (exclude native modules)
  console.log('[1/5] Bundling JS...');
  execSync(`npx esbuild src/index.js --bundle --platform=node --format=esm --outfile=${join(distDir, 'bundle.js')} --external:node-thermal-printer`, {
    cwd: root,
    stdio: 'inherit',
  });

  // 2. Create SEA config
  console.log('[2/5] Creating SEA config...');
  const seaConfig = {
    main: join(distDir, 'bundle.js'),
    output: join(distDir, 'sea-prep.blob'),
    disableExperimentalSEAWarning: true,
  };
  writeFileSync(join(distDir, 'sea-config.json'), JSON.stringify(seaConfig, null, 2));

  // 3. Generate SEA blob
  console.log('[3/5] Generating SEA blob...');
  execSync(`node --experimental-sea-config ${join(distDir, 'sea-config.json')}`, {
    cwd: root,
    stdio: 'inherit',
  });

  // 4. Copy node binary and inject blob
  console.log('[4/5] Creating executable...');
  const nodePath = process.execPath;
  const exePath = join(distDir, 'meliprinter.exe');
  copyFileSync(nodePath, exePath);

  // On Windows we need to handle signature
  try {
    execSync(`powershell -Command "Remove-Item -LiteralPath '${exePath}' -Force -ErrorAction SilentlyContinue; Add-Content -Path '${exePath}' -Value $([System.Text.Encoding]::UTF8.GetBytes('dummy'))"`, { stdio: 'ignore' });
  } catch { /* ignore */ }

  execSync(`npx postject "${exePath}" NODE_SEA_BLOB "${join(distDir, 'sea-prep.blob')}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, {
    cwd: root,
    stdio: 'inherit',
  });

  // 5. Copy native modules
  console.log('[5/5] Copying native modules...');
  const modulesDir = join(distDir, 'modules');
  mkdirSync(modulesDir, { recursive: true });

  // Copy printer native addon
  const printerDir = join(root, 'node_modules', 'printer');
  if (existsSync(printerDir)) {
    copyRecursive(printerDir, join(modulesDir, 'printer'));
  }

  // Also copy node-thermal-printer
  const thermalPrinterDir = join(root, 'node_modules', 'node-thermal-printer');
  if (existsSync(thermalPrinterDir)) {
    copyRecursive(thermalPrinterDir, join(modulesDir, 'node-thermal-printer'));
  }

  // Copy package.json for module resolution
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
  writeFileSync(join(modulesDir, 'package.json'), JSON.stringify({
    name: pkg.name,
    version: pkg.version,
    private: true,
  }, null, 2));

  // Copy logo
  if (existsSync(join(root, 'logo.png'))) {
    copyFileSync(join(root, 'logo.png'), join(distDir, 'logo.png'));
  }

  // Create launcher
  const launcher = `@echo off
title MeliPrinter v${pkg.version}
cd /d "%~dp0"
echo Iniciando MeliPrinter v${pkg.version}...
echo.
"%~dp0meliprinter.exe"
pause
`;
  writeFileSync(join(distDir, 'iniciar.bat'), launcher);

  console.log('\n=== BUILD COMPLETE ===');
  console.log(`Output: ${distDir}\\`);
  console.log(`Executable: ${exePath}`);
  console.log(`Size: ${(statSync(exePath).size / 1024 / 1024).toFixed(1)} MB`);
}

function copyRecursive(src, dest) {
  if (!existsSync(src)) return;
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.name === 'node_modules') continue;
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
