const fs = require('fs');

const code = `import React from 'react';

const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
    return '$' + value.toLocaleString();
};

const TeamPerformance = ({ data }) => {
  const topPerformers = data?.topPerformers || [];
  const mvp = topPerformers.length > 0 ? topPerformers[0] : null;
  const rank2 = topPerformers.length > 1 ? topPerformers[1] : null;
  const rank3 = topPerformers.length > 2 ? topPerformers[2] : null;
  const divisionReps = topPerformers.slice(3);

  return (
    <>
      <main className="max-w-7xl mx-auto px-8 py-16 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-10">
          <div className="space-y-2">
            <h1 className="font-h1 text-h1 text-primary-container tracking-tighter">Team Performance</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Detailed metrics for all sales representatives</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-primary-container text-on-primary font-label-caps uppercase tracking-widest rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Ledger
            </button>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
            <h2 className="font-h2 text-h2 text-primary-container">Top Performers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rank 2 */}
            {rank2 && (
              <div className="order-2 md:order-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 shadow-sm relative overflow-hidden group transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-blue-900/10 font-h1 text-7xl select-none">02</span>
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-blue-800">{rank2.username.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-h3 text-h3 text-primary-container">{rank2.username}</h3>
                    <span className="font-label-caps text-orange-800 bg-orange-100 px-3 py-1 rounded inline-block">{rank2.title || 'Senior Lead'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                    <div>
                      <p className="font-label-caps text-on-surface-variant opacity-60 mb-1">REVENUE</p>
                      <p className="font-data-tabular text-xl font-bold text-primary-container">{formatCurrency(rank2.totalPremium)}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-on-surface-variant opacity-60 mb-1">DEALS</p>
                      <p className="font-data-tabular text-xl font-bold text-primary-container">{rank2.dealsClosed || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MVP (Rank 1) */}
            {mvp && (
              <div className="order-1 md:order-2 bg-blue-600 text-white border border-blue-500 rounded-xl p-10 shadow-xl relative overflow-hidden group scale-105 z-20 transition-transform hover:-translate-y-2">
                <div className="absolute -bottom-10 -right-10 opacity-5">
                  <span className="material-symbols-outlined text-[240px]" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="w-28 h-28 rounded-full bg-blue-800 border-4 border-white/20 shadow-xl flex items-center justify-center overflow-hidden">
                        <span className="text-4xl font-bold text-white">{mvp.username.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>emoji_events</span>
                      <span className="font-label-caps text-xs">MVP This Month</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-extrabold tracking-tight">{mvp.username}</h3>
                    <p className="font-body-md text-white/70">{mvp.title || 'Strategic Accounts Director'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div>
                      <p className="font-label-caps text-white/50 mb-2">TOTAL REVENUE</p>
                      <p className="font-data-tabular text-3xl font-black">{formatCurrency(mvp.totalPremium)}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-white/50 mb-2">QUOTA STATUS</p>
                      <p className="font-data-tabular text-3xl font-black">{mvp.quota ? Math.round((mvp.totalPremium / mvp.quota) * 100) : 0}%</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between font-label-caps text-xs">
                      <span>Monthly Progress</span>
                      <span>{formatCurrency(mvp.quota)} Goal</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: \`\${Math.min(100, (mvp.totalPremium / (mvp.quota || 1)) * 100)}%\` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {rank3 && (
              <div className="order-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 shadow-sm relative overflow-hidden group transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-blue-900/10 font-h1 text-7xl select-none">03</span>
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-blue-800">{rank3.username.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-h3 text-h3 text-primary-container">{rank3.username}</h3>
                    <span className="font-label-caps text-orange-800 bg-orange-100 px-3 py-1 rounded inline-block">{rank3.title || 'Global Sales'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                    <div>
                      <p className="font-label-caps text-on-surface-variant opacity-60 mb-1">REVENUE</p>
                      <p className="font-data-tabular text-xl font-bold text-primary-container">{formatCurrency(rank3.totalPremium)}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-on-surface-variant opacity-60 mb-1">DEALS</p>
                      <p className="font-data-tabular text-xl font-bold text-primary-container">{rank3.dealsClosed || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {divisionReps.length > 0 && (
          <section className="space-y-6 pt-8">
            <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">groups</span>
                <h3 className="font-h3 text-primary-container">Division Representatives</h3>
              </div>
              <div className="flex gap-2 text-on-surface-variant">
                <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">filter_list</span></button>
                <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">sort</span></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {divisionReps.map((rep, index) => {
                const percent = rep.quota ? Math.round((rep.totalPremium / rep.quota) * 100) : 0;
                return (
                  <div key={index} className="bg-white border border-outline-variant/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <span className="text-lg font-bold text-slate-600">{rep.username.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-label-lg text-primary-container">{rep.username}</h4>
                        <p className="font-label-sm text-on-surface-variant">{rep.title || 'Enterprise Manager'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div>
                        <p className="font-label-caps text-[10px] text-on-surface-variant/60 mb-1">REVENUE</p>
                        <p className="font-data-tabular font-bold text-primary-container">{formatCurrency(rep.totalPremium)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-label-caps text-[10px] text-on-surface-variant/60 mb-1">DEALS</p>
                        <p className="font-data-tabular font-bold text-blue-600">{rep.dealsClosed || 0}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-label-caps text-[10px] text-on-surface-variant">
                        <span>Quota Progress</span>
                        <span className="text-blue-600">{percent}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: \`\${Math.min(100, percent)}%\` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default TeamPerformance;`;

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/TeamPerformance.jsx', code);
console.log('Updated TeamPerformance.jsx');
