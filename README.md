# MeliPrinter

Servidor de impresión térmica para tickets de buses — reescrito en C# (.NET Core 3.1) como single-file executable.

## Requisitos

- Windows 7+ (x64)
- Impresora térmica EPSON (o compatible con ESC/POS) instalada como predeterminada
- .NET Core 3.1 Runtime **solo si usas el framework-dependent**. Si usas el self-contained publish no necesitas nada.

## Compilar

```powershell
# Self-contained (∼45 MB, no requiere runtime)
dotnet publish MeliPrinter\MeliPrinter.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o dist
```

```powershell
# Framework-dependent (∼200 KB, requiere .NET Core 3.1 Runtime)
dotnet publish MeliPrinter\MeliPrinter.csproj -c Release -r win-x64 -o dist
```

> Ejecutar desde la raíz del repositorio (`print-ticket/`).

## Ejecutar

```powershell
dist\MeliPrinter.exe
```

Por defecto corre en `http://localhost:3030`.

## Rutas

### Tickets
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ticket/invoice/:ruc` | Boleta/factura de pasaje |
| POST | `/credit-note` | Nota de crédito |
| POST | `/encomiendas` | Encomienda/courier |
| POST | `/money-transfer` | Giro/transferencia |
| POST | `/logistics` | Ticket de logística |
| POST | `/logistics/budget` | Recibo de ingresos/egresos |
| POST | `/courier/:ruc` | Encomienda genérica por RUC |
| POST | `/courier/shipping-order/20529682248` | Guía de remisión |
| POST | `/grt/20529682248` | Guía de remisión transportista |

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Estado, versión, impresora |

## Configuración

Editar `appsettings.json`:
```json
{
  "Urls": "http://0.0.0.0:3030",
  "UpdateIntervalHours": 24
}
```

Datos adicionales del cliente en `additional_data.json`.

## Versión

La versión actual se lee de `MeliPrinter/version.txt`. Para publicar una nueva:

```powershell
# 1. Actualizar version.txt (ej: "2.0.5")
# 2. Commit y tag
git add MeliPrinter/version.txt
git commit -m "bump vX.Y.Z"
git tag vX.Y.Z
git push origin sisharp --tags
# 3. GitHub Actions compila y sube MeliPrinter-vX.Y.Z.zip como Release Asset
```

## Auto-Update

Al iniciar, MeliPrinter consulta `releases/latest` en GitHub. Si hay una versión más nueva:

1. Descarga el zip del release asset (`assets[0].browser_download_url`).
2. Extrae el `MeliPrinter.exe` a `.update/`.
3. Genera `actualizar.bat` en la raíz.
4. Ejecuta el bat y se cierra.
5. El bat espera a que el proceso termine, copia el nuevo .exe y reinicia.

Variables de entorno:
- `NO_UPDATE=true` — desactiva el check de actualizaciones
- `PRINTER_NAME` — nombre de impresora específica (opcional)

> **Nota para desarrollo**: Si el binario recién compilado no refleja cambios de código, verificar con:
> ```powershell
> Select-String -Path "dist\MeliPrinter.exe" -Pattern "Descargando" -SimpleMatch
> ```
> Luego hacer `dotnet clean` y recompilar.
