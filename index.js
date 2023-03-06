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
        printer.println(`DIRECCION. LAJAS JR. ROSENDO MENDIVEL 088 - CHOTA CORONEL BECERRA 337 - CAJAMARCA JR. PUNO 230-232`);
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
        printer.println(`Telf. ${body.enterprise_telephone || ''} - Juanjui: 990 009 838`);
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
        if ('sender_2' in body) {
            printer.println(`MENSAJERO         : ${body.sender_2}`);
            printer.println(`DNI               : ${body.sender_2_id}`);
        }

        // REMITENTE
        printer.println(printLines()); //------------------------------------------
        printer.println(`REMITENTE         : ${body.sender}`);
        printer.println(`DNI/RUC           : ${body.sender_id}`);
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
