using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text;

namespace MeliPrinter.Services
{
    public class EscPosPrinter
    {
        private readonly List<byte> _buffer = new List<byte>();
        private readonly string _printerName;
        private const int MaxWidth = 42;

        public EscPosPrinter(string printerName)
        {
            _printerName = printerName;
        }

        public int GetWidth() => MaxWidth;

        public string PrintLines() => new string('-', MaxWidth);

        public void Init()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x40);
        }

        public void Bold(bool on)
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x45);
            _buffer.Add((byte)(on ? 1 : 0));
        }

        public void AlignLeft()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x61);
            _buffer.Add(0);
        }

        public void AlignCenter()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x61);
            _buffer.Add(1);
        }

        public void AlignRight()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x61);
            _buffer.Add(2);
        }

        public void SetTextNormal()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x21);
            _buffer.Add(0);
        }

        public void SetTextDoubleHeight()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x21);
            _buffer.Add(0x10);
        }

        public void SetTextDoubleWidth()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x21);
            _buffer.Add(0x20);
        }

        public void SetTextDoubleBoth()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x21);
            _buffer.Add(0x30);
        }

        public void Println(string text)
        {
            byte[] data = Encoding.GetEncoding(437).GetBytes(text + "\n");
            _buffer.AddRange(data);
        }

        public void Print(string text)
        {
            byte[] data = Encoding.GetEncoding(437).GetBytes(text);
            _buffer.AddRange(data);
        }

        public void Feed(int lines)
        {
            for (int i = 0; i < lines; i++)
                Println("");
        }

        public void Table(string[] columns)
        {
            int colWidth = MaxWidth / Math.Max(columns.Length, 1);
            var sb = new StringBuilder();
            for (int i = 0; i < columns.Length; i++)
            {
                string val = columns[i] ?? "";
                if (val.Length > colWidth) val = val.Substring(0, colWidth);
                sb.Append(val.PadRight(colWidth));
            }
            Println(sb.ToString());
        }

        public void PartialCut()
        {
            _buffer.Add(0x1B);
            _buffer.Add(0x6D);
        }

        public void PrintImage(string imagePath)
        {
            if (!File.Exists(imagePath)) return;
            try
            {
                using var img = Image.FromFile(imagePath);
                using var ms = new MemoryStream();
                using var bitmap = new Bitmap(img);
                int width = bitmap.Width;
                int height = bitmap.Height;

                for (int y = 0; y < height; y += 256)
                {
                    int remainingHeight = Math.Min(256, height - y);
                    byte[] imageData = ConvertBitmapToEscPos(bitmap, y, remainingHeight);

                    _buffer.Add(0x1B);
                    _buffer.Add(0x33);
                    _buffer.Add(0x18);

                    _buffer.Add(0x1D);
                    _buffer.Add(0x76);
                    _buffer.Add(0x30);
                    _buffer.Add(0);
                    _buffer.Add((byte)(width / 8 % 256));
                    _buffer.Add((byte)(width / 8 / 256));
                    _buffer.Add((byte)(remainingHeight % 256));
                    _buffer.Add((byte)(remainingHeight / 256));

                    _buffer.AddRange(imageData);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[printer] Error printing image: {ex.Message}");
            }
        }

        private byte[] ConvertBitmapToEscPos(Bitmap bitmap, int startY, int height)
        {
            int width = bitmap.Width;
            int bytesPerLine = (width + 7) / 8;
            var data = new byte[bytesPerLine * height];

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    Color pixel;
                    try { pixel = bitmap.GetPixel(x, startY + y); }
                    catch { pixel = Color.White; }

                    bool isBlack = pixel.GetBrightness() < 0.5;
                    if (isBlack)
                    {
                        int byteIdx = y * bytesPerLine + x / 8;
                        int bitIdx = 7 - (x % 8);
                        data[byteIdx] |= (byte)(1 << bitIdx);
                    }
                }
            }
            return data;
        }

        public void PrintQR(string data)
        {
            if (string.IsNullOrEmpty(data)) return;

            int len = data.Length + 3;
            byte[] qrData = Encoding.GetEncoding(437).GetBytes(data);

            _buffer.Add(0x1D);
            _buffer.Add(0x28);
            _buffer.Add(0x6B);
            _buffer.Add((byte)(len % 256));
            _buffer.Add((byte)(len / 256));
            _buffer.Add(0x31);
            _buffer.Add(0x43);
            _buffer.Add(5);

            _buffer.Add(0x1D);
            _buffer.Add(0x28);
            _buffer.Add(0x6B);
            _buffer.Add(3);
            _buffer.Add(0);
            _buffer.Add(0x31);
            _buffer.Add(0x45);
            _buffer.Add(48);

            int storeLen = data.Length + 3;
            _buffer.Add(0x1D);
            _buffer.Add(0x28);
            _buffer.Add(0x6B);
            _buffer.Add((byte)(storeLen % 256));
            _buffer.Add((byte)(storeLen / 256));
            _buffer.Add(0x31);
            _buffer.Add(0x50);
            _buffer.Add(48);
            _buffer.AddRange(qrData);

            _buffer.Add(0x1D);
            _buffer.Add(0x28);
            _buffer.Add(0x6B);
            _buffer.Add(3);
            _buffer.Add(0);
            _buffer.Add(0x31);
            _buffer.Add(0x51);
            _buffer.Add(48);
        }

        public byte[] GetBuffer() => _buffer.ToArray();

        public void Clear() => _buffer.Clear();

        public bool Execute()
        {
            if (_buffer.Count == 0) return false;
            bool result = RawPrinterHelper.PrintRaw(_printerName, _buffer.ToArray());
            return result;
        }
    }
}
