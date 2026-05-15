const fs = require('fs');

const code = `import React from 'react';

const formatCurrency = (value) => {
    if (!value) return '$0';
    return '$' + value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
};

const ActivityFeed = ({ data }) => {
  const recentActivities = data?.recentActivities || [];

  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-8 min-h-screen">
        <header className="mb-10 border-b border-outline-variant pb-10">
          <h1 className="font-h1 text-h2 text-on-background mb-2">Activity Feed</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Real-time chronological log of all team interactions, providing an immutable record of sales excellence.
          </p>
        </header>

        <div className="relative">
          {recentActivities.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No recent activities found.</div>
          ) : (
            recentActivities.map((activity, index) => {
              const initials = activity.username ? activity.username.substring(0, 2).toUpperCase() : 'NA';
              const isLast = index === recentActivities.length - 1;
              const dateObj = new Date(activity.activityDate);
              const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
              
              let icon = 'forum';
              let iconColor = 'bg-surface-container-highest text-on-surface';
              let actionText = '';
              
              if (activity.stage === 'CLOSURE') {
                icon = 'handshake';
                iconColor = 'bg-blue-600 text-white';
                actionText = <><span className="font-bold text-primary">{activity.username}</span> closed a deal with <span className="font-bold text-primary">{activity.clientName || 'Unknown Client'}</span>.</>;
              } else if (activity.stage === 'CONNECTION') {
                icon = 'hub';
                iconColor = 'bg-orange-500 text-white';
                actionText = <><span className="font-bold text-primary">{activity.username}</span> established a new lead connection with <span className="font-bold text-primary">{activity.clientName || 'Unknown Client'}</span>.</>;
              } else {
                icon = 'forum';
                iconColor = 'bg-slate-200 text-slate-700';
                actionText = <><span className="font-bold text-primary">{activity.username}</span> logged a strategy call with <span className="font-bold text-primary">{activity.clientName || 'Unknown Client'}</span>.</>;
              }

              return (
                <div key={activity.id} className="timeline-item relative flex gap-6 pb-10 group">
                  {!isLast && <div className="absolute top-10 bottom-0 left-5 w-[2px] bg-slate-200 group-hover:bg-blue-200 transition-colors"></div>}
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-slate-600">{initials}</span>
                    </div>
                    <div className={\`mt-2 \${iconColor} p-1.5 rounded-sm flex items-center justify-center\`}>
                      <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:"'FILL' 1"}}>{icon}</span>
                    </div>
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-label-caps text-label-caps text-slate-500 uppercase">{activity.stage}</span>
                      <time className="font-data-tabular text-data-tabular text-slate-400">{dateString} • {activity.timeAgo}</time>
                    </div>
                    <div className="bg-white border border-outline-variant p-5 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                      <p className="font-body-md text-on-surface mb-3">
                        {actionText}
                      </p>
                      
                      {activity.stage === 'CLOSURE' && (
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-200">
                            <span className="font-label-caps text-[10px] text-slate-500 block">DEAL VALUE</span>
                            <span className="font-data-tabular text-slate-900">{formatCurrency(activity.premiumAmount)}</span>
                          </div>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-200">
                            <span className="font-label-caps text-[10px] text-slate-500 block">PRODUCT</span>
                            <span className="font-data-tabular text-slate-900">{activity.productName || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                      
                      {activity.stage === 'CONNECTION' && (
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-200">
                            <span className="font-label-caps text-[10px] text-slate-500 block">STATUS</span>
                            <span className="font-data-tabular text-slate-900">{activity.status || 'Active'}</span>
                          </div>
                        </div>
                      )}

                      {activity.stage === 'CONVERSATION' && (
                         <div className="flex flex-wrap gap-3">
                         <div className="bg-blue-50/50 px-3 py-1.5 rounded-sm border border-blue-100">
                           <span className="font-label-caps text-[10px] text-blue-800 block">PRODUCT PITCHED</span>
                           <span className="font-data-tabular text-blue-900">{activity.productName || 'N/A'}</span>
                         </div>
                       </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityFeed;`;

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/ActivityFeed.jsx', code);
console.log('Updated ActivityFeed.jsx');
