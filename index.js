const m_printer = require('printer')
const printer = require('node-thermal-printer')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const fs = require('fs')
const numeroALetras = require('./numeroALetra')

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
  }else{
	console.log('EL ARCHIVO NO EXISTE. COPIANDO DESDE EL TEMPLATE')
	fs.copyFileSync('./additional_data.js.template', './additional_data.js');
  }

const client_data = require('./additional_data.js');

let logo = getLogo();


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
	printer.printImage(logo, function (done) {
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
			printer.bold(true);
			printer.println(`FORMA DE PAGO: ${body.payment_type}`);
			printer.bold(false);
			printer.println(printLines()); //----------------------------------

			printer.alignCenter();
			printer.printQR(`${body.ticket_id}`)

			if(client_data.client_data.print_bottom === true){
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

	if('credit_note' in body){
		body = body.credit_note;
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

app.post('/money-transfer/', (req, res) => {
	let body = req.body;
	console.log(body);
	if (typeof (body) === "string") {
		body = JSON.parse(body);
	}

	printer.printImage(logo, function (done) {
		body = body.transfer
		console.log(body.items);
		printer.println(" ")
		printer.println(" ")
		printer.alignCenter();
		printer.bold(true)
		printer.println(`TOURS ANGEL DIVINO SAC`);
		printer.bold(false)
		printer.println(`Av. Jorge Chavez Nro. 1365`)
		printer.println(`PUNTO DE EMISIÓN: ${body.current_agency}`)
		printer.println(`R.U.C. 20395419715`);
		printer.println(printLines());

		printer.println('GIRO - TRANSFERENCIA DE DINERO');
		printer.setTextDoubleHeight();
		printer.setTextDoubleWidth();
		printer.println(`${body.serie}`);
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

		if(client_data.client_data.print_bottom === true){
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
		res.send('<h1>UNO SAN</h1>')
});


})


app.post('/encomiendas/', (req, res) => {
	let body = req.body;
	console.log(body);
	if (typeof (body) === "string") {
		body = JSON.parse(body);
	}
	printer.printImage(logo, function (done) {
			body = body.invoice
			console.log(body.items);
			printer.println(" ")
			printer.println(" ")
			printer.alignCenter();
			printer.bold(true)
			printer.println(`TOURS ANGEL DIVINO SAC`);
			printer.bold(false)
			printer.println(`Av. Jorge Chavez Nro. 1365`)
			printer.println(`PUNTO DE EMISIÓN: ${body.seller_agency}`)
			printer.println(`R.U.C. 20395419715`);
			printer.println(printLines());

			let arrival = body.final_arrival === '' ? body.arrival : body.final_arrival;

			let invoice_type = "BOLETA ELECTRÓNICA"
			if (parseInt(body.document_type) === 6) {
				invoice_type = "FACTURA ELECTRÓNICA";
			}
			if(body.serie.startsWith('V')){
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
			if('sender_2' in body){
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
			if('receiver_2' in body){
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
			printer.println(`FORMA DE PAGO: ${body.payment_type}`);
			printer.bold(false);
			printer.println(printLines()); //----------------------------------

			printer.alignCenter();
			printer.printQR(`${body.ticket_id}`)

			if(client_data.client_data.print_bottom === true){
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
			res.send('<h1>UNO SAN</h1>')
	});

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

function getLogo(){
	try {
		if (fs.existsSync('./custom_logo.png')) {
		  return './custom_logo.png'
		}
	} catch(err) {
		return './logo.png'
	}    
}
