using System;
using System.Runtime.InteropServices;
using System.Text;

namespace MeliPrinter.Services
{
    public static class RawPrinterHelper
    {
        [DllImport("winspool.drv", CharSet = CharSet.Unicode, ExactSpelling = false)]
        private static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

        [DllImport("winspool.drv", SetLastError = true)]
        private static extern bool ClosePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", SetLastError = true)]
        private static extern bool StartDocPrinter(IntPtr hPrinter, int level, ref DOC_INFO_1 docInfo);

        [DllImport("winspool.drv", SetLastError = true)]
        private static extern bool EndDocPrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", SetLastError = true)]
        private static extern bool StartPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", SetLastError = true)]
        private static extern bool EndPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", SetLastError = true)]
        private static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct DOC_INFO_1
        {
            public string pDocName;
            public string pOutputFile;
            public string pDatatype;
        }

        public static bool PrintRaw(string printerName, byte[] data)
        {
            IntPtr hPrinter = IntPtr.Zero;
            DOC_INFO_1 docInfo = new DOC_INFO_1
            {
                pDocName = "MeliPrinter",
                pOutputFile = null,
                pDatatype = "RAW"
            };

            try
            {
                if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero))
                    return false;

                if (!StartDocPrinter(hPrinter, 1, ref docInfo))
                    return false;

                if (!StartPagePrinter(hPrinter))
                    return false;

                IntPtr pData = Marshal.AllocHGlobal(data.Length);
                try
                {
                    Marshal.Copy(data, 0, pData, data.Length);
                    if (!WritePrinter(hPrinter, pData, data.Length, out int written))
                        return false;
                    return written == data.Length;
                }
                finally
                {
                    Marshal.FreeHGlobal(pData);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[printer] Error printing: {ex.Message}");
                return false;
            }
            finally
            {
                if (hPrinter != IntPtr.Zero)
                {
                    EndPagePrinter(hPrinter);
                    EndDocPrinter(hPrinter);
                    ClosePrinter(hPrinter);
                }
            }
        }

        public static string GetDefaultPrinterName()
        {
            try
            {
                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "powershell",
                    Arguments = "-NoProfile -Command \"Get-CimInstance Win32_Printer -Filter \\\"Default=$true\\\" | Select-Object -ExpandProperty Name\"",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using var proc = System.Diagnostics.Process.Start(psi);
                string output = proc?.StandardOutput.ReadToEnd()?.Trim();
                proc?.WaitForExit(5000);
                return string.IsNullOrEmpty(output) ? null : output;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[printer] Error getting default printer: {ex.Message}");
                return null;
            }
        }
    }
}
