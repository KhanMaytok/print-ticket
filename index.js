const m_printer = require('printer')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const fs = require('fs')
const numeroALetras = require('./NumeroALetra')

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const VARIOS = 'VARIOS';
const ZERO = '0';

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())
const jsonParser = bodyParser.json()
console.log(`La actual impresora por defecto es ${m_printer.getDefaultPrinterName()}`)
const default_printer = m_printer.getDefaultPrinterName();

console.log('COPIANDO TEMPLATE SI NO EXISTE')


if (fs.existsSync('./additional_data.js')) {
    console.log('EL ARCHIVO DE DATOS ADICIONALES YA EXISTE. TODO BIEN')
} else {
    console.log('EL ARCHIVO NO EXISTE. COPIANDO DESDE EL TEMPLATE')
    fs.copyFileSync('./additional_data.js.template', './additional_data.js');
}

const client_data = require('./additional_data.js');

let logo = getLogo();


let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `printer:${default_printer}`,
    driver: require('printer'),
    options: {
        timeout: 5000
    }
});

function printLines() {
    let paperWidth = printer.getWidth();
    let lines = "";
    console.log(paperWidth);
    for (let i = 1; i <= paperWidth; i++) {
        lines += '-';
    }
    console.log(lines);
    return lines;
}

app.post('/', (req, res) => {
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20395419715', (req, res) => { // TOURS ANGEL DIVINO - 20395419715
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/ticket/invoice/20610533443', (req, res) => { // TARAPOTO - 20610533443
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });
})

app.post('/ticket/invoice/20612671720', (req, res) => { // SIBERIANO - 20612671720
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. 925 193 119 - 942 097 541`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/ticket/invoice/20605002863', (req, res) => { // ESANTUR - 20605002863
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`ESANTUR`);
        printer.bold(false)
        printer.println(`774_1 Panamericana Norte - Terminal Gasela - Cel. 978 282 295`)
        printer.println(`Av. Mesones Muro cdra. 7 terminal Tetsur - Jaén - Cel. 959 666 747`)
        printer.println(`Av. San Ignacio #485 - Cel. 993 742 830`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20609883309', (req, res) => { // BUS CHOTA - 20609883309
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`EMPRESA DE MULTISERVICIOS DE TRANSPORTE TURISMO CHOTA BUSS S.A.C.`);
        printer.bold(false)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. 20609883309`);
        printer.println(`Telf. LAJAS 959 191 720 - CHOTA 959 191 028 - CAJAMARCA 993 324 792`);
        printer.println(`DIRECCION. JOSE GALVEZ 265`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20603488173', (req, res) => { //  BUSTAMANTE - 20603488173
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`TRANSPORTES JJ BUSTAMANTE S.R.L.`);
        printer.println(`RUC: 20603488173`);
        printer.println(`PRO.MEXICO ESTE NRO. 782 UPS MARIA PARADO DE BELLIDO LAMBAYEQUE - CHICLAYO - JOSE LEONARDO ORTIZ`);
        printer.bold(false);
        printer.println(`SANTA CRUZ: Jr. cutervo esquina con Ramón Castilla. Cel: 944134849 - 981360209`);
        printer.println(`CATACHE: Bodega MARY. Cel: 978049044 - 981360209`);
        printer.println(`RACARRUMI: Km 70+800`);
        printer.println(printLines()); //----------------------------------
        printer.println(" ")

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20603446004', (req, res) => { // IMPERIAL - 20603446004
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`TRANSPORTE IMPERIAL DEL NORTE SAC`);
        printer.println(`RUC: 20603446004`);
        printer.println(`AV. PANAMERICANA NORTE KM. 558 - TRUJILLO - TRUJILLO - LA LIBERTAD`);
        printer.bold(false);
        printer.println(`Of. Terrapuerto: 996 767 948`);
        printer.println(`Of. Plaza Norte: 902 408 927`);
        printer.println(`Of. Principal: 920 683 085`);
        printer.println(printLines()); //----------------------------------
        printer.println(" ")

        let invoice_type = "BOLETA DE VENTA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA DE VENTA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`  `);
        printer.println(`  `);
        printer.partialCut();
        printer.println(`CONTROL REF: ${body.serie}-${body.number}`)
        printer.bold(true);
        printer.println(`PASAJERO:`);
        printer.bold(false);
        printer.println(`SR(A): ${body.dni} - ${body.passenger_name}`);
        printer.bold(true);
        printer.println(`AGENCIA DE EMBARQUE:`);
        printer.bold(false);
        printer.println(`${body.departure}`);
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.println(`  `);

        const now = new Date();

        printer.println(`Fecha-Hora de impresión: ${now.toLocaleString()}`);        
        printer.println(`Usuario: ${body.seller}`);

        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });
})

app.post('/ticket/invoice/20600916239', (req, res) => { // SOL CHOTANO - 20600916239
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20480150857', (req, res) => { // TORRES 20480150857
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Teléfonos: 978569333 - Chiclayo | 949001436 - Tarapoto | 976877804 - Chota | 976877796 - Nueva Cajamarca`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/ticket/invoice/20604950512', (req, res) => { // MURGA - 20604950512
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/ticket/invoice/20608151771', (req, res) => { // ANGEL DIVINO BUS - 20608151771
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`Calle Nicolás de Pierola 720 Urbanización Campodonico Chiclayo - Lambayeque`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        let embark_time = (body.embark_time.date).split(' ')[1].split('.')[0];
        embark_time = formatHourString(embark_time);
        let embark_date = formatEmbarkDate(body.next_day, body.departure_date);
        printer.println(`F. EMBARQUE: ${embark_date}`);
        printer.println(`H. EMBARQUE: ${embark_time}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);
        printer.println(`ASEGURADO CON: ${body.soat_provider}`);
        printer.println(`POLIZA N°: ${body.soat}`);
        printer.println("PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE");
        printer.println("TODO PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE DE MANO");

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/ticket/invoice/20612365432', (req, res) => { // NUEVO SAN ANTONIO - 20612365432
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`TURISMO NUEVO SAN ANTONIO S.A.C.`);
        printer.bold(false)
        printer.println(`JR. EZEQUIEL MONTOYA NRO. 854`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. 20612365432`);
        //printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        let embark_time = (body.embark_time.date).split(' ')[1].split('.')[0];
        embark_time = formatHourString(embark_time);
        let embark_date = formatEmbarkDate(body.next_day, body.departure_date);
        printer.println(`F. EMBARQUE: ${embark_date}`);
        printer.println(`H. EMBARQUE: ${embark_time}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);
        printer.println(`ASEGURADO CON: ${body.soat_provider}`);
        printer.println(`POLIZA N°: ${body.soat}`);
        printer.println("PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE");

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20529682248', (req, res) => { // CRUCERO JAEN - 20529682248
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.println(`CRUCERO JAÉN`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(printLines());
        printer.println(`${body.arrival} - ${body.ubigeo_arrival}`);
        printer.println(`Atención al cliente: 980 845 273 - 963 450 965`);
        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     :`);
        printer.println(`${body.departure} - ${body.ubigeo_departure}`);
        printer.println(`DESTINO    :`);
        printer.println(`${body.arrival} - ${body.ubigeo_arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();
        printer.println(`Observaciones : ${body.additional_info}`);

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/ticket/invoice/20603236310', (req, res) => { // turismo mbus - 20603236310
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.println(`TURISMO M. BUS E.I.R.L.`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(printLines());
        printer.println(`${body.arrival} - ${body.ubigeo_arrival}`);
        // printer.println(`Atención al cliente: 980 845 273 - 963 450 965`);
        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     :`);
        printer.println(`${body.departure} - ${body.ubigeo_departure}`);
        printer.println(`DESTINO    :`);
        printer.println(`${body.arrival} - ${body.ubigeo_arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();
        printer.println(`Observaciones : ${body.additional_info}`);

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/courier/shipping-order/20529682248', (req, res) => { // CRUCERO JAEN - 20529682248
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        body = body.invoice
        const cellphone = body.cellphone === '' ? '-' : body.cellphone;
        printer.println(" ")
        printer.alignCenter();
        printer.println("Transportes El Crucero de Jaén S.A.C")
        printer.println("CRUCERO JAÉN")
        printer.println("RUC: 20529682248")
        printer.println("Avenida Mesones Muro 642 Aromo Alto Jaén")
        printer.bold(true)
        printer.println(`${body.serie}`);
        printer.bold(false)
        const arrival = body.final_arrival === null || body.final_arrival === '' ? body.arrival : body.final_arrival;
        printer.println(`${arrival.toUpperCase()} - ${body.arrival_district.toUpperCase()}`)
        printer.println('Ventas whatsapp: 977726252');
        printer.println('Atención al cliente: 980 845 273 - 963 450 965');
        
        let invoice_type = "GUIA DE REMISION DE TRANSPORTISTA"
        printer.println(`${invoice_type}`);
        printer.alignLeft();
        printer.println(`FECHA EMISION     : ${body.created_at}`);
        printer.println(`FECHA TRANSLADO   : ${body.created_at}`);
        printer.println(`ORIGEN            : ${body.seller_agency}`)
        printer.println(`DESTINO           : ${body.arrival}`)
        printer.println(printLines()); //------------------------------------------
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`DATOS DEL REMITENTE`)
        printer.alignLeft();
        // MENSAJERO
        if ('sender_2' in body) {
            printer.println(`MENSAJERO         : ${body.sender_2}`);
            printer.println(`DNI               : ${body.sender_2_id}`);
        }
 
        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`REMITENTE         : ${body.sender}`);
        printer.println(`DNI/RUC           : ${body.sender_id}`);
        printer.println(`Teléfono          : ${cellphone}`);
        printer.alignCenter();
        printer.println(printLines()); //------------------------------------------
        printer.println(printLines()); //------------------------------------------
        printer.println(`DATOS DEL DESTINATARIO`)
        printer.alignLeft();
        // CONSIGNADO
        printer.println(printLines()); //------------------------------------------
        printer.println(`CONSIGNADO        : ${body.receiver}`);
        printer.println(`DNI/RUC           : ${body.receiver_id}`);
 
        // CONSIGNADO 2
        printer.println(printLines()); //------------------------------------------
        if ('receiver_2' in body) {
            printer.println(`CONSIGNADO        : ${body.receiver_2}`);
            printer.println(`DNI/RUC           : ${body.receiver_2_id}`);
        }
        printer.println(printLines()); //------------------------------------------
        printer.println(`ENTREGA`);
        printer.println(`DIRECCIÓN: ENTREGAR EN AGENCIA`);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        body.items.map(function (e) {
            printer.table([e.quantity, e.name, e.total]);
        })
        printer.println(`OBSERVACIONES`);
        printer.println(body.observations);
        printer.alignCenter();
        printer.println(`TOTAL: ${body.total}`);
        let letras = numeroALetras(parseFloat(body.total), {
            plural: 'dólares estadounidenses',
            singular: 'dólar estadounidense',
            centPlural: 'centavos',
            centSingular: 'centavo'
        });

        printer.println(`SON: ${letras}`);
        printer.alignLeft();
        printer.bold(true)
        printer.println(`DATOS DE LA UNIDAD DE TRANSPORTE:`);
        printer.bold(false)
        printer.println(`Empresa: Crucero Jaén`);
        printer.println(`RUC: 20529682248`);
        printer.println(`Conductor: ${body.driver}`);
        printer.println(`Licencia: ${body.license}`);
        printer.println(`Marca: ${body.brand}`);
        printer.println(`Placa: ${body.plate}`);
        printer.println(`MTC: ${body.mtc}`);
        printer.println(`Condición de pago: ${forma_pago}`);
        printer.println(`Representación impresa de la GUÍA DE REMISIÓN TRANSPORTISTA`); 


        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

app.post('/ticket/invoice/20529522801', (req, res) => { // COMBIS - 20529522801
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telef. Oficina Chiclayo: 995 601 837 - Oficina Chota: 965 958 977`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})


app.post('/ticket/invoice/20602391982', (req, res) => { // TOURS ILUCAN - 20395419715
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})



app.post('/ticket/invoice/20495803121', (req, res) => { // Tours Corazon E.I.R.L.
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
        }

        if(body.total_letter === '---') {
            body.total_letter = numeroALetras(parseFloat(body.total), {
                plural: 'dólares estadounidenses',
                singular: 'dólar estadounidense',
                centPlural: 'centavos',
                centSingular: 'centavo'
            });
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.println(printLines());
        if (body.enterprise_client_id !== "0") {
            printer.println(`RAZÓN SOCIAL: ${body.enterprise_client}`);
            printer.println(`RUC         : ${body.enterprise_client_id}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.println(printLines());
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.println(printLines());
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.schedule_hour}`);
        printer.println(`EMBARQUE   : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.println(printLines());
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.println(`${body.invoice_footer || ''}`);
        printer.alignCenter();
        printer.println(`Usted viaja asegurado (La Positiva). Póliza número ${body.soat || ""}. En caso de accidente, comuníquese al Telf. (01) 211-0-211.`);
        printer.println(`Bus placa N° ${body.registration}`);
        printer.alignLeft();

        printer.alignCenter();
        //printer.printQR(`${body.ticket_id}`)

        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });

})

app.post('/credit-note', (req, res) => {
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }

    console.log(body);

    if ('credit_note' in body) {
        body = body.credit_note;
    }

    printer.alignCenter();
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.current_agency_address}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printLines();
        printer.println("NOTA DE CRÉDITO");
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.cancel_serie}-${body.cancel_number}`);
        printer.setTextNormal();
        printer.println(`Para: ${body.ticket_serie}-${body.ticket_number}`);
        printer.println(`${body.invoice_footer || ''}`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Impreso correctamente`);
            }
        });
        printer.clear();
        res.send('<h1>PRINTED TICKET</h1>')
    })
})


app.get('/', (req, res) => {
    res.send("HELLO FRIEND")
})

app.post('/money-transfer/', (req, res) => {
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }

    console.log('The logo is ', logo);

    printer.printImage(logo).then(function (done) {
        body = body.transfer
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(body.enterprise_name);
        printer.bold(false)
        printer.println(body.enterprise_address)
        printer.println(`PUNTO DE EMISIÓN: ${body.current_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(`Fecha y hora: ${printNow()}`)
        printer.println(printLines());

        printer.println('GIRO - TRANSFERENCIA DE DINERO');
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION     : ${body.current_day}`);
        printer.println(`ATENDIDO POR      : ${body.seller}`);
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`DATOS DEL GIRO`);
        printer.alignLeft();
        // MENSAJERO
        printer.println(printLines()); //------------------------------------------
        printer.println(`ENVIA             : ${body.sender}`);
        printer.println(`DNI               : ${body.sender_id}`);
        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`RECIBE            : ${body.receiver}`);
        printer.println(`DNI               : ${body.receiver_id}`);
        printer.println(printLines()); //------------------------------------------
        printer.println(`ORIGEN            : ${body.departure}`);
        printer.println(`DESTINO           : ${body.arrival}`);
        printer.println(printLines()); //------------------------------------------
        printer.bold(true);
        printer.println(`MONTO DE ENVIO  : S/. ${parseFloat(body.subtotal).toFixed(2)}`);
        printer.println(`COMISION        : S/. ${parseFloat(body.commission).toFixed(2)}`);
        printer.println(`TOTAL A COBRAR  : S/. ${parseFloat(body.total).toFixed(2)}`);
        printer.bold(false);
        printer.println(printLines()); //------------------------------------------
        printer.println(`${body.invoice_footer || ''}`);


        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }

        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>')
    });
    //res.send('<h1>UNO SAN</h1>')
})

app.post('/logistics/', (req, res) => {
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    c = body.company;
    i = body.money_sent;
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.println(printLines()); //------------------------------------------
        printer.println(`TICKET DE ${i.budget_type.toUpperCase()}`);
        printer.println(printLines()); //------------------------------------------
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`USUARIO REGISTRA  : ${i.sender}`);
        printer.println(`OFICINA REGISTRO  : ${i.departure}`);
        printer.println(`RECAUDADOR        : ${i.receiver}`);
        printer.println(printLines()); //------------------------------------------
        printer.println(`CANTIDAD          : ${i.total}`);
        printer.println(`DESDE             : ${i.from}`);
        printer.println(`HASTA             : ${i.to}`);
        printer.println(`CONDUCTOR         : ${i.driver}`);
        printer.println(`RUTA              : ${i.schedule}`);
        printer.println(`VEHÍCULO          : ${i.vehicle}`);
        // MENSAJERO
        printer.println(printLines()); //------------------------------------------
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`FIRMA DE QUIEN ENTREGA`);
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(printLines()); //------------------------------------------
        printer.println(`FIRMA DE QUIEN RECIBE`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})


app.post('/logistics/budget', (req, res) => {
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    c = body.company;
    i = body.budget;
    printer.printImage(logo).then(function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.println(printLines()); //------------------------------------------
        printer.println(`RECIBO DE INGRESOS/EGRESOS`);
        printer.println(`Fecha y hora: ${printNow()}`)
        printer.println(printLines()); //------------------------------------------
        printer.println(`${i.serie}-${i.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`DESCRIPCION   : ${i.name}`);
        printer.println(`TOTAL         : S/ ${i.total}`);
        printer.println(`TIPO          : ${i.budget_type}`);
        printer.println(`FECHA         : ${i.created_at}`);
        printer.println(printLines()); //------------------------------------------        
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(" ")
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`ENTREGADO POR : ${i.person_name}`);
        printer.println(`DOC.IDENTIDAD : ${i.person_id}`);
        printer.println(`EMPRESA       : ${i.enterprise_name}`);
        printer.println(`RUC           : ${i.ruc}`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

app.post('/encomiendas/', (req, res) => {
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        body = body.invoice
        const cellphone = body.cellphone === '' ? '-' : body.cellphone;
        console.log(body.items);
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(body.enterprise_name);
        printer.bold(false)
        printer.println(body.enterprise_address)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());
        let arrival = body.final_arrival === '' ? body.arrival : body.final_arrival;

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (parseInt(body.document_type) === 6) {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.serie.startsWith('V')) {
            invoice_type = "CONSTANCIA DE VENTA"
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION     : ${body.created_at}`);
        printer.println(`ATENDIDO POR      : ${body.seller}`);
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`DATOS DE ENVIO`);
        printer.alignLeft();
        // MENSAJERO
        printer.println(printLines()); //------------------------------------------
        if (body.sender_2_id != null) {
            printer.println(`MENSAJERO         : ${body.sender_2}`);
            printer.println(`DNI               : ${body.sender_2_id}`);
        }

        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`REMITENTE         : ${body.sender}`);
        printer.println(`DNI/RUC           : ${body.sender_2_id}`);
        // CONSIGNADO
        printer.println(printLines()); //------------------------------------------
        printer.println(`CONSIGNADO        : ${body.receiver}`);
        printer.println(`DNI/RUC           : ${body.receiver_id}`);

        // CONSIGNADO 2
        printer.println(printLines()); //------------------------------------------
        if (body.receiver_2_id != null) {
            printer.println(`CONSIGNADO        : ${body.receiver_2}`);
            printer.println(`DNI/RUC           : ${body.receiver_2_id}`);
        }
        printer.println(printLines()); //------------------------------------------
        // CLIENTE REAL
        printer.bold(true);
        printer.println(`CLIENTE`);
        printer.bold(false);
        printer.println(`DNI/RUC           : ${body.customer_id}`);
        printer.println(`NOMBRE/RAZ. SOCIAL: ${body.customer}`);

        printer.println(`Teléfono          : ${cellphone}`);
        printer.println(printLines()); //------------------------------------------
        printer.println(`TIPO              : ENCOMIENDA`);
        printer.println(`ORIGEN            : ${body.departure}`);
        printer.println(`DESTINO           : ${arrival}`);
        printer.println(`ITEMS        :`);
        body.items.map(function (e) {
            printer.table([e.quantity, e.name, e.total]);
        })

        printer.println(printLines()); //------------------------------------------
        if (parseInt(body.document_type) === 6) {
            printer.println(`SUBTOTAL            : ${body.subtotal}`);
            printer.println(`IGV            : ${body.igv}`);
        }
        printer.println(`TOTAL            : ${body.total}`);
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        let letras = numeroALetras(parseFloat(body.total), {
            plural: 'dólares estadounidenses',
            singular: 'dólar estadounidense',
            centPlural: 'centavos',
            centSingular: 'centavo'
        });

        printer.println(`SON: ${letras}`);
        printer.alignLeft();
        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.alignCenter();
        printer.printQR(`${body.ticket_id}`)
        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.println(printLines()); //------------------------------------------
        printer.println(`${body.invoice_footer || ''}`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

app.post('/courier/20395419715', (req, res) => { // TOURS ANGEL DIVINO 20395419715
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        body = body.invoice
        const cellphone = body.cellphone === '' ? '-' : body.cellphone;
        console.log(body.items);
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(body.enterprise_name);
        printer.bold(false)
        printer.println(body.enterprise_address)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(`Telf. ${body.enterprise_telephone || ''}`);
        printer.println(printLines());
        let arrival = body.final_arrival === '' ? body.arrival : body.final_arrival;

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (parseInt(body.document_type) === 6) {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.serie.startsWith('V')) {
            invoice_type = "CONSTANCIA DE VENTA"
        }

        printer.println(`${invoice_type}`);
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION     : ${body.created_at}`);
        printer.println(`ATENDIDO POR      : ${body.seller}`);
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`DATOS DE ENVIO`);
        printer.alignLeft();
        // MENSAJERO
        printer.println(printLines()); //------------------------------------------
        if (body.sender_2_id != null) {
            printer.println(`MENSAJERO         : ${body.sender_2}`);
            printer.println(`DNI               : ${body.sender_2_id}`);
        }

        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`REMITENTE         : ${body.sender}`);
        printer.println(`DNI/RUC           : ${body.sender_2_id}`);
        // CONSIGNADO
        printer.println(printLines()); //------------------------------------------
        printer.println(`CONSIGNADO        : ${body.receiver}`);
        printer.println(`DNI/RUC           : ${body.receiver_id}`);

        // CONSIGNADO 2
        printer.println(printLines()); //------------------------------------------
        if (body.receiver_2_id != null) {
            printer.println(`CONSIGNADO        : ${body.receiver_2}`);
            printer.println(`DNI/RUC           : ${body.receiver_2_id}`);
        }
        printer.println(printLines()); //------------------------------------------
        // CLIENTE REAL
        printer.bold(true);
        printer.println(`CLIENTE`);
        printer.bold(false);
        printer.println(`DNI/RUC           : ${body.customer_id}`);
        printer.println(`NOMBRE/RAZ. SOCIAL: ${body.customer}`);

        printer.println(`Teléfono          : ${cellphone}`);
        printer.println(printLines()); //------------------------------------------
        printer.println(`TIPO              : ENCOMIENDA`);
        printer.println(`ORIGEN            : ${body.departure}`);
        printer.println(`DESTINO           : ${arrival}`);
        printer.println(`ITEMS        :`);
        body.items.map(function (e) {
            printer.table([e.quantity, e.name, e.total]);
        })

        printer.println(printLines()); //------------------------------------------
        if (parseInt(body.document_type) === 6) {
            printer.println(`SUBTOTAL            : ${body.subtotal}`);
            printer.println(`IGV            : ${body.igv}`);
        }
        printer.println(`TOTAL            : ${body.total}`);
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        let letras = numeroALetras(parseFloat(body.total), {
            plural: 'dólares estadounidenses',
            singular: 'dólar estadounidense',
            centPlural: 'centavos',
            centSingular: 'centavo'
        });

        printer.println(`SON: ${letras}`);
        printer.alignLeft();
        printer.println(printLines()); //----------------------------------
        printer.bold(true);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        printer.bold(false);
        printer.println(printLines()); //----------------------------------
        printer.alignCenter();
        printer.printQR(`${body.ticket_id}`)
        if (client_data.client_data.print_bottom === true) {
            printer.println(client_data.client_data.bottom_text)
        }
        printer.println(printLines()); //------------------------------------------
        printer.println(`SU ENCOMIENDA NO HA SIDO VERIFICADA; VIAJA POR CUENTA DEL REMITENTE`);
        printer.println(`SU ENCOMIENDA Y/O CARGA VIAJA CON UN SEGURO ESTÁNDAR QUE EN CASO DE PERDIDA, EXTRAVIO, AVERIA, DETERIORO O ROBO CUBRE UN MONTO HASTA 10 VECES DEL VALOR DEL FLETE PAGADO. DECRETO SUPREMO Nº 032-2005-MTC.`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

app.post('/courier/20529682248', (req, res) => { // CRUCERO JAEN - 20529682248
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        body = body.invoice
        const cellphone = body.cellphone === '' ? '-' : body.cellphone;
        printer.println(" ")
        printer.alignCenter();
        printer.println("Transportes El Crucero de Jaén S.A.C")
        printer.println("CRUCERO JAÉN")
        printer.println("RUC: 20529682248")
        printer.println("Avenida Mesones Muro 642 Aromo Alto Jaén")
        printer.bold(true)
        printer.println(`${body.serie}`);
        printer.bold(false)
        const arrival = body.final_arrival === null || body.final_arrival === '' ? body.arrival : body.final_arrival;
        printer.println(`${arrival.toUpperCase()} - ${body.arrival_district.toUpperCase()}`)
        printer.println('Ventas whatsapp: 977726252');
        printer.println('Atención al cliente: 980 845 273 - 963 450 965');
        
        let invoice_type = "BOLETA ELECTRÓNICA"
        if (parseInt(body.document_type) === 6) {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.serie.startsWith('V')) {
            invoice_type = "CONSTANCIA DE VENTA"
        }
        printer.println(`${invoice_type}`);
        printer.alignLeft();
        printer.println(`FECHA EMISION     : ${body.created_at}`);
        printer.println(`FECHA TRANSLADO   : ${body.created_at}`);
        printer.println(`ORIGEN            : ${body.seller_agency}`)
        printer.println(`DESTINO           : ${body.arrival}`)
        printer.println(printLines()); //------------------------------------------
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`DATOS DEL REMITENTE`)
        printer.alignLeft();
        // MENSAJERO
        if ('sender_2' in body) {
            printer.println(`MENSAJERO         : ${body.sender_2}`);
            printer.println(`DNI               : ${body.sender_2_id}`);
        }
 
        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`REMITENTE         : ${body.sender}`);
        printer.println(`DNI/RUC           : ${body.sender_id}`);
        printer.println(`Teléfono          : ${cellphone}`);
        printer.alignCenter();
        printer.println(printLines()); //------------------------------------------
        printer.println(printLines()); //------------------------------------------
        printer.println(`DATOS DEL DESTINATARIO`)
        printer.alignLeft();
        // CONSIGNADO
        printer.println(printLines()); //------------------------------------------
        printer.println(`CONSIGNADO        : ${body.receiver}`);
        printer.println(`DNI/RUC           : ${body.receiver_id}`);
 
        // CONSIGNADO 2
        printer.println(printLines()); //------------------------------------------
        if ('receiver_2' in body) {
            printer.println(`CONSIGNADO        : ${body.receiver_2}`);
            printer.println(`DNI/RUC           : ${body.receiver_2_id}`);
        }
        printer.println(printLines()); //------------------------------------------
        printer.println(`ENTREGA`);
        printer.println(`DIRECCIÓN: ENTREGAR EN AGENCIA`);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        body.items.map(function (e) {
            printer.table([e.quantity, e.name, e.total]);
        })
        printer.println(`OBSERVACIONES`);
        printer.println(body.observations);
        printer.println(`USTED NO CONTRATO EL SERVICIO DE GARANTIA`);
        printer.println(`Cuenta con una COBERTURA máxima hasta 10 veces el valor del flete sobre el envío afectado.`);
        printer.println(`(Cobertura no aplicable si el daño sufrido fue propio del mal embalaje)`);
        printer.println(`Recibido sin verificación de contenido`);
        printer.alignCenter();
        printer.println(`TOTAL: ${body.total}`);
        let letras = numeroALetras(parseFloat(body.total), {
            plural: 'dólares estadounidenses',
            singular: 'dólar estadounidense',
            centPlural: 'centavos',
            centSingular: 'centavo'
        });

        printer.println(`SON: ${letras}`);
        printer.alignLeft();
        printer.println(`EMBALAJE INAPROPIADO ASUMO CUALQUIER DAÑO QUE PUDIESE SUFRIR DURANTE SU TRASLADO - ${body.sender}`);
        printer.println(`EL REMITENTE ACEPTA EL TRASLADO DEL ENVÍO PARA EL ${body.created_at}`);
        printer.println(`IMPORTANTE`);
        printer.println(`El remitente será responsable de la veracidad de los datos y del contenido brindados . Plazo para el retiro de envío: hasta 48 horas posteriores a su llegada . Cobro de almacenaje . Custodia máximo por 30 días posteriores a su llegada . Abandono del envío: después de los 30 días será desechado, destruido o eliminado sin reclamos posteriores. Los términos, tarifas y condiciones mencionados en el presente boleto son parte de las normas de la empresa para el servicio de encomiendas.`);
        printer.println(`AVISO:`);
        printer.println(`El servicio de envío de encomiendas y carga, necesita el DNI del remitente y del destinatario, así como también número de celular del remitente.`);

        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

app.post('/courier/20605002863', (req, res) => { // ENCOMIENDAS ESANTUR - 20605002863
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        body = body.invoice
        const cellphone = body.cellphone === '' ? '-' : body.cellphone;
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`ESANTUR`);
        printer.bold(false)
        printer.println(`774_1 Panamericana Norte - Terminal Gasela - Cel. 978 282 295`)
        printer.println(`Av. Mesones Muro cdra. 7 terminal Tetsur - Jaén - Cel. 959 666 747`)
        printer.println(`Av. San Ignacio #485 - Cel. 993 742 830`)
        printer.bold(true)
        printer.println(`${body.serie}`);
        printer.bold(false)
        const arrival = body.final_arrival === null || body.final_arrival === '' ? body.arrival : body.final_arrival;
        printer.println(`${arrival.toUpperCase()} - ${body.arrival_district.toUpperCase()}`)
        
        let invoice_type = "BOLETA ELECTRÓNICA"
        if (parseInt(body.document_type) === 6) {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.serie.startsWith('V')) {
            invoice_type = "CONSTANCIA DE VENTA"
        }
        printer.println(`${invoice_type}`);
        printer.alignLeft();
        printer.println(`FECHA EMISION     : ${body.created_at}`);
        printer.println(`FECHA TRANSLADO   : ${body.created_at}`);
        printer.println(`ORIGEN            : ${body.seller_agency}`)
        printer.println(`DESTINO           : ${body.arrival}`)
        printer.println(printLines()); //------------------------------------------
        printer.println(printLines()); //------------------------------------------
        printer.alignCenter();
        printer.println(`DATOS DEL REMITENTE`)
        printer.alignLeft();
        // MENSAJERO
        if ('sender_2' in body) {
            printer.println(`MENSAJERO         : ${body.sender_2}`);
            printer.println(`DNI               : ${body.sender_2_id}`);
        }
 
        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`REMITENTE         : ${body.sender}`);
        printer.println(`DNI/RUC           : ${body.sender_id}`);
        printer.println(`Teléfono          : ${cellphone}`);
        printer.alignCenter();
        printer.println(printLines()); //------------------------------------------
        printer.println(printLines()); //------------------------------------------
        printer.println(`DATOS DEL DESTINATARIO`)
        printer.alignLeft();
        // CONSIGNADO
        printer.println(printLines()); //------------------------------------------
        printer.println(`CONSIGNADO        : ${body.receiver}`);
        printer.println(`DNI/RUC           : ${body.receiver_id}`);
 
        // CONSIGNADO 2
        printer.println(printLines()); //------------------------------------------
        if ('receiver_2' in body) {
            printer.println(`CONSIGNADO        : ${body.receiver_2}`);
            printer.println(`DNI/RUC           : ${body.receiver_2_id}`);
        }
        printer.println(printLines()); //------------------------------------------
        printer.println(`ENTREGA`);
        printer.println(`DIRECCIÓN: ENTREGAR EN AGENCIA`);
        const forma_pago = body.payment_type.toUpperCase() === 'EFECTIVO' ? 'CONTADO' :  body.payment_type;
        printer.println(`FORMA DE PAGO: ${forma_pago}`);
        body.items.map(function (e) {
            printer.table([e.quantity, e.name, e.total]);
        })
        printer.println(`OBSERVACIONES`);
        printer.println(body.observations);
        printer.alignCenter();
        printer.println(`TOTAL: ${body.total}`);
        let letras = numeroALetras(parseFloat(body.total), {
            plural: 'dólares estadounidenses',
            singular: 'dólar estadounidense',
            centPlural: 'centavos',
            centSingular: 'centavo'
        });

        printer.println(`SON: ${letras}`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

app.post('/grt/20529682248', (req, res) => {
    let body = req.body;
    console.log(body);
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    printer.printImage(logo).then(function (done) {
        body = body.invoice
        console.log(body.items);
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println("EMPRESA DE TRANSPORTES DE PASAJEROS EL CRUCERO DE JAEN SOCIEDAD ANONIMA CERRADA");
        printer.bold(false)
        printer.println("AV. MESONES MURO NRO. 642 SEC. AROMO ALTO CAJAMARCA - JAEN - JAEN")
        printer.println(`RUC 20529682248`);
        printer.println('Ventas whatsapp: 977726252');
        printer.println('Atención al cliente: 980 845 273 - 963 450 965');
        printer.println(" ")
        printer.println(" ")
        printer.bold(true)
        printer.println("GUÍA DE REMISIÓN ELECTRÓNICA")
        printer.println("TRANSPORTISTA")
        printer.println(`${body.serie}-${body.number}`)
        printer.bold(false)
        printer.alignLeft();
        printer.println(`Fecha emisión: ${body.created_at}`)
        printer.println(`Fecha traslado: ${body.departure_at}`)
        
        printer.println(" ")

        printer.println(`PUNTO DE PARTIDA: ${body.departure_address}`)
        printer.println(`PUNTO DE LLEGADA: ${body.arrival_address}`)

        printer.println(" ")

        printer.println("DATOS DEL REMITENTE:")
        printer.println(`Nombre/Raz. Social: ${sender}`)
        printer.println(`DNI/RUC: ${sender_document_number}`)

        printer.println(" ")

        printer.println("DATOS DEL DESTINATARIO:")
        printer.println(`Nombre/Raz. Social: ${receiver}`)
        printer.println(`DNI/RUC: ${receiver_document_number}`)

        printer.println(" ")

        printer.println("BIENES POR TRANSPORTAR")
        body.items.map(function (e) {
            printer.table([e.quantity, e.name, e.total]);
        })

        printer.println(" ")

        printer.println("DATOS DE LOS VEHÍCULOS")
        printer.println(`Vehículo principal: ${registration}`)
        printer.println(`DATOS DE LOS CONDUCTORES`)
        printer.println(`Principal: ${driver_name}`)
        printer.println(`Licencia: ${driver_license}`)

        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        printer.clear();
        res.send('<h1>UNO SAN</h1>');
    });
})

function printLines() {
    let paperWidth = printer.getWidth();
    let lines = "";
    for (let i = 1; i <= paperWidth; i++) {
        lines += '-';
    }
    return lines;
}

app.listen(3030, () => console.log(`El servidor de impresión está listo en el puerto 3030. Por favor, no cierres esta ventana durante el proceso de impresión`))


function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

function getLogo() {
    try {
        if (fs.existsSync('./custom_logo.png')) {
            return './custom_logo.png'
        } else {
            return './logo.png';
        }
    } catch (err) {
        return './logo.png';
    }
}

function formatHourString(inputTime){
    // Split the time string into hours and minutes
    const [hours, minutes] = inputTime.split(':');

    // Create a new Date object and set the hours and minutes
    const formattedTime = new Date();
    formattedTime.setHours(parseInt(hours, 10));
    formattedTime.setMinutes(parseInt(minutes, 10));

    // Format the time using Intl.DateTimeFormat
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', timeOptions).format(formattedTime);
}

function formatEmbarkDate(nextDay, input){
    const [day, month, year] = input.split('/');

    // Create a new Date object and set the date to the input date
    const currentDate = new Date(`${year}-${month}-${day}`);

    if(nextDay === 'true' || nextDay === true){
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get the new day, month, and year values
    const newDay = `${currentDate.getDate()}`.padStart(2, '0');
    const newMonth = `${currentDate.getMonth() + 1}`.padStart(2, '0'); // Month is 0-based, so add 1
    const newYear = currentDate.getFullYear();

    // Format the new date in the same format as the input date
    return `${newDay}/${newMonth}/${newYear}`;
}

function printNow() {
    // Input date string
    const currentDate = new Date();


    // Get the new day, month, and year values
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Month is 0-based, so add 1
    const year = currentDate.getFullYear();

    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const time =  Intl.DateTimeFormat('en-US', timeOptions).format(new Date());

    // Format the new date in the same format as the input date
    return `${day}/${month}/${year} ${time}`;
}
