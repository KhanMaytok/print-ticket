using System;
using System.Threading.Tasks;
using MeliPrinter.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MeliPrinter
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var version = "2.0.0";
            Console.WriteLine($"[meliprinter] v{version} - Iniciando...");

            var host = CreateHostBuilder(args).Build();

            var updateService = host.Services.GetRequiredService<UpdateService>();
            try
            {
                var update = await updateService.CheckForUpdates();
                if (update != null)
                {
                    Console.WriteLine($"[updater] Nueva versi\u00f3n: {update["version"]}");
                    if (update["downloadUrl"] != null)
                        Console.WriteLine($"[updater] Descarga: {update["downloadUrl"]}");
                }
            }
            catch { }

            Console.WriteLine($"[meliprinter] v{version} - Servidor listo en puerto 3030");
            Console.WriteLine("[meliprinter] No cierres esta ventana durante la impresi\u00f3n");

            await host.RunAsync();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseUrls("http://0.0.0.0:3030");
                });
    }
}
