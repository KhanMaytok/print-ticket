using System;
using System.IO;
using System.Linq;
using MeliPrinter.Data;
using MeliPrinter.Models;
using Newtonsoft.Json.Linq;

namespace MeliPrinter.Services
{
    public class PrintService
    {
        private readonly EscPosPrinter _printer;

        public PrintService(EscPosPrinter printer)
        {
            _printer = printer;
        }

        private static string GetInvoiceType(JObject body, Enterprise enterprise)
        {
            if (body["is_vale"]?.Value<bool>() == true)
                return enterprise.InvoiceLabel.Vale;
            if (body["enterprise_client_id"]?.Value<string>() != "0")
                return enterprise.InvoiceLabel.Factura;
            return enterprise.InvoiceLabel.Boleta;
        }

        private static string GetStr(JObject obj, string key, string fallback = "")
        {
            return obj[key]?.Value<string>() ?? fallback;
        }

        private static string GetStr(JObject obj, params string[] keys)
        {
            foreach (var key in keys)
            {
                var val = obj[key]?.Value<string>();
                if (!string.IsNullOrEmpty(val)) return val;
            }
            return "";
        }

        private static void AddTotalLetras(JObject body)
        {
            var totalLetter = GetStr(body, "total_letter");
            if (totalLetter == "---" || string.IsNullOrEmpty(totalLetter))
            {
                var total = body["total"]?.Value<decimal>() ?? 0;
                body["total_letter"] = NumberToWords.Convert(total);
            }
        }

        private static string FormatHourString(string inputTime)
        {
            if (string.IsNullOrEmpty(inputTime)) return "";
            var parts = inputTime.Split(':');
            if (parts.Length < 2) return inputTime;
            if (int.TryParse(parts[0], out int hours) && int.TryParse(parts[1], out int minutes))
            {
                var ampm = hours >= 12 ? "PM" : "AM";
                if (hours > 12) hours -= 12;
                if (hours == 0) hours = 12;
                return $"{hours}:{minutes:D2} {ampm}";
            }
            return inputTime;
        }

        private static string FormatEmbarkDate(string nextDay, string input)
        {
            if (nextDay == "false" || string.IsNullOrEmpty(input)) return input;
            var parts = input.Split('/');
            if (parts.Length < 3) return input;
            if (int.TryParse(parts[0], out int day) &&
                int.TryParse(parts[1], out int month) &&
                int.TryParse(parts[2], out int year))
            {
                var date = new DateTime(year, month, day);
                if (nextDay == "true") date = date.AddDays(1);
                return $"{date.Day:D2}/{date.Month:D2}/{date.Year}";
            }
            return input;
        }

        private static string PrintNow()
        {
            var now = DateTime.Now;
            var ampm = now.Hour >= 12 ? "PM" : "AM";
            var hour = now.Hour > 12 ? now.Hour - 12 : (now.Hour == 0 ? 12 : now.Hour);
            return $"{now.Day}/{now.Month}/{now.Year} {hour}:{now.Minute:D2} {ampm}";
        }

        private string GetLogo()
        {
            var dir = AppDomain.CurrentDomain.BaseDirectory;
            if (File.Exists(Path.Combine(dir, "custom_logo.png")))
                return Path.Combine(dir, "custom_logo.png");
            return Path.Combine(dir, "logo.png");
        }

        private void ApplyHeader(JObject body, Enterprise enterprise)
        {
            var headerItems = enterprise.Header(body);
            foreach (var item in headerItems)
            {
                if (item.Bold == true) _printer.Bold(true);
                if (item.Bold == false) _printer.Bold(false);
                if (item.Align == "center") _printer.AlignCenter();
                if (item.Align == "left") _printer.AlignLeft();
                if (item.Size?.DoubleHeight == true) _printer.SetTextDoubleHeight();
                if (item.Size?.DoubleWidth == true) _printer.SetTextDoubleWidth();
                if (item.Size?.Normal == true) _printer.SetTextNormal();
                _printer.Println(item.Text);
            }
            _printer.Bold(false);
        }

        private void ApplyDirective(dynamic d)
        {
            if (d.bold == true) _printer.Bold(true);
            if (d.bold == false) _printer.Bold(false);
            if (d.align == "center") _printer.AlignCenter();
            if (d.align == "left") _printer.AlignLeft();
            if (d.size?.doubleHeight == true) _printer.SetTextDoubleHeight();
            if (d.size?.doubleWidth == true) _printer.SetTextDoubleWidth();
            if (d.size?.normal == true) _printer.SetTextNormal();
            _printer.Println((string)d.text);
        }

        public bool PrintTicket(JObject body, Enterprise enterprise, JObject clientData)
        {
            _printer.Init();
            var lines = _printer.PrintLines();

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);

            ApplyHeader(body, enterprise);
            _printer.Println(lines);

            var invoiceType = GetInvoiceType(body, enterprise);
            _printer.Println(invoiceType);
            _printer.SetTextDoubleBoth();
            _printer.Println($"{GetStr(body, "serie")}-{GetStr(body, "number")}");
            _printer.SetTextNormal();

            _printer.AlignLeft();
            _printer.Println($"FECHA EMISION: {GetStr(body, "buy_date")}");
            _printer.Println($"ATENDIDO POR : {GetStr(body, "seller")}");
            _printer.Println(lines);

            if (GetStr(body, "enterprise_client_id") != "0")
            {
                _printer.Println($"RAZ\u00d3N SOCIAL: {GetStr(body, "enterprise_client")}");
                _printer.Println($"RUC         : {GetStr(body, "enterprise_client_id")}");
            }
            _printer.Println($"DOC PASAJERO: {GetStr(body, "dni")}");
            _printer.Println($"PASAJERO    : {GetStr(body, "passenger_name")}");
            _printer.Println(lines);

            _printer.AlignCenter();
            _printer.Bold(true);
            _printer.Println("DATOS DEL VIAJE");
            _printer.Bold(false);
            _printer.Println(lines);
            _printer.AlignLeft();

            if (enterprise.ShowUbigeo)
            {
                _printer.SetTextDoubleWidth();
                _printer.Println("ORIGEN     :");
                _printer.Println($"{GetStr(body, "departure")} - {GetStr(body, "ubigeo_departure")}");
                _printer.Println("DESTINO    :");
                _printer.Println($"{GetStr(body, "arrival")} - {GetStr(body, "ubigeo_arrival")}");
            }
            else
            {
                _printer.SetTextDoubleWidth();
                _printer.Println($"ORIGEN     : {GetStr(body, "departure")}");
                _printer.Println($"DESTINO    : {GetStr(body, "arrival")}");
            }

            _printer.Println($"FECHA VIAJE: {GetStr(body, "departure_date")}");
            _printer.Println($"HORA VIAJE : {GetStr(body, "schedule_hour")}");

            if (enterprise.UseEmbarkTime)
            {
                _printer.Println($"F. EMBARQUE: {GetStr(body, "departure_date")}");
                _printer.Println($"H. EMBARQUE: {GetStr(body, "departure_hour")}");
            }
            else
            {
                _printer.Println($"EMBARQUE   : {GetStr(body, "departure_hour")}");
            }

            _printer.Println($"ASIENTO    : {GetStr(body, "seat")}");
            _printer.Println($"IMPORTE    : S/ {GetStr(body, "total")}");
            _printer.SetTextNormal();
            _printer.Println(lines);

            _printer.AlignCenter();
            _printer.Println($"SON: {GetStr(body, "total_letter")}");
            _printer.AlignLeft();
            _printer.Println(lines);

            _printer.Bold(true);
            var formaPago = GetStr(body, "payment_type").ToUpper() == "EFECTIVO" ? "CONTADO" : GetStr(body, "payment_type");
            _printer.Println($"FORMA DE PAGO: {formaPago}");
            _printer.Bold(false);

            if (enterprise.ExtraFields?.Contains("operation_code") == true)
                _printer.Println($"NRO. OPERACI\u00d3N: {GetStr(body, "operation_code")}");
            if (enterprise.ExtraFields?.Contains("observation") == true)
                _printer.Println($"OBSERVACIONES : {GetStr(body, "observation")}");
            if (enterprise.ExtraFields?.Contains("service_title") == true)
                _printer.Println($"MODALIDAD : {GetStr(body, "service_title")}");
            _printer.Println(lines);

            _printer.Println(GetStr(body, "invoice_footer"));

            if (enterprise.ExtraFields?.Contains("soat_provider") == true)
                _printer.Println($"ASEGURADO CON: {GetStr(body, "soat_provider")}");
            if (enterprise.ExtraFields?.Contains("soat") == true)
                _printer.Println($"POLIZA N\u00b0: {GetStr(body, "soat")}");

            foreach (var term in enterprise.Terms)
                _printer.Println(term);

            _printer.AlignCenter();

            if (clientData?["print_bottom"]?.Value<bool>() == true)
            {
                var bottomText = clientData["bottom_text"]?.Value<string>();
                if (!string.IsNullOrEmpty(bottomText))
                    _printer.Println(bottomText);
            }

            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintImperialTicket(JObject body, Enterprise enterprise, JObject clientData)
        {
            AddTotalLetras(body);
            _printer.Init();
            var lines = _printer.PrintLines();

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);

            ApplyHeader(body, enterprise);
            _printer.Println(lines);
            _printer.Feed(1);

            var invoiceType = GetInvoiceType(body, enterprise);
            _printer.Println(invoiceType);
            _printer.SetTextDoubleBoth();
            _printer.Println($"{GetStr(body, "serie")}-{GetStr(body, "number")}");
            _printer.SetTextNormal();
            _printer.AlignLeft();
            _printer.Println($"FECHA EMISION: {GetStr(body, "buy_date")}");
            _printer.Println($"ATENDIDO POR : {GetStr(body, "seller")}");
            _printer.Println(lines);

            if (GetStr(body, "enterprise_client_id") != "0")
            {
                _printer.Println($"RAZ\u00d3N SOCIAL: {GetStr(body, "enterprise_client")}");
                _printer.Println($"RUC         : {GetStr(body, "enterprise_client_id")}");
            }
            _printer.Println($"DOC PASAJERO: {GetStr(body, "dni")}");
            _printer.Println($"PASAJERO    : {GetStr(body, "passenger_name")}");
            _printer.Println(lines);

            _printer.AlignCenter();
            _printer.Bold(true);
            _printer.Println("DATOS DEL VIAJE");
            _printer.Bold(false);
            _printer.Println(lines);
            _printer.AlignLeft();

            _printer.SetTextDoubleWidth();
            _printer.Println($"ORIGEN     : {GetStr(body, "departure")}");
            _printer.Println($"DESTINO    : {GetStr(body, "arrival")}");
            _printer.Println($"FECHA VIAJE: {GetStr(body, "departure_date")}");
            _printer.Println($"HORA VIAJE : {GetStr(body, "schedule_hour")}");
            _printer.Println($"EMBARQUE   : {GetStr(body, "departure_hour")}");
            _printer.Println($"ASIENTO    : {GetStr(body, "seat")}");
            _printer.Println($"IMPORTE    : S/ {GetStr(body, "total")}");
            _printer.SetTextNormal();
            _printer.Println(lines);

            _printer.AlignCenter();
            _printer.Println($"SON: {GetStr(body, "total_letter")}");
            _printer.AlignLeft();
            _printer.Println(lines);

            _printer.Bold(true);
            var formaPago = GetStr(body, "payment_type").ToUpper() == "EFECTIVO" ? "CONTADO" : GetStr(body, "payment_type");
            _printer.Println($"FORMA DE PAGO: {formaPago}");
            _printer.Bold(false);
            _printer.Println(lines);
            _printer.Feed(2);

            _printer.PartialCut();
            _printer.Feed(1);

            _printer.Println($"CONTROL REF: {GetStr(body, "serie")}-{GetStr(body, "number")}");
            _printer.Bold(true);
            _printer.Println("PASAJERO:");
            _printer.Bold(false);
            _printer.Println($"SR(A): {GetStr(body, "dni")} - {GetStr(body, "passenger_name")}");
            _printer.Bold(true);
            _printer.Println("AGENCIA DE EMBARQUE:");
            _printer.Bold(false);
            _printer.Println(GetStr(body, "departure"));
            _printer.Println($"ORIGEN     : {GetStr(body, "departure")}");
            _printer.Println($"DESTINO    : {GetStr(body, "arrival")}");
            _printer.Println($"FECHA VIAJE: {GetStr(body, "departure_date")}");
            _printer.Println($"HORA VIAJE : {GetStr(body, "schedule_hour")}");
            _printer.Println($"ASIENTO    : {GetStr(body, "seat")}");
            _printer.Println($"IMPORTE    : S/ {GetStr(body, "total")}");
            _printer.Feed(1);
            _printer.Println($"Fecha-Hora de impresi\u00f3n: {PrintNow()}");
            _printer.Println($"Usuario: {GetStr(body, "seller")}");

            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintCourier(JObject body, JObject clientData)
        {
            _printer.Init();
            var inv = body["invoice"] as JObject;
            if (inv == null) return false;

            var cellphone = GetStr(inv, "cellphone");
            if (string.IsNullOrEmpty(cellphone)) cellphone = "-";
            var arrival = GetStr(inv, "final_arrival");
            if (string.IsNullOrEmpty(arrival)) arrival = GetStr(inv, "arrival");

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);
            _printer.AlignCenter();
            _printer.Bold(true);
            _printer.Println(GetStr(inv, "enterprise_name"));
            _printer.Bold(false);
            _printer.Println(GetStr(inv, "enterprise_address"));
            _printer.Println($"PUNTO DE EMISI\u00d3N: {GetStr(inv, "seller_agency")}");
            _printer.Println($"R.U.C. {GetStr(inv, "enterprise_ruc")}");
            _printer.Println($"Telf. {GetStr(inv, "enterprise_telephone")}");
            _printer.Println(_printer.PrintLines());

            var docType = GetStr(inv, "document_type");
            string invoiceType = "BOLETA DE VENTA ELECTR\u00d3NICA";
            if (docType == "6") invoiceType = "FACTURA DE VENTA ELECTR\u00d3NICA";
            if (GetStr(inv, "serie").StartsWith("V")) invoiceType = "CONSTANCIA DE VENTA";

            _printer.Println(invoiceType);
            _printer.SetTextDoubleBoth();
            _printer.Println(GetStr(inv, "serie"));
            _printer.SetTextNormal();
            _printer.AlignLeft();
            _printer.Println($"FECHA EMISION     : {GetStr(inv, "created_at")}");
            _printer.Println($"ATENDIDO POR      : {GetStr(inv, "seller")}");
            _printer.Println(_printer.PrintLines());

            _printer.AlignCenter();
            _printer.Println("DATOS DE ENVIO");
            _printer.AlignLeft();
            _printer.Println(_printer.PrintLines());

            if (GetStr(inv, "sender_2_id") != "")
            {
                _printer.Println($"MENSAJERO         : {GetStr(inv, "sender_2")}");
                _printer.Println($"DNI               : {GetStr(inv, "sender_2_id")}");
            }
            _printer.Println(_printer.PrintLines());
            _printer.Println($"REMITENTE         : {GetStr(inv, "sender")}");
            _printer.Println($"DNI/RUC           : {GetStr(inv, "sender_id")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println($"CONSIGNADO        : {GetStr(inv, "receiver")}");
            _printer.Println($"DNI/RUC           : {GetStr(inv, "receiver_id")}");
            _printer.Println(_printer.PrintLines());
            if (GetStr(inv, "receiver_2_id") != "")
            {
                _printer.Println($"CONSIGNADO        : {GetStr(inv, "receiver_2")}");
                _printer.Println($"DNI/RUC           : {GetStr(inv, "receiver_2_id")}");
            }
            _printer.Println(_printer.PrintLines());

            _printer.Bold(true);
            _printer.Println("CLIENTE");
            _printer.Bold(false);
            _printer.Println($"DNI/RUC           : {GetStr(inv, "customer_id")}");
            _printer.Println($"NOMBRE/RAZ. SOCIAL: {GetStr(inv, "customer")}");
            _printer.Println($"Tel\u00e9fono          : {cellphone}");
            _printer.Println(_printer.PrintLines());

            _printer.Println("TIPO              : ENCOMIENDA");
            _printer.Println($"ORIGEN            : {GetStr(inv, "departure")}");
            _printer.Println($"DESTINO           : {arrival}");
            _printer.Println("ITEMS        :");
            var items = inv["items"] as JArray;
            if (items != null)
            {
                foreach (var e in items)
                {
                    _printer.Table(new[] {
                        e["quantity"]?.Value<string>() ?? "",
                        e["name"]?.Value<string>() ?? "",
                        e["total"]?.Value<string>() ?? ""
                    });
                }
            }
            _printer.Println(_printer.PrintLines());

            if (docType == "6")
            {
                _printer.Println($"SUBTOTAL            : {GetStr(inv, "subtotal")}");
                _printer.Println($"IGV            : {GetStr(inv, "igv")}");
            }
            _printer.Println($"SUBTOTAL: {GetStr(inv, "subtotal")}");
            _printer.Println($"IGV: {GetStr(inv, "igv")}");
            _printer.Println($"TOTAL: {GetStr(inv, "total")}");
            _printer.Println(_printer.PrintLines());

            _printer.AlignCenter();
            var totalInv = inv["total"]?.Value<decimal>() ?? 0;
            _printer.Println($"SON: {NumberToWords.Convert(totalInv)}");
            _printer.AlignLeft();
            _printer.Println(_printer.PrintLines());

            _printer.Bold(true);
            var formaPago = GetStr(inv, "payment_type").ToUpper() == "EFECTIVO" ? "CONTADO" : GetStr(inv, "payment_type");
            _printer.Println($"FORMA DE PAGO: {formaPago}");
            if (!string.IsNullOrEmpty(GetStr(inv, "operation_number")))
                _printer.Println($"NRO. OPERACI\u00d3N: {GetStr(inv, "operation_number")}");
            _printer.Bold(false);
            _printer.Println(_printer.PrintLines());

            if (clientData?["print_bottom"]?.Value<bool>() == true)
            {
                var bottomText = clientData["bottom_text"]?.Value<string>();
                if (!string.IsNullOrEmpty(bottomText))
                    _printer.Println(bottomText);
            }
            _printer.Println(_printer.PrintLines());
            _printer.Println(GetStr(inv, "invoice_footer"));
            _printer.AlignCenter();
            _printer.PrintQR(GetStr(inv, "ticket_id"));

            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintMoneyTransfer(JObject body, JObject clientData)
        {
            _printer.Init();
            var t = body["transfer"] as JObject;
            if (t == null) return false;

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);
            _printer.AlignCenter();
            _printer.Bold(true);
            _printer.Println(GetStr(t, "enterprise_name"));
            _printer.Bold(false);
            _printer.Println(GetStr(t, "enterprise_address"));
            _printer.Println($"PUNTO DE EMISI\u00d3N: {GetStr(t, "current_agency")}");
            _printer.Println($"R.U.C. {GetStr(t, "enterprise_ruc")}");
            _printer.Println($"Telf. {GetStr(t, "enterprise_telephone")}");
            _printer.Println($"Fecha y hora: {PrintNow()}");
            _printer.Println(_printer.PrintLines());

            _printer.Println("GIRO - TRANSFERENCIA DE DINERO");
            _printer.SetTextDoubleBoth();
            _printer.Println($"{GetStr(t, "serie")}-{GetStr(t, "number")}");
            _printer.SetTextNormal();
            _printer.AlignLeft();
            _printer.Println($"FECHA EMISION     : {GetStr(t, "current_day")}");
            _printer.Println($"ATENDIDO POR      : {GetStr(t, "seller")}");
            _printer.Println(_printer.PrintLines());
            _printer.AlignCenter();
            _printer.Println("DATOS DEL GIRO");
            _printer.AlignLeft();
            _printer.Println(_printer.PrintLines());
            _printer.Println($"ENVIA             : {GetStr(t, "sender")}");
            _printer.Println($"DNI               : {GetStr(t, "sender_id")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println($"RECIBE            : {GetStr(t, "receiver")}");
            _printer.Println($"DNI               : {GetStr(t, "receiver_id")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println($"ORIGEN            : {GetStr(t, "departure")}");
            _printer.Println($"DESTINO           : {GetStr(t, "arrival")}");
            _printer.Println(_printer.PrintLines());

            _printer.Bold(true);
            _printer.Println($"MONTO DE ENVIO  : S/. {t["subtotal"]?.Value<decimal>() ?? 0:F2}");
            _printer.Println($"COMISION        : S/. {t["commission"]?.Value<decimal>() ?? 0:F2}");
            _printer.Println($"TOTAL A COBRAR  : S/. {t["total"]?.Value<decimal>() ?? 0:F2}");
            _printer.Bold(false);
            _printer.Println(_printer.PrintLines());
            _printer.Println(GetStr(t, "invoice_footer"));

            if (clientData?["print_bottom"]?.Value<bool>() == true)
            {
                var bottomText = clientData["bottom_text"]?.Value<string>();
                if (!string.IsNullOrEmpty(bottomText))
                    _printer.Println(bottomText);
            }

            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintLogistics(JObject body)
        {
            _printer.Init();
            var i = body["money_sent"] as JObject;
            if (i == null) return false;

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);
            _printer.Println(_printer.PrintLines());
            _printer.Println($"TICKET DE {GetStr(i, "budget_type").ToUpper()}");
            _printer.Println(_printer.PrintLines());
            _printer.SetTextNormal();
            _printer.AlignLeft();
            _printer.Println($"USUARIO REGISTRA  : {GetStr(i, "sender")}");
            _printer.Println($"OFICINA REGISTRO  : {GetStr(i, "departure")}");
            _printer.Println($"RECAUDADOR        : {GetStr(i, "receiver")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println($"CANTIDAD          : {GetStr(i, "total")}");
            _printer.Println($"DESDE             : {GetStr(i, "from")}");
            _printer.Println($"HASTA             : {GetStr(i, "to")}");
            _printer.Println($"CONDUCTOR         : {GetStr(i, "driver")}");
            _printer.Println($"RUTA              : {GetStr(i, "schedule")}");
            _printer.Println($"VEH\u00cdCULO          : {GetStr(i, "vehicle")}");
            _printer.Println(_printer.PrintLines());
            _printer.Feed(6);
            _printer.Println(_printer.PrintLines());
            _printer.AlignCenter();
            _printer.Println("FIRMA DE QUIEN ENTREGA");
            _printer.Feed(5);
            _printer.Println(_printer.PrintLines());
            _printer.Println("FIRMA DE QUIEN RECIBE");
            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintBudget(JObject body)
        {
            _printer.Init();
            var i = body["budget"] as JObject;
            if (i == null) return false;

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);
            _printer.Println(_printer.PrintLines());
            _printer.Println("RECIBO DE INGRESOS/EGRESOS");
            _printer.Println($"Fecha y hora: {PrintNow()}");
            _printer.Println(_printer.PrintLines());
            _printer.Println($"{GetStr(i, "serie")}-{GetStr(i, "number")}");
            _printer.SetTextNormal();
            _printer.AlignLeft();
            _printer.Println($"DESCRIPCION   : {GetStr(i, "name")}");
            _printer.Println($"TOTAL         : S/ {GetStr(i, "total")}");
            _printer.Println($"TIPO          : {GetStr(i, "budget_type")}");
            _printer.Println($"FECHA         : {GetStr(i, "created_at")}");
            _printer.Println(_printer.PrintLines());
            _printer.Feed(10);
            _printer.Println(_printer.PrintLines());
            _printer.AlignCenter();
            _printer.Println($"ENTREGADO POR : {GetStr(i, "person_name")}");
            _printer.Println($"DOC.IDENTIDAD : {GetStr(i, "person_id")}");
            _printer.Println($"EMPRESA       : {GetStr(i, "enterprise_name")}");
            _printer.Println($"RUC           : {GetStr(i, "ruc")}");
            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintCourierGeneric(JObject body, Func<JObject, CourierConfig> getConfig)
        {
            _printer.Init();
            var inv = body["invoice"] as JObject;
            if (inv == null) return false;

            var config = getConfig(inv);
            var cellphone = GetStr(inv, "cellphone")
                ?? "-";
            var arrival = GetStr(inv, "final_arrival");
            if (string.IsNullOrEmpty(arrival)) arrival = GetStr(inv, "arrival");

            _printer.PrintImage(GetLogo());
            _printer.Feed(1);
            _printer.AlignCenter();
            _printer.Bold(true);
            _printer.Println(config.Title);
            if (!string.IsNullOrEmpty(config.RucLine))
                _printer.Println(config.RucLine);
            foreach (var line in config.ExtraLines)
                _printer.Println(line);
            _printer.Bold(true);
            _printer.Println(GetStr(inv, "serie"));
            _printer.Bold(false);
            _printer.Println($"{arrival.ToUpper()} - {GetStr(inv, "arrival_district").ToUpper()}");
            _printer.Println(config.Contact);

            var docType = GetStr(inv, "document_type");
            string invoiceType = "BOLETA ELECTR\u00d3NICA";
            if (docType == "6") invoiceType = "FACTURA ELECTR\u00d3NICA";
            if (GetStr(inv, "serie").StartsWith("V")) invoiceType = "CONSTANCIA DE VENTA";
            _printer.Println(invoiceType);

            _printer.AlignLeft();
            _printer.Println($"FECHA EMISION     : {GetStr(inv, "created_at")}");
            _printer.Println($"FECHA TRANSLADO   : {GetStr(inv, "created_at")}");
            _printer.Println($"ORIGEN            : {GetStr(inv, "seller_agency")}");
            _printer.Println($"DESTINO           : {GetStr(inv, "arrival")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println(_printer.PrintLines());
            _printer.AlignCenter();
            _printer.Println("DATOS DEL REMITENTE");
            _printer.AlignLeft();
            if (GetStr(inv, "sender_2") != "")
            {
                _printer.Println($"MENSAJERO         : {GetStr(inv, "sender_2")}");
                _printer.Println($"DNI               : {GetStr(inv, "sender_2_id")}");
            }
            _printer.Println(_printer.PrintLines());
            _printer.Println($"REMITENTE         : {GetStr(inv, "sender")}");
            _printer.Println($"DNI/RUC           : {GetStr(inv, "sender_id")}");
            _printer.Println($"Tel\u00e9fono          : {cellphone}");
            _printer.AlignCenter();
            _printer.Println(_printer.PrintLines());
            _printer.Println(_printer.PrintLines());
            _printer.Println("DATOS DEL DESTINATARIO");
            _printer.AlignLeft();
            _printer.Println(_printer.PrintLines());
            _printer.Println($"CONSIGNADO        : {GetStr(inv, "receiver")}");
            _printer.Println($"DNI/RUC           : {GetStr(inv, "receiver_id")}");
            _printer.Println(_printer.PrintLines());
            if (GetStr(inv, "receiver_2") != "")
            {
                _printer.Println($"CONSIGNADO        : {GetStr(inv, "receiver_2")}");
                _printer.Println($"DNI/RUC           : {GetStr(inv, "receiver_2_id")}");
            }
            _printer.Println(_printer.PrintLines());
            _printer.Println("ENTREGA");
            _printer.Println("DIRECCI\u00d3N: ENTREGAR EN AGENCIA");
            var formaPago = GetStr(inv, "payment_type").ToUpper() == "EFECTIVO" ? "CONTADO" : GetStr(inv, "payment_type");
            _printer.Println($"FORMA DE PAGO: {formaPago}");

            var items = inv["items"] as JArray;
            if (items != null)
            {
                foreach (var e in items)
                {
                    _printer.Table(new[] {
                        e["quantity"]?.Value<string>() ?? "",
                        e["name"]?.Value<string>() ?? "",
                        e["total"]?.Value<string>() ?? ""
                    });
                }
            }

            _printer.Println("OBSERVACIONES");
            _printer.Println(GetStr(inv, "observations"));
            _printer.Println(config.Warnings);
            _printer.AlignCenter();
            _printer.Println($"SUBTOTAL: {GetStr(inv, "subtotal")}");
            _printer.Println($"IGV: {GetStr(inv, "igv")}");
            _printer.Println($"TOTAL: {GetStr(inv, "total")}");
            if (!string.IsNullOrEmpty(GetStr(inv, "operation_number")))
                _printer.Println($"NRO. OPERACI\u00d3N: {GetStr(inv, "operation_number")}");
            var totalInv = inv["total"]?.Value<decimal>() ?? 0;
            _printer.Println($"SON: {NumberToWords.Convert(totalInv)}");
            _printer.AlignLeft();
            _printer.Println(config.ExtraFooter);
            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintShippingOrder(JObject body)
        {
            _printer.Init();
            var inv = body["invoice"] as JObject;
            if (inv == null) return false;

            var cellphone = GetStr(inv, "cellphone") ?? "-";
            var arrival = GetStr(inv, "final_arrival");
            if (string.IsNullOrEmpty(arrival)) arrival = GetStr(inv, "arrival");

            _printer.PrintImage(GetLogo());
            _printer.Feed(1);
            _printer.AlignCenter();
            _printer.Println("Transportes El Crucero de Ja\u00e9n S.A.C");
            _printer.Println("CRUCERO JA\u00c9N");
            _printer.Println("RUC: 20529682248");
            _printer.Println("Avenida Mesones Muro 642 Aromo Alto Ja\u00e9n");
            _printer.Bold(true);
            _printer.Println(GetStr(inv, "serie"));
            _printer.Bold(false);
            _printer.Println($"{arrival.ToUpper()} - {GetStr(inv, "arrival_district").ToUpper()}");
            _printer.Println("Ventas whatsapp: ");
            _printer.Println("Atenci\u00f3n al cliente: 980 845 273 - 963 450 965");

            _printer.Println("GUIA DE REMISION DE TRANSPORTISTA");
            _printer.AlignLeft();
            _printer.Println($"FECHA EMISION     : {GetStr(inv, "created_at")}");
            _printer.Println($"FECHA TRANSLADO   : {GetStr(inv, "created_at")}");
            _printer.Println($"ORIGEN            : {GetStr(inv, "seller_agency")}");
            _printer.Println($"DESTINO           : {GetStr(inv, "arrival")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println(_printer.PrintLines());
            _printer.AlignCenter();
            _printer.Println("DATOS DEL REMITENTE");
            _printer.AlignLeft();
            if (GetStr(inv, "sender_2") != "")
            {
                _printer.Println($"MENSAJERO         : {GetStr(inv, "sender_2")}");
                _printer.Println($"DNI               : {GetStr(inv, "sender_2_id")}");
            }
            _printer.Println(_printer.PrintLines());
            _printer.Println($"REMITENTE         : {GetStr(inv, "sender")}");
            _printer.Println($"DNI/RUC           : {GetStr(inv, "sender_id")}");
            _printer.Println($"Tel\u00e9fono          : {cellphone}");
            _printer.AlignCenter();
            _printer.Println(_printer.PrintLines());
            _printer.Println(_printer.PrintLines());
            _printer.Println("DATOS DEL DESTINATARIO");
            _printer.AlignLeft();
            _printer.Println(_printer.PrintLines());
            _printer.Println($"CONSIGNADO        : {GetStr(inv, "receiver")}");
            _printer.Println($"DNI/RUC           : {GetStr(inv, "receiver_id")}");
            _printer.Println(_printer.PrintLines());
            if (GetStr(inv, "receiver_2") != "")
            {
                _printer.Println($"CONSIGNADO        : {GetStr(inv, "receiver_2")}");
                _printer.Println($"DNI/RUC           : {GetStr(inv, "receiver_2_id")}");
            }
            _printer.Println(_printer.PrintLines());
            _printer.Println("ENTREGA");
            _printer.Println("DIRECCI\u00d3N: ENTREGAR EN AGENCIA");
            var formaPago = GetStr(inv, "payment_type").ToUpper() == "EFECTIVO" ? "CONTADO" : GetStr(inv, "payment_type");
            _printer.Println($"FORMA DE PAGO: {formaPago}");

            var items = inv["items"] as JArray;
            if (items != null)
            {
                foreach (var e in items)
                {
                    _printer.Table(new[] {
                        e["quantity"]?.Value<string>() ?? "",
                        e["name"]?.Value<string>() ?? "",
                        e["total"]?.Value<string>() ?? ""
                    });
                }
            }

            _printer.Println("OBSERVACIONES");
            _printer.Println(GetStr(inv, "observations"));
            _printer.AlignCenter();
            _printer.Println($"TOTAL: {GetStr(inv, "total")}");
            var totalInv = inv["total"]?.Value<decimal>() ?? 0;
            _printer.Println($"SON: {NumberToWords.Convert(totalInv)}");
            _printer.AlignLeft();
            _printer.Bold(true);
            _printer.Println("DATOS DE LA UNIDAD DE TRANSPORTE:");
            _printer.Bold(false);
            _printer.Println($"Empresa: Crucero Ja\u00e9n");
            _printer.Println($"RUC: 20529682248");
            _printer.Println($"Conductor: {GetStr(inv, "driver")}");
            _printer.Println($"Licencia: {GetStr(inv, "license")}");
            _printer.Println($"Marca: {GetStr(inv, "brand")}");
            _printer.Println($"Placa: {GetStr(inv, "plate")}");
            _printer.Println($"MTC: {GetStr(inv, "mtc")}");
            _printer.Println($"Condici\u00f3n de pago: {formaPago}");
            _printer.Println("Representaci\u00f3n impresa de la GU\u00cdA DE REMISI\u00d3N TRANSPORTISTA");
            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintGrt(JObject body)
        {
            _printer.Init();
            var inv = body["invoice"] as JObject;
            if (inv == null) return false;

            _printer.PrintImage(GetLogo());
            _printer.Feed(2);
            _printer.AlignCenter();
            _printer.Bold(true);
            _printer.Println("EMPRESA DE TRANSPORTES DE PASAJEROS EL CRUCERO DE JAEN SOCIEDAD ANONIMA CERRADA");
            _printer.Bold(false);
            _printer.Println("AV. MESONES MURO NRO. 642 SEC. AROMO ALTO CAJAMARCA - JAEN - JAEN");
            _printer.Println("RUC 20529682248");
            _printer.Println("Ventas whatsapp: 977726252");
            _printer.Println("Atenci\u00f3n al cliente: 980 845 273 - 963 450 965");
            _printer.Feed(2);
            _printer.Bold(true);
            _printer.Println("GU\u00cdA DE REMISI\u00d3N ELECTR\u00d3NICA");
            _printer.Println("TRANSPORTISTA");
            _printer.Println($"{GetStr(inv, "serie")}-{GetStr(inv, "number")}");
            _printer.Bold(false);
            _printer.AlignLeft();
            _printer.Println($"Fecha emisi\u00f3n: {GetStr(inv, "created_at")}");
            _printer.Println($"Fecha traslado: {GetStr(inv, "departure_at")}");
            _printer.Feed(1);
            _printer.Println($"PUNTO DE PARTIDA: {GetStr(inv, "departure_address")}");
            _printer.Println($"PUNTO DE LLEGADA: {GetStr(inv, "arrival_address")}");
            _printer.Feed(1);
            _printer.Println("DATOS DEL REMITENTE:");
            _printer.Println($"Nombre/Raz. Social: {GetStr(inv, "sender")}");
            _printer.Println($"DNI/RUC: {GetStr(inv, "sender_document_number")}");
            _printer.Feed(1);
            _printer.Println("DATOS DEL DESTINATARIO:");
            _printer.Println($"Nombre/Raz. Social: {GetStr(inv, "receiver")}");
            _printer.Println($"DNI/RUC: {GetStr(inv, "receiver_document_number")}");
            _printer.Feed(1);
            _printer.Println("BIENES POR TRANSPORTAR");
            var items = inv["items"] as JArray;
            if (items != null)
            {
                foreach (var e in items)
                {
                    _printer.Table(new[] {
                        e["quantity"]?.Value<string>() ?? "",
                        e["name"]?.Value<string>() ?? "",
                        e["total"]?.Value<string>() ?? ""
                    });
                }
            }
            _printer.Feed(1);
            _printer.Println("DATOS DE LOS VEH\u00cdCULOS");
            _printer.Println($"Veh\u00edculo principal: {GetStr(inv, "registration")}");
            _printer.Println("DATOS DE LOS CONDUCTORES");
            _printer.Println($"Principal: {GetStr(inv, "driver_name")}");
            _printer.Println($"Licencia: {GetStr(inv, "driver_license")}");
            _printer.PartialCut();
            return _printer.Execute();
        }

        public bool PrintCreditNote(JObject body, JObject clientData)
        {
            _printer.Init();
            var b = body["credit_note"] as JObject ?? body;

            _printer.AlignCenter();
            _printer.PrintImage(GetLogo());
            _printer.Feed(2);
            _printer.Bold(true);
            _printer.Println(GetStr(b, "enterprise_name"));
            _printer.Bold(false);
            _printer.Println(GetStr(b, "enterprise_address"));
            _printer.Println($"PUNTO DE EMISI\u00d3N: {GetStr(b, "current_agency_address")}");
            _printer.Println($"R.U.C. {GetStr(b, "enterprise_ruc")}");
            _printer.Println($"Telf. {GetStr(b, "enterprise_telephone")}");
            _printer.Println(_printer.PrintLines());
            _printer.Println("NOTA DE CR\u00c9DITO");
            _printer.SetTextDoubleBoth();
            _printer.Println($"{GetStr(b, "cancel_serie")}-{GetStr(b, "cancel_number")}");
            _printer.SetTextNormal();
            _printer.Println($"Para: {GetStr(b, "ticket_serie")}-{GetStr(b, "ticket_number")}");
            _printer.Println(GetStr(b, "invoice_footer"));

            if (clientData?["print_bottom"]?.Value<bool>() == true)
            {
                var bottomText = clientData["bottom_text"]?.Value<string>();
                if (!string.IsNullOrEmpty(bottomText))
                    _printer.Println(bottomText);
            }

            _printer.PartialCut();
            return _printer.Execute();
        }
    }
}
