import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import api from '../api';
import LogActivityModal from './LogActivityModal';

const ActivityDetailsModal = ({ isOpen, onClose, clientName }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);

    const fetchActivities = () => {
        setLoading(true);
        api.get(`/activities/client/${encodeURIComponent(clientName)}`)
            .then(res => setActivities(res.data))
            .catch(err => console.error("Failed to fetch client activities", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (isOpen && clientName) {
            fetchActivities();
        }
    }, [isOpen, clientName]);

    const handleEditSubmit = async (stage, formData, id) => {
        try {
            const payload = { ...formData, stage };
            if (formData.premiumAmount) payload.premiumAmount = parseFloat(formData.premiumAmount);
            if (formData.salaryPercentage) payload.salaryPercentage = parseFloat(formData.salaryPercentage);
            
            await api.put(`/activities/${id}`, payload);
            setEditingActivity(null);
            fetchActivities(); // Refresh after update
        } catch (err) {
            console.error("Failed to update activity", err);
            alert("Error updating activity: " + (err.response?.data?.message || err.message));
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex justify-between items-start sm:items-center shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 break-words max-w-[200px] sm:max-w-full">Deal History: {clientName}</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Full chronological timeline</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 shrink-0">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-blue-600">
                            Loading details...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No activities found for this client.
                        </div>
                    ) : (
                        <div className="relative ml-4 space-y-10 pb-4 pt-2">
                            {activities.map((act, index) => {
                                const isLast = index === activities.length - 1;
                                const dateObj = new Date(act.activityDate);
                                const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                
                                let icon = 'forum';
                                let iconBg = 'bg-slate-100';
                                let iconColor = 'text-slate-600';
                                
                                if (act.stage === 'CONNECTION') {
                                    icon = 'hub';
                                    iconBg = 'bg-orange-100';
                                    iconColor = 'text-orange-600';
                                } else if (act.stage === 'CLOSURE') {
                                    icon = 'handshake';
                                    iconBg = 'bg-emerald-100';
                                    iconColor = 'text-emerald-600';
                                } else {
                                    iconBg = 'bg-blue-100';
                                    iconColor = 'text-blue-600';
                                }

                                return (
                                    <div key={act.id} className="relative pl-10">
                                        {/* Timeline Line */}
                                        {!isLast && (
                                            <div className="absolute top-10 bottom-[-40px] left-[-1px] w-[2px] bg-slate-200"></div>
                                        )}

                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[21px] top-6 w-10 h-10 rounded-full border-4 border-white ${iconBg} ${iconColor} flex items-center justify-center shadow-sm z-10`}>
                                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                                                <div>
                                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase mb-2 ${iconBg} ${iconColor}`}>
                                                        {act.stage}
                                                    </span>
                                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-1 sm:gap-2">
                                                        {act.user?.username || 'Salesperson'} 
                                                        <span className="text-slate-400 font-normal text-xs sm:text-sm">logged on {dateString}</span>
                                                    </h3>
                                                </div>
                                                <div className="w-full sm:w-auto flex justify-end items-center gap-2">
                                                    <button onClick={() => setEditingActivity(act)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Activity">
                                                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                                                    </button>
                                                    <div className="text-xs sm:text-sm font-medium text-slate-700 bg-white px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1 sm:gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                                        {act.createdAt 
                                                            ? new Date(act.createdAt + (act.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) 
                                                            : (act.timeSlot && act.timeSlot !== 'Anytime' ? act.timeSlot : 'Anytime')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Fields based on Stage */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                {act.stage === 'CONNECTION' && (
                                                    <>
                                                        <DetailItem label="Product Pitched" value={act.productPitched} />
                                                        <DetailItem label="Mode of Connection" value={act.modeOfConnection} />
                                                        
                                                        {/* Custom Needs Identified Rendering */}
                                                        {act.needsIdentifiedList && (
                                                            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Need of Identification</span>
                                                                <div className="flex items-center gap-2">
                                                                    {act.needsIdentifiedList.startsWith('[') ? (
                                                                        <>
                                                                            <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                                                {act.needsIdentifiedList.substring(1, act.needsIdentifiedList.indexOf(']'))}
                                                                            </span>
                                                                            <span className="text-sm font-medium text-slate-700">
                                                                                {act.needsIdentifiedList.substring(act.needsIdentifiedList.indexOf(']') + 1).trim()}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-sm font-medium text-slate-700">{act.needsIdentifiedList}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <DetailItem label="Specific Need" value={act.needIdentified} />
                                                        <DetailItem label="Expected Closure" value={act.expectedClosureDate} fullWidth />
                                                        <DetailItem label="Personal Profile" value={act.personalDetails} fullWidth isObjectJson />
                                                        <DetailItem label="Family Details" value={act.familyDetails} fullWidth isObjectJson />
                                                        <DetailItem label="Requirement Details" value={act.requirementDetails} fullWidth />

                                                        {/* Custom Personal Interests Rendering */}
                                                        {act.personalInterests && (
                                                            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Personal Interests</span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {act.personalInterests.split(',').map((interest, i) => interest.trim() && (
                                                                        <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                                            {interest.trim()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Notes mapping for Connection */}
                                                        {act.remarks && (
                                                            <DetailItem label="Notes" value={act.remarks} fullWidth />
                                                        )}
                                                    </>
                                                )}

                                                {act.stage === 'CONVERSATION' && (
                                                    <>
                                                        <DetailItem label="Contact Number" value={act.contactNumber} />
                                                        <DetailItem label="Mode of Meeting" value={act.modeOfConnection} />
                                                        <DetailItem label="Product Term" value={act.productTerm} />
                                                        <DetailItem label="Salary %" value={act.salaryPercentage ? `${act.salaryPercentage}%` : ''} />
                                                        <DetailItem label="Remarks" value={act.remarks} fullWidth />
                                                        {act.meetingsData && (
                                                            <DetailItem label="Meeting Flow" value={act.meetingsData} fullWidth isJson />
                                                        )}
                                                    </>
                                                )}

                                                {act.stage === 'CLOSURE' && (
                                                    <>
                                                        <DetailItem label="Product Name" value={act.productName} />
                                                        <DetailItem label="Premium Amount" value={act.premiumAmount ? `₹${act.premiumAmount.toLocaleString()}` : ''} />
                                                        <DetailItem label="Status" value={act.status} />
                                                        <DetailItem label="Closure Date" value={act.closureDate} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {editingActivity && (
                <div className="fixed inset-0 z-[10000]">
                    <LogActivityModal 
                        isOpen={!!editingActivity}
                        stage={editingActivity.stage}
                        initialData={editingActivity}
                        onClose={() => setEditingActivity(null)}
                        onSubmit={handleEditSubmit}
                        allDeals={[]}
                    />
                </div>
            )}
        </div>,
        document.body
    );
};

const DetailItem = ({ label, value, fullWidth, isJson, isObjectJson }) => {
    if (!value) return null;

    if (isObjectJson) {
        try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            const entries = Object.entries(parsed).filter(([_, v]) => v);
            if (entries.length === 0) return null;

            return (
                <div className={`flex flex-col gap-2 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    <div className="flex flex-wrap gap-3">
                        {entries.map(([k, v]) => {
                            const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                                <div key={k} className="bg-white border border-slate-100 px-3 py-2 rounded-lg flex flex-col gap-0.5 min-w-[120px] flex-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{formattedKey}</span>
                                    <span className="text-sm font-medium text-slate-800 truncate">{v}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } catch (e) {
            // fallback if parsing fails
        }
    }

    let displayValue = value;
    if (isJson) {
        try {
            const parsed = JSON.parse(value);
            displayValue = parsed.map(m => m.type || 'Meeting').join(' → ');
        } catch (e) {
            // keep as is
        }
    }

    return (
        <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{displayValue}</span>
        </div>
    );
};

export default ActivityDetailsModal;
