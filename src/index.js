import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const require = createRequire(import.meta.url);

import printerDriver from './printer-driver.js';
const { printer: ThermalPrinter, types: PrinterTypes } = require('node-thermal-printer');

import { getEnterprise } from './enterprises.js';
import {
  printTicket, printCourier, printMoneyTransfer, printLogistics, printBudget,
  printCourierGeneric, printShippingOrder, printGrt, printCreditNote,
  printImperialTicket,
} from './print.js';
import { checkForUpdates, createUpdateScript, getCurrentVersion } from './updater.js';

// --- Init ---
const PORT = process.env.PORT || 3030;
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL) || 86400000; // 24h
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {

// --- Config files ---
if (!existsSync(join(root, 'additional_data.js'))) {
  copyFileSync(join(root, 'additional_data.js.template'), join(root, 'additional_data.js'));
  console.log('[setup] additional_data.js created from template');
}

const clientData = (await import(pathToFileURL(join(root, 'additional_data.js')).href)).client_data;

// --- Printer ---
const defaultPrinterName = printerDriver.getDefaultPrinterName();
console.log(`[printer] Impresora por defecto: ${defaultPrinterName}`);

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: `printer:${defaultPrinterName}`,
  driver: printerDriver,
  options: { timeout: 5000 },
});

// --- Helper ---
function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
}

async function handlePrintError(res, err, context = '') {
  console.error(`[print] Error ${context}:`, err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Error de impresión', detail: err.message });
  }
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => handlePrintError(res, err));
  };
}

// === TICKET ROUTES ===

app.post('/ticket/invoice/:ruc', asyncHandler(async (req, res) => {
  const { ruc } = req.params;
  const enterprise = getEnterprise(ruc);
  if (!enterprise) {
    return res.status(404).json({ error: `Empresa no encontrada: ${ruc}` });
  }

  const body = parseBody(req);
  console.log(`[ticket] ${ruc} - ${body.serie}-${body.number}`);

  if (ruc === '20603446004') {
    await printImperialTicket(printer, body, enterprise, clientData);
  } else {
    await printTicket(printer, body, enterprise, clientData);
  }
  res.send('<h1>UNO SAN</h1>');
}));

// === OTHER PRINT ROUTES ===

app.post('/credit-note', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[credit-note]');
  await printCreditNote(printer, body, clientData);
  res.send('<h1>PRINTED TICKET</h1>');
}));

app.post('/money-transfer/', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[money-transfer]');
  await printMoneyTransfer(printer, body, clientData);
  res.send('<h1>UNO SAN</h1>');
}));

app.post('/logistics/', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[logistics]');
  await printLogistics(printer, body);
  res.send('<h1>UNO SAN</h1>');
}));

app.post('/logistics/budget', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[logistics/budget]');
  await printBudget(printer, body);
  res.send('<h1>UNO SAN</h1>');
}));

app.post('/encomiendas/', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[encomiendas]');
  await printCourier(printer, body, clientData);
  res.send('<h1>UNO SAN</h1>');
}));

// Courier routes
const courierConfigs = {
  '20608151771': (inv) => ({
    title: inv.enterprise_name,
    contact: 'Ventas internet autorizados Chiclayo: 958842029 |954909021| 942057662| 907758392',
    warnings: '',
    extraFooter: 'DECLARACIÓN JURADA DE TRANSPORTE\nEn mérito a la Ley del Procedimiento Administrativo General, Ley Nº 27444; declaro que las mercancías amparadas en el presente comprobante, están siendo transportadas bajo mi cuenta y riesgo.\nUSTED ESTÁ ACEPTANDO LAS CONDICIONES DE ENVIO DEL COMPROBANTE QUE SE LE ENTREGÓ\nVerifique las condiciones condiciones generales del servicio al reverso del comprobante\n¡Gracias por su preferencia ANGEL DIVINO más cerca de Ud….!',
  }),
  '20395419715': (inv) => ({
    title: inv.enterprise_name,
    contact: '',
    rucLine: `R.U.C. ${inv.enterprise_ruc}`,
    warnings: '',
    extraFooter: 'RECOMENDACIONES\nRECOJO : DNI ORIGINAL\nCLAVE  : 4 DIGITOS\nPAQUETE : EMBALADO\nSU ENCOMIENDA NO HA SIDO VERIFICADA; VIAJA POR CUENTA DEL REMITENTE\nSU ENCOMIENDA Y/O CARGA VIAJA CON UN SEGURO ESTÁNDAR QUE EN CASO DE PERDIDA, EXTRAVIO, AVERIA, DETERIORO O ROBO CUBRE UN MONTO HASTA 10 VECES DEL VALOR DEL FLETE PAGADO. DECRETO SUPREMO Nº 032-2005-MTC.',
  }),
  '20529682248': (inv) => ({
    title: 'Transportes El Crucero de Jaén S.A.C',
    rucLine: 'RUC: 20529682248',
    extraLines: ['Avenida Mesones Muro 642 Aromo Alto Jaén'],
    contact: 'Ventas whatsapp: 977726252\nAtención al cliente: 980 845 273 - 963 450 965',
    warnings: 'USTED NO CONTRATO EL SERVICIO DE GARANTIA\nCuenta con una COBERTURA máxima hasta 10 veces el valor del flete sobre el envío afectado.\n(Cobertura no aplicable si el daño sufrido fue propio del mal embalaje)\nRecibido sin verificación de contenido',
    extraFooter: 'EMBALAJE INAPROPIADO ASUMO CUALQUIER DAÑO QUE PUDIESE SUFRIR DURANTE SU TRASLADO - ' + inv.sender + '\nEL REMITENTE ACEPTA EL TRASLADO DEL ENVÍO PARA EL ' + inv.created_at + '\nIMPORTANTE\nEl remitente será responsable de la veracidad de los datos y del contenido brindados . Plazo para el retiro de envío: hasta 48 horas posteriores a su llegada . Cobro de almacenaje . Custodia máximo por 30 días posteriores a su llegada . Abandono del envío: después de los 30 días será desechado, destruido o eliminado sin reclamos posteriores.\nAVISO:\nEl servicio de envío de encomiendas y carga, necesita el DNI del remitente y del destinatario, así como también número de celular del remitente.',
  }),
  '20614485168': (inv) => ({
    title: 'TRANSPORTES LINEBUS S.A.C.',
    rucLine: 'RUC: 20614485168',
    extraLines: ['MZA. C LOTE. 01 P.J. JUAN PABLO PEREGRINO'],
    contact: '---',
    warnings: 'USTED NO CONTRATO EL SERVICIO DE GARANTIA\nCuenta con una COBERTURA máxima hasta 10 veces el valor del flete sobre el envío afectado.\n(Cobertura no aplicable si el daño sufrido fue propio del mal embalaje)\nRecibido sin verificación de contenido',
    extraFooter: 'EMBALAJE INAPROPIADO ASUMO CUALQUIER DAÑO QUE PUDIESE SUFRIR DURANTE SU TRASLADO - ' + inv.sender + '\nEL REMITENTE ACEPTA EL TRASLADO DEL ENVÍO PARA EL ' + inv.created_at + '\nIMPORTANTE\nEl remitente será responsable de la veracidad de los datos y del contenido brindados . Plazo para el retiro de envío: hasta 48 horas posteriores a su llegada . Cobro de almacenaje . Custodia máximo por 30 días posteriores a su llegada . Abandono del envío: después de los 30 días será desechado, destruido o eliminado sin reclamos posteriores.\nAVISO:\nEl servicio de envío de encomiendas y carga, necesita el DNI del remitente y del destinatario, así como también número de celular del remitente.',
  }),
  '20605002863': (inv) => ({
    title: 'ESANTUR',
    rucLine: '',
    extraLines: [],
    contact: '',
    warnings: '',
    extraFooter: '',
  }),
};

for (const [ruc, configFn] of Object.entries(courierConfigs)) {
  app.post(`/courier/${ruc}`, asyncHandler(async (req, res) => {
    const body = parseBody(req);
    console.log(`[courier] ${ruc}`);
    await printCourierGeneric(printer, body, configFn);
    res.send('<h1>UNO SAN</h1>');
  }));
}

// Shipping order (courier/shipping-order/:ruc)
app.post('/courier/shipping-order/20529682248', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[shipping-order]');
  await printShippingOrder(printer, body);
  res.send('<h1>UNO SAN</h1>');
}));

// GRT
app.post('/grt/20529682248', asyncHandler(async (req, res) => {
  const body = parseBody(req);
  console.log('[grt]');
  await printGrt(printer, body);
  res.send('<h1>UNO SAN</h1>');
}));

// === HEALTH & INFO ===
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: getCurrentVersion(),
    printer: defaultPrinterName,
    port: PORT,
  });
});

// === STARTUP ===
const version = getCurrentVersion();
console.log(`[meliprinter] v${version} - Iniciando...`);

// Auto-update check
if (process.env.NO_UPDATE !== 'true') {
  checkForUpdates().then((update) => {
    if (update) {
      console.log(`[updater] Nueva versión: ${update.version}`);
      if (update.downloadUrl) {
        console.log(`[updater] Descarga: ${update.downloadUrl}`);
      }
      createUpdateScript(update.version);
    }
  });

  // Periodic check
  setInterval(() => {
    checkForUpdates().then((update) => {
      if (update) createUpdateScript(update.version);
    });
  }, UPDATE_INTERVAL);
}

app.listen(PORT, () => {
  console.log(`[meliprinter] v${version} - Servidor listo en puerto ${PORT}`);
  console.log(`[meliprinter] Impresora: ${defaultPrinterName}`);
  console.log(`[meliprinter] No cierres esta ventana durante la impresión`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[meliprinter] Cerrando servidor...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('[meliprinter] Cerrando servidor...');
  process.exit(0);
});

} // end main

main().catch((err) => {
  console.error('[meliprinter] Error al iniciar:', err);
  process.exit(1);
});
