using System.Collections.Generic;

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
