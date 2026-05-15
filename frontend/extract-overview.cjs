const fs = require('fs');
const code = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/ManagerDashboard.jsx', 'utf-8');
const start = code.indexOf('<main className="ml-64');
const end = code.indexOf('</main>') + 7;
const mainContent = code.substring(start, end);
const overviewComponent = `import React from 'react';\n\nconst Overview = ({ data }) => {\n  return (\n    ${mainContent.replace(/\n/g, '\n    ')}\n  );\n};\n\nexport default Overview;\n`;
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/Overview.jsx', overviewComponent);
console.log('Created Overview.jsx');
