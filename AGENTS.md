# MeliPrinter — Guía para Agentes de IA

## Stack

- **Runtime**: Node.js 22+ (ESM, `"type": "module"`)
- **Framework**: Express 4.x
- **Impresión**: `node-thermal-printer` v4 + driver Windows nativo (PowerShell `copy /b`)
- **Compilación**: SEA (Single Executable Application) de Node.js

## Arquitectura

### Flujo de una petición

```
HTTP POST /ticket/invoice/:ruc
  → index.js: express route handler
  → print.js: printTicket(printer, body, enterprise, clientData)
  → printer-driver.js: printDirect() → cmd /c copy /b → Windows RAW printer
```

### Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/index.js` | Entry point. Crea Express app, registra rutas, inicia servidor. |
| `src/enterprises.js` | Datos de todas las empresas. Cada RUC tiene header, términos, flags. |
| `src/print.js` | Funciones de impresión. Cada tipo de ticket tiene su función (printTicket, printCourier, etc.). |
| `src/printer-driver.js` | Driver de impresión Windows nativo. Reemplaza al paquete `printer` (roto con Node 24). |
| `src/numeroALetra.js` | Convierte números a letras en español. |
| `src/updater.js` | Verifica GitHub Releases para auto-update. |
| `scripts/build.js` | Compila .exe usando SEA de Node.js + postject. |

## Patrones

### 1. Rutas Express con async/await

Todas las rutas usan `asyncHandler` wrapper para capturar errores:

```js
app.post('/ticket/invoice/:ruc', asyncHandler(async (req, res) => {
  const enterprise = getEnterprise(req.params.ruc);
  if (!enterprise) return res.status(404).json({ error: 'No encontrada' });
  await printTicket(printer, parseBody(req), enterprise, clientData);
  res.send('<h1>UNO SAN</h1>');
}));
```

### 2. Enterprise configs

Cada empresa se define como objeto con:

```js
'20608151771': {
  name: 'ANGEL DIVINO BUS',
  header: (b) => [...],        // Función que recibe body, retorna líneas
  invoiceLabel: { boleta, factura, vale },
  useEmbarkTime: true,         // Flag para formato especial
  extraFields: ['operation_code', 'observation'],
  terms: ['Término 1', ...],
}
```

### 3. Print templates

`print.js` tiene funciones específicas para cada tipo de documento:

- `printTicket()` — Boleto/factura genérico
- `printImperialTicket()` — Boleto IMPERIAL (sección de control duplicada)
- `printCourier()` — Encomiendas
- `printCourierGeneric()` — Courier genérico (configurable por RUC)
- `printMoneyTransfer()` — Giros
- `printLogistics()` / `printBudget()` — Logística
- `printShippingOrder()` / `printGrt()` — Guías de remisión
- `printCreditNote()` — Nota de crédito

### 4. Printer driver

Reemplaza al paquete `printer@0.4.0` (incompatible con Node 24). Usa:

- `Get-CimInstance Win32_Printer` (PowerShell) para obtener impresora por defecto
- `cmd /c copy /b` para enviar datos RAW a `\\localhost\NOMBRE_IMPRESORA`

## Convenciones

- **ESM siempre**: Usar `import`/`export`, no `require` (excepto `node-thermal-printer` via `createRequire`)
- **async/await**: Preferir sobre callbacks
- **Errores**: Capturar con try/catch en funciones de impresión, responder 500 con JSON
- **Logging**: `console.log` con tags `[tag] mensaje`
- **Header de empresa**: Array de objetos `{ text, bold?, align?, size? }`

## Cómo añadir una nueva empresa

1. Agregar entrada en `src/enterprises.js` con su RUC como key
2. Definir `header`, `invoiceLabel`, `terms`, `extraFields`, flags
3. La ruta `POST /ticket/invoice/:ruc` ya funciona automáticamente

## Cómo añadir un nuevo tipo de ticket

1. Crear función en `src/print.js` (ej: `printNuevoTicket(printer, body, ...)`)
2. Registrar ruta en `src/index.js`
3. Usar `asyncHandler` para el route handler

## Compilación .exe

```bash
npm run build
```

Proceso:
1. `esbuild` bundlea todo `src/` a `dist/bundle.js`
2. `node --experimental-sea-config` genera SEA blob
3. `postject` inyecta blob en `node.exe` → `meliprinter.exe`
4. Copia módulos nativos a `dist/modules/`

El .exe resultante necesita `modules/` junto a él para los native addons.

## Notas técnicas

- **`node-thermal-printer`**: Se importa con `createRequire` porque es CJS
- **`additional_data.js`**: Es ESM (`export { client_data }`), se carga con `import()` dinámico
- **Impresora por defecto**: Se obtiene al iniciar, no cambia en caliente
- **Timeout de impresión**: 30 segundos vía `cmd /c copy /b`
