using System.Collections.Generic;

// Small comment: This class represents the configuration settings for a courier, including title, contact information, RUC line, warnings, extra footer, and additional lines.

namespace MeliPrinter.Models
{
    public class CourierConfig
    {
        public string Title { get; set; }
        public string Contact { get; set; }
        public string RucLine { get; set; }
        public string Warnings { get; set; }
        public string ExtraFooter { get; set; }
        public List<string> ExtraLines { get; set; } = new List<string>();
    }
}
