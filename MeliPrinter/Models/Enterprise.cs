using System;
using System.Collections.Generic;

namespace MeliPrinter.Models
{
    public class Enterprise
    {
        public string Name { get; set; }
        public Func<dynamic, List<HeaderItem>> Header { get; set; }
        public InvoiceLabel InvoiceLabel { get; set; }
        public bool UseEmbarkTime { get; set; }
        public bool ShowUbigeo { get; set; }
        public List<string> ExtraFields { get; set; } = new List<string>();
        public List<string> Terms { get; set; } = new List<string>();
    }

    public class HeaderItem
    {
        public string Text { get; set; }
        public bool? Bold { get; set; }
        public string Align { get; set; }
        public FontSize Size { get; set; }
    }

    public class FontSize
    {
        public bool? DoubleHeight { get; set; }
        public bool? DoubleWidth { get; set; }
        public bool? Normal { get; set; }
    }

    public class InvoiceLabel
    {
        public string Boleta { get; set; } = "BOLETA ELECTRÓNICA";
        public string Factura { get; set; } = "FACTURA ELECTRÓNICA";
        public string Vale { get; set; } = "VALE";
    }
}
