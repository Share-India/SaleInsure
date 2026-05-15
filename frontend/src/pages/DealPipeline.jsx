import React, { useState } from 'react';
import ClientProfileModal from '../components/ClientProfileModal';

const formatCurrency = (value) => {
    if (!value) return '₹0';
    return '₹' + value.toLocaleString();
};

const DealPipeline = ({ data }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [quarterFilter, setQuarterFilter] = useState('ALL');
  const allDeals = data?.allDeals || [];

  const filteredDeals = allDeals.filter(deal => {
      if (quarterFilter === 'ALL') return true;
      if (!deal.activityDate) return true;
      const month = new Date(deal.activityDate).getMonth();
      const q = Math.floor(month / 3) + 1;
      return `Q${q}` === quarterFilter;
  });

  const handleExport = (e) => {
    e.preventDefault();
    try {
        if (!filteredDeals || filteredDeals.length === 0) {
            alert("No data to export");
            return;
        }
        const headers = ['Ref ID', 'Client Name', 'Stage', 'Status', 'Date', 'Amount', 'Product', 'Salesperson'];
        const csvRows = filteredDeals.map(deal => {
            return [
                `"#${deal.id}"`,
                `"${(deal.clientName || '').replace(/"/g, '""')}"`,
                `"${deal.stage || ''}"`,
                `"${deal.status || ''}"`,
                `"${deal.activityDate || ''}"`,
                deal.premiumAmount || 0,
                `"${(deal.productName || '').replace(/"/g, '""')}"`,
                `"${(deal.username || '').replace(/"/g, '""')}"`
            ].join(',');
        });
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // IE11 & Edge support
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, 'deal_pipeline_export.csv');
            return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `deal_pipeline_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to export data. See console for details.");
    }
  };

  const leads = filteredDeals.filter(d => d.stage === 'CONNECTION');
  const meetings = filteredDeals.filter(d => d.stage === 'CONVERSATION');
  const closed = filteredDeals.filter(d => d.stage === 'CLOSURE');

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
    } else if (type === 'closed') {
      statusLabel = deal.status === 'WON' ? 'Closed Won' : (deal.status === 'LOST' ? 'Closed Lost' : 'Archived');
      statusColor = deal.status === 'WON' ? 'bg-green-50 text-green-700' : 'bg-slate-200 text-slate-500';
    }

    if (type === 'closed') {
        return (
            <div key={deal.id} onClick={() => setSelectedClient(client)} className="bg-slate-50/50 border border-slate-200 p-4 rounded opacity-75 grayscale hover:grayscale-0 transition-all cursor-pointer">
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
                <span className={`${statusColor} font-label-caps text-[9px] px-2 py-1 rounded-sm uppercase tracking-widest`}>{statusLabel}</span>
                </div>
            </div>
        );
    }

    return (
      <div key={deal.id} onClick={() => setSelectedClient(client)} className="bg-surface-container-lowest border border-slate-200 p-4 rounded shadow-sm hover:border-slate-400 transition-colors cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-caps text-[10px] text-slate-400 uppercase tracking-tighter">REF: #{type.charAt(0).toUpperCase()}-{deal.id}</span>
          <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-900 transition-colors">more_horiz</span>
        </div>
        <h3 className="font-h3 text-lg text-primary mb-1">{client}</h3>
        {type === 'lead' || type === 'meeting' ? (
          <p className="font-body-md text-slate-500 mb-4 truncate">{deal.productName || 'Awaiting Details'}</p>
        ) : (
          <p className="font-data-tabular text-slate-900 font-bold text-xl mb-4">{amount}</p>
        )}
        
        {type === 'meeting' ? (
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
          <span className={`${statusColor} font-label-caps text-[9px] px-2 py-1 rounded-sm uppercase tracking-widest`}>{statusLabel}</span>
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
          <div className="flex gap-4 items-center">
            <select 
              value={quarterFilter}
              onChange={(e) => setQuarterFilter(e.target.value)}
              className="bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm cursor-pointer text-sm font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors appearance-none pr-8 relative"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="ALL">Filter: All Time</option>
              <option value="Q1">Q1 (Jan - Mar)</option>
              <option value="Q2">Q2 (Apr - Jun)</option>
              <option value="Q3">Q3 (Jul - Sep)</option>
              <option value="Q4">Q4 (Oct - Dec)</option>
            </select>

            <button type="button" onClick={handleExport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-colors font-bold uppercase tracking-widest text-xs">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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

      <ClientProfileModal 
        isOpen={!!selectedClient} 
        clientName={selectedClient} 
        onClose={() => setSelectedClient(null)} 
      />
    </>
  );
};

export default DealPipeline;