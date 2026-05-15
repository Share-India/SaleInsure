const fs = require('fs');

let code = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/ManagerDashboard.jsx', 'utf-8');

// 1. Add imports
code = code.replace(
    "import api from '../api';",
    "import api from '../api';\nimport Overview from './Overview';\nimport TeamPerformance from './TeamPerformance';\nimport DealPipeline from './DealPipeline';\nimport ActivityFeed from './ActivityFeed';"
);

// 2. Add state
code = code.replace(
    "const [loading, setLoading] = useState(true);",
    "const [loading, setLoading] = useState(true);\n  const [activeView, setActiveView] = useState('overview');"
);

// 3. Update nav
const oldNav = `<nav className="flex-1 flex flex-col gap-1">
<a className="flex items-center gap-3 bg-blue-600 text-white rounded-lg px-4 py-3 shadow-[0_10px_20px_rgba(37,99,235,0.3)]" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-label-md text-label-md">Overview</span>
</a>
<a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:translate-x-1 transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span className="font-label-md text-label-md">Team Performance</span>
</a>
<a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:translate-x-1 transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
<span className="font-label-md text-label-md">Revenue Analytics</span>
</a>
<a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:translate-x-1 transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
<span className="font-label-md text-label-md">Deal Pipeline</span>
</a>
<a className="flex items-center gap-3 text-slate-600 px-4 py-3 hover:translate-x-1 transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span className="font-label-md text-label-md">Activity Feed</span>
</a>
</nav>`;

const newNav = `<nav className="flex-1 flex flex-col gap-1">
<a onClick={(e) => { e.preventDefault(); setActiveView('overview'); }} className={\`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 \${activeView === 'overview' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}\`} href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-label-md text-label-md">Overview</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveView('team_performance'); }} className={\`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 \${activeView === 'team_performance' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}\`} href="#">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span className="font-label-md text-label-md">Team Performance</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveView('revenue_analytics'); }} className={\`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 \${activeView === 'revenue_analytics' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}\`} href="#">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
<span className="font-label-md text-label-md">Revenue Analytics</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveView('deal_pipeline'); }} className={\`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 \${activeView === 'deal_pipeline' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}\`} href="#">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
<span className="font-label-md text-label-md">Deal Pipeline</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveView('activity_feed'); }} className={\`flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 \${activeView === 'activity_feed' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-slate-600 hover:translate-x-1'}\`} href="#">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span className="font-label-md text-label-md">Activity Feed</span>
</a>
</nav>`;

code = code.replace(oldNav, newNav);

// 4. Replace main content
const startIdx = code.indexOf('{/*  Main Content Area  */}');
const endIdx = code.lastIndexOf('</div>\n\n    </div>');

if (startIdx !== -1 && endIdx !== -1) {
    const newMain = `{/*  Main Content Area  */}
<div className="ml-64 pt-16 min-h-screen relative z-20">
    {activeView === 'overview' && <Overview data={data} />}
    {activeView === 'team_performance' && <TeamPerformance data={data} />}
    {activeView === 'deal_pipeline' && <DealPipeline data={data} />}
    {activeView === 'activity_feed' && <ActivityFeed data={data} />}
</div>\n`;
    code = code.substring(0, startIdx) + newMain + code.substring(endIdx);
} else {
    console.log("Could not find start/end for main content replacement.");
}

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/ManagerDashboard.jsx', code);
console.log('Updated ManagerDashboard.jsx');
