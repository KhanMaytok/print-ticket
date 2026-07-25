// CJS entry point for SEA build
// Resolves paths relative to the executable location
process.env.SEA = 'true';

const path = require('path');
const fs = require('fs');

// Change to the executable directory
const exeDir = path.dirname(process.execPath);
try { process.chdir(exeDir); } catch {}

// Resolve modules relative to exe
const modulesDir = path.join(exeDir, 'modules');
if (fs.existsSync(modulesDir)) {
  require('module').Module._initPaths();
  // Add modules dir to the module search path
  const nodeModulesPaths = require('module').Module._nodeModulePaths(modulesDir);
  require('module').Module._resolveLookupPaths = function(request, parent) {
    return [request, nodeModulesPaths];
  };
}

// Load the bundled app
require('./bundle.js');
