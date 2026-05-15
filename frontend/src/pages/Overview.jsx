import React, { useState, useEffect } from 'react';
import SetTargetsModal from '../components/SetTargetsModal';
import ActivityDetailsModal from '../components/ActivityDetailsModal';
import { API_BASE_URL } from '../config';

const Overview = ({ data }) => {
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const [chartView, setChartView] = useState('revenue');
    const [showAllActivities, setShowAllActivities] = useState(false);
    const [selectedClientName, setSelectedClientName] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    // Load targets from localStorage or use defaults
    const [targets, setTargets] = useState(() => {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        const saved = localStorage.getItem('teamTargets');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            revenueTarget: data?.revenueProgress?.target || 500000,
            dealsClosedTarget: 20,
            connectionsTarget: 50,
            talksTarget: 100
        };
    });

    // Save targets to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('teamTargets', JSON.stringify(targets));
    }, [targets]);

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Compute last 7 days chart data
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            dateStr: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: 0,
            volume: 0
        };
    });

    if (data?.allDeals) {
        data.allDeals.forEach(deal => {
            if (deal.stage === 'CLOSURE') {
                const dealDate = deal.activityDate;
                const dayMatch = last7Days.find(d => d.dateStr === dealDate);
                if (dayMatch) {
                    dayMatch.revenue += (deal.premiumAmount || 0);
                    dayMatch.volume += 1;
                }
            }
        });
    }

    const chartData = last7Days.map(d => chartView === 'revenue' ? d.revenue : d.volume);
    const displayTarget = chartView === 'revenue' ? targets.revenueTarget : targets.dealsClosedTarget;
    const maxChartVal = Math.max(displayTarget, ...chartData) || 1;
    
    const displayAchieved = chartView === 'revenue' ? (data?.revenueProgress?.achieved || 0) : (data?.dealsClosed || 0);
    const displayGap = Math.max(0, displayTarget - displayAchieved);

    // Calculate Dynamic Pipeline Insights
    const leadsCount = data?.pipelineHealth?.leads || 0;
    const meetingsCount = data?.pipelineHealth?.meetings || 0;
    const closedCount = data?.pipelineHealth?.closed || 0;
    const closingRate = leadsCount > 0 ? ((closedCount / leadsCount) * 100).toFixed(1) : 0;
    
    let pipelineInsight = `Current closing rate is ${closingRate}%. `;
    if (meetingsCount === 0 && leadsCount > 0) {
        pipelineInsight += "Focus on converting Leads into Meetings.";
    } else if (meetingsCount > 0 && closedCount === 0) {
        pipelineInsight += "Focus on closing your active Meetings.";
    } else {
        pipelineInsight += "Keep maintaining your 'Meeting' stage follow-ups.";
    }

    const handleActivityClick = (clientName) => {
        if (!clientName) return;
        setSelectedClientName(clientName);
        setIsDetailsModalOpen(true);
    };

    return (
    <>
    <main className="p-8 relative z-20 space-y-12">
    {/*  Welcome Header  */}
    <div className="mb-10 flex justify-between items-end">
    <div>
    <h2 className="font-headline-lg text-headline-lg text-on-surface">Team Performance Dashboard</h2>
    <p className="font-body-md text-slate-500 mt-1">Real-time intelligence for the current sales cycle.</p>
    </div>
    <div className="flex gap-3">
    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-white/60 shadow-sm text-label-md text-slate-600">
    <span className="material-symbols-outlined text-[20px]" data-icon="calendar_today">calendar_today</span>
                        Today: {today}
                    </button>
    <button onClick={() => setIsTargetModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg border border-transparent shadow-sm text-label-md hover:bg-blue-700 transition-colors">
    <span className="material-symbols-outlined text-[20px]" data-icon="target">my_location</span>
                        Set Targets
                    </button>
    </div>
    </div>
    {/*  Aggregated Metrics Grid  */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    {/*  Metric Card 1 - Connections  */}
    <div className="glass-card p-6 rounded-2xl shadow-xl shadow-blue-500/5">
    <div className="flex justify-between items-start mb-4">
    <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center">
    <span className="material-symbols-outlined" data-icon="hub">hub</span>
    </div>
    </div>
    <h3 className="text-slate-500 font-label-md mb-1">Connections Today</h3>
    <div className="flex items-baseline gap-2">
    <span className="font-stat-lg text-stat-lg text-on-surface">{data?.connectionsToday || 0}</span>
    <span className="text-sm font-bold text-slate-400">/ {data?.teamConnectionTarget || 0}</span>
    </div>
    <div className="mt-4 flex gap-1 items-end h-8 relative group">
    <div className="flex-1 bg-tertiary-fixed rounded-t-sm h-[40%]"></div>
    <div className="flex-1 bg-tertiary-fixed rounded-t-sm h-[60%]"></div>
    <div className="flex-1 bg-tertiary-fixed rounded-t-sm h-[45%]"></div>
    <div className="flex-1 bg-tertiary-fixed rounded-t-sm h-[80%]"></div>
    <div className="flex-1 bg-tertiary-fixed rounded-t-sm h-[95%]"></div>
    <div className="flex-1 bg-tertiary-fixed rounded-t-sm transition-all" style={{height: `${Math.min((data?.connectionsToday || 0) / (data?.teamConnectionTarget || 1) * 100, 100)}%`}}></div>
    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 font-bold transition-opacity">Target: {data?.teamConnectionTarget || 0}</div>
    </div>
    </div>
    {/*  Metric Card 2 - Conversations  */}
    <div className="glass-card p-6 rounded-2xl shadow-xl shadow-blue-500/5">
    <div className="flex justify-between items-start mb-4">
    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
    <span className="material-symbols-outlined" data-icon="forum">forum</span>
    </div>
    </div>
    <h3 className="text-slate-500 font-label-md mb-1">Conversations Today</h3>
    <div className="flex items-baseline gap-2">
    <span className="font-stat-lg text-stat-lg text-on-surface">{data?.talksToday || 0}</span>
    <span className="text-sm font-bold text-slate-400">/ {data?.teamConversationTarget || 0}</span>
    </div>
    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative group">
    <div className="h-full bg-blue-500 rounded-full transition-all" style={{"width": Math.min((data?.talksToday || 0) / (data?.teamConversationTarget || 1) * 100, 100) + "%"}}></div>
    <div className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 font-bold transition-opacity">Target: {data?.teamConversationTarget || 0}</div>
    </div>
    </div>
    {/*  Metric Card 3 - Closures  */}
    <div className="glass-card p-6 rounded-2xl shadow-xl shadow-blue-500/5">
    <div className="flex justify-between items-start mb-4">
    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
    <span className="material-symbols-outlined" data-icon="task_alt">task_alt</span>
    </div>
    </div>
    <h3 className="text-slate-500 font-label-md mb-1">Closures Today</h3>
    <div className="flex items-baseline gap-2">
    <span className="font-stat-lg text-stat-lg text-on-surface">{data?.closuresToday || 0}</span>
    <span className="text-sm font-bold text-slate-400">/ {data?.teamClosureTarget || 0}</span>
    </div>
    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative group">
    <div className="h-full bg-orange-500 rounded-full transition-all" style={{"width": `${Math.min((data?.closuresToday || 0) / (data?.teamClosureTarget || 1) * 100, 100)}%`}}></div>
    <div className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 font-bold transition-opacity">Target: {data?.teamClosureTarget || 0}</div>
    </div>
    </div>
    {/*  Metric Card 4  */}
    <div className="glass-card p-6 rounded-2xl shadow-xl shadow-blue-500/5">
    <div className="flex justify-between items-start mb-4">
    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
    <span className="material-symbols-outlined" data-icon="payments">payments</span>
    </div>
    </div>
    <h3 className="text-slate-500 font-label-md mb-1">Premium Revenue</h3>
    <div className="flex items-baseline gap-2">
    <span className="font-stat-lg text-stat-lg text-on-surface">₹{(data?.totalPremium || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
    </div>
    <p className="mt-4 text-[12px] font-bold text-blue-600 flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
                        Total accumulated revenue
                    </p>
    </div>
    </div>
    {/*  Main Insights Section (Bento Style)  */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/*  Team Performance Overview (Large)  */}
    <div className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-xl shadow-blue-500/5">
    <div className="flex justify-between items-center mb-8">
    <div>
    <h3 className="font-headline-md text-headline-md text-on-surface">Revenue Progress</h3>
    <p className="text-slate-500 font-label-md">Monthly goal vs Current progress</p>
    </div>
    <div className="flex gap-2">
    <button onClick={() => setChartView('revenue')} className={`px-3 py-1.5 rounded-lg text-[12px] font-bold ${chartView === 'revenue' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>Revenue</button>
    <button onClick={() => setChartView('volume')} className={`px-3 py-1.5 rounded-lg text-[12px] font-bold ${chartView === 'volume' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>Volume</button>
    </div>
    </div>
    <div className="relative h-64 w-full flex items-end gap-4 px-4">
    {/*  Chart Simulation  */}
    {chartData.map((amount, idx) => {
        const effectiveTarget = amount === 0 ? 0 : displayTarget;
        const targetBarHeight = `${(effectiveTarget / maxChartVal) * 100}%`;
        const achievedBarHeight = `${(amount / maxChartVal) * 100}%`;

        return (
            <div key={idx} className="flex-1 relative group transition-all duration-500 h-full flex items-end">
                {/* Grey Bar (Target) */}
                <div className="absolute bottom-0 w-full bg-slate-200/60 rounded-t-xl transition-all duration-500" style={{ height: targetBarHeight }}></div>
                
                {/* Blue Bar (Achieved) */}
                <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-xl transition-all duration-500 opacity-90 group-hover:opacity-100 shadow-sm" style={{ height: achievedBarHeight }}></div>
                
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-slate-400 font-label-sm">{last7Days[idx].dayName}</span>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] py-1.5 px-2.5 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg flex flex-col gap-0.5 items-center">
                    <span className="font-bold text-slate-300">Target: {chartView === 'revenue' ? `₹${effectiveTarget.toLocaleString()}` : effectiveTarget}</span>
                    <span className="font-bold text-white">Achieved: {chartView === 'revenue' ? `₹${amount.toLocaleString()}` : amount}</span>
                </div>
            </div>
        );
    })}
    </div>
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
    <div>
    <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mb-1">Target</p>
    <p className="font-headline-md text-headline-md">{chartView === 'revenue' ? '₹' : ''}{(displayTarget).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
    </div>
    <div>
    <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mb-1">Achieved</p>
    <p className="font-headline-md text-headline-md text-blue-600">{chartView === 'revenue' ? '₹' : ''}{(displayAchieved).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
    </div>
    <div>
    <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mb-1">Gap</p>
    <p className="font-headline-md text-headline-md text-orange-600">{chartView === 'revenue' ? '₹' : ''}{(displayGap).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
    </div>
    </div>
    </div>
    {/*  Recent Team Activity (Feed)  */}
    <div className="glass-card rounded-3xl p-8 shadow-xl shadow-blue-500/5 flex flex-col max-h-[600px]">
    <div className="flex justify-between items-center mb-8 shrink-0">
    <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
    <button onClick={() => setShowAllActivities(!showAllActivities)} className="text-blue-600 font-label-md hover:underline">
        {showAllActivities ? 'Show Less' : 'View All'}
    </button>
    </div>
    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
    {data?.recentActivities?.length > 0 ? (showAllActivities ? data.recentActivities : data.recentActivities.slice(0, 6)).map((activity, idx) => (
    <div 
        key={idx} 
        onClick={() => handleActivityClick(activity.clientName)}
        className="flex gap-4 group p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
    >
    <div className="relative">
    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
    {activity.profilePhotoUrl ? (
        <img src={`${API_BASE_URL}${activity.profilePhotoUrl}`} alt={activity.username} className="w-full h-full object-cover" />
    ) : (
        activity.username.charAt(0).toUpperCase()
    )}
    </div>
    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${activity.stage === 'CLOSURE' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
    </div>
    <div className="flex-1">
    <p className="text-sm font-medium text-on-surface">
    <span className="font-bold">{activity.username}</span> {activity.stage === 'CLOSURE' ? 'closed a deal with' : activity.stage === 'CONNECTION' ? 'connected with' : 'had a conversation with'} <span className="font-bold">{activity.clientName || 'Client'}</span>
    </p>
    <div className="flex items-center gap-2 mt-1">
    <span className="text-[11px] text-slate-400">{activity.timeAgo}</span>
    {activity.premiumAmount && (
        <>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className="text-[11px] font-bold text-blue-600">₹{activity.premiumAmount.toLocaleString()}</span>
        </>
    )}
    </div>
    </div>
    </div>
    )) : <div className="text-slate-400 text-sm">No recent activities found.</div>}
    </div>
    <div className="mt-6 pt-6 border-t border-slate-100 shrink-0">
    <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center justify-between">
    <div>
    <p className="text-[12px] font-bold text-blue-600">Live Team Status</p>
    <p className="text-[11px] text-slate-500">{data?.totalTeamMembers || 0} members active now</p>
    </div>
    <div className="flex -space-x-2">
    {data?.activeMemberPhotos?.slice(0, 3).map((photo, i) => (
       <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
           {photo ? <img src={photo} alt="Member" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300"></div>}
       </div>
    ))}
    {(data?.totalTeamMembers || 0) > 3 && (
       <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
          +{(data?.totalTeamMembers || 0) - (data?.activeMemberPhotos?.length > 3 ? 3 : data?.activeMemberPhotos?.length || 0)}
       </div>
    )}
    </div>
    </div>
    </div>
    </div>
    </div>
    {/*  Secondary Performance Grid  */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
    {/*  Top Performers Card  */}
    <div className="glass-card p-6 rounded-3xl shadow-xl shadow-blue-500/5">
    <h3 className="font-label-md text-slate-900 mb-6 flex items-center justify-between">
                        Top Performers
                        <span className="material-symbols-outlined text-slate-400" data-icon="star">star</span>
    </h3>
    <div className="space-y-5">
    {data?.topPerformers?.length > 0 ? data.topPerformers.map((performer, idx) => (
    <div key={idx} className="flex items-center justify-between">
    <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-emerald-100 text-emerald-700' : idx === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>0{idx + 1}</div>
    <span className="font-label-md text-on-surface">{performer.username}</span>
    </div>
    <span className="font-bold text-blue-600">₹{(performer.totalPremium || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
    </div>
    )) : <div className="text-slate-400 text-sm">No performers yet</div>}
    </div>
    </div>
    {/*  Connection Health  */}
    <div className="glass-card p-6 rounded-3xl shadow-xl shadow-blue-500/5 col-span-1 lg:col-span-2">
    <div className="flex justify-between items-center mb-6">
    <h3 className="font-label-md text-slate-900">Conversion Pipeline Health</h3>
    <div className="flex items-center gap-4">
    <div className="flex items-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
    <span className="text-[11px] font-bold text-slate-500">Inbound</span>
    </div>
    <div className="flex items-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
    <span className="text-[11px] font-bold text-slate-500">Outreach</span>
    </div>
    </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="space-y-2">
    <p className="text-[11px] font-bold text-slate-400 uppercase">Lead</p>
    <div className="h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600">{data?.pipelineHealth?.leads || 0}</div>
    </div>
    <div className="space-y-2">
    <p className="text-[11px] font-bold text-slate-400 uppercase">Meeting</p>
    <div className="h-12 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">{data?.pipelineHealth?.meetings || 0}</div>
    </div>
    <div className="space-y-2">
    <p className="text-[11px] font-bold text-slate-400 uppercase">Closed</p>
    <div className="h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">{data?.pipelineHealth?.closed || 0}</div>
    </div>
    </div>
    <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500">
    <span className="material-symbols-outlined text-[16px] text-emerald-500" data-icon="info">info</span>
                        {pipelineInsight}
                    </div>
    </div>
    </div>
    </main>

    <SetTargetsModal 
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        initialTargets={targets}
        onSave={setTargets}
    />
    
    <ActivityDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        clientName={selectedClientName}
    />
    </>
  );
};

export default Overview;
