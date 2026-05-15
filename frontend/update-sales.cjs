const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import DealPipeline from './DealPipeline';
import ActivityFeed from './ActivityFeed';

const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k';
    return '$' + value.toLocaleString();
};

const SalesDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logMsg, setLogMsg] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/sales-dashboard');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogActivity = async (stage) => {
    try {
      setLogMsg(null);
      const payload = {
        clientName: "Demo Client",
        stage: stage,
        notes: \`Quick \${stage} log from dashboard\`,
      };
      
      if (stage === 'CLOSURE') {
        payload.premiumAmount = 15000;
        payload.productName = "Enterprise Plan";
        payload.status = "WON";
      }
      
      await api.post('/activities', payload);
      setLogMsg({ type: 'success', text: \`Successfully logged \${stage}\` });
      
      // Refresh data
      fetchDashboardData();
      
      setTimeout(() => setLogMsg(null), 3000);
    } catch (err) {
      setLogMsg({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const pipeline = data?.pipelineHealth || { leads: 0, meetings: 0, offers: 0, closed: 0 };
  const totalPipeline = pipeline.leads + pipeline.meetings + pipeline.offers + pipeline.closed || 1; // avoid div by 0
  
  const w1 = Math.round((pipeline.leads / totalPipeline) * 100);
  const w2 = Math.round((pipeline.meetings / totalPipeline) * 100);
  const w3 = Math.round((pipeline.closed / totalPipeline) * 100);

  const target = data?.targetRevenue || 160000;
  const achieved = data?.achievedRevenue || 0;
  const progressPercent = Math.min(100, Math.round((achieved / target) * 100));

  const navItemClass = (viewName) => {
    return activeView === viewName
      ? "flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all cursor-pointer"
      : "flex items-center gap-3 px-4 py-3 text-slate-500 hover:translate-x-1 hover:bg-slate-100/50 transition-all rounded-lg group cursor-pointer";
  };

  return (
    <div className="canvas-bg text-on-surface min-h-screen overflow-x-hidden">
      
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 bottom-0 flex flex-col p-4 gap-4 bg-white/70 backdrop-blur-2xl h-screen w-64 border-r border-white/40 shadow-xl z-50 font-manrope text-sm font-medium">
        <div className="flex items-center gap-3 px-2 py-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-primary-container text-blue-800 font-bold">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'NA'}
          </div>
          <div>
            <p className="font-bold text-on-surface">{user?.username || 'Alex Rivers'}</p>
            <p className="text-xs text-slate-500">Account Executive</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <a onClick={(e) => { e.preventDefault(); setActiveView('Dashboard'); }} className={navItemClass('Dashboard')} href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeView === 'Dashboard' ? "'FILL' 1" : undefined}}>dashboard</span>
            <span>Dashboard</span>
          </a>
          <a onClick={(e) => { e.preventDefault(); setActiveView('Pipeline'); }} className={navItemClass('Pipeline')} href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeView === 'Pipeline' ? "'FILL' 1" : undefined}}>account_tree</span>
            <span>Pipeline</span>
          </a>
          <a onClick={(e) => { e.preventDefault(); setActiveView('Conversations'); }} className={navItemClass('Conversations')} href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeView === 'Conversations' ? "'FILL' 1" : undefined}}>forum</span>
            <span>Conversations</span>
          </a>
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-white/40">
          <button onClick={() => handleLogActivity('CONVERSATION')} className="mb-4 w-full py-3 bg-primary-container text-on-primary-container rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform ambient-shadow">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Log Activity
          </button>
          <a onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 transition-all rounded-lg cursor-pointer" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 min-h-screen flex flex-col">
        {/* TopNavBar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 h-16 w-full bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm font-manrope antialiased">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-slate-900">Aether Sales</span>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto space-y-10">
          {activeView === 'Dashboard' && (
            <>
              {/* Section 1: Personal Activity Overview */}
              <section>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Activity Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card ambient-shadow p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600">
                        <span className="material-symbols-outlined">forum</span>
                      </div>
                    </div>
                    <p className="font-label-sm text-label-sm text-slate-500 uppercase tracking-wider">Conversations Today</p>
                    <p className="font-stat-lg text-stat-lg text-on-surface mt-1">{data?.talksToday || 0}</p>
                  </div>

                  <div className="glass-card ambient-shadow p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-tertiary/10 text-tertiary">
                        <span className="material-symbols-outlined">handshake</span>
                      </div>
                    </div>
                    <p className="font-label-sm text-label-sm text-slate-500 uppercase tracking-wider">Connections Made</p>
                    <p className="font-stat-lg text-stat-lg text-on-surface mt-1">{data?.connectionsMade || 0}</p>
                  </div>

                  <div className="glass-card ambient-shadow p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                        <span className="material-symbols-outlined">verified</span>
                      </div>
                    </div>
                    <p className="font-label-sm text-label-sm text-slate-500 uppercase tracking-wider">Closures</p>
                    <p className="font-stat-lg text-stat-lg text-on-surface mt-1">{data?.dealsClosed || 0}</p>
                  </div>

                  <div className="glass-card ambient-shadow p-6 rounded-2xl bg-gradient-to-br from-white/70 to-blue-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg">
                        <span className="material-symbols-outlined">payments</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Goal: {progressPercent}%</span>
                    </div>
                    <p className="font-label-sm text-label-sm text-slate-500 uppercase tracking-wider">Total Revenue</p>
                    <p className="font-stat-lg text-stat-lg text-on-surface mt-1">{formatCurrency(data?.totalRevenue)}</p>
                  </div>
                </div>
              </section>

              {/* Section 2: Activity Logger */}
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {logMsg && (
                    <div className={\`col-span-1 lg:col-span-3 p-4 rounded-xl \${logMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                      {logMsg.text}
                    </div>
                  )}
                  <button onClick={() => handleLogActivity('CONVERSATION')} className="glass-card group p-8 rounded-3xl text-left border-2 border-transparent hover:border-blue-600/20 transition-all ambient-shadow active:scale-[0.98]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/5 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-3xl">add_comment</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md mb-2">Log Conversation</h3>
                    <p className="text-slate-500 text-body-md">Record details of a client call, meeting, or email exchange.</p>
                  </button>

                  <button onClick={() => handleLogActivity('CONNECTION')} className="glass-card group p-8 rounded-3xl text-left border-2 border-transparent hover:border-tertiary/20 transition-all ambient-shadow active:scale-[0.98]">
                    <div className="w-14 h-14 rounded-2xl bg-tertiary/5 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-3xl">person_add</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md mb-2">Log Connection</h3>
                    <p className="text-slate-500 text-body-md">Mark a new meaningful relationship established today.</p>
                  </button>

                  <button onClick={() => handleLogActivity('CLOSURE')} className="glass-card group p-8 rounded-3xl text-left border-2 border-transparent hover:border-secondary/20 transition-all ambient-shadow active:scale-[0.98]">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md mb-2">Log Closure</h3>
                    <p className="text-slate-500 text-body-md">Celebrate a win! Finalize details for a newly closed deal.</p>
                  </button>
                </div>
              </section>

              {/* Section 3: Pipeline Health */}
              <section className="glass-card p-8 rounded-3xl ambient-shadow">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="font-headline-md text-headline-md">Pipeline Health</h2>
                    <p className="text-slate-500">Current velocity across the sales funnel</p>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center w-1/3">
                      <div className="font-bold text-on-surface">{pipeline.leads}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-tighter">Conversations</div>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="font-bold text-on-surface">{pipeline.meetings}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-tighter">Connections</div>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="font-bold text-on-surface">{pipeline.closed}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-tighter">Closures</div>
                    </div>
                  </div>

                  <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden p-1 shadow-inner relative">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{width: \`\${w1}%\`}}></div>
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{width: \`\${w2}%\`}}></div>
                    <div className="h-full bg-blue-700 rounded-full transition-all" style={{width: \`\${w3}%\`}}></div>
                  </div>

                  <div className="flex justify-between mt-6 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                      <span className="text-xs text-slate-500">Total Pipeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-700"></span>
                      <span className="text-xs text-slate-500">Closing</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Recent Activity Feed */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 ambient-shadow">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline-md text-headline-md">Recent Activity</h2>
                    <button onClick={() => setActiveView('Conversations')} className="text-blue-600 font-bold text-sm hover:underline">View All</button>
                  </div>

                  <div className="space-y-6">
                    {data?.recentActivities?.length > 0 ? data.recentActivities.slice(0, 5).map((act, i) => {
                      const isLast = i === Math.min(data.recentActivities.length, 5) - 1;
                      let icon = 'forum';
                      let iconColor = 'bg-blue-600/10 text-blue-600';
                      let label = 'Conversation';

                      if (act.stage === 'CLOSURE') {
                        icon = 'verified';
                        iconColor = 'bg-secondary/10 text-secondary';
                        label = \`Closed a \${formatCurrency(act.premiumAmount)} deal\`;
                      } else if (act.stage === 'CONNECTION') {
                        icon = 'handshake';
                        iconColor = 'bg-tertiary/10 text-tertiary';
                        label = 'New Connection';
                      }

                      return (
                        <div key={act.id} className="flex gap-4 group">
                          <div className="relative">
                            <div className={\`w-10 h-10 rounded-full \${iconColor} flex items-center justify-center z-10 relative\`}>
                              <span className="material-symbols-outlined text-xl">{icon}</span>
                            </div>
                            {!isLast && <div className="absolute top-10 bottom-[-24px] left-1/2 w-px bg-slate-200"></div>}
                          </div>
                          <div className="flex-1 pb-6 border-b border-slate-50 group-last:border-none">
                            <div className="flex justify-between items-start">
                              <p className="text-on-surface"><span className="font-bold">{label}</span> with {act.clientName || 'Client'}</p>
                              <span className="text-xs text-slate-400">{act.timeAgo}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{act.productName || 'No specific product details'}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-slate-500">No recent activities.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-6 ambient-shadow overflow-hidden relative">
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-widest">Monthly Target</p>
                      <h3 className="text-2xl font-bold mb-4">{progressPercent >= 100 ? 'Target Achieved!' : "You're almost there!"}</h3>
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-extrabold">{formatCurrency(achieved)}</span>
                        <span className="text-slate-400 text-sm pb-1">/ {formatCurrency(target)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
                        <div className="bg-blue-600 h-full rounded-full transition-all" style={{width: \`\${progressPercent}%\`}}></div>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">Closing 2 more mid-size deals this week will push you past your accelerator threshold!</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 ambient-shadow bg-blue-600 text-white">
                    <h3 className="text-lg font-bold mb-2">Sales Tips</h3>
                    <p className="text-blue-100 text-sm mb-4">Recent data shows that follow-ups within 2 hours of a connection increase closure rates by 35%.</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeView === 'Pipeline' && (
            <DealPipeline data={data} />
          )}

          {activeView === 'Conversations' && (
            <ActivityFeed data={data} />
          )}

        </main>
      </div>
    </div>
  );
};

export default SalesDashboard;`;

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/SalesDashboard.jsx', code);
console.log('Updated SalesDashboard.jsx');
