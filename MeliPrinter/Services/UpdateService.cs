using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace MeliPrinter.Services
{
    public class UpdateService
    {
        private static readonly string GitHubApi = "https://api.github.com/repos/KhanMaytok/print-ticket/releases/latest";
        private static readonly string UserAgent = "MeliPrinter/2.0";

        // Lee la versión actual desde version.txt
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
                var zipUrl = release["assets"]?[0]?["browser_download_url"]?.Value<string>();
                if (zipUrl == null)
                    zipUrl = release["zipball_url"]?.Value<string>();

                    Console.WriteLine($"[Updater] Nueva versi\u00f3n disponible: {latest}");
                    return new JObject
                    {
                        ["version"] = latest,
                        ["url"] = release["html_url"]?.Value<string>(),
                        ["downloadUrl"] = zipUrl,
                        ["notes"] = release["body"]?.Value<string>(),
                        ["tag_name"] = release["tag_name"]?.Value<string>()
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

        public async Task<bool> DownloadAndApplyUpdate(JObject updateInfo)
        {
            var version = updateInfo["version"]?.Value<string>();
            var downloadUrl = updateInfo["downloadUrl"]?.Value<string>();
            if (string.IsNullOrEmpty(version) || string.IsNullOrEmpty(downloadUrl))
            {
                Console.Error.WriteLine("[Updater] No hay URL de descarga disponible");
                return false;
            }

            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var updateDir = Path.Combine(baseDir, ".update");
            Directory.CreateDirectory(updateDir);

            var zipPath = Path.Combine(updateDir, $"MeliPrinter-{version}.zip");
            var extractDir = Path.Combine(updateDir, $"v{version}");

            try
            {
                Console.WriteLine($"[Updater] Descargando v{version} desde {downloadUrl}...");
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", UserAgent);
                client.Timeout = TimeSpan.FromMinutes(5);

                var data = await client.GetByteArrayAsync(downloadUrl);
                await File.WriteAllBytesAsync(zipPath, data);
                Console.WriteLine($"[Updater] Descarga completa ({data.Length / 1024 / 1024} MB, {data.Length} bytes)");

                if (Directory.Exists(extractDir))
                    Directory.Delete(extractDir, true);
                ZipFile.ExtractToDirectory(zipPath, extractDir);
                Console.WriteLine("[Updater] Extracci\u00f3n completa");

                var exeName = "MeliPrinter.exe";
                var newExe = FindFile(extractDir, exeName);
                if (newExe == null)
                {
                    Console.Error.WriteLine("[Updater] No se encontr\u00f3 MeliPrinter.exe en el zip");
                    return false;
                }

                var currentExe = Process.GetCurrentProcess().MainModule.FileName;
                var destExe = Path.Combine(updateDir, exeName);
                File.Copy(newExe, destExe, true);

                var newVersionFile = FindFile(extractDir, "version.txt");
                if (newVersionFile != null)
                    File.Copy(newVersionFile, Path.Combine(updateDir, "version.txt"), true);
                else
                    File.WriteAllText(Path.Combine(updateDir, "version.txt"), version);

                var batPath = Path.Combine(baseDir, "actualizar.bat");
                var batContent = $@"@echo off
title ACTUALIZANDO MeliPrinter a v{version}
echo Esperando que el proceso actual termine...
:wait
tasklist /fi ""IMAGENAME eq {exeName}"" 2>nul | find /i ""{exeName}"" >nul
if not errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait
)
echo Reemplazando archivos...
copy /y ""{destExe}"" ""{currentExe}"" >nul
copy /y ""{Path.Combine(updateDir, "version.txt")}"" ""{Path.Combine(baseDir, "version.txt")}"" >nul
echo Limpiando...
rd /s /q ""{updateDir}"" 2>nul
echo Iniciando nueva versi\u00f3n...
start """" ""{currentExe}""
";
                await File.WriteAllTextAsync(batPath, batContent);
                Console.WriteLine($"[Updater] Script de actualizaci\u00f3n generado: {batPath}");

                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[Updater] Error durante la descarga: {ex.Message}");
                return false;
            }
        }

        public void RestartWithUpdate()
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var batPath = Path.Combine(baseDir, "actualizar.bat");

            if (!File.Exists(batPath)) return;

            Console.WriteLine("[Updater] Aplicando actualizaci\u00f3n y reiniciando...");

            var psi = new ProcessStartInfo
            {
                FileName = batPath,
                UseShellExecute = true,
                CreateNoWindow = false,
                WindowStyle = ProcessWindowStyle.Normal
            };
            Process.Start(psi);

            Environment.Exit(0);
        }

        public static void ApplyUpdateAndRestart()
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var updateDir = Path.Combine(baseDir, ".update");
            var exeName = "MeliPrinter.exe";
            var currentExe = Process.GetCurrentProcess().MainModule.FileName;
            var stagedExe = Path.Combine(updateDir, exeName);

            if (!File.Exists(stagedExe)) return;

            try
            {
                File.Copy(stagedExe, currentExe + ".new", true);
                var psi = new ProcessStartInfo
                {
                    FileName = "powershell",
                    Arguments = $"-NoProfile -Command \""
                        + $"Start-Sleep 2; "
                        + $"Copy-Item '{currentExe}.new' '{currentExe}' -Force; "
                        + $"Remove-Item '{currentExe}.new', '{updateDir}' -Recurse -Force -ErrorAction SilentlyContinue; "
                        + $"Start-Process '{currentExe}'"
                        + "\"",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                Process.Start(psi);
                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[Updater] Error al aplicar actualizaci\u00f3n: {ex.Message}");
            }
        }

        private static string FindFile(string dir, string fileName)
        {
            var file = Path.Combine(dir, fileName);
            if (File.Exists(file)) return file;

            foreach (var subDir in Directory.GetDirectories(dir))
            {
                var found = FindFile(subDir, fileName);
                if (found != null) return found;
            }
            return null;
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
