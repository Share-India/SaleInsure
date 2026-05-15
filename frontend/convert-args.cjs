const fs = require('fs');
const path = require('path');

const convertHtmlToJsx = (htmlContent, componentName) => {
    let bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let jsxCode = bodyMatch ? bodyMatch[1] : htmlContent;
    jsxCode = jsxCode.replace(/<script[\s\S]*?<\/script>/gi, '');
    jsxCode = jsxCode.replace(/class="/g, 'className="');
    jsxCode = jsxCode.replace(/for="/g, 'htmlFor="');
    jsxCode = jsxCode.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    jsxCode = jsxCode.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    jsxCode = jsxCode.replace(/<br>/g, '<br />');
    jsxCode = jsxCode.replace(/<hr>/g, '<hr />');
    jsxCode = jsxCode.replace(/style="([^"]*)"/g, (match, styleStr) => {
        const styles = styleStr.split(';').filter(s => s.trim() !== '');
        const styleObj = {};
        styles.forEach(s => {
            let [key, value] = s.split(':');
            if (key && value) {
                key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                styleObj[key] = value.trim();
            }
        });
        return `style={${JSON.stringify(styleObj)}}`;
    });
    jsxCode = jsxCode.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

    const finalComponent = `import React from 'react';

const ${componentName} = ({ data }) => {
  return (
    <>
      ${jsxCode}
    </>
  );
};

export default ${componentName};
`;
    return finalComponent;
};

const inputFile = process.argv[2];
const componentName = process.argv[3];
const outputFile = process.argv[4];

if (inputFile && componentName && outputFile) {
    if (fs.existsSync(inputFile)) {
        const html = fs.readFileSync(inputFile, 'utf-8');
        let jsx = convertHtmlToJsx(html, componentName);
        fs.writeFileSync(outputFile, jsx, 'utf-8');
        console.log(`Converted ${inputFile} to ${outputFile}`);
    } else {
        console.log(`Input file does not exist: ${inputFile}`);
    }
} else {
    console.log('Usage: node convert-args.cjs <input> <component> <output>');
}
