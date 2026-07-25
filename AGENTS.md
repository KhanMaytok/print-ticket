# MeliPrinter — C# (.NET Core 3.1)

## Stack
- ASP.NET Core 3.1 Web API
- Newtonsoft.Json (JObject para cuerpos dinámicos)
- RawPrinterHelper (Win32 P/Invoke para impresión raw)
- ESC/POS commands generados manualmente
- PublishSingleFile=true + self-contained para .exe único

## Estructura
```
MeliPrinter/
├── Controllers/PrintController.cs    # Todas las rutas HTTP
├── Data/Enterprises.cs               # Config de 22 empresas por RUC
├── Models/Enterprise.cs              # Enterprise, HeaderItem, CourierConfig
├── Services/
│   ├── EscPosPrinter.cs              # Generación de comandos ESC/POS
│   ├── RawPrinterHelper.cs           # Envío raw a impresora Win32
│   ├── PrintService.cs               # 10 templates de impresión
│   ├── NumberToWords.cs              # Números a letras (español)
│   ├── UpdateService.cs              # Check de actualizaciones GitHub
│   └── ClientDataService.cs          # Carga additional_data.json
├── Program.cs / Startup.cs
├── MeliPrinter.csproj
├── appsettings.json
├── additional_data.json
├── logo.png
└── version.txt
```

## Compilar
```powershell
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o dist
```
Output: `dist\MeliPrinter.exe`

## Publicar (framework-dependent, más pequeño)
```powershell
dotnet publish -c Release -r win-x64 -o dist
```
Requiere .NET Core 3.1 Runtime en la PC destino.

## Rutas mantenidas
Mismas rutas que la versión Node.js original — ver PrintController.cs.

## Notas
- Las cabeceras de empresa se definen como `Func<dynamic, List<HeaderItem>>` en Enterprises.cs.
- El body de cada request se recibe como `JObject` (Newtonsoft) para mantener flexibilidad.
- ESC/POS usa code page 437 para caracteres especiales.
- QR se genera con comandos ESC/POS estándar GS (k.
- La impresora se detecta automáticamente como la predeterminada del sistema.
