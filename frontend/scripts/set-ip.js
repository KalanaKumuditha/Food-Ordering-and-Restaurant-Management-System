const fs = require('fs');
const os = require('os');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    // Ignore virtual network interfaces like WSL, VirtualBox, and VMware
    if (name.toLowerCase().includes('vethernet') || 
        name.toLowerCase().includes('wsl') || 
        name.toLowerCase().includes('virtual') || 
        name.toLowerCase().includes('vmware')) {
      continue;
    }
    
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIp();
const envPath = path.join(__dirname, '..', '.env');
const apiUrl = `http://${ip}:5000`;

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check if EXPO_PUBLIC_API_BASE_URL already exists
const regex = /^#?\s*EXPO_PUBLIC_API_BASE_URL=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `EXPO_PUBLIC_API_BASE_URL=${apiUrl}`);
} else {
  envContent += `\nEXPO_PUBLIC_API_BASE_URL=${apiUrl}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n');
console.log(`\n✅ Successfully updated .env with API Base URL: ${apiUrl}\n`);
