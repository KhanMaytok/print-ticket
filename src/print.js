import { existsSync } from 'fs';
import { resolveHeader } from './enterprises.js';
import numeroALetras from './numeroALetra.js';

export function printLines(printer) {
  const width = printer.getWidth();
  return '-'.repeat(width);
}

export function formatHourString(inputTime) {
  const [hours, minutes] = inputTime.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);
}

export function formatEmbarkDate(nextDay, input) {
  if (nextDay === 'false' || nextDay === false) return input;
  const [day, month, year] = input.split('/');
  const date = new Date(year, month - 1, day);
  if (nextDay === 'true' || nextDay === true) date.setDate(date.getDate() + 1);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function printNow() {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(now);
  return `${d}/${m}/${y} ${time}`;
}

function getInvoiceType(body, enterprise) {
  if (body.is_vale === true) return enterprise.invoiceLabel.vale;
  if (body.enterprise_client_id !== '0') return enterprise.invoiceLabel.factura;
  return enterprise.invoiceLabel.boleta;
}

function addTotalLetras(body) {
  if (body.total_letter === '---') {
    body.total_letter = numeroALetras(parseFloat(body.total), {
      plural: 'dólares estadounidenses',
      singular: 'dólar estadounidense',
      centPlural: 'centavos',
      centSingular: 'centavo',
    });
  }
}

function applyDirective(printer, d) {
  if (d.bold === true) printer.bold(true);
  if (d.bold === false) printer.bold(false);
  if (d.align === 'center') printer.alignCenter();
  if (d.align === 'left') printer.alignLeft();
  if (d.size?.doubleHeight) printer.setTextDoubleHeight();
  if (d.size?.doubleWidth) printer.setTextDoubleWidth();
  if (d.size?.normal) printer.setTextNormal();
  printer.println(d.text);
}

export async function printTicket(printer, body, enterprise, clientData) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body;
  const b = parsed;

  addTotalLetras(b);
  const lines = printLines(printer);

  await printer.printImage(getLogo());

  printer.println(' ');
  printer.println(' ');

  // --- Header ---
  const headerItems = resolveHeader(enterprise, b);
  for (const item of headerItems) {
    applyDirective(printer, { align: 'center', bold: undefined, ...item });
  }
  printer.println(lines);

  // --- Invoice type ---
  const invoiceType = getInvoiceType(b, enterprise);
  printer.println(invoiceType);
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println(`${b.serie}-${b.number}`);
  printer.setTextNormal();

  printer.alignLeft();
  printer.println(`FECHA EMISION: ${b.buy_date}`);
  printer.println(`ATENDIDO POR : ${b.seller}`);
  printer.println(lines);

  if (b.enterprise_client_id !== '0') {
    printer.println(`RAZÓN SOCIAL: ${b.enterprise_client}`);
    printer.println(`RUC         : ${b.enterprise_client_id}`);
  }
  printer.println(`DOC PASAJERO: ${b.dni}`);
  printer.println(`PASAJERO    : ${b.passenger_name}`);
  printer.println(lines);

  // --- Trip data ---
  printer.alignCenter();
  printer.bold(true);
  printer.println('DATOS DEL VIAJE');
  printer.bold(false);
  printer.println(lines);
  printer.alignLeft();

  if (enterprise.showUbigeo) {
    printer.setTextDoubleWidth();
    printer.println(`ORIGEN     :`);
    printer.println(`${b.departure} - ${b.ubigeo_departure}`);
    printer.println(`DESTINO    :`);
    printer.println(`${b.arrival} - ${b.ubigeo_arrival}`);
  } else {
    printer.setTextDoubleWidth();
    printer.println(`ORIGEN     : ${b.departure}`);
    printer.println(`DESTINO    : ${b.arrival}`);
  }

  printer.println(`FECHA VIAJE: ${b.departure_date}`);
  printer.println(`HORA VIAJE : ${b.schedule_hour}`);

  if (enterprise.useEmbarkTime && b.embark_time?.date) {
    const embarkTime = formatHourString(b.embark_time.date.split(' ')[1].split('.')[0]);
    const embarkDate = formatEmbarkDate(b.next_day, b.departure_date);
    printer.println(`F. EMBARQUE: ${embarkDate}`);
    printer.println(`H. EMBARQUE: ${embarkTime}`);
  } else {
    printer.println(`EMBARQUE   : ${b.departure_hour}`);
  }

  printer.println(`ASIENTO    : ${b.seat}`);
  printer.println(`IMPORTE    : S/ ${b.total}`);
  printer.setTextNormal();
  printer.println(lines);

  printer.alignCenter();
  printer.println(`SON: ${b.total_letter}`);
  printer.alignLeft();
  printer.println(lines);

  // --- Payment ---
  printer.bold(true);
  const formaPago = b.payment_type?.toUpperCase() === 'EFECTIVO' ? 'CONTADO' : b.payment_type;
  printer.println(`FORMA DE PAGO: ${formaPago}`);
  printer.bold(false);

  if (enterprise.extraFields?.includes('operation_code') && b.operation_code) {
    printer.println(`NRO. OPERACIÓN: ${b.operation_code}`);
  }
  if (enterprise.extraFields?.includes('observation') && b.observation) {
    printer.println(`OBSERVACIONES : ${b.observation}`);
  }
  if (enterprise.extraFields?.includes('service_title') && b.service_title) {
    printer.println(`MODALIDAD : ${b.service_title}`);
  }
  printer.println(lines);

  // --- Footer ---
  if (b.invoice_footer) {
    printer.println(b.invoice_footer);
  }

  if (enterprise.extraFields?.includes('soat_provider') && b.soat_provider) {
    printer.println(`ASEGURADO CON: ${b.soat_provider}`);
  }
  if (enterprise.extraFields?.includes('soat') && b.soat) {
    printer.println(`POLIZA N°: ${b.soat}`);
  }

  // --- Terms ---
  for (const term of (enterprise.terms || [])) {
    printer.println(term);
  }

  printer.alignCenter();

  // --- Client bottom text ---
  if (clientData?.print_bottom === true && clientData?.bottom_text) {
    printer.println(clientData.bottom_text);
  }

  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printCourier(printer, body, clientData) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const inv = b.invoice;
  const cellphone = inv.cellphone === '' ? '-' : inv.cellphone;
  const arrival = inv.final_arrival === '' ? inv.arrival : inv.final_arrival;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  printer.alignCenter();
  printer.bold(true);
  printer.println(inv.enterprise_name);
  printer.bold(false);
  printer.println(inv.enterprise_address);
  printer.println(`PUNTO DE EMISIÓN: ${inv.seller_agency}`);
  printer.println(`R.U.C. ${inv.enterprise_ruc}`);
  printer.println(`Telf. ${inv.enterprise_telephone || ''}`);
  printer.println(printLines(printer));

  let invoiceType = 'BOLETA DE VENTA ELECTRÓNICA';
  if (parseInt(inv.document_type) === 6) invoiceType = 'FACTURA DE VENTA ELECTRÓNICA';
  if (inv.serie.startsWith('V')) invoiceType = 'CONSTANCIA DE VENTA';

  printer.println(invoiceType);
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println(inv.serie);
  printer.setTextNormal();
  printer.alignLeft();
  printer.println(`FECHA EMISION     : ${inv.created_at}`);
  printer.println(`ATENDIDO POR      : ${inv.seller}`);
  printer.println(printLines(printer));

  printer.alignCenter();
  printer.println('DATOS DE ENVIO');
  printer.alignLeft();
  printer.println(printLines(printer));

  if (inv.sender_2_id != null) {
    printer.println(`MENSAJERO         : ${inv.sender_2}`);
    printer.println(`DNI               : ${inv.sender_2_id}`);
  }
  printer.println(printLines(printer));
  printer.println(`REMITENTE         : ${inv.sender}`);
  printer.println(`DNI/RUC           : ${inv.sender_2_id}`);
  printer.println(printLines(printer));
  printer.println(`CONSIGNADO        : ${inv.receiver}`);
  printer.println(`DNI/RUC           : ${inv.receiver_id}`);
  printer.println(printLines(printer));
  if (inv.receiver_2_id != null) {
    printer.println(`CONSIGNADO        : ${inv.receiver_2}`);
    printer.println(`DNI/RUC           : ${inv.receiver_2_id}`);
  }
  printer.println(printLines(printer));

  printer.bold(true);
  printer.println('CLIENTE');
  printer.bold(false);
  printer.println(`DNI/RUC           : ${inv.customer_id}`);
  printer.println(`NOMBRE/RAZ. SOCIAL: ${inv.customer}`);
  printer.println(`Teléfono          : ${cellphone}`);
  printer.println(printLines(printer));

  printer.println('TIPO              : ENCOMIENDA');
  printer.println(`ORIGEN            : ${inv.departure}`);
  printer.println(`DESTINO           : ${arrival}`);
  printer.println('ITEMS        :');
  for (const e of inv.items) {
    printer.table([e.quantity, e.name, e.total]);
  }
  printer.println(printLines(printer));

  if (parseInt(inv.document_type) === 6) {
    printer.println(`SUBTOTAL            : ${inv.subtotal}`);
    printer.println(`IGV            : ${inv.igv}`);
  }
  printer.println(`SUBTOTAL: ${inv.subtotal}`);
  printer.println(`IGV: ${inv.igv}`);
  printer.println(`TOTAL: ${inv.total}`);
  printer.println(printLines(printer));

  printer.alignCenter();
  const letras = numeroALetras(parseFloat(inv.total), {
    plural: 'dólares estadounidenses', singular: 'dólar estadounidense',
    centPlural: 'centavos', centSingular: 'centavo',
  });
  printer.println(`SON: ${letras}`);
  printer.alignLeft();
  printer.println(printLines(printer));

  printer.bold(true);
  const formaPago = inv.payment_type?.toUpperCase() === 'EFECTIVO' ? 'CONTADO' : inv.payment_type;
  printer.println(`FORMA DE PAGO: ${formaPago}`);
  if (inv.operation_number) printer.println(`NRO. OPERACIÓN: ${inv.operation_number}`);
  printer.bold(false);
  printer.println(printLines(printer));

  if (clientData?.print_bottom === true && clientData?.bottom_text) {
    printer.println(clientData.bottom_text);
  }
  printer.println(printLines(printer));
  printer.println(inv.invoice_footer || '');
  printer.alignCenter();
  printer.printQR(inv.ticket_id);
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printMoneyTransfer(printer, body, clientData) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const t = b.transfer;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  printer.alignCenter();
  printer.bold(true);
  printer.println(t.enterprise_name);
  printer.bold(false);
  printer.println(t.enterprise_address);
  printer.println(`PUNTO DE EMISIÓN: ${t.current_agency}`);
  printer.println(`R.U.C. ${t.enterprise_ruc}`);
  printer.println(`Telf. ${t.enterprise_telephone || ''}`);
  printer.println(`Fecha y hora: ${printNow()}`);
  printer.println(printLines(printer));

  printer.println('GIRO - TRANSFERENCIA DE DINERO');
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println(`${t.serie}-${t.number}`);
  printer.setTextNormal();
  printer.alignLeft();
  printer.println(`FECHA EMISION     : ${t.current_day}`);
  printer.println(`ATENDIDO POR      : ${t.seller}`);
  printer.println(printLines(printer));
  printer.alignCenter();
  printer.println('DATOS DEL GIRO');
  printer.alignLeft();
  printer.println(printLines(printer));
  printer.println(`ENVIA             : ${t.sender}`);
  printer.println(`DNI               : ${t.sender_id}`);
  printer.println(printLines(printer));
  printer.println(`RECIBE            : ${t.receiver}`);
  printer.println(`DNI               : ${t.receiver_id}`);
  printer.println(printLines(printer));
  printer.println(`ORIGEN            : ${t.departure}`);
  printer.println(`DESTINO           : ${t.arrival}`);
  printer.println(printLines(printer));
  printer.bold(true);
  printer.println(`MONTO DE ENVIO  : S/. ${parseFloat(t.subtotal).toFixed(2)}`);
  printer.println(`COMISION        : S/. ${parseFloat(t.commission).toFixed(2)}`);
  printer.println(`TOTAL A COBRAR  : S/. ${parseFloat(t.total).toFixed(2)}`);
  printer.bold(false);
  printer.println(printLines(printer));
  printer.println(t.invoice_footer || '');

  if (clientData?.print_bottom === true && clientData?.bottom_text) {
    printer.println(clientData.bottom_text);
  }
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printLogistics(printer, body) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const i = b.money_sent;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  printer.println(printLines(printer));
  printer.println(`TICKET DE ${i.budget_type.toUpperCase()}`);
  printer.println(printLines(printer));
  printer.setTextNormal();
  printer.alignLeft();
  printer.println(`USUARIO REGISTRA  : ${i.sender}`);
  printer.println(`OFICINA REGISTRO  : ${i.departure}`);
  printer.println(`RECAUDADOR        : ${i.receiver}`);
  printer.println(printLines(printer));
  printer.println(`CANTIDAD          : ${i.total}`);
  printer.println(`DESDE             : ${i.from}`);
  printer.println(`HASTA             : ${i.to}`);
  printer.println(`CONDUCTOR         : ${i.driver}`);
  printer.println(`RUTA              : ${i.schedule}`);
  printer.println(`VEHÍCULO          : ${i.vehicle}`);
  printer.println(printLines(printer));
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(printLines(printer));
  printer.alignCenter();
  printer.println('FIRMA DE QUIEN ENTREGA');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(printLines(printer));
  printer.println('FIRMA DE QUIEN RECIBE');
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printBudget(printer, body) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const i = b.budget;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  printer.println(printLines(printer));
  printer.println('RECIBO DE INGRESOS/EGRESOS');
  printer.println(`Fecha y hora: ${printNow()}`);
  printer.println(printLines(printer));
  printer.println(`${i.serie}-${i.number}`);
  printer.setTextNormal();
  printer.alignLeft();
  printer.println(`DESCRIPCION   : ${i.name}`);
  printer.println(`TOTAL         : S/ ${i.total}`);
  printer.println(`TIPO          : ${i.budget_type}`);
  printer.println(`FECHA         : ${i.created_at}`);
  printer.println(printLines(printer));
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(' ');
  printer.println(printLines(printer));
  printer.alignCenter();
  printer.println(`ENTREGADO POR : ${i.person_name}`);
  printer.println(`DOC.IDENTIDAD : ${i.person_id}`);
  printer.println(`EMPRESA       : ${i.enterprise_name}`);
  printer.println(`RUC           : ${i.ruc}`);
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printCourierGeneric(printer, body, getFields) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const inv = b.invoice;
  const cellphone = inv.cellphone === '' ? '-' : inv.cellphone;
  const arrival = inv.final_arrival === null || inv.final_arrival === '' ? inv.arrival : inv.final_arrival;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.alignCenter();
  printer.bold(true);
  printer.println(getFields(inv).title);
  const rucLine = getFields(inv).rucLine;
  if (rucLine) printer.println(rucLine);
  const extraLines = getFields(inv).extraLines || [];
  for (const line of extraLines) printer.println(line);
  printer.bold(true);
  printer.println(inv.serie);
  printer.bold(false);
  printer.println(`${arrival.toUpperCase()} - ${inv.arrival_district.toUpperCase()}`);
  printer.println(getFields(inv).contact);

  let invoiceType = 'BOLETA ELECTRÓNICA';
  if (parseInt(inv.document_type) === 6) invoiceType = 'FACTURA ELECTRÓNICA';
  if (inv.serie.startsWith('V')) invoiceType = 'CONSTANCIA DE VENTA';
  printer.println(invoiceType);

  printer.alignLeft();
  printer.println(`FECHA EMISION     : ${inv.created_at}`);
  printer.println(`FECHA TRANSLADO   : ${inv.created_at}`);
  printer.println(`ORIGEN            : ${inv.seller_agency}`);
  printer.println(`DESTINO           : ${inv.arrival}`);
  printer.println(printLines(printer));
  printer.println(printLines(printer));
  printer.alignCenter();
  printer.println('DATOS DEL REMITENTE');
  printer.alignLeft();
  if (inv.sender_2) {
    printer.println(`MENSAJERO         : ${inv.sender_2}`);
    printer.println(`DNI               : ${inv.sender_2_id}`);
  }
  printer.println(printLines(printer));
  printer.println(`REMITENTE         : ${inv.sender}`);
  printer.println(`DNI/RUC           : ${inv.sender_id}`);
  printer.println(`Teléfono          : ${cellphone}`);
  printer.alignCenter();
  printer.println(printLines(printer));
  printer.println(printLines(printer));
  printer.println('DATOS DEL DESTINATARIO');
  printer.alignLeft();
  printer.println(printLines(printer));
  printer.println(`CONSIGNADO        : ${inv.receiver}`);
  printer.println(`DNI/RUC           : ${inv.receiver_id}`);
  printer.println(printLines(printer));
  if (inv.receiver_2) {
    printer.println(`CONSIGNADO        : ${inv.receiver_2}`);
    printer.println(`DNI/RUC           : ${inv.receiver_2_id}`);
  }
  printer.println(printLines(printer));
  printer.println('ENTREGA');
  printer.println('DIRECCIÓN: ENTREGAR EN AGENCIA');
  const formaPago = inv.payment_type?.toUpperCase() === 'EFECTIVO' ? 'CONTADO' : inv.payment_type;
  printer.println(`FORMA DE PAGO: ${formaPago}`);
  for (const e of inv.items) printer.table([e.quantity, e.name, e.total]);
  printer.println('OBSERVACIONES');
  printer.println(inv.observations);
  printer.println(getFields(inv).warnings || '');
  printer.alignCenter();
  printer.println(`SUBTOTAL: ${inv.subtotal}`);
  printer.println(`IGV: ${inv.igv}`);
  printer.println(`TOTAL: ${inv.total}`);
  if (inv.operation_number) printer.println(`NRO. OPERACIÓN: ${inv.operation_number}`);
  const letras = numeroALetras(parseFloat(inv.total), {
    plural: 'dólares estadounidenses', singular: 'dólar estadounidense',
    centPlural: 'centavos', centSingular: 'centavo',
  });
  printer.println(`SON: ${letras}`);
  printer.alignLeft();
  printer.println(getFields(inv).extraFooter || '');
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printShippingOrder(printer, body) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const inv = b.invoice;
  const cellphone = inv.cellphone === '' ? '-' : inv.cellphone;
  const arrival = inv.final_arrival === null || inv.final_arrival === '' ? inv.arrival : inv.final_arrival;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.alignCenter();
  printer.println('Transportes El Crucero de Jaén S.A.C');
  printer.println('CRUCERO JAÉN');
  printer.println('RUC: 20529682248');
  printer.println('Avenida Mesones Muro 642 Aromo Alto Jaén');
  printer.bold(true);
  printer.println(inv.serie);
  printer.bold(false);
  printer.println(`${arrival.toUpperCase()} - ${inv.arrival_district.toUpperCase()}`);
  printer.println('Ventas whatsapp: ');
  printer.println('Atención al cliente: 980 845 273 - 963 450 965');

  const invoiceType = 'GUIA DE REMISION DE TRANSPORTISTA';
  printer.println(invoiceType);
  printer.alignLeft();
  printer.println(`FECHA EMISION     : ${inv.created_at}`);
  printer.println(`FECHA TRANSLADO   : ${inv.created_at}`);
  printer.println(`ORIGEN            : ${inv.seller_agency}`);
  printer.println(`DESTINO           : ${inv.arrival}`);
  printer.println(printLines(printer));
  printer.println(printLines(printer));
  printer.alignCenter();
  printer.println('DATOS DEL REMITENTE');
  printer.alignLeft();
  if (inv.sender_2) {
    printer.println(`MENSAJERO         : ${inv.sender_2}`);
    printer.println(`DNI               : ${inv.sender_2_id}`);
  }
  printer.println(printLines(printer));
  printer.println(`REMITENTE         : ${inv.sender}`);
  printer.println(`DNI/RUC           : ${inv.sender_id}`);
  printer.println(`Teléfono          : ${cellphone}`);
  printer.alignCenter();
  printer.println(printLines(printer));
  printer.println(printLines(printer));
  printer.println('DATOS DEL DESTINATARIO');
  printer.alignLeft();
  printer.println(printLines(printer));
  printer.println(`CONSIGNADO        : ${inv.receiver}`);
  printer.println(`DNI/RUC           : ${inv.receiver_id}`);
  printer.println(printLines(printer));
  if (inv.receiver_2) {
    printer.println(`CONSIGNADO        : ${inv.receiver_2}`);
    printer.println(`DNI/RUC           : ${inv.receiver_2_id}`);
  }
  printer.println(printLines(printer));
  printer.println('ENTREGA');
  printer.println('DIRECCIÓN: ENTREGAR EN AGENCIA');
  const formaPago = inv.payment_type?.toUpperCase() === 'EFECTIVO' ? 'CONTADO' : inv.payment_type;
  printer.println(`FORMA DE PAGO: ${formaPago}`);
  for (const e of inv.items) printer.table([e.quantity, e.name, e.total]);
  printer.println('OBSERVACIONES');
  printer.println(inv.observations);
  printer.alignCenter();
  printer.println(`TOTAL: ${inv.total}`);
  const letras = numeroALetras(parseFloat(inv.total), {
    plural: 'dólares estadounidenses', singular: 'dólar estadounidense',
    centPlural: 'centavos', centSingular: 'centavo',
  });
  printer.println(`SON: ${letras}`);
  printer.alignLeft();
  printer.bold(true);
  printer.println('DATOS DE LA UNIDAD DE TRANSPORTE:');
  printer.bold(false);
  printer.println(`Empresa: Crucero Jaén`);
  printer.println(`RUC: 20529682248`);
  printer.println(`Conductor: ${inv.driver}`);
  printer.println(`Licencia: ${inv.license}`);
  printer.println(`Marca: ${inv.brand}`);
  printer.println(`Placa: ${inv.plate}`);
  printer.println(`MTC: ${inv.mtc}`);
  printer.println(`Condición de pago: ${formaPago}`);
  printer.println('Representación impresa de la GUÍA DE REMISIÓN TRANSPORTISTA');
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printGrt(printer, body) {
  const b = typeof body === 'string' ? JSON.parse(body) : body;
  const inv = b.invoice;

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  printer.alignCenter();
  printer.bold(true);
  printer.println('EMPRESA DE TRANSPORTES DE PASAJEROS EL CRUCERO DE JAEN SOCIEDAD ANONIMA CERRADA');
  printer.bold(false);
  printer.println('AV. MESONES MURO NRO. 642 SEC. AROMO ALTO CAJAMARCA - JAEN - JAEN');
  printer.println('RUC 20529682248');
  printer.println('Ventas whatsapp: 977726252');
  printer.println('Atención al cliente: 980 845 273 - 963 450 965');
  printer.println(' ');
  printer.println(' ');
  printer.bold(true);
  printer.println('GUÍA DE REMISIÓN ELECTRÓNICA');
  printer.println('TRANSPORTISTA');
  printer.println(`${inv.serie}-${inv.number}`);
  printer.bold(false);
  printer.alignLeft();
  printer.println(`Fecha emisión: ${inv.created_at}`);
  printer.println(`Fecha traslado: ${inv.departure_at}`);
  printer.println(' ');
  printer.println(`PUNTO DE PARTIDA: ${inv.departure_address}`);
  printer.println(`PUNTO DE LLEGADA: ${inv.arrival_address}`);
  printer.println(' ');
  printer.println('DATOS DEL REMITENTE:');
  printer.println(`Nombre/Raz. Social: ${inv.sender}`);
  printer.println(`DNI/RUC: ${inv.sender_document_number}`);
  printer.println(' ');
  printer.println('DATOS DEL DESTINATARIO:');
  printer.println(`Nombre/Raz. Social: ${inv.receiver}`);
  printer.println(`DNI/RUC: ${inv.receiver_document_number}`);
  printer.println(' ');
  printer.println('BIENES POR TRANSPORTAR');
  for (const e of inv.items) printer.table([e.quantity, e.name, e.total]);
  printer.println(' ');
  printer.println('DATOS DE LOS VEHÍCULOS');
  printer.println(`Vehículo principal: ${inv.registration}`);
  printer.println('DATOS DE LOS CONDUCTORES');
  printer.println(`Principal: ${inv.driver_name}`);
  printer.println(`Licencia: ${inv.driver_license}`);
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printCreditNote(printer, body, clientData) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body;
  const b = parsed.credit_note || parsed;

  printer.alignCenter();
  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  printer.bold(true);
  printer.println(b.enterprise_name);
  printer.bold(false);
  printer.println(b.enterprise_address);
  printer.println(`PUNTO DE EMISIÓN: ${b.current_agency_address}`);
  printer.println(`R.U.C. ${b.enterprise_ruc}`);
  printer.println(`Telf. ${b.enterprise_telephone || ''}`);
  printLines(printer);
  printer.println('NOTA DE CRÉDITO');
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println(`${b.cancel_serie}-${b.cancel_number}`);
  printer.setTextNormal();
  printer.println(`Para: ${b.ticket_serie}-${b.ticket_number}`);
  printer.println(b.invoice_footer || '');

  if (clientData?.print_bottom === true && clientData?.bottom_text) {
    printer.println(clientData.bottom_text);
  }
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

export async function printImperialTicket(printer, body, enterprise, clientData) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body;
  const b = parsed;
  addTotalLetras(b);
  const lines = printLines(printer);

  await printer.printImage(getLogo());
  printer.println(' ');
  printer.println(' ');
  const headerItems = resolveHeader(enterprise, b);
  for (const item of headerItems) {
    applyDirective(printer, { align: 'center', bold: undefined, ...item });
  }
  printer.println(lines);
  printer.println(' ');

  const invoiceType = getInvoiceType(b, enterprise);
  printer.println(invoiceType);
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println(`${b.serie}-${b.number}`);
  printer.setTextNormal();
  printer.alignLeft();
  printer.println(`FECHA EMISION: ${b.buy_date}`);
  printer.println(`ATENDIDO POR : ${b.seller}`);
  printer.println(lines);
  if (b.enterprise_client_id !== '0') {
    printer.println(`RAZÓN SOCIAL: ${b.enterprise_client}`);
    printer.println(`RUC         : ${b.enterprise_client_id}`);
  }
  printer.println(`DOC PASAJERO: ${b.dni}`);
  printer.println(`PASAJERO    : ${b.passenger_name}`);
  printer.println(lines);
  printer.alignCenter();
  printer.bold(true);
  printer.println('DATOS DEL VIAJE');
  printer.bold(false);
  printer.println(lines);
  printer.alignLeft();
  printer.setTextDoubleWidth();
  printer.println(`ORIGEN     : ${b.departure}`);
  printer.println(`DESTINO    : ${b.arrival}`);
  printer.println(`FECHA VIAJE: ${b.departure_date}`);
  printer.println(`HORA VIAJE : ${b.schedule_hour}`);
  printer.println(`EMBARQUE   : ${b.departure_hour}`);
  printer.println(`ASIENTO    : ${b.seat}`);
  printer.println(`IMPORTE    : S/ ${b.total}`);
  printer.setTextNormal();
  printer.println(lines);
  printer.alignCenter();
  printer.println(`SON: ${b.total_letter}`);
  printer.alignLeft();
  printer.println(lines);
  printer.bold(true);
  const formaPago = b.payment_type?.toUpperCase() === 'EFECTIVO' ? 'CONTADO' : b.payment_type;
  printer.println(`FORMA DE PAGO: ${formaPago}`);
  printer.bold(false);
  printer.println(lines);
  printer.println('  ');
  printer.println('  ');
  printer.partialCut();
  printer.println(`CONTROL REF: ${b.serie}-${b.number}`);
  printer.bold(true);
  printer.println('PASAJERO:');
  printer.bold(false);
  printer.println(`SR(A): ${b.dni} - ${b.passenger_name}`);
  printer.bold(true);
  printer.println('AGENCIA DE EMBARQUE:');
  printer.bold(false);
  printer.println(b.departure);
  printer.println(`ORIGEN     : ${b.departure}`);
  printer.println(`DESTINO    : ${b.arrival}`);
  printer.println(`FECHA VIAJE: ${b.departure_date}`);
  printer.println(`HORA VIAJE : ${b.schedule_hour}`);
  printer.println(`ASIENTO    : ${b.seat}`);
  printer.println(`IMPORTE    : S/ ${b.total}`);
  printer.println('  ');
  const now = new Date();
  printer.println(`Fecha-Hora de impresión: ${now.toLocaleString()}`);
  printer.println(`Usuario: ${b.seller}`);
  printer.partialCut();
  await printer.execute();
  printer.clear();
}

function getLogo() {
  if (existsSync('./custom_logo.png')) return './custom_logo.png';
  return './logo.png';
}
