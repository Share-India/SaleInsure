const fs = require('fs');
const path = require('path');

const convertHtmlToJsx = (htmlContent, componentName) => {
    // Extract the content inside <body>
    let bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let jsxCode = bodyMatch ? bodyMatch[1] : htmlContent;

    // Remove scripts if any inside body
    jsxCode = jsxCode.replace(/<script[\s\S]*?<\/script>/gi, '');

    // Replace class= with className=
    jsxCode = jsxCode.replace(/class="/g, 'className="');
    
    // Replace for= with htmlFor=
    jsxCode = jsxCode.replace(/for="/g, 'htmlFor="');
    
    // Close unclosed tags
    jsxCode = jsxCode.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    jsxCode = jsxCode.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    jsxCode = jsxCode.replace(/<br>/g, '<br />');
    jsxCode = jsxCode.replace(/<hr>/g, '<hr />');
    
    // Replace inline styles style="width: 82%" with style={{ width: '82%' }}
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

    // Replace HTML comments
    jsxCode = jsxCode.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

    const finalComponent = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ${componentName} = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="canvas-bg text-on-surface min-h-screen overflow-x-hidden">
      ${jsxCode}
    </div>
  );
};

export default ${componentName};
`;
    return finalComponent;
};

const processFile = (inputFile, componentName, outputFile) => {
    const html = fs.readFileSync(inputFile, 'utf-8');
    let jsx = convertHtmlToJsx(html, componentName);
    
    // For specific components, we might want to attach real logout/data later. 
    // Right now, let's just make sure it compiles.
    fs.writeFileSync(outputFile, jsx, 'utf-8');
    console.log(`Converted ${inputFile} to ${outputFile}`);
};

const pagesDir = path.join(__dirname, 'src', 'pages');

processFile(path.join(pagesDir, 'ManagerDashboard.html'), 'ManagerDashboard', path.join(pagesDir, 'ManagerDashboard.jsx'));
processFile(path.join(pagesDir, 'SalespersonDashboard.html'), 'SalesDashboard', path.join(pagesDir, 'SalesDashboard.jsx'));
processFile(path.join(pagesDir, 'Login.html'), 'Login', path.join(pagesDir, 'Login.jsx'));
