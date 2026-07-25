export const enterprises = {
  '20395419715': {
    name: 'TOURS ANGEL DIVINO',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: `Telf. ${b.enterprise_telephone || ''}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20610533443': {
    name: 'TARAPOTO',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: `Telf. ${b.enterprise_telephone || ''}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20612671720': {
    name: 'SIBERIANO',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'Telf. 925 193 119 - 917 440 001' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20605002863': {
    name: 'ESANTUR',
    header: () => [
      { text: 'ESANTUR', bold: true, align: 'center' },
      { text: '774_1 Panamericana Norte - Terminal Gasela - Cel. 978 282 295' },
      { text: 'Av. Mesones Muro cdra. 7 terminal Tetsur - Jaén - Cel. 959 666 747' },
      { text: 'Av. San Ignacio #485 - Cel. 993 742 830' },
      { text: (b) => `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: (b) => `R.U.C. ${b.enterprise_ruc}` },
      { text: (b) => `Telf. ${b.enterprise_telephone || ''}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20609883309': {
    name: 'CHOTA BUSS',
    header: () => [
      { text: 'EMPRESA DE MULTISERVICIOS DE TRANSPORTE TURISMO CHOTA BUSS S.A.C.', bold: true, align: 'center' },
      { text: (b) => `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: 'R.U.C. 20609883309' },
      { text: 'Telf. LAJAS 959 191 720 - CHOTA 959 191 028 - CAJAMARCA 993 324 792' },
      { text: 'DIRECCION. JOSE GALVEZ 265' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20603488173': {
    name: 'BUSTAMANTE',
    header: () => [
      { text: 'TRANSPORTES JJ BUSTAMANTE S.R.L.', bold: true, align: 'center' },
      { text: 'RUC: 20603488173' },
      { text: 'PRO.MEXICO ESTE NRO. 782 UPS MARIA PARADO DE BELLIDO LAMBAYEQUE - CHICLAYO - JOSE LEONARDO ORTIZ' },
      { text: 'SANTA CRUZ: Jr. cutervo esquina con Ramón Castilla. Cel: 944134849 - 981360209' },
      { text: 'CATACHE: Bodega MARY. Cel: 978049044 - 981360209' },
      { text: 'RACARRUMI: Km 70+800' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20603446004': {
    name: 'IMPERIAL',
    header: () => [
      { text: 'TRANSPORTE IMPERIAL DEL NORTE SAC', bold: true, align: 'center' },
      { text: 'RUC: 20603446004' },
      { text: 'AV. PANAMERICANA NORTE KM. 558 - TRUJILLO - TRUJILLO - LA LIBERTAD' },
      { text: 'Of. Terrapuerto: 996 767 948' },
      { text: 'Of. Plaza Norte: 902 408 927' },
      { text: 'Of. Principal: 920 683 085' },
    ],
    invoiceLabel: { boleta: 'BOLETA DE VENTA ELECTRÓNICA', factura: 'FACTURA DE VENTA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20600916239': {
    name: 'SOL CHOTANO',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: `Telf. ${b.enterprise_telephone || ''}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20480150857': {
    name: 'TORRES',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'Teléfonos: 978569333 - Chiclayo | 949001436 - Tarapoto | 976877804 - Chota | 976877796 - Nueva Cajamarca' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20604950512': {
    name: 'MURGA',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: `Telf. ${b.enterprise_telephone || ''}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },

  '20608151771': {
    name: 'ANGEL DIVINO BUS',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'Calle Nicolás de Pierola 720 URB.Campodonico- Chiclayo' },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'Venta internet autorizados Chiclayo: 958842029 |954909021| 942057662| 907758392' },
    ],
    invoiceLabel: { boleta: 'BOLETA DE VENTA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    useEmbarkTime: true,
    terms: [
      '1.- El pasajero deberá presentarse 30 min antes al horario de salida del bus.',
      '2.- Niños a partir de 5 años deberán adquirir su boleto.  Los menores deben viajar acompañados de padre o madre presentando su DNI y/o Partida de Nacimiento original.',
      'los niños mayores de 14 años, deben viajar acompañados por un adulto, presentando su DNI y/o Partida de Nacimiento, así como permiso de viaje notarial y/o judicial.',
      '3.- El pasajero tiene derecho a transportar sin costo hasta 20K de equipaje, considerándose como tal: maletas, maletines y bolsos que contengan artículos de uso personal. (DS N 182-2013-EF, Art. 2).',
      '4.- La empresa no se responsabiliza por dinero, alhajas, objetos de valor y/o artículos de lujo no declarados en el embarque y transportados como equipaje ni por los bienes personales y/o equipajes perdidos en el salón de pasajeros y terminales.',
      'TERMINO Y CONDICIONES AL REVERSO DEL BOLETO',
    ],
    extraFields: ['operation_code', 'observation', 'service_title', 'soat_provider', 'soat'],
  },

  '20614709562': {
    name: 'NUEVO ILUCAN',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'Calle Nicolás de Pierola 720 URB.Campodonico- Chiclayo' },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'Venta internet autorizados: 958842029 - Chiclayo | 954909021 - Chiclayo | 942057662 - Chiclayo' },
    ],
    invoiceLabel: { boleta: 'BOLETA DE VENTA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    useEmbarkTime: true,
    extraFields: ['observation', 'service_title', 'soat_provider', 'soat'],
    terms: [
      '1.- El pasajero deberá presentarse 30 min antes al horario de salida del bus.',
      '2.- No se permitirá el embarque de pasajeros con signos de haber ingerido alcohol. Si hay indicios, se podrá aplicar una prueba de alcoholímetro. Si es positiva, perderá el derecho a viajar y el valor del boleto.',
      '3.- Niños partir de 5 años deberán adquirir su boleto.  Los menores deben viajar acompañados de padre o madre presentando su DNI y/o Partida de Nacimiento original.',
      'Tener en cuenta lo siguiente: Menores de hasta los 14 años, deben viajar acompañados por un adulto, presentando su DNI y/o Partida de Nacimiento, así como permiso de viaje notarial y/o judicial. Menores de edad a partir de los 14 años, pueden viajar sin acompañante adulto, presentando su DNI y/o Partida de Nacimiento, así como permiso de viaje notarial o judicial según corresponda, original y vigente.',
      '4.- El pasajero tiene derecho a transportar sin costo hasta 20K de equipaje, considerándose como tal: maletas, maletines y bolsos que contengan artículos de uso personal. (DS N 182-2013-EF, Art. 2).',
      '5.- El traslado de exceso de equipaje dependerá de capacidad de bodega y del pago según tarifario.',
      '6.- La empresa no se responsabiliza por dinero, alhajas, objetos de valor y/o artículos de lujo no declarados en el embarque y transportados como equipaje ni por los bienes personales y/o equipajes perdidos en el salón de pasajeros y terminales.',
    ],
  },

  '20612365432': {
    name: 'NUEVO SAN ANTONIO',
    header: () => [
      { text: 'TURISMO NUEVO SAN ANTONIO S.A.C.', bold: true, align: 'center' },
      { text: 'JR. EZEQUIEL MONTOYA NRO. 854' },
      { text: (b) => `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: 'R.U.C. 20612365432' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    useEmbarkTime: true,
    extraFields: ['soat_provider', 'soat'],
    terms: [
      'PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE',
    ],
  },

  '20529682248': {
    name: 'CRUCERO JAEN',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'CRUCERO JAÉN' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: `${b.arrival} - ${b.ubigeo_arrival}` },
      { text: 'Atención al cliente: 980 845 273 - 963 450 965' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    showUbigeo: true,
    extraFields: ['additional_info'],
    terms: [],
  },

  '20614485168': {
    name: 'LINEBUS',
    header: (b) => [
      { text: 'TRANSPORTES LINEBUS S.A.C.', bold: true, align: 'center' },
      { text: 'JAEN BUS' },
      { text: 'R.U.C. 20614485168' },
      { text: 'MZA. C LOTE. 01 P.J. JUAN PABLO PEREGRINO' },
      { text: 'LAMBAYEQUE - CHICLAYO - CHICLAYO' },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `DIRECCIÓN: ${b.seller_agency_address}` },
      { text: `TELÉFONO: ${b.seller_agency_telephone}` },
    ],
    invoiceLabel: { boleta: 'BOLETA DE VENTA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    showUbigeo: true,
    extraFields: ['additional_info'],
    terms: [],
  },

  '20600308883': {
    name: 'CHOTA EXPRESS',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'EMPRESA DE MULTISERVICIOS Y TRANSPORTES TURS CHOTA EXPRESS S.A.C.' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: 'R.U.C. 20600308883' },
      { text: 'Chiclayo - Chota - 943818749' },
      { text: 'Chota - Chiclayo - 954956993' },
      { text: 'Chota - Cajamarca - 941931014' },
      { text: 'Cajamarca - Chota - 948211532' },
      { text: 'Chota - Cutervo - 954956993' },
      { text: 'Cutervo - Chota - 905479262' },
      { text: (b) => `${b.arrival} - ${b.ubigeo_arrival}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    showUbigeo: true,
    extraFields: ['observation'],
    terms: [],
  },

  '20604329036': {
    name: 'VIA EN BUS',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'VIA EN BUS TRAVEL EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: 'R.U.C. 20604329036' },
      { text: (b) => `${b.arrival} - ${b.ubigeo_arrival}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    showUbigeo: true,
    extraFields: ['additional_info'],
    terms: [
      '1- El boleto es personal intransferible y válido para viajar en la fecha y hora indicada.',
      '2- El pasajero podrá partir libre de pago hasta 20 kilos de equipaje Maletas y maletines pasado los 20 kilos pagará exceso de equipaje.',
      '3- El pasajero viaja amparado por el seguro obligatorio de accidentes de tránsito SOAT.',
      '4- La empresa no responde por la perdida de equipaje en salón del bus.',
      '5- Las postergaciones de viaje serán aceptadas con 3 horas de anticipación.',
      '6- Niños mayores de 5 años pagan su pasaje completo.',
      '7- El pasajero deberá estar en la oficina de embarque 1 hora de anticipación. Al no estar perderá su pasaje sin lugar a reclamo.',
      '8- Está prohibió viajar con armas de fuego o pnzcortantes.',
      '9- Prohibido viajar bajo efecto de alcohol o drogas. Perderá su boleto de viaje sin reclamo alguno.',
    ],
  },

  '20491796856': {
    name: 'EZAPE',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'TRANSPORTES EZAPE-LAJAS EIRL' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: 'R.U.C. 20491796856' },
      { text: (b) => `${b.arrival} - ${b.ubigeo_arrival}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    showUbigeo: true,
    extraFields: ['additional_info'],
    terms: [
      '1- El boleto es personal intransferible y válido para viajar en la fecha y hora indicada.',
      '2- El pasajero podrá partir libre de pago hasta 20 kilos de equipaje Maletas y maletines pasado los 20 kilos pagará exceso de equipaje.',
      '3- El pasajero viaja amparado por el seguro obligatorio de accidentes de tránsito SOAT.',
      '4- La empresa no responde por la perdida de equipaje en salón del bus.',
      '5- Las postergaciones de viaje serán aceptadas con 3 horas de anticipación.',
      '6- Niños mayores de 5 años pagan su pasaje completo.',
      '7- El pasajero deberá estar en la oficina de embarque 1 hora de anticipación. Al no estar perderá su pasaje sin lugar a reclamo.',
      '8- Está prohibió viajar con armas de fuego o pnzcortantes.',
      '9- Prohibido viajar bajo efecto de alcohol o drogas. Perderá su boleto de viaje sin reclamo alguno.',
    ],
  },

  '20603236310': {
    name: 'TURISMO M. BUS',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: 'TURISMO M. BUS E.I.R.L.' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: (b) => `${b.arrival} - ${b.ubigeo_arrival}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    showUbigeo: true,
    extraFields: ['additional_info'],
    terms: [],
  },

  '20602391982': {
    name: 'TOURS ILUCAN',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'Venta internet autorizados: 958842029 - Chiclayo | 954909021 - Chiclayo | 942057662 - Chiclayo' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    extraFields: ['soat_provider', 'soat'],
    terms: [
      'PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE',
      'TODO PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE DE MANO',
    ],
  },

  '20495803121': {
    name: 'TOURS CORAZON',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'BAGUA GRANDE| 976608091' },
      { text: `Telf. ${b.enterprise_telephone || ''}` },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    extraFields: ['soat', 'registration'],
    terms: [
      'PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE',
      'TODO PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE DE MANO',
    ],
  },

  '20529522801': {
    name: 'COMBIS',
    header: (b) => [
      { text: b.enterprise_name, bold: true, align: 'center' },
      { text: b.enterprise_address },
      { text: `PUNTO DE EMISIÓN: ${b.seller_agency}` },
      { text: `R.U.C. ${b.enterprise_ruc}` },
      { text: 'Telef. Oficina Chiclayo: 995 601 837 - Oficina Chota: 965 958 977' },
    ],
    invoiceLabel: { boleta: 'BOLETA ELECTRÓNICA', factura: 'FACTURA ELECTRÓNICA', vale: 'VALE' },
    terms: [],
  },
};

export function getEnterprise(ruc) {
  return enterprises[ruc] || null;
}

function resolve(val, body) {
  return typeof val === 'function' ? val(body) : val;
}

export function resolveHeader(enterprise, body) {
  return enterprise.header(body).map((item) => ({
    ...item,
    text: resolve(item.text, body),
  }));
}
