const fs = require('fs');

const log = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/f4147ba1-d1a4-4a55-bdf3-2e1ce71985bb/.system_generated/logs/overview.txt', 'utf-8');

function restoreFile(filePath, searchString) {
    const lines = log.split('\n');
    let startIdx = -1;
    let endIdx = -1;
    for(let i=lines.length-1; i>=0; i--) {
        if(lines[i].includes('The above content shows the entire, complete file contents of the requested file')) {
            endIdx = i;
        }
        if(endIdx !== -1 && lines[i].includes(`File Path: \`file:///C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/${searchString}\``)) {
            startIdx = i;
            break;
        }
    }

    if (startIdx !== -1 && endIdx !== -1) {
        let content = lines.slice(startIdx, endIdx).filter(l => /^\d+:/.test(l)).map(l => l.replace(/^\d+:\s?/, '')).join('\n');
        fs.writeFileSync(filePath, content);
        console.log(`Restored ${searchString}`);
    } else {
        console.log(`Could not find ${searchString}`);
    }
}

restoreFile('frontend/src/pages/SalesDashboard.jsx', 'frontend/src/pages/SalesDashboard.jsx');
restoreFile('frontend/src/pages/Login.jsx', 'frontend/src/pages/Login.jsx');
