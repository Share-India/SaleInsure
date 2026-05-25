import React, { useState, useRef, useEffect } from 'react';

const NEEDS_CATEGORIES = [
  {
    category: 'Individual',
    items: ['Life', 'Health', 'Motor', 'Cyber', 'Affinity']
  },
  {
    category: 'Corporate',
    items: ['Asset', 'Liability', 'Employee Benefits']
  }
];

const LogActivityModal = ({ isOpen, stage, onClose, onSubmit, allDeals = [], initialData = null }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    notes: '',
    contactNumber: '',
    productPitched: '',
    productTerm: '',
    salaryPercentage: '',
    modeOfConnection: 'personally',
    pdAge: '',
    pdOccupation: '',
    pdIncome: '',
    pdMaritalStatus: 'Single',
    fdDependents: '0',
    fdSpouseOccupation: '',
    fdChildrenAges: '',
    personalInterests: ['', '', ''],
    needsIdentifiedList: [],
    productName: '',
    premiumAmount: '',
    status: 'WON',
    meetingsData: []
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    if (initialData && isOpen) {
      let parsedPd = {};
      let parsedFd = {};
      let parsedMeetings = [];
      let parsedInterests = ['', '', ''];
      let parsedNeeds = [];
      let category = '';

      try { if (initialData.personalDetails) parsedPd = JSON.parse(initialData.personalDetails); } catch(e){}
      try { if (initialData.familyDetails) parsedFd = JSON.parse(initialData.familyDetails); } catch(e){}
      try { if (initialData.meetingsData) parsedMeetings = JSON.parse(initialData.meetingsData); } catch(e){}
      
      if (initialData.personalInterests) {
        const parts = initialData.personalInterests.split(',').map(s => s.trim());
        parsedInterests = [parts[0] || '', parts[1] || '', parts[2] || ''];
      }

      if (initialData.needsIdentifiedList) {
        let str = initialData.needsIdentifiedList;
        if (str.startsWith('[')) {
          const closeIdx = str.indexOf(']');
          if (closeIdx !== -1) {
            category = str.substring(1, closeIdx);
            str = str.substring(closeIdx + 1).trim();
          }
        }
        parsedNeeds = str.split(',').map(s => s.trim()).filter(Boolean);
      }

      setSelectedCategory(category);
      setFormData({
        clientName: initialData.clientName || '',
        notes: initialData.remarks || '',
        contactNumber: initialData.contactNumber || '',
        productPitched: initialData.productPitched || '',
        productTerm: initialData.productTerm || '',
        salaryPercentage: initialData.salaryPercentage || '',
        modeOfConnection: initialData.modeOfConnection || 'personally',
        pdAge: parsedPd.age || '',
        pdOccupation: parsedPd.occupation || '',
        pdIncome: parsedPd.income || '',
        pdMaritalStatus: parsedPd.maritalStatus || 'Single',
        fdDependents: parsedFd.dependents || '0',
        fdSpouseOccupation: parsedFd.spouseOccupation || '',
        fdChildrenAges: parsedFd.childrenAges || '',
        personalInterests: parsedInterests,
        needsIdentifiedList: parsedNeeds,
        productName: initialData.productName || '',
        premiumAmount: initialData.premiumAmount || '',
        status: initialData.status || 'WON',
        meetingsData: parsedMeetings
      });
    } else if (!isOpen) {
      // Reset when closed
      setFormData({
        clientName: '', notes: '', contactNumber: '', productPitched: '', productTerm: '', salaryPercentage: '',
        modeOfConnection: 'personally', pdAge: '', pdOccupation: '', pdIncome: '', pdMaritalStatus: 'Single',
        fdDependents: '0', fdSpouseOccupation: '', fdChildrenAges: '', personalInterests: ['', '', ''],
        needsIdentifiedList: [], productName: '', premiumAmount: '', status: 'WON', meetingsData: []
      });
      setSelectedCategory('');
    }
  }, [initialData, isOpen]);
  
  const pastClients = Array.from(new Set(allDeals.map(d => d.clientName).filter(Boolean))).map(name => {
     const dealsForClient = allDeals.filter(d => d.clientName === name);
     const deal = dealsForClient[0];
     // Find the most recent CONVERSATION record (or any that has product details)
     const conversation = dealsForClient.find(d => d.productPitched) || {};
     
     return { 
        name, 
        contactNumber: deal?.contactNumber || '',
        productPitched: conversation.productPitched || '',
        productTerm: conversation.productTerm || '',
        premiumAmount: conversation.premiumAmount || '',
        salaryPercentage: conversation.salaryPercentage || ''
     };
  });

  const filteredClients = pastClients.filter(c => c.name.toLowerCase().includes(formData.clientName.toLowerCase()));

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'clientName' && (stage === 'CONVERSATION' || stage === 'CLOSURE')) {
        setShowDropdown(true);
    }
  };

  const handleInterestChange = (index, value) => {
    const newInterests = [...formData.personalInterests];
    newInterests[index] = value;
    setFormData({ ...formData, personalInterests: newInterests });
  };

  const handleChecklistToggle = (item) => {
    const list = formData.needsIdentifiedList.includes(item)
      ? formData.needsIdentifiedList.filter(i => i !== item)
      : [...formData.needsIdentifiedList, item];
    setFormData({ ...formData, needsIdentifiedList: list });
  };

  const addMeeting = () => {
    setFormData({
      ...formData,
      meetingsData: [...formData.meetingsData, { agreedToNeed: 'No', changesToNeed: '' }]
    });
  };

  const updateMeeting = (index, field, value) => {
    const newMeetings = [...formData.meetingsData];
    newMeetings[index][field] = value;
    setFormData({ ...formData, meetingsData: newMeetings });
  };

  const selectClient = (client) => {
    setFormData({
      ...formData,
      clientName: client.name,
      contactNumber: client.contactNumber || formData.contactNumber,
      ...(stage === 'CONVERSATION' && {
        productPitched: client.productPitched || formData.productPitched,
        productTerm: client.productTerm || formData.productTerm,
        premiumAmount: client.premiumAmount || formData.premiumAmount,
        salaryPercentage: client.salaryPercentage || formData.salaryPercentage
      })
    });
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      personalDetails: JSON.stringify({ age: formData.pdAge, occupation: formData.pdOccupation, income: formData.pdIncome, maritalStatus: formData.pdMaritalStatus }),
      familyDetails: JSON.stringify({ dependents: formData.fdDependents, spouseOccupation: formData.fdSpouseOccupation, childrenAges: formData.fdChildrenAges }),
      personalInterests: formData.personalInterests.filter(Boolean).join(', '),
      needsIdentifiedList: selectedCategory ? `[${selectedCategory}] ${formData.needsIdentifiedList.join(', ')}` : formData.needsIdentifiedList.join(', '),
      meetingsData: JSON.stringify(formData.meetingsData),
      remarks: formData.notes
    };
    onSubmit(stage, payload, initialData?.id);
  };

  const getTitle = () => {
    switch (stage) {
      case 'CONVERSATION': return 'Log Conversation';
      case 'CONNECTION': return 'Log Connection';
      case 'CLOSURE': return 'Log Closure';
    }
  };

  const getButtonText = () => {
    return initialData ? 'Update Activity' : 'Save Activity';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl glass-card ambient-shadow rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/40 shrink-0">
          <h2 className="font-headline-md text-headline-md">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-white/50 rounded-full transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="activity-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Client Name *</label>
              <input 
                required
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                placeholder="e.g. Acme Corp"
                autoComplete="off"
              />
              {showDropdown && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredClients.map((client, idx) => (
                          <div 
                              key={idx} 
                              className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                              onMouseDown={() => selectClient(client)}
                          >
                              {client.name}
                          </div>
                      ))}
                  </div>
              )}
            </div>

            {stage === 'CONNECTION' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Mode of Connection</label>
                    <select
                      name="modeOfConnection"
                      value={formData.modeOfConnection}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="personally">Personally</option>
                      <option value="telephone">Telephone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Product Pitched (Name)</label>
                    <input 
                      name="productPitched"
                      value={formData.productPitched}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" 
                      placeholder="e.g. Term Life"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Personal Details</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="pdAge" value={formData.pdAge} onChange={handleChange} placeholder="Age / DOB" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                    <input name="pdOccupation" value={formData.pdOccupation} onChange={handleChange} placeholder="Occupation" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                    <input name="pdIncome" type="number" value={formData.pdIncome} onChange={handleChange} placeholder="Annual Income (₹)" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                    <select name="pdMaritalStatus" value={formData.pdMaritalStatus} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Family Details</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="fdDependents" type="number" value={formData.fdDependents} onChange={handleChange} placeholder="No. of Dependents" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                    <input name="fdSpouseOccupation" value={formData.fdSpouseOccupation} onChange={handleChange} placeholder="Spouse Occupation" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                    <input name="fdChildrenAges" value={formData.fdChildrenAges} onChange={handleChange} placeholder="Children Ages (e.g. 5, 8)" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl col-span-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Personal Interests</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[0, 1, 2].map(i => (
                        <input 
                          key={i}
                          value={formData.personalInterests[i]}
                          onChange={(e) => handleInterestChange(i, e.target.value)}
                          placeholder={`Interest ${i+1}`}
                          className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-2">Need of Identification</label>
                  {/* Category Selection */}
                  <div className="flex gap-6 mb-4">
                    {NEEDS_CATEGORIES.map((group) => (
                      <label key={group.category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="needCategory"
                          value={group.category}
                          checked={selectedCategory === group.category}
                          onChange={() => {
                             setSelectedCategory(group.category);
                             // Clear previous selections when switching categories
                             setFormData(prev => ({ ...prev, needsIdentifiedList: [] }));
                          }}
                          className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-slate-700">{group.category}</span>
                      </label>
                    ))}
                  </div>

                  {/* Sub-items based on selected category */}
                  {selectedCategory && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Select Sub-Categories</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {NEEDS_CATEGORIES.find(g => g.category === selectedCategory)?.items.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={formData.needsIdentifiedList.includes(item)}
                              onChange={() => handleChecklistToggle(item)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {stage === 'CONVERSATION' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Mode of Meeting</label>
                    <select
                      name="modeOfConnection"
                      value={formData.modeOfConnection}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="personally">Personally</option>
                      <option value="telephone">Telephone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Term</label>
                    <input 
                      name="productTerm"
                      value={formData.productTerm}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Premium (₹)</label>
                    <input 
                      type="number"
                      name="premiumAmount"
                      value={formData.premiumAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" 
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Percentage as per Annual Salary</label>
                    <input 
                      type="number"
                      step="0.1"
                      name="salaryPercentage"
                      value={formData.salaryPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" 
                      placeholder="%"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider">Meetings</label>
                    <button type="button" onClick={addMeeting} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                      + Add Meeting
                    </button>
                  </div>
                  {formData.meetingsData.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No meetings logged yet.</p>
                  )}
                  <div className="space-y-4">
                    {formData.meetingsData.map((meeting, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="font-bold text-slate-700 mb-3">Meeting {idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Agreed to the Need?</label>
                                <select 
                                    value={meeting.agreedToNeed}
                                    onChange={(e) => updateMeeting(idx, 'agreedToNeed', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Changes to the Need</label>
                                <input 
                                    value={meeting.changesToNeed}
                                    onChange={(e) => updateMeeting(idx, 'changesToNeed', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                                />
                              </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {stage === 'CLOSURE' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Status</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                    >
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </div>
                </div>
                {formData.status === 'WON' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Product Name *</label>
                      <input 
                        required
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                        placeholder="e.g. Standard Plan"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Premium Amount (₹) *</label>
                      <input 
                        required
                        type="number"
                        name="premiumAmount"
                        value={formData.premiumAmount}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none" 
                        placeholder="e.g. 15000"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-label-sm text-slate-500 uppercase tracking-wider mb-1">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none resize-none" 
                placeholder="Add any additional context..."
              ></textarea>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="activity-form"
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogActivityModal;
