const m_printer = require('printer')
const printer = require('node-thermal-printer')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
const jsonParser = bodyParser.json()
console.log(m_printer.getDefaultPrinterName())
const default_printer = m_printer.getDefaultPrinterName();

printer.init({
    type: 'epson',                                     // Printer type: 'star' or 'epson'
    interface: `printer:${default_printer}`,                        // Printer interface
                          // Printer character set
    removeSpecialCharacters: false,                   // Removes special characters - default: false
    replaceSpecialCharacters: true,                   // Replaces special characters listed in config files - default: true
    extraSpecialCharacters:{'£':163}                  // Adds additional special characters to those listed in the config files
});
  
printer.isPrinterConnected( function(isConnected){
    console.log(`Is the printer connected? ${isConnected}`);
});

app.post('/', (req, res) => {
    console.log(req.body);
    let body = req.body;
    if(typeof(body) === "string"){
        body = JSON.parse(body);
    }
    console.log();

    printer.alignCenter();
    printer.println(`${body.enterprise_name}`);
    printer.println(`R.U.C. ${body.enterprise_ruc}`);
    printer.println("BOLETO DE VENTA");
    printer.println(`${body.serie}-${body.number}`);
    printer.println(" ");
    printer.alignLeft();
    printer.println(`FECHA DE EMISION: ${body.now}`);
    printer.println(`FECHA DE COMPRA: ${body.buy_date}`);
    printer.println(`VENDEDOR: ${body.seller}`);
    printer.drawLine();
    printer.println(`DOC PASAJERO:     ${body.dni}`);
    printer.println(`NOMBRES PASAJERO: ${body.passenger_name}`);
    printer.println(`ORIGEN:           ${body.departure}`);
    printer.println(`DESTINO:          ${body.arrival}`);
    printer.setTextDoubleHeight();                      // Set text to double height
    printer.setTextDoubleWidth();  
    printer.println(`FECHA VIAJE: ${body.departure_date}`);
    printer.println(`HORA VIAJE: ${body.departure_hour}`);
    printer.println(`ASIENTO: ${body.seat}`);
    printer.setTextNormal();    
    printer.println(`IMPORTE:          S/. ${body.total}`);
    printer.println(`OBSERVACIONES:    ${body.additional_info}`);
    printer.drawLine();
    printer.partialCut();
    printer.execute(function(err){
      if (err) {
        console.error(`Print failed`, err);
      } else {
       console.log(`Print done`);
      }
    });
    res.send('<h1>UNO SAN</h1>')
})

app.get('/', (req, res) => {
    res.send("HELLO FRIEND")
})

app.listen(3030, () => console.log(`Example app listening on port 3030`))
