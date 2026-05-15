import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const SetTargetsModal = ({ isOpen, onClose, onSave, initialTargets }) => {
  const [formData, setFormData] = useState(initialTargets || {
    revenueTarget: 100000,
    dealsClosedTarget: 20,
    connectionsTarget: 50,
    talksTarget: 100
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full transition-colors z-10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">my_location</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Set Team Targets</h2>
              <p className="text-slate-500 text-body-md mt-1">Configure goals for the dashboard.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Revenue Target (₹)</label>
              <input 
                type="number"
                name="revenueTarget"
                value={formData.revenueTarget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none font-bold text-on-surface"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Deals Closed Target</label>
              <input 
                type="number"
                name="dealsClosedTarget"
                value={formData.dealsClosedTarget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none font-bold text-on-surface"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Connections Target</label>
              <input 
                type="number"
                name="connectionsTarget"
                value={formData.connectionsTarget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none font-bold text-on-surface"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Conversations Target</label>
              <input 
                type="number"
                name="talksTarget"
                value={formData.talksTarget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none font-bold text-on-surface"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
              >
                Save Targets
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SetTargetsModal;
