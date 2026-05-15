import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Login = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('sales');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTabClick = (newRole) => {
    setRole(newRole);
    setUsername('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password, rememberMe);
    if (success) {
      if (role === 'manager') navigate('/manager');
      else navigate('/sales');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!username) {
        setError("Please enter your username to reset password.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        if (response.ok) {
            setError(data.message || "Password reset request sent to manager.");
        } else {
            setError(data.message || "Failed to send reset request.");
        }
    } catch (err) {
        setError("An error occurred. Please try again later.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="canvas-bg text-on-surface min-h-screen overflow-x-hidden">

      <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
        {/*  Hero Section (Left)  */}
        <section className="hidden md:flex md:w-1/2 lg:w-3/5 hero-gradient relative p-16 flex-col justify-between items-start text-white">
          {/*  Decorative Pattern Overlay  */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <img alt="Abstract Data Visualization" className="w-full h-full object-cover mix-blend-overlay" data-alt="An abstract digital representation of sales data and neural networks, featuring glowing nodes and interconnected light paths over a deep sapphire blue background. The lighting is sophisticated and moody, with high-contrast highlights that suggest speed and intelligence. The aesthetic is clean and corporate, utilizing a professional palette of blues and teals to evoke a sense of high-performance visionary technology." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq-uYed5QMnxTG_TwkWmFBFXVtsEtk-Q-yppXEu6VHzPzXz35WRUa0munICOnOg6TybmH2IBKQ4GM3MIy2PqjpjD6VpD66tJ9LZMBw2Xq72GHJ7_vhBlGL25yROQXPb2KAOMKXuf33jgsPhrQ9MPcQ43gi2XbmS7A_9Doi5dzGp95SWQsCEx37Mvbqr0P18tYWDdbe7R1WjqRptNLBWqrrrCAKd0ofrxOEb9TCZIgkguFTeEoTZlM6gRqBtcW2n42CT7ZWwkoRbq7J" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 bg-white backdrop-blur-md rounded-xl flex items-center justify-center overflow-hidden p-1.5 shadow-lg">
                <img src="/SaleInsureLogo.png" alt="SaleInsure Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight">SaleInsure</span>
            </div>
            <h1 className="font-display-lg text-white mb-6 max-w-xl">
              Drive your sales to new heights.
            </h1>
            <p className="font-body-lg text-primary-fixed max-w-lg leading-relaxed opacity-90">
              Unlock hyper-growth with the world's most sophisticated sales intelligence engine. Precise data, actionable insights, and visionary workflows at light-speed.
            </p>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="glass-card px-8 py-5 rounded-xl inline-flex items-center gap-4 bg-white/90 shadow-lg">
              <img src="/SHAREINDIA.png" alt="Share India Logo" className="h-14 w-auto object-contain" />
              <div className="text-4xl font-black tracking-tighter uppercase" style={{ transform: 'scaleY(1.1)' }}>
                <span className="text-[#0072bc]">Share</span>
                <span className="text-[#ed1c24] ml-2">India</span>
              </div>
            </div>
          </div>
        </section>
        {/*  Login Section (Right)  */}
        <section className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-bright relative">
          <div className="w-full max-w-[420px] space-y-8">
            {/*  Logo  */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-white flex items-center justify-center">
                <img src="/SHAREINDIA.png" alt="Share India Logo" className="w-full h-full object-contain p-2" />
              </div>
              <h2 className="font-headline-lg text-on-surface">Share India</h2>
              <p className="font-body-md text-outline mt-2">Welcome back. Please enter your details.</p>
            </div>
            {/*  Tabs/Segmented Control  */}
            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
              <button 
                type="button"
                onClick={() => handleTabClick('sales')}
                className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${role === 'sales' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Salesperson
              </button>
              <button 
                type="button"
                onClick={() => handleTabClick('manager')}
                className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${role === 'manager' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Manager/Admin
              </button>
            </div>
            {/*  Form  */}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-4">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant block ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" placeholder="Username" type="text" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant block ml-1">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                  <button onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
                    {showPassword ? "visibility_off" : "visibility"}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all" 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="font-label-sm text-outline group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
                <a className="font-label-sm text-primary hover:underline underline-offset-4" href="#" onClick={handleForgotPassword}>Forgot Password?</a>
              </div>
              <button className="w-full bg-primary py-4 rounded-xl font-headline-md text-white shadow-lg shadow-primary/20 hover:bg-surface-tint active:scale-[0.99] transition-all flex items-center justify-center gap-2" type="submit">
                Sign In
              </button>
            </form>
          </div>
          {/*  Contextual Footer  */}
          <footer className="w-full absolute bottom-0 left-0 py-6 px-12 border-t border-slate-200/20 flex flex-col md:flex-row justify-between items-center gap-4 bg-transparent">
            <span className="font-['Manrope'] text-xs font-medium text-slate-500">© 2026 Share India. All rights reserved.</span>
            <div className="flex gap-6">
              <a className="font-['Manrope'] text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-all duration-300" href="#">Privacy Policy</a>
              <a className="font-['Manrope'] text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-all duration-300" href="#">Terms of Service</a>
            </div>
          </footer>
        </section>
      </main>

    </div>
  );
};

export default Login;
