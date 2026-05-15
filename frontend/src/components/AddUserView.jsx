import React, { useState, useRef } from 'react';
import api from '../api';

const AddUserView = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'SALESPERSON',
    designation: '',
    monthlyTarget: '',
    dailyConnectionTarget: '10',
    dailyConversationTarget: '5',
    dailyClosureTarget: '1'
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const submitData = new FormData();
    submitData.append('username', formData.username);
    submitData.append('password', formData.password);
    submitData.append('role', formData.role);
    submitData.append('designation', formData.designation);
    submitData.append('monthlyTarget', formData.monthlyTarget);
    submitData.append('dailyConnectionTarget', formData.dailyConnectionTarget);
    submitData.append('dailyConversationTarget', formData.dailyConversationTarget);
    submitData.append('dailyClosureTarget', formData.dailyClosureTarget);
    if (file) {
      submitData.append('file', file);
    }

    try {
      // Must use multipart/form-data. Our api interceptor sets application/json by default if we pass an object, 
      // but if we pass FormData, axios automatically sets multipart/form-data.
      await api.post('/users', submitData);
      
      setMsg({ type: 'success', text: 'Team member added successfully!' });
      setFormData({ username: '', password: '', role: 'SALESPERSON', designation: '', monthlyTarget: '', dailyConnectionTarget: '10', dailyConversationTarget: '5', dailyClosureTarget: '1' });
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Add Team Member</h2>
          <p className="text-slate-500 mt-2 text-body-lg">Create a new profile and assign their monthly target.</p>
        </div>
      </div>

      <div className="glass-card ambient-shadow rounded-3xl overflow-hidden p-8">
        {msg && (
          <div className={`p-4 rounded-xl mb-6 ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Photo Upload */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg border-2 border-white"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md mb-1">Profile Photo</h3>
              <p className="text-sm text-slate-500 mb-3">Upload a high-quality professional headshot.</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Choose file...
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Username *</label>
              <input 
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                placeholder="e.g. jdoe_sales"
              />
            </div>
            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Password *</label>
              <input 
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Role *</label>
              <select 
                required
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
              >
                <option value="SALESPERSON">Salesperson</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Designation</label>
              <input 
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                placeholder="e.g. Account Executive"
              />
            </div>
          </div>

          {/* Targets Section */}
          {formData.role === 'SALESPERSON' && (
            <div className="pt-6 mt-2 border-t border-slate-100">
              <h3 className="font-headline-md text-headline-md mb-4 text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">track_changes</span>
                Performance Targets
              </h3>
              
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-6">
                <div>
                  <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Monthly Revenue Target (₹) *</label>
                  <input 
                    required={formData.role === 'SALESPERSON'}
                    type="number"
                    name="monthlyTarget"
                    value={formData.monthlyTarget}
                    onChange={handleChange}
                    className="w-full md:w-1/2 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                    placeholder="e.g. 150000"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Daily Connections</label>
                    <input 
                      required={formData.role === 'SALESPERSON'}
                      type="number"
                      name="dailyConnectionTarget"
                      value={formData.dailyConnectionTarget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Daily Conversations</label>
                    <input 
                      required={formData.role === 'SALESPERSON'}
                      type="number"
                      name="dailyConversationTarget"
                      value={formData.dailyConversationTarget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Daily Closures</label>
                    <input 
                      required={formData.role === 'SALESPERSON'}
                      type="number"
                      name="dailyClosureTarget"
                      value={formData.dailyClosureTarget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserView;
