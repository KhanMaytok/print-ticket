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
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            if (args.Length > 0 && args[0] == "--apply-update")
            {
                UpdateService.ApplyUpdateAndRestart();
                return;
            }

            var version = "2.0.11";
            Console.WriteLine($"[meliprinter] v{version} - Iniciando...");

            var host = CreateHostBuilder(args).Build();

            if (Environment.GetEnvironmentVariable("NO_UPDATE") != "true")
            {
                var updateService = host.Services.GetRequiredService<UpdateService>();
                try
                {
                    var update = await updateService.CheckForUpdates();
                    if (update != null)
                    {
                        Console.WriteLine($"[updater] Nueva versi\u00f3n: {update["version"]}");
                        var downloaded = await updateService.DownloadAndApplyUpdate(update);
                        if (downloaded)
                        {
                            Console.WriteLine("[updater] Actualizaci\u00f3n lista. Reiniciando...");
                            updateService.RestartWithUpdate();
                            return;
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[updater] Error en actualizaci\u00f3n: {ex.Message}");
                }
            }

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
