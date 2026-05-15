import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import api from '../api';

const ClientProfileModal = ({ isOpen, onClose, clientName }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && clientName) {
            setLoading(true);
            api.get(`/activities/client/${encodeURIComponent(clientName)}`)
                .then(res => setActivities(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, clientName]);

    if (!isOpen) return null;

    // We assume the API returns activities in chronological order.
    // So popping gets the latest activity for a given stage.
    const connection = [...activities].filter(a => a.stage === 'CONNECTION').pop();
    const conversation = [...activities].filter(a => a.stage === 'CONVERSATION').pop();
    const closure = [...activities].filter(a => a.stage === 'CLOSURE').pop();

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold border-2 border-white/30 shadow-inner">
                                {clientName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white leading-tight">{clientName}</h2>
                                <p className="text-blue-100 text-sm font-medium">Unified Client Profile</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-blue-600 gap-4">
                            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                            <span className="font-bold tracking-widest uppercase text-xs">Loading Client Profile</span>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No data found for this client.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            
                            {/* Section: Connection Details */}
                            {connection && (
                                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">hub</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">Connection Profile</h3>
                                        <span className="ml-auto text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                            {new Date(connection.activityDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <DetailItem label="Product Pitched" value={connection.productPitched} />
                                        <DetailItem label="Mode of Connection" value={connection.modeOfConnection} />
                                        
                                        {/* Custom Needs Identified Rendering */}
                                        {connection.needsIdentifiedList && (
                                            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Need of Identification</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {connection.needsIdentifiedList.startsWith('[') ? (
                                                        <>
                                                            <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                                {connection.needsIdentifiedList.substring(1, connection.needsIdentifiedList.indexOf(']'))}
                                                            </span>
                                                            <span className="text-base font-medium text-slate-900 bg-white">
                                                                {connection.needsIdentifiedList.substring(connection.needsIdentifiedList.indexOf(']') + 1).trim()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-base font-medium text-slate-900 bg-white">{connection.needsIdentifiedList}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <DetailItem label="Specific Need" value={connection.needIdentified} fullWidth />
                                        <DetailItem label="Expected Closure" value={connection.expectedClosureDate} />
                                        <DetailItem label="Personal Profile" value={connection.personalDetails} fullWidth isObjectJson />
                                        <DetailItem label="Family Details" value={connection.familyDetails} fullWidth isObjectJson />
                                        <DetailItem label="Requirement Details" value={connection.requirementDetails} fullWidth />

                                        {/* Custom Personal Interests Rendering */}
                                        {connection.personalInterests && (
                                            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Interests</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {connection.personalInterests.split(',').map((interest, i) => interest.trim() && (
                                                        <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                            {interest.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Notes mapping for Connection */}
                                        {connection.remarks && (
                                            <DetailItem label="Notes" value={connection.remarks} fullWidth />
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Section: Conversation Details */}
                            {conversation && (
                                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">forum</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">Product & Pitch Details</h3>
                                        <span className="ml-auto text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                            {new Date(conversation.activityDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <DetailItem label="Contact Number" value={conversation.contactNumber} />
                                        <DetailItem label="Mode of Meeting" value={conversation.modeOfConnection} />
                                        <DetailItem label="Product Term" value={conversation.productTerm} />
                                        <DetailItem label="Salary %" value={conversation.salaryPercentage ? `${conversation.salaryPercentage}%` : ''} />
                                        <DetailItem label="Remarks" value={conversation.remarks} fullWidth />
                                        {conversation.meetingsData && (
                                            <DetailItem label="Meeting Flow" value={conversation.meetingsData} fullWidth isJson />
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Section: Closure Details */}
                            {closure && (
                                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">Closure Status</h3>
                                        <span className="ml-auto text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                            {new Date(closure.activityDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <DetailItem label="Final Product" value={closure.productName} />
                                        <DetailItem label="Premium Amount" value={closure.premiumAmount ? `₹${closure.premiumAmount.toLocaleString()}` : ''} />
                                        <DetailItem label="Final Status" value={closure.status} />
                                        <DetailItem label="Closure Date" value={closure.closureDate} />
                                    </div>
                                </section>
                            )}

                        </div>
                    )}
                </div>
            </div>
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
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {entries.map(([k, v]) => {
                            const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                                <div key={k} className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex flex-col gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                    <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-widest">{formattedKey}</span>
                                    <span className="text-sm font-bold text-slate-800 truncate">{v}</span>
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
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-base font-medium text-slate-900 bg-white">{displayValue}</span>
        </div>
    );
};

export default ClientProfileModal;
