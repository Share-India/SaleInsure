const fs = require('fs');
let code = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/ManagerDashboard.jsx', 'utf-8');
const startIdx = code.indexOf('<main className="ml-64');
const endIdx = code.lastIndexOf('</main>') + 7;

if (startIdx !== -1 && endIdx !== -1) {
    const newMain = `{/*  Main Content Area  */}\n<div className="ml-64 pt-16 min-h-screen relative z-20">\n    {activeView === 'overview' && <Overview data={data} />}\n    {activeView === 'team_performance' && <TeamPerformance data={data} />}\n    {activeView === 'deal_pipeline' && <DealPipeline data={data} />}\n    {activeView === 'activity_feed' && <ActivityFeed data={data} />}\n</div>`;
    code = code.substring(0, startIdx) + newMain + code.substring(endIdx);
    fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/Sale-App/frontend/src/pages/ManagerDashboard.jsx', code);
    console.log('Successfully replaced main content');
} else {
    console.log('Could not find main content');
}
