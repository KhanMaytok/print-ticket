using System;
using System.IO;
using Newtonsoft.Json.Linq;

namespace MeliPrinter.Services
{
    public class ClientDataService
    {
        public JObject Data { get; }

        public ClientDataService()
        {
            var dir = AppDomain.CurrentDomain.BaseDirectory;
            var path = Path.Combine(dir, "additional_data.json");
            var templatePath = Path.Combine(dir, "additional_data.json.template");

            if (!File.Exists(path) && File.Exists(templatePath))
            {
                File.Copy(templatePath, path);
                Console.WriteLine("[setup] additional_data.json created from template");
            }

            if (File.Exists(path))
            {
                var json = File.ReadAllText(path);
                Data = JObject.Parse(json);
            }
            else
            {
                Data = new JObject
                {
                    ["print_bottom"] = false,
                    ["bottom_text"] = ""
                };
            }
        }
    }
}
