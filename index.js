const m_printer = require('printer')
const printer = require('node-thermal-printer')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
require('dotenv').config()

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())
const jsonParser = bodyParser.json()
console.log(`La actual impresora por defecto es ${m_printer.getDefaultPrinterName()}`)
const default_printer = m_printer.getDefaultPrinterName();

bottom_text = process.env.BOTTOM_TEXT == 'false' ? false : true

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
    console.log(`La impresora está conectada? ${isConnected}`);
});

function printLines(){
    let paperWidth = printer.getWidth();
    let lines = "";
    console.log(paperWidth);
    for(let i = 1; i <= paperWidth; i++){
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

    printer.alignCenter();
    printer.printImage('./logo.png', function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.alignCenter();
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printer.println(printLines());

        let invoice_type = "BOLETA ELECTRÓNICA"
        if (body.enterprise_client_id !== "0") {
            invoice_type = "FACTURA ELECTRÓNICA";
        }
        if (body.is_vale === true) {
            invoice_type = "VALE";
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
        printer.println(`FORMA DE PAGO: ${body.payment_type}`);
        printer.println(printLines()); //----------------------------------

        printer.alignCenter();
        printer.printQR(`${body.ticket_id}`)

        printer.println(`Estimado usuario, verifique las condiciones generales del servicio en nuestra página web www.angeldivino.com.pe`);
        printer.println(`Este boleto se puede canjear por un comprobante electrónico en: https://${body.enterprise_client_web}/mis-comprobantes/`)
        if(bottom_text === true){
            printer.println(additional_data.bottom_text)
        }
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

app.post('/credit-note', (req, res) => {
    console.log(req.body);
    let body = req.body;
    if (typeof (body) === "string") {
        body = JSON.parse(body);
    }

    printer.alignCenter();
    printer.printImage('./logo.png', function (done) {
        printer.println(" ")
        printer.println(" ")
        printer.bold(true)
        printer.println(`${body.enterprise_name}`);
        printer.bold(false)
        printer.println(`${body.enterprise_address}`)
        printer.println(`PUNTO DE EMISIÓN: ${body.current_agency_address}`)
        printer.println(`R.U.C. ${body.enterprise_ruc}`);
        printLines();
        printer.println("NOTA DE CRÉDITO");
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.println(`${body.cancel_serie}-${body.cancel_number}`);
        printer.setTextNormal();
        printer.println(`Para: ${body.ticket_serie}-${body.ticket_number}`);
        printer.partialCut();
        printer.execute(function (err) {
            if (err) {
                console.error(`Print failed`, err);
            } else {
                console.log(`Impreso correctamente`);
            }
        });
        res.send('<h1>PRINTED TICKET</h1>')
    })
})


app.get('/', (req, res) => {
    res.send("HELLO FRIEND")
})

function printLines(){
    let paperWidth = printer.getWidth();
    let lines = "";
    for(let i = 1; i <= paperWidth; i++){
        lines += '-';
    }
    return lines;
}

app.listen(3030, () => console.log(`El servidor de impresión está listo en el puerto 3030. Por favor, no cierres esta ventana durante el proceso de impresión`))


const additional_data = {
    bottom_text: `Sr. Pasajero: 
    1. Revise su boleto antes de retirarse. No se aceptan reclamos posteriores.
    2. Las postergaciones se hacen con 4 horas de anticipacion presentando su boleto en oficinas personalmente.
    3. Portar maletas de uso personal. Libre 20 lilos de equipaje. Todo exceso se pagara una tarifa de acuerdo a la empresa.
    4. La empresa no se responsabiliza por deterioro del equipaje debido al mal embalaje. 
    5. Prohibido transportar animales vivos, liquido y/o productos inflamables.
    6. El pasajero que no se presenta a la hora indicada perderá el valor íntegro del boleto. 
    8. La empresa no se responsabiliza por maletas, paquetes y bulto que contenga dinero, alhajas y objetos de valor que no hubiesen sido declarados previamente.
    9. En caso de perdida de un bulto de equipaje siempre que esté amparado por el comprobante respectivo, la empresa solo abonara el máximo de cincuenta soles(s/.50) de acuerdo con los articulos 105 al 190 de R.G de ff.cc.`
}
