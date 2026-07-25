using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MeliPrinter.Data;
using MeliPrinter.Models;
using MeliPrinter.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace MeliPrinter.Controllers
{
    [ApiController]
    public class PrintController : ControllerBase
    {
        private readonly PrintService _printService;
        private readonly UpdateService _updateService;
        private readonly JObject _clientData;

        public PrintController(PrintService printService, UpdateService updateService, ClientDataService clientDataService)
        {
            _printService = printService;
            _updateService = updateService;
            _clientData = clientDataService.Data;
        }

        private JObject ParseBody()
        {
            var body = Request.Body;
            using var reader = new System.IO.StreamReader(body);
            var text = reader.ReadToEndAsync().Result;
            return JObject.Parse(text);
        }

        [HttpPost("ticket/invoice/{ruc}")]
        public IActionResult PrintInvoice(string ruc)
        {
            var enterprise = Enterprises.GetEnterprise(ruc);
            if (enterprise == null)
                return NotFound(new { error = $"Empresa no encontrada: {ruc}" });

            var body = ParseBody();
            Console.WriteLine($"[ticket] {ruc} - {body["serie"]?.Value<string>()}-{body["number"]?.Value<string>()}");

            bool success;
            if (ruc == "20603446004")
                success = _printService.PrintImperialTicket(body, enterprise, _clientData);
            else
                success = _printService.PrintTicket(body, enterprise, _clientData);

            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });

            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpPost("credit-note")]
        public IActionResult PrintCreditNote()
        {
            var body = ParseBody();
            Console.WriteLine("[credit-note]");
            var success = _printService.PrintCreditNote(body, _clientData);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>PRINTED TICKET</h1>", "text/html");
        }

        [HttpPost("money-transfer")]
        public IActionResult PrintMoneyTransfer()
        {
            var body = ParseBody();
            Console.WriteLine("[money-transfer]");
            var success = _printService.PrintMoneyTransfer(body, _clientData);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpPost("logistics")]
        public IActionResult PrintLogistics()
        {
            var body = ParseBody();
            Console.WriteLine("[logistics]");
            var success = _printService.PrintLogistics(body);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpPost("logistics/budget")]
        public IActionResult PrintBudget()
        {
            var body = ParseBody();
            Console.WriteLine("[logistics/budget]");
            var success = _printService.PrintBudget(body);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpPost("encomiendas")]
        public IActionResult PrintCourier()
        {
            var body = ParseBody();
            Console.WriteLine("[encomiendas]");
            var success = _printService.PrintCourier(body, _clientData);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        private static readonly Dictionary<string, Func<JObject, CourierConfig>> CourierConfigs = new Dictionary<string, Func<JObject, CourierConfig>>
        {
            ["20608151771"] = (inv) => new CourierConfig
            {
                Title = inv["enterprise_name"]?.Value<string>(),
                Contact = "Ventas internet autorizados Chiclayo: 958842029 |954909021| 942057662| 907758392",
                Warnings = "",
                ExtraFooter = "DECLARACI\u00d3N JURADA DE TRANSPORTE\nEn m\u00e9rito a la Ley del Procedimiento Administrativo General, Ley N\u00ba 27444; declaro que las mercanc\u00edas amparadas en el presente comprobante, est\u00e1n siendo transportadas bajo mi cuenta y riesgo.\nUSTED EST\u00c1 ACEPTANDO LAS CONDICIONES DE ENVIO DEL COMPROBANTE QUE SE LE ENTREG\u00d3\nVerifique las condiciones condiciones generales del servicio al reverso del comprobante\n\u00a1Gracias por su preferencia ANGEL DIVINO m\u00e1s cerca de Ud\u2026.!"
            },
            ["20395419715"] = (inv) => new CourierConfig
            {
                Title = inv["enterprise_name"]?.Value<string>(),
                Contact = "",
                RucLine = $"R.U.C. {inv["enterprise_ruc"]?.Value<string>()}",
                Warnings = "",
                ExtraFooter = "RECOMENDACIONES\nRECOJO : DNI ORIGINAL\nCLAVE  : 4 DIGITOS\nPAQUETE : EMBALADO\nSU ENCOMIENDA NO HA SIDO VERIFICADA; VIAJA POR CUENTA DEL REMITENTE\nSU ENCOMIENDA Y/O CARGA VIAJA CON UN SEGURO EST\u00c1NDAR QUE EN CASO DE PERDIDA, EXTRAVIO, AVERIA, DETERIORO O ROBO CUBRE UN MONTO HASTA 10 VECES DEL VALOR DEL FLETE PAGADO. DECRETO SUPREMO N\u00ba 032-2005-MTC."
            },
            ["20529682248"] = (inv) => new CourierConfig
            {
                Title = "Transportes El Crucero de Ja\u00e9n S.A.C",
                RucLine = "RUC: 20529682248",
                ExtraLines = new List<string> { "Avenida Mesones Muro 642 Aromo Alto Ja\u00e9n" },
                Contact = "Ventas whatsapp: 977726252\nAtenci\u00f3n al cliente: 980 845 273 - 963 450 965",
                Warnings = "USTED NO CONTRATO EL SERVICIO DE GARANTIA\nCuenta con una COBERTURA m\u00e1xima hasta 10 veces el valor del flete sobre el env\u00edo afectado.\n(Cobertura no aplicable si el da\u00f1o sufrido fue propio del mal embalaje)\nRecibido sin verificaci\u00f3n de contenido",
                ExtraFooter = $"EMBALAJE INAPROPIADO ASUMO CUALQUIER DA\u00d1O QUE PUDIESE SUFRIR DURANTE SU TRASLADO - {inv["sender"]?.Value<string>()}\nEL REMITENTE ACEPTA EL TRASLADO DEL ENV\u00cdO PARA EL {inv["created_at"]?.Value<string>()}\nIMPORTANTE\nEl remitente ser\u00e1 responsable de la veracidad de los datos y del contenido brindados . Plazo para el retiro de env\u00edo: hasta 48 horas posteriores a su llegada . Cobro de almacenaje . Custodia m\u00e1ximo por 30 d\u00edas posteriores a su llegada . Abandono del env\u00edo: despu\u00e9s de los 30 d\u00edas ser\u00e1 desechado, destruido o eliminado sin reclamos posteriores.\nAVISO:\nEl servicio de env\u00edo de encomiendas y carga, necesita el DNI del remitente y del destinatario, as\u00ed como tambi\u00e9n n\u00famero de celular del remitente."
            },
            ["20614485168"] = (inv) => new CourierConfig
            {
                Title = "TRANSPORTES LINEBUS S.A.C.",
                RucLine = "RUC: 20614485168",
                ExtraLines = new List<string> { "MZA. C LOTE. 01 P.J. JUAN PABLO PEREGRINO" },
                Contact = "---",
                Warnings = "USTED NO CONTRATO EL SERVICIO DE GARANTIA\nCuenta con una COBERTURA m\u00e1xima hasta 10 veces el valor del flete sobre el env\u00edo afectado.\n(Cobertura no aplicable si el da\u00f1o sufrido fue propio del mal embalaje)\nRecibido sin verificaci\u00f3n de contenido",
                ExtraFooter = $"EMBALAJE INAPROPIADO ASUMO CUALQUIER DA\u00d1O QUE PUDIESE SUFRIR DURANTE SU TRASLADO - {inv["sender"]?.Value<string>()}\nEL REMITENTE ACEPTA EL TRASLADO DEL ENV\u00cdO PARA EL {inv["created_at"]?.Value<string>()}\nIMPORTANTE\nEl remitente ser\u00e1 responsable de la veracidad de los datos y del contenido brindados . Plazo para el retiro de env\u00edo: hasta 48 horas posteriores a su llegada . Cobro de almacenaje . Custodia m\u00e1ximo por 30 d\u00edas posteriores a su llegada . Abandono del env\u00edo: despu\u00e9s de los 30 d\u00edas ser\u00e1 desechado, destruido o eliminado sin reclamos posteriores.\nAVISO:\nEl servicio de env\u00edo de encomiendas y carga, necesita el DNI del remitente y del destinatario, as\u00ed como tambi\u00e9n n\u00famero de celular del remitente."
            },
            ["20605002863"] = (inv) => new CourierConfig
            {
                Title = "ESANTUR",
                RucLine = "",
                ExtraLines = new List<string>(),
                Contact = "",
                Warnings = "",
                ExtraFooter = ""
            },
        };

        [HttpPost("courier/{ruc}")]
        public IActionResult PrintCourierGeneric(string ruc)
        {
            if (!CourierConfigs.TryGetValue(ruc, out var configFn))
                return NotFound(new { error = $"Configuraci\u00f3n no encontrada: {ruc}" });

            var body = ParseBody();
            Console.WriteLine($"[courier] {ruc}");
            var success = _printService.PrintCourierGeneric(body, configFn);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpPost("courier/shipping-order/20529682248")]
        public IActionResult PrintShippingOrder()
        {
            var body = ParseBody();
            Console.WriteLine("[shipping-order]");
            var success = _printService.PrintShippingOrder(body);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpPost("grt/20529682248")]
        public IActionResult PrintGrt()
        {
            var body = ParseBody();
            Console.WriteLine("[grt]");
            var success = _printService.PrintGrt(body);
            if (!success)
                return StatusCode(500, new { error = "Error de impresi\u00f3n" });
            return Content("<h1>UNO SAN</h1>", "text/html");
        }

        [HttpGet("/")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "ok",
                version = _updateService.GetCurrentVersion(),
                printer = Environment.GetEnvironmentVariable("PRINTER_NAME") ?? "default",
                port = 3030
            });
        }
    }
}
