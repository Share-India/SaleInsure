const fs = require('fs');

function stripToMain(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const match = code.match(/(<main[\s\S]*<\/main>)/);
    if (match) {
        const newCode = code.replace(/<>\s*[\s\S]*?\s*<\/>/, `<>\n      ${match[1]}\n    </>`);
        fs.writeFileSync(filePath, newCode);
        console.log('Stripped ' + filePath);
    } else {
        console.log('No <main> found in ' + filePath);
    }
}

stripToMain('frontend/src/pages/TeamPerformance.jsx');
stripToMain('frontend/src/pages/DealPipeline.jsx');
stripToMain('frontend/src/pages/ActivityFeed.jsx');
