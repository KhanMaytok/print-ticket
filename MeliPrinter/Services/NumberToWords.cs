using System;
using System.Text;

namespace MeliPrinter.Services
{
    public static class NumberToWords
    {
        private static string Unidades(int num) => num switch
        {
            1 => "UN",
            2 => "DOS",
            3 => "TRES",
            4 => "CUATRO",
            5 => "CINCO",
            6 => "SEIS",
            7 => "SIETE",
            8 => "OCHO",
            9 => "NUEVE",
            _ => ""
        };

        private static string DecenasY(string strSin, int numUnidades) =>
            numUnidades > 0 ? strSin + " Y " + Unidades(numUnidades) : strSin;

        private static string Decenas(int num)
        {
            int decena = num / 10;
            int unidad = num - (decena * 10);

            switch (decena)
            {
                case 1:
                    return unidad switch
                    {
                        0 => "DIEZ",
                        1 => "ONCE",
                        2 => "DOCE",
                        3 => "TRECE",
                        4 => "CATORCE",
                        5 => "QUINCE",
                        _ => "DIECI" + Unidades(unidad)
                    };
                case 2: return unidad == 0 ? "VEINTE" : "VEINTI" + Unidades(unidad);
                case 3: return DecenasY("TREINTA", unidad);
                case 4: return DecenasY("CUARENTA", unidad);
                case 5: return DecenasY("CINCUENTA", unidad);
                case 6: return DecenasY("SESENTA", unidad);
                case 7: return DecenasY("SETENTA", unidad);
                case 8: return DecenasY("OCHENTA", unidad);
                case 9: return DecenasY("NOVENTA", unidad);
                case 0: return Unidades(unidad);
            }
            return "";
        }

        private static string Centenas(int num)
        {
            int centenas = num / 100;
            int decenas = num - (centenas * 100);

            switch (centenas)
            {
                case 1: return decenas > 0 ? "CIENTO " + Decenas(decenas) : "CIEN";
                case 2: return "DOSCIENTOS " + Decenas(decenas);
                case 3: return "TRESCIENTOS " + Decenas(decenas);
                case 4: return "CUATROCIENTOS " + Decenas(decenas);
                case 5: return "QUINIENTOS " + Decenas(decenas);
                case 6: return "SEISCIENTOS " + Decenas(decenas);
                case 7: return "SETECIENTOS " + Decenas(decenas);
                case 8: return "OCHOCIENTOS " + Decenas(decenas);
                case 9: return "NOVECIENTOS " + Decenas(decenas);
            }
            return Decenas(decenas);
        }

        private static string Seccion(int num, int divisor, string strSingular, string strPlural)
        {
            int cientos = num / divisor;
            if (cientos > 0)
                return cientos > 1 ? Centenas(cientos) + " " + strPlural : strSingular;
            return "";
        }

        private static string Miles(int num)
        {
            string strMiles = Seccion(num, 1000, "UN MIL", "MIL");
            string strCentenas = Centenas(num % 1000);
            if (strMiles == "") return strCentenas;
            return strMiles.TrimEnd() + " " + strCentenas.TrimStart();
        }

        private static string Millones(int num)
        {
            string strMillones = Seccion(num, 1000000, "UN MILLON DE", "MILLONES DE");
            string strMiles = Miles(num % 1000000);
            if (strMillones == "") return strMiles;
            return strMillones.TrimEnd() + " " + strMiles.TrimStart();
        }

        public static string Convert(decimal num, string currencyPlural = "dólares estadounidenses",
            string currencySingular = "dólar estadounidense",
            string centPlural = "centavos", string centSingular = "centavo")
        {
            int enteros = (int)Math.Floor(num);
            int centavos = (int)(Math.Round(num * 100) - (enteros * 100));

            string letrasCentavos = $"y {centavos}/100 soles";

            if (enteros == 0) return "CERO " + currencyPlural + " " + letrasCentavos;
            if (enteros == 1) return Millones(enteros) + " " + currencySingular + " " + letrasCentavos;
            return Millones(enteros) + " " + currencyPlural + " " + letrasCentavos;
        }
    }
}
