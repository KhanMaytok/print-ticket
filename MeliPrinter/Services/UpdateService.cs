using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MeliPrinter.Services
{
    public class UpdateService
    {
        private static readonly string GitHubApi = "https://api.github.com/repos/KhanMaytok/print-ticket/releases/latest";
        private static readonly string UserAgent = "MeliPrinter/2.0";

        public string GetCurrentVersion()
        {
            try
            {
                var dir = AppDomain.CurrentDomain.BaseDirectory;
                var versionFile = Path.Combine(dir, "version.txt");
                if (File.Exists(versionFile))
                    return File.ReadAllText(versionFile).Trim();
            }
            catch { }
            return "2.0.0";
        }

        public async Task<JObject> CheckForUpdates()
        {
            var current = GetCurrentVersion();
            Console.WriteLine($"[Updater] Versi\u00f3n actual: {current}");

            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", UserAgent);
                client.Timeout = TimeSpan.FromSeconds(10);

                var response = await client.GetStringAsync(GitHubApi);
                var release = JObject.Parse(response);
                var latest = release["tag_name"]?.Value<string>()?.TrimStart('v') ?? "";

                if (CompareVersions(latest, current) > 0)
                {
                    Console.WriteLine($"[Updater] Nueva versi\u00f3n disponible: {latest}");
                    return new JObject
                    {
                        ["version"] = latest,
                        ["url"] = release["html_url"]?.Value<string>(),
                        ["downloadUrl"] = release["assets"]?[0]?["browser_download_url"]?.Value<string>(),
                        ["notes"] = release["body"]?.Value<string>()
                    };
                }

                Console.WriteLine("[Updater] Ya tienes la \u00faltima versi\u00f3n");
                return null;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[Updater] Error: {ex.Message}");
                return null;
            }
        }

        private static int CompareVersions(string a, string b)
        {
            var pa = a.Split('.');
            var pb = b.Split('.');
            int max = Math.Max(pa.Length, pb.Length);
            for (int i = 0; i < max; i++)
            {
                int da = i < pa.Length && int.TryParse(pa[i], out var x) ? x : 0;
                int db = i < pb.Length && int.TryParse(pb[i], out var y) ? y : 0;
                if (da > db) return 1;
                if (da < db) return -1;
            }
            return 0;
        }
    }
}
