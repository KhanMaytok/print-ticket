using System;
using MeliPrinter.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MeliPrinter
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            var printerName = RawPrinterHelper.GetDefaultPrinterName();
            Console.WriteLine($"[printer] Impresora por defecto: {printerName}");

            if (!string.IsNullOrEmpty(printerName))
            {
                var escPosPrinter = new EscPosPrinter(printerName);
                services.AddSingleton(escPosPrinter);
                services.AddSingleton<PrintService>();
            }

            services.AddSingleton<UpdateService>();
            services.AddSingleton<ClientDataService>();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
