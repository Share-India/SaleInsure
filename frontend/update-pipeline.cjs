const fs = require('fs');

const code = `import React from 'react';

const formatCurrency = (value) => {
    if (!value) return '$0';
    return '$' + value.toLocaleString();
};

const DealPipeline = ({ data }) => {
  const allDeals = data?.allDeals || [];
  
  const leads = allDeals.filter(d => d.stage === 'CONVERSATION');
  const meetings = allDeals.filter(d => d.stage === 'CONNECTION');
  const offers = []; // Empty for demo
  const closed = allDeals.filter(d => d.stage === 'CLOSURE');

  const renderDealCard = (deal, type) => {
    const initials = deal.username ? deal.username.substring(0, 2).toUpperCase() : 'NA';
    const amount = formatCurrency(deal.premiumAmount || 0);
    const client = deal.clientName || 'Unknown Client';
    
    let statusLabel = 'Active';
    let statusColor = 'bg-blue-50 text-blue-700';
    
    if (type === 'lead') {
      statusLabel = deal.status || 'Early Stage';
    } else if (type === 'meeting') {
      statusLabel = deal.status || 'Follow Up';
      statusColor = 'bg-amber-50 text-amber-700';
    } else if (type === 'offer') {
      statusLabel = deal.status || 'Negotiating';
      statusColor = 'bg-indigo-50 text-indigo-700';
    } else if (type === 'closed') {
      statusLabel = deal.status === 'WON' ? 'Closed Won' : (deal.status === 'LOST' ? 'Closed Lost' : 'Archived');
      statusColor = deal.status === 'WON' ? 'bg-green-50 text-green-700' : 'bg-slate-200 text-slate-500';
    }

    if (type === 'closed') {
        return (
            <div key={deal.id} className="bg-slate-50/50 border border-slate-200 p-4 rounded opacity-75 grayscale hover:grayscale-0 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-tighter">REF: #C-{deal.id}</span>
                <span className="material-symbols-outlined text-green-600" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                </div>
                <h3 className="font-h3 text-lg text-slate-500 mb-1">{client}</h3>
                <p className="font-data-tabular text-slate-400 font-bold text-xl mb-4">{amount}</p>
                <div className="h-[1px] w-full bg-slate-200 mb-4"></div>
                <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full ring-2 ring-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">{initials}</div>
                </div>
                <span className={\`\${statusColor} font-label-caps text-[9px] px-2 py-1 rounded-sm uppercase tracking-widest\`}>{statusLabel}</span>
                </div>
            </div>
        );
    }

    return (
      <div key={deal.id} className="bg-surface-container-lowest border border-slate-200 p-4 rounded shadow-sm hover:border-slate-400 transition-colors cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-tighter">REF: #{type.charAt(0).toUpperCase()}-{deal.id}</span>
          <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-900 transition-colors">more_horiz</span>
        </div>
        <h3 className="font-h3 text-lg text-primary mb-1">{client}</h3>
        <p className="font-data-tabular text-slate-900 font-bold text-xl mb-4">{amount}</p>
        
        {type === 'meeting' || type === 'offer' ? (
            <div className="w-full bg-slate-100 h-1 mb-4 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full w-[65%]"></div>
            </div>
        ) : (
            <div className="h-[1px] w-full bg-slate-100 mb-4"></div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800">{initials}</div>
          </div>
          <span className={\`\${statusColor} font-label-caps text-[9px] px-2 py-1 rounded-sm uppercase tracking-widest\`}>{statusLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <main className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="font-h2 text-h2 text-primary tracking-tight">Deal Pipeline</h1>
            <p className="font-body-md text-on-primary-container mt-1">Current conversion health and active deals</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-outline-variant rounded shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="font-label-caps text-xs">Filter by Quarter</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-outline-variant rounded shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="font-label-caps text-xs">Export Ledger</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Column: Lead */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900/10">
              <span className="font-label-caps text-primary tracking-widest uppercase">Lead</span>
              <span className="font-data-tabular bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{leads.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col gap-4">
              {leads.map(deal => renderDealCard(deal, 'lead'))}
              {leads.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No leads</div>}
            </div>
          </div>

          {/* Column: Meeting */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900/10">
              <span className="font-label-caps text-primary tracking-widest uppercase">Meeting</span>
              <span className="font-data-tabular bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{meetings.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col gap-4">
              {meetings.map(deal => renderDealCard(deal, 'meeting'))}
              {meetings.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No meetings</div>}
            </div>
          </div>

          {/* Column: Offer */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900/10">
              <span className="font-label-caps text-primary tracking-widest uppercase">Offer</span>
              <span className="font-data-tabular bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{offers.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col gap-4">
              {offers.map(deal => renderDealCard(deal, 'offer'))}
              {offers.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No offers</div>}
            </div>
          </div>

          {/* Column: Closed */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900/10">
              <span className="font-label-caps text-primary tracking-widest uppercase">Closed</span>
              <span className="font-data-tabular bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{closed.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col gap-4">
              {closed.map(deal => renderDealCard(deal, 'closed'))}
              {closed.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No closed deals</div>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DealPipeline;`;

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/DealPipeline.jsx', code);
console.log('Updated DealPipeline.jsx');
