using System;
using System.Collections.Generic;
using System.Linq;
using MeliPrinter.Models;

namespace MeliPrinter.Data
{
    public static class Enterprises
    {
        private static readonly Dictionary<string, Enterprise> _enterprises = new Dictionary<string, Enterprise>
        {
            ["20395419715"] = new Enterprise
            {
                Name = "TOURS ANGEL DIVINO",
                InvoiceLabel = new InvoiceLabel(),
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TOURS ANGEL DIVINO", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20610533443"] = new Enterprise
            {
                Name = "TARAPOTO",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TARAPOTO", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20612671720"] = new Enterprise
            {
                Name = "SIBERIANO",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "SIBERIANO", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "Telf. 925 193 119 - 917 440 001" },
                }
            },
            ["20605002863"] = new Enterprise
            {
                Name = "ESANTUR",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "ESANTUR", Bold = true, Align = "center" },
                    new HeaderItem { Text = "774_1 Panamericana Norte - Terminal Gasela - Cel. 978 282 295" },
                    new HeaderItem { Text = "Av. Mesones Muro cdra. 7 terminal Tetsur - Ja\u00e9n - Cel. 959 666 747" },
                    new HeaderItem { Text = "Av. San Ignacio #485 - Cel. 993 742 830" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20609883309"] = new Enterprise
            {
                Name = "CHOTA BUSS",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "CHOTA BUSS", Bold = true, Align = "center" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = "R.U.C. 20609883309" },
                    new HeaderItem { Text = "Telf. 956 678 577 - 969 026 229" },
                    new HeaderItem { Text = "Jr. Comercio 216 - Chota - Cel. 969 026 229" },
                }
            },
            ["20603488173"] = new Enterprise
            {
                Name = "BUSTAMANTE",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "BUSTAMANTE", Bold = true, Align = "center" },
                    new HeaderItem { Text = "R.U.C. 20603488173" },
                    new HeaderItem { Text = "Santa Cruz - Cajamarca" },
                    new HeaderItem { Text = "Santa Cruz : 938 679 139" },
                    new HeaderItem { Text = "Catache : 942 695 400" },
                    new HeaderItem { Text = "Racarrumi : Prolongaci\u00f3n Ascope S/N" },
                }
            },
            ["20603446004"] = new Enterprise
            {
                Name = "IMPERIAL",
                InvoiceLabel = new InvoiceLabel
                {
                    Boleta = "BOLETA DE VENTA ELECTR\u00d3NICA",
                    Factura = "FACTURA DE VENTA ELECTR\u00d3NICA",
                    Vale = "VALE"
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "IMPERIAL", Bold = true, Align = "center" },
                    new HeaderItem { Text = "R.U.C. 20603446004" },
                    new HeaderItem { Text = "Av. saenz pe\u00f1a 227 - SJL" },
                    new HeaderItem { Text = "Terrapuerto: 981 314 264" },
                    new HeaderItem { Text = "Plaza Norte: 981 314 264" },
                    new HeaderItem { Text = "Principal: 01 448 1431" },
                }
            },
            ["20600916239"] = new Enterprise
            {
                Name = "SOL CHOTANO",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "SOL CHOTANO", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20480150857"] = new Enterprise
            {
                Name = "TORRES",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TORRES", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "Chiclayo: 979 670 125 / Tarapoto: 979 670 125" },
                    new HeaderItem { Text = "Chota: 979 670 125 / Nueva Cajamarca: 979 670 125" },
                }
            },
            ["20604950512"] = new Enterprise
            {
                Name = "MURGA",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "MURGA", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20608151771"] = new Enterprise
            {
                Name = "ANGEL DIVINO BUS",
                InvoiceLabel = new InvoiceLabel
                {
                    Boleta = "BOLETA DE VENTA ELECTR\u00d3NICA",
                    Factura = "FACTURA ELECTR\u00d3NICA",
                    Vale = "VALE"
                },
                UseEmbarkTime = true,
                ExtraFields = new List<string> { "operation_code", "observation", "service_title", "soat_provider", "soat" },
                Terms = new List<string>
                {
                    "* PRESENTARSE 30 MINUTOS ANTES DEL EMBARQUE",
                    "* NI\u00d1OS A PARTIR DE 5 A\u00d1OS ABONAN PASAJE COMPLETO, MENORES DE 14 A\u00d1OS CON DNI O PARTIDA DE NACIMIENTO",
                    "* 20Kg DE EQUIPAJE SIN COSTO",
                    "* NOS RESPONSABILIZAMOS POR SU EQUIPAJE SIEMPRE QUE PORTE SU COMPROBANTE",
                    "* NO NOS RESPONSABILIZAMOS POR OBJETOS DE VALOR NO DECLARADOS - TERMINO Y CONDICIONES AL REVERSO DEL BOLETO",
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "ANGEL DIVINO BUS", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Calle Nicol\u00e1s de Pierola 720 URB.Campodonico- Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "Telf. 979670125 - 978588680 - 979670125" },
                }
            },
            ["20614709562"] = new Enterprise
            {
                Name = "NUEVO ILUCAN",
                InvoiceLabel = new InvoiceLabel
                {
                    Boleta = "BOLETA DE VENTA ELECTR\u00d3NICA",
                    Factura = "FACTURA ELECTR\u00d3NICA",
                    Vale = "VALE"
                },
                UseEmbarkTime = true,
                ExtraFields = new List<string> { "observation", "service_title", "soat_provider", "soat" },
                Terms = new List<string>
                {
                    "* PRESENTARSE 30 MIN ANTES DE LA HORA DE EMBARQUE",
                    "* NO SE PERMITE EL EMBARQUE A PERSONAS CON SIGNOS DE EBRIEDAD, ALCOHOL Y DROGAS, PREVIA PRUEBA DE ALCOHOLIMETR\u00cdA",
                    "* NI\u00d1OS A PARTIR DE 5 A\u00d1OS ABONAN PASAJE COMPLETO, MENORES DE 14 A\u00d1OS CON DNI Y/O PARTIDA DE NACIMIENTO, ACOMPA\u00d1ADOS CON PERMISO DE PADRES",
                    "* 20Kg DE EQUIPAJE SIN COSTO",
                    "* EXCESO DE EQUIPAJE ESTAR\u00c1 SUJETO A ESPACIO Y TARIFARIO DE LA EMPRESA",
                    "* NO NOS RESPONSABILIZAMOS POR OBJETOS DE VALOR NO DECLARADOS",
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "NUEVO ILUCAN", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "Telf. 979670125 - 978588680 - Chiclayo: 979670125" },
                }
            },
            ["20612365432"] = new Enterprise
            {
                Name = "NUEVO SAN ANTONIO",
                UseEmbarkTime = true,
                ExtraFields = new List<string> { "soat_provider", "soat" },
                Terms = new List<string> { "PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE" },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "NUEVO SAN ANTONIO", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Jr. San Mart\u00edn Nro. 386 P.J. San Antonio (Espalda Mercado) - Ja\u00e9n - Ja\u00e9n - Cajamarca" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = "R.U.C. 20612365432" },
                }
            },
            ["20529682248"] = new Enterprise
            {
                Name = "CRUCERO JAEN",
                ShowUbigeo = true,
                ExtraFields = new List<string> { "additional_info" },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "Transportes El Crucero de Ja\u00e9n S.A.C", Bold = true, Align = "center" },
                    new HeaderItem { Text = "CRUCERO JA\u00c9N" },
                    new HeaderItem { Text = "Av. Mesones Muro 642 Aromo Alto Ja\u00e9n" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"{b.arrival} - {b.ubigeo_arrival}" },
                    new HeaderItem { Text = "Atenci\u00f3n al cliente: 980 845 273 - 963 450 965" },
                }
            },
            ["20614485168"] = new Enterprise
            {
                Name = "LINEBUS",
                InvoiceLabel = new InvoiceLabel
                {
                    Boleta = "BOLETA DE VENTA ELECTR\u00d3NICA",
                    Factura = "FACTURA ELECTR\u00d3NICA",
                    Vale = "VALE"
                },
                ShowUbigeo = true,
                ExtraFields = new List<string> { "additional_info" },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TRANSPORTES LINEBUS S.A.C.", Bold = true, Align = "center" },
                    new HeaderItem { Text = "JAEN BUS" },
                    new HeaderItem { Text = "RUC: 20614485168" },
                    new HeaderItem { Text = "MZA. C LOTE. 01 P.J. JUAN PABLO PEREGRINO" },
                    new HeaderItem { Text = "PUNTO DE EMISI\u00d3N: Chiclayo" },
                    new HeaderItem { Text = $"DIRECCI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20600308883"] = new Enterprise
            {
                Name = "CHOTA EXPRESS",
                ShowUbigeo = true,
                ExtraFields = new List<string> { "observation" },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "CHOTA EXPRESS", Bold = true, Align = "center" },
                    new HeaderItem { Text = "TRANSPORTES CHOTA EXPRESS S.A.C." },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = "R.U.C. 20600308883" },
                    new HeaderItem { Text = "Chiclayo: 978588680 / 979670125" },
                    new HeaderItem { Text = "Chota: 979744925 / 978822785" },
                    new HeaderItem { Text = "Cajamarca: 978822785 / 979744925" },
                    new HeaderItem { Text = "Celend\u00edn: 979890274" },
                    new HeaderItem { Text = $"{b.arrival} - {b.ubigeo_arrival}" },
                }
            },
            ["20604329036"] = new Enterprise
            {
                Name = "VIA EN BUS",
                ShowUbigeo = true,
                ExtraFields = new List<string> { "additional_info" },
                Terms = new List<string>
                {
                    "EL BOLETO ES PERSONAL E INTRANSFERIBLE",
                    "EL PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE, EL EXCESO SE PAGARA",
                    "EL PASAJERO CUENTA CON UN SEGURO SOAT",
                    "LA EMPRESA NO SE RESPONSABILIZA POR EL EQUIPAJE UBICADO EN EL SALON DEL BUS",
                    "LAS POSTERGACIONES SE REALIZAN HASTA 3 HORAS ANTES DEL VIAJE",
                    "LOS NI\u00d1OS MAYORES DE 5 A\u00d1OS PAGAN EL 100% DEL PASAJE",
                    "EL PASAJERO DEBE PRESENTARSE 1 HORA ANTES DEL EMBARQUE, CASO CONTRARIO PERDERA SU PASAJE",
                    "PROHIBIDO TRANSPORTAR ARMAS DE FUEGO, PUNZOCORTANTES Y OBJETOS PELIGROSOS",
                    "PROHIBIDO ABORDAR EN ESTADO DE EBRIEDAD O BAJO EFECTOS DE DROGAS, CASO CONTRARIO PERDERA SU BOLETO",
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "VIA EN BUS", Bold = true, Align = "center" },
                    new HeaderItem { Text = "TRANSPORTES VIA EN BUS S.A.C." },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = "R.U.C. 20604329036" },
                    new HeaderItem { Text = $"{b.arrival} - {b.ubigeo_arrival}" },
                }
            },
            ["20491796856"] = new Enterprise
            {
                Name = "EZAPE",
                ShowUbigeo = true,
                ExtraFields = new List<string> { "additional_info" },
                Terms = new List<string>
                {
                    "EL BOLETO ES PERSONAL E INTRANSFERIBLE",
                    "EL PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE, EL EXCESO SE PAGARA",
                    "EL PASAJERO CUENTA CON UN SEGURO SOAT",
                    "LA EMPRESA NO SE RESPONSABILIZA POR EL EQUIPAJE UBICADO EN EL SALON DEL BUS",
                    "LAS POSTERGACIONES SE REALIZAN HASTA 3 HORAS ANTES DEL VIAJE",
                    "LOS NI\u00d1OS MAYORES DE 5 A\u00d1OS PAGAN EL 100% DEL PASAJE",
                    "EL PASAJERO DEBE PRESENTARSE 1 HORA ANTES DEL EMBARQUE, CASO CONTRARIO PERDERA SU PASAJE",
                    "PROHIBIDO TRANSPORTAR ARMAS DE FUEGO, PUNZOCORTANTES Y OBJETOS PELIGROSOS",
                    "PROHIBIDO ABORDAR EN ESTADO DE EBRIEDAD O BAJO EFECTOS DE DROGAS, CASO CONTRARIO PERDERA SU BOLETO",
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "EZAPE", Bold = true, Align = "center" },
                    new HeaderItem { Text = "TRANSPORTES EZAPE-LAJAS EIRL" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = "R.U.C. 20491796856" },
                    new HeaderItem { Text = $"{b.arrival} - {b.ubigeo_arrival}" },
                }
            },
            ["20603236310"] = new Enterprise
            {
                Name = "TURISMO M. BUS",
                ShowUbigeo = true,
                ExtraFields = new List<string> { "additional_info" },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TURISMO M. BUS", Bold = true, Align = "center" },
                    new HeaderItem { Text = "TURISMO M. BUS E.I.R.L." },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = $"{b.arrival} - {b.ubigeo_arrival}" },
                }
            },
            ["20602391982"] = new Enterprise
            {
                Name = "TOURS ILUCAN",
                ExtraFields = new List<string> { "soat_provider", "soat" },
                Terms = new List<string>
                {
                    "PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE",
                    "TODO PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE DE MANO",
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TOURS ILUCAN", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "Telf. 979670125 - 978588680 - Chiclayo: 979670125" },
                }
            },
            ["20495803121"] = new Enterprise
            {
                Name = "TOURS CORAZON",
                ExtraFields = new List<string> { "soat", "registration" },
                Terms = new List<string>
                {
                    "PRESENTARSE 30 MINUTOS ANTES DE LA HORA DE EMBARQUE",
                    "TODO PASAJERO TIENE DERECHO A LLEVAR 20 KILOS DE EQUIPAJE DE MANO",
                },
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "TOURS CORAZON", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "BAGUA GRANDE| 976608091" },
                    new HeaderItem { Text = $"Telf. {b.enterprise_telephone}" },
                }
            },
            ["20529522801"] = new Enterprise
            {
                Name = "COMBIS",
                Header = (b) => new List<HeaderItem>
                {
                    new HeaderItem { Text = "COMBIS", Bold = true, Align = "center" },
                    new HeaderItem { Text = "Av. Jos\u00e9 Leonardo Ortiz 1528 - Chiclayo" },
                    new HeaderItem { Text = $"PUNTO DE EMISI\u00d3N: {b.seller_agency}" },
                    new HeaderItem { Text = $"R.U.C. {b.enterprise_ruc}" },
                    new HeaderItem { Text = "Telf. 979670125 - 978588680" },
                    new HeaderItem { Text = "Chota: 979744925 / 978822785" },
                }
            },
        };

        public static Enterprise GetEnterprise(string ruc)
        {
            _enterprises.TryGetValue(ruc, out var enterprise);
            return enterprise;
        }

        public static List<HeaderItem> ResolveHeader(Enterprise enterprise, dynamic body)
        {
            var items = (List<HeaderItem>)enterprise.Header(body);
            return items;
        }
    }
}
