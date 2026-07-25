import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function getDefaultPrinterName() {
  try {
    const result = execSync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Printer -Filter \\"Default=$true\\" | Select-Object -ExpandProperty Name"',
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();
    return result || null;
  } catch (err) {
    console.error('[printer] Error getting default printer:', err.message);
    return null;
  }
}

function printDirect({ data, printer, type, success, error }) {
  if (!printer) {
    const err = new Error('No printer specified');
    if (error) error(err);
    else throw err;
    return;
  }

  const tmpFile = join(tmpdir(), `printer-${Date.now()}.bin`);

  try {
    writeFileSync(tmpFile, data);
    execSync(
      `cmd /c copy /b "${tmpFile}" "\\\\localhost\\${printer}"`,
      { timeout: 30000, stdio: 'pipe' }
    );
    if (success) success();
  } catch (err) {
    console.error('[printer] Print error:', err.message);
    if (error) error(err);
  } finally {
    try { unlinkSync(tmpFile); } catch { }
  }
}

const printer = { getDefaultPrinterName, printDirect };
export default printer;
