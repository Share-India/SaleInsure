const fs = require('fs');
let code = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/Login.jsx', 'utf-8');

code = code.replace("import React from 'react';", "import React, { useState } from 'react';");
code = code.replace("const { user, logout } = useAuth();", "const { user, login, logout } = useAuth();");

const stateCode = `  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      if (username === 'demo_manager') navigate('/manager');
      else navigate('/sales');
    } else {
      setError('Invalid credentials');
    }
  };`;

code = code.replace("  const handleLogout = () => {", stateCode + "\n\n  const handleLogout = () => {");

code = code.replace('<form className="space-y-5">', '{error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-4">{error}</div>}\n<form onSubmit={handleLogin} className="space-y-5">');

code = code.replace(
    '<input className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" placeholder="name@company.com" type="email"/>',
    '<input value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" placeholder="Username" type="text"/>'
);

code = code.replace(
    '<input className="w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password"/>',
    '<input value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password"/>'
);

code = code.replace(
    `document.querySelector('input[type="email"]').value = 'demo_manager';
                            document.querySelector('input[type="password"]').value = 'password123';`,
    `setUsername('demo_manager');
                            setPassword('password123');`
);

code = code.replace(
    `document.querySelector('input[type="email"]').value = 'demo_sales';
                            document.querySelector('input[type="password"]').value = 'password123';`,
    `setUsername('demo_sales');
                            setPassword('password123');`
);

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/Login.jsx', code);
console.log('Updated Login.jsx');
