import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Overview from './Overview';
import TeamPerformance from './TeamPerformance';
import DealPipeline from './DealPipeline';
import ActivityFeed from './ActivityFeed';
import AddUserView from '../components/AddUserView';
import MessagesPanel from '../components/MessagesPanel';
import { API_BASE_URL } from '../config';
const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [unreadSummary, setUnreadSummary] = useState({ totalUnread: 0, perUserCounts: {} });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/unread`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadSummary(data);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-xl text-blue-600">Loading Dashboard...</div>;
  }


  return (
    <div className="canvas-bg text-on-surface min-h-screen overflow-x-hidden">
      
{/* Mobile Overlay */}
{isMobileMenuOpen && (
  <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
)}

{/*  SideNavBar (Shared Component)  */}
<aside className={`fixed left-0 top-0 flex flex-col h-full py-6 px-4 z-50 bg-white/70 backdrop-blur-[40px] h-screen w-64 border-r border-white/40 shadow-2xl shadow-blue-500/5 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
<div className="mb-10 px-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-white overflow-hidden shadow-sm flex items-center justify-center p-1">
<img src="/SaleInsureLogo.png" alt="SaleInsure Logo" className="w-full h-full object-contain" />
</div>
<div>
<h1 className="text-lg font-extrabold text-blue-600">SaleInsure</h1>
<p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Share India CRM</p>
</div>
</div>
</div>
<nav className="flex-1 flex flex-col gap-1">
<a onClick={(e) => { e.preventDefault(); setActiveView('overview'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${activeView === 'overview' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}`} href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-label-md text-label-md">Overview</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveView('team_performance'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${activeView === 'team_performance' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}`} href="#">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span className="font-label-md text-label-md">Team Performance</span>
</a>

<a onClick={(e) => { e.preventDefault(); setActiveView('deal_pipeline'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${activeView === 'deal_pipeline' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}`} href="#">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
<span className="font-label-md text-label-md">Deal Pipeline</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveView('activity_feed'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${activeView === 'activity_feed' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}`} href="#">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span className="font-label-md text-label-md">Activity Feed</span>
</a>
</nav>
<div className="mt-auto flex flex-col gap-1 border-t border-white/40 pt-6">
<a onClick={(e) => { e.preventDefault(); setActiveView('add_user'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${activeView === 'add_user' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}`} href="#">
<span className="material-symbols-outlined" data-icon="person_add">person_add</span>
<span className="font-label-md text-label-md">Add Team Member</span>
</a>
<a className="flex items-center gap-3 text-slate-600 px-4 py-2 hover:bg-white/80 rounded-lg transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-label-md text-label-md">Logout</span>
</a>
</div>
</aside>
{/*  TopNavBar (Shared Component)  */}
<header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white/70 backdrop-blur-[20px] flex justify-between items-center px-4 md:px-8 z-30 border-b border-white/40 shadow-[0_10px_30px_-15px_rgba(37,99,235,0.1)]">
<div className="flex items-center gap-2 md:gap-4 flex-1">
<button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg">
  <span className="material-symbols-outlined">menu</span>
</button>
<div className="relative w-full max-w-md hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" data-icon="search">search</span>
<input className="w-full bg-slate-50/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400" placeholder="Search analytics, deals, or team members..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button onClick={() => toggleDropdown('notifications')} className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-colors relative">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
                </button>
                {activeDropdown === 'notifications' && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Notifications</h3>
                      <button onClick={() => toggleDropdown(null)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
                      <p className="text-sm font-medium">No new notifications</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('messages')} className="p-2 text-slate-500 hover:bg-blue-50/50 rounded-full transition-colors relative">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  {unreadSummary.totalUnread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {unreadSummary.totalUnread > 99 ? '99+' : unreadSummary.totalUnread}
                    </span>
                  )}
                </button>
                <MessagesPanel 
                  isOpen={activeDropdown === 'messages'} 
                  onClose={() => toggleDropdown(null)} 
                  currentUser={user} 
                  unreadCounts={unreadSummary.perUserCounts}
                  refreshUnread={fetchUnread}
                />
              </div>
            </div>
<div className="h-8 w-[1px] bg-slate-200"></div>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="font-label-md text-slate-900 leading-none">{user?.username || 'Manager'}</p>
<p className="text-[10px] font-bold text-blue-600 leading-none mt-1">{user?.designation || 'Sales Manager'}</p>
</div>
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
{user?.profilePhotoUrl ? (
    <img alt="Manager Avatar" className="w-full h-full object-cover" src={`${API_BASE_URL}${user.profilePhotoUrl}`}/>
) : (
    user?.username ? user.username.charAt(0).toUpperCase() : 'M'
)}
</div>
</div>
</div>
</header>
{/*  Main Content Area  */}
<div className="md:ml-64 pt-16 min-h-screen relative z-20">
    {activeView === 'overview' && <Overview data={data} />}
    {activeView === 'team_performance' && <TeamPerformance data={data} />}
    {activeView === 'deal_pipeline' && <DealPipeline data={data} />}
    {activeView === 'activity_feed' && <ActivityFeed data={data} />}
    {activeView === 'add_user' && <AddUserView />}
</div>

    </div>
  );
};

export default ManagerDashboard;
