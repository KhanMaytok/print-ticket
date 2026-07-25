# MeliPrinter — C# (.NET Core 3.1)

## Stack
- ASP.NET Core 3.1 Web API
- Newtonsoft.Json (JObject para cuerpos dinámicos)
- RawPrinterHelper (Win32 P/Invoke para impresión raw)
- ESC/POS commands generados manualmente
- PublishSingleFile=true + self-contained para .exe único

## Estructura
```
MeliPrinter/
├── Controllers/PrintController.cs    # Todas las rutas HTTP
├── Data/Enterprises.cs               # Config de 22 empresas por RUC
├── Models/Enterprise.cs              # Enterprise, HeaderItem, CourierConfig
├── Services/
│   ├── EscPosPrinter.cs              # Generación de comandos ESC/POS
│   ├── RawPrinterHelper.cs           # Envío raw a impresora Win32
│   ├── PrintService.cs               # 10 templates de impresión
│   ├── NumberToWords.cs              # Números a letras (español)
│   ├── UpdateService.cs              # Check + descarga + auto-reemplazo
│   └── ClientDataService.cs          # Carga additional_data.json
├── .github/workflows/build.yml       # CI: build + release asset on tag
├── Program.cs / Startup.cs
├── MeliPrinter.csproj
├── appsettings.json
├── additional_data.json
├── logo.png
└── version.txt
```

## Compilar
```powershell
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o dist
```
Output: `dist\MeliPrinter.exe`

## Publicar (framework-dependent, más pequeño)
```powershell
dotnet publish -c Release -r win-x64 -o dist
```
Requiere .NET Core 3.1 Runtime en la PC destino.

## Rutas mantenidas
Mismas rutas que la versión Node.js original — ver PrintController.cs.

## Actualización automática
1. Crear un tag `vX.Y.Z` → GitHub Actions corre `.github/workflows/build.yml`
2. Genera `MeliPrinter-vX.Y.Z.zip` y lo sube como Release Asset
3. Al iniciar, MeliPrinter consulta `releases/latest` vía GitHub API
4. Si hay versión más nueva, descarga el zip, extrae el .exe a `.update/`
5. Genera `actualizar.bat` que espera que el proceso muera, copia el nuevo .exe y reinicia
6. Si falla, ignora el error y arranca normalmente

Variables de entorno:
- `NO_UPDATE=true` — desactiva el check de actualizaciones

## Notas
- Las cabeceras de empresa se definen como `Func<dynamic, List<HeaderItem>>` en Enterprises.cs.
- El body de cada request se recibe como `JObject` (Newtonsoft) para mantener flexibilidad.
- ESC/POS usa code page 437 para caracteres especiales.
- QR se genera con comandos ESC/POS estándar GS (k.
- La impresora se detecta automáticamente como la predeterminada del sistema.
- El encoding 437 requiere `System.Text.Encoding.CodePages` registrado en Program.cs.

## Session State (última sesión — continuar aquí)

### Branch: `sisharp`

### Qué se hizo
- Migración completa de Node.js a C# (.NET Core 3.1) con todas las rutas, 22 empresas, 10 templates de impresión.
- Sistema de auto-update implementado en `UpdateService.cs`:
  - `CheckForUpdates()` consulta GitHub API → `releases/latest`
  - Prioriza `assets[0].browser_download_url` sobre `zipball_url` (fix aplicado)
  - `DownloadAndApplyUpdate()` descarga zip, extrae a `.update/`, genera `actualizar.bat`
  - `RestartWithUpdate()` ejecuta el bat y mata el proceso
  - `ApplyUpdateAndRestart()` (invocado via `--apply-update`) hace swap por PowerShell
- Form URL-encoded parsing con `ParseBody()` + `SetNestedValue()` para claves anidadas tipo `embark[date]`.
- CI en `.github/workflows/build.yml`: tag `v*` → build → zip → release asset.
- Release **v2.0.4** subida a GitHub con zip correcto (40.9 MB, contiene `MeliPrinter.exe` + config).
- `dist/MeliPrinter.exe` compilado con código actualizado (confirmado: strings `Descargando`, `desde`, `CompareVersions` presentes en el binario).

### Estado actual
- Al iniciar, MeliPrinter busca updates. Si encuentra v2.0.4, descarga el zip, extrae el .exe a `.update/`, genera `actualizar.bat` en el directorio base.
- `actualizar.bat` espera en un loop (`:wait`) hasta que el proceso MeliPrinter.exe termine, entonces copia el nuevo .exe y reinicia.
- **Pendiente**: Prueba E2E completa del flujo de actualización:
  1. Ejecutar `dist\MeliPrinter.exe`
  2. Ver en consola que detecta v2.0.4, descarga, extrae y genera `actualizar.bat`
  3. Cerrar/terminar el proceso (Ctrl+C o Taskkill)
  4. Verificar que `actualizar.bat` completa el swap y reinicia con la nueva versión
  5. Verificar que `version.txt` se actualizó a `2.0.4`

### Cómo comprobar estado del binario
```powershell
Select-String -Path "dist\MeliPrinter.exe" -Pattern "Descargando" -SimpleMatch
```
Si aparece la string, el binario tiene el código nuevo.

### Cómo publicar nueva versión
```powershell
# 1. Actualizar MeliPrinter\version.txt
# 2. Hacer commit + tag
git add MeliPrinter/version.txt && git commit -m "bump vX.Y.Z"
git tag vX.Y.Z
git push origin sisharp --tags
# 3. GitHub Actions compila y sube release asset automáticamente
```

### Variables de entorno relevantes
- `NO_UPDATE=true` — desactiva el check de actualizaciones al inicio
- `PRINTER_NAME` — nombre de impresora específica (si no se usa la predeterminada)
