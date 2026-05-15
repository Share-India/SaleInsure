import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const UserDetailsModal = ({ isOpen, onClose, user, onPasswordChange }) => {
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await onPasswordChange(user.userId, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setNewPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update password' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '₹0';
        if (value >= 1000000) return '₹' + (value / 1000000).toFixed(2) + 'M';
        if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'k';
        return '₹' + value.toLocaleString();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden animate-slide-up">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[120px]" style={{fontVariationSettings: "'FILL' 1"}}>account_circle</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>

                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold">{user.username?.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{user.username}</h2>
                            <p className="text-blue-100 font-label-md">{user.title || 'Sales Executive'}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-8 pb-4">
                    <h3 className="font-label-caps text-slate-400 mb-4 tracking-widest text-xs">Performance Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Target</p>
                            <p className="text-xl font-bold text-slate-800">{formatCurrency(user.quota)}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100/50">
                            <p className="text-blue-500 text-xs font-bold uppercase tracking-wide mb-1">Achieved</p>
                            <p className="text-xl font-bold text-blue-700">{formatCurrency(user.totalPremium)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Deals</p>
                            <p className="text-xl font-bold text-slate-800">{user.dealsClosed || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Progress</p>
                            <p className="text-xl font-bold text-slate-800">{user.quota ? Math.round((user.totalPremium / user.quota) * 100) : 0}%</p>
                        </div>
                    </div>

                    <h3 className="font-label-caps text-slate-400 mt-6 mb-4 tracking-widest text-xs">Daily Activity Status</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-1">Connections</p>
                            <p className="text-lg font-bold text-slate-800">
                                {user.dailyConnections || 0}
                                <span className="text-slate-400 text-sm font-medium">/{user.dailyConnectionTarget || 10}</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-1">Conversations</p>
                            <p className="text-lg font-bold text-slate-800">
                                {user.dailyConversations || 0}
                                <span className="text-slate-400 text-sm font-medium">/{user.dailyConversationTarget || 5}</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-1">Closures</p>
                            <p className="text-lg font-bold text-slate-800">
                                {user.dailyClosures || 0}
                                <span className="text-slate-400 text-sm font-medium">/{user.dailyClosureTarget || 1}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Password Reset Section */}
                <div className="p-8 pt-4">
                    <h3 className="font-label-caps text-slate-400 mb-4 tracking-widest text-xs">Administrative Action</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Change Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">lock_reset</span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                <span className="material-symbols-outlined text-[16px]">
                                    {message.type === 'error' ? 'error' : 'check_circle'}
                                </span>
                                {message.text}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-label-md hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !newPassword}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-label-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {isSubmitting ? (
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Save Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UserDetailsModal;
