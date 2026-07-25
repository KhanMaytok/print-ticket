# MeliPrinter

Servidor de impresión térmica para tickets de buses — reescrito en C# (.NET Core 3.1) como single-file executable.

## Requisitos

- Windows 7+ (x64)
- Impresora térmica EPSON (o compatible con ESC/POS) instalada como predeterminada
- .NET Core 3.1 Runtime **solo si usas el framework-dependent**. Si usas el self-contained publish no necesitas nada.

## Compilar

```powershell
dotnet publish MeliPrinter\MeliPrinter.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o dist
```

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

Editar `version.txt` para cambiar la versión reportada.
