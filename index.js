const m_printer = require('printer')
const printer = require('node-thermal-printer')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}))
const jsonParser = bodyParser.json()
console.log(m_printer.getDefaultPrinterName())
const default_printer = m_printer.getDefaultPrinterName();

printer.init({
    type: 'epson', // Printer type: 'star' or 'epson'
    interface: `printer:${default_printer}`, // Printer interface
    characterSet: 'CHARCODE_SPAIN1', // Printer character set
    removeSpecialCharacters: false, // Removes special characters - default: false
    replaceSpecialCharacters: true, // Replaces special characters listed in config files - default: true
    extraSpecialCharacters: {
        '£': 163
    } // Adds additional special characters to those listed in the config files
});

printer.isPrinterConnected(function (isConnected) {
    console.log(`Is the printer connected? ${isConnected}`);
});

app.post('/', (req, res) => {
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }
    console.log();

    printer.alignCenter();
    printer.printImage('./logo.png', function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println('AV. JORGE CHAVEZ N° 1365 URB. CAMPODONICO –   CHICLAYO – LAMBAYEQUE')
        printer.println(`PUNTO DE EMISIÓN: `)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.drawLine();

        printer.println("BOLETO DE VENTA");
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.serie}-${body.number}`);
        printer.setTextNormal();
        printer.alignLeft();
        printer.println(`FECHA EMISION: ${body.buy_date}`);
        printer.println(`ATENDIDO POR : ${body.seller}`);
        printer.drawLine();
        if (body.enterpriseClient === true) {
            printer.println(`RAZÓN SOCIAL: ${body.ruc}`);
            printer.println(`RUC         : ${body.enterprise_name}`);
        }
        printer.println(`DOC PASAJERO: ${body.dni}`);
        printer.println(`PASAJERO    : ${body.passenger_name}`);
        printer.drawLine();
        printer.alignCenter();
        printer.bold(true);
        printer.println(`DATOS DEL VIAJE`);
        printer.bold(false);
        printer.drawLine();
        printer.alignLeft();
        //printer.setTextDoubleHeight();                      // Set text to double height
        printer.setTextDoubleWidth();
        printer.println(`ORIGEN     : ${body.departure}`);
        printer.println(`DESTINO    : ${body.arrival}`);
        printer.println(`FECHA VIAJE: ${body.departure_date}`);
        printer.println(`HORA VIAJE : ${body.departure_hour}`);
        printer.println(`ASIENTO    : ${body.seat}`);
        printer.println(`IMPORTE    : S/ ${body.total}`);
        printer.setTextNormal();

        printer.drawLine();
        printer.alignCenter();
        printer.println(`SON: ${body.total_letter}`);
        printer.alignLeft();

        printer.drawLine(); //----------------------------------
        printer.println(`FORMA DE PAGO: ${body.payment_type}`);
        printer.drawLine(); //----------------------------------

        printer.alignCenter();
        printer.printQR(`${body.ticket_id}`)

        printer.println(`Estimado usuario, verifique las condiciones generales del servicio en nuestra página web www.angeldivino.com.pe`);
        printer.println(`Este boleto se puede canjear por un comprobante electrónico en: https://angeldivino.com/mis-comprobantes/`)
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Print done`);
            }
        });
        res.send('<h1>UNO SAN</h1>')
    });

})

app.get('/', (req, res) => {
    res.send("HELLO FRIEND")
})

app.listen(3030, () => console.log(`Example app listening on port 3030`))
