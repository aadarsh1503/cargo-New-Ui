import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

// ─── Generic list card ────────────────────────────────────────────────────────
const ListCard = ({ title, items, onAdd, onEdit, onToggle, loading }) => {
  const [search, setSearch] = useState('');
  const [addValue, setAddValue] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!addValue.trim()) { toast.error('Please enter a name'); return; }
    onAdd(addValue.trim());
    setAddValue('');
    setShowAddInput(false);
  };

  const handleEdit = (id) => {
    if (!editValue.trim()) return;
    onEdit(id, editValue.trim());
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <p className="font-semibold text-gray-700 text-sm">{title}</p>
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670] bg-blue-50/30" />
        <button onClick={() => setShowAddInput(v => !v)}
          className="px-4 py-1.5 rounded-full bg-[#243670] text-white text-xs font-semibold hover:bg-blue-900">
          {showAddInput ? 'Cancel' : 'Add'}
        </button>
      </div>
      {showAddInput && (
        <div className="flex gap-2">
          <input value={addValue} onChange={e => setAddValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`New ${title.toLowerCase()} name`} autoFocus
            className="flex-1 border border-[#243670] rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670]" />
          <button onClick={handleAdd}
            className="px-4 py-1.5 rounded-full bg-[#243670] text-white text-xs font-semibold hover:bg-blue-900">Save</button>
        </div>
      )}
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No items</p>
        ) : filtered.map(item => (
          <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
            {editingId === item.id ? (
              <input value={editValue} onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEdit(item.id)} autoFocus
                className="flex-1 border border-[#243670] rounded px-2 py-0.5 text-xs focus:outline-none mr-2" />
            ) : (
              <span className="text-sm font-semibold text-[#243670] flex-1">{item.name}</span>
            )}
            <div className="flex items-center gap-2 flex-shrink-0">
              {editingId === item.id ? (
                <>
                  <button onClick={() => handleEdit(item.id)} className="text-xs text-green-600 font-semibold">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingId(item.id); setEditValue(item.name); }}
                    className="text-xs text-green-600 font-semibold hover:underline">Edit</button>
                  <button onClick={() => onToggle(item.id, item.is_active)}
                    className={`text-xs font-semibold ${item.is_active ? 'text-rose-500' : 'text-gray-400'} hover:underline`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Hook: list items ─────────────────────────────────────────────────────────
const useSettingsList = (key) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight-settings/${key}`, { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [key]);

  const add = async (name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight-settings/${key}`, { method: 'POST', headers, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error();
      toast.success('Added'); load();
    } catch { toast.error('Failed to add'); }
  };

  const edit = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight-settings/${key}/${id}`, { method: 'PUT', headers, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error();
      toast.success('Updated'); load();
    } catch { toast.error('Failed to update'); }
  };

  const toggle = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight-settings/${key}/${id}/toggle`, { method: 'PATCH', headers });
      if (!res.ok) throw new Error();
      load();
    } catch { toast.error('Failed to toggle'); }
  };

  return { items, loading, add, edit, toggle };
};

// ─── Hook: single key-value setting ──────────────────────────────────────────
const useSetting = (key) => {
  const [value, setValue] = useState('');
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings/${key}`, { headers })
      .then(r => r.json())
      .then(d => setValue(d.value || ''))
      .catch(() => {});
  }, [key]);

  const save = async (val) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/${key}`, { method: 'PUT', headers, body: JSON.stringify({ value: val }) });
      if (!res.ok) throw new Error();
      toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  };

  return { value, setValue, save };
};

// ─── Reusable commission/fee card with Fixed/Percentage toggle ────────────────
const FeeCard = ({ title, settingKey }) => {
  const { value, setValue, save } = useSetting(settingKey);
  const { value: typeStored, save: saveType } = useSetting(settingKey + '_type');
  const [feeType, setFeeType] = useState('fixed');

  useEffect(() => {
    if (typeStored === 'fixed' || typeStored === 'percentage') setFeeType(typeStored);
  }, [typeStored]);

  const handleSave = async () => {
    await save(value);
    await saveType(feeType);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <p className="font-semibold text-gray-700 text-sm">{title}</p>
      <div className="flex gap-2">
        {['fixed', 'percentage'].map(t => (
          <button key={t} onClick={() => setFeeType(t)}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              feeType === t ? 'bg-[#243670] text-white border-[#243670]' : 'text-gray-500 border-gray-200 hover:border-[#243670]'
            }`}>
            {t === 'fixed' ? 'Fixed' : 'Percentage'}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input type="number" value={value} onChange={e => setValue(e.target.value)}
          placeholder={feeType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#243670]" />
        <span className="text-gray-500 text-sm w-8 text-center">{feeType === 'percentage' ? '%' : 'USD'}</span>
      </div>
      <button onClick={handleSave}
        className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900">
        Save
      </button>
    </div>
  );
};

// ─── Sub-tab: Shipment ────────────────────────────────────────────────────────
const ShipmentTab = () => {
  const containerSizes = useSettingsList('container-sizes');
  const containerTypes = useSettingsList('container-types');
  const liners = useSettingsList('liners');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <ListCard title="Container Size" items={containerSizes.items} loading={containerSizes.loading} onAdd={containerSizes.add} onEdit={containerSizes.edit} onToggle={containerSizes.toggle} />
      <ListCard title="Container Type" items={containerTypes.items} loading={containerTypes.loading} onAdd={containerTypes.add} onEdit={containerTypes.edit} onToggle={containerTypes.toggle} />
      <ListCard title="Liners" items={liners.items} loading={liners.loading} onAdd={liners.add} onEdit={liners.edit} onToggle={liners.toggle} />
    </div>
  );
};

// ─── Sub-tab: Port ────────────────────────────────────────────────────────────
const PortTab = () => {
  const countries = useSettingsList('countries');
  const ports = useSettingsList('ports');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
      <ListCard title="Countries" items={countries.items} loading={countries.loading} onAdd={countries.add} onEdit={countries.edit} onToggle={countries.toggle} />
      <ListCard title="Ports" items={ports.items} loading={ports.loading} onAdd={ports.add} onEdit={ports.edit} onToggle={ports.toggle} />
    </div>
  );
};

// ─── Sub-tab: Pricing ─────────────────────────────────────────────────────────
const PricingTab = () => {
  const [commissionType, setCommissionType] = useState('percentage');
  const { value: commissionValue, setValue: setCommissionValue, save: saveCommission } = useSetting('ocean_freight_commission');
  const { value: commissionTypeStored, save: saveCommissionType } = useSetting('ocean_freight_commission_type');

  useEffect(() => {
    if (commissionTypeStored === 'fixed' || commissionTypeStored === 'percentage') {
      setCommissionType(commissionTypeStored);
    }
  }, [commissionTypeStored]);

  const handleSaveCommission = async () => {
    await saveCommission(commissionValue);
    await saveCommissionType(commissionType);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Ocean Freight Commission */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-gray-700 text-sm">Ocean Freight Commission</p>
        <div className="flex gap-2">
          {['fixed', 'percentage'].map(t => (
            <button key={t} onClick={() => setCommissionType(t)}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                commissionType === t ? 'bg-[#243670] text-white border-[#243670]' : 'text-gray-500 border-gray-200 hover:border-[#243670]'
              }`}>
              {t === 'fixed' ? 'Fixed' : 'Percentage'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input type="number" value={commissionValue} onChange={e => setCommissionValue(e.target.value)}
            placeholder={commissionType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#243670]" />
          <span className="text-gray-500 text-sm w-8 text-center">{commissionType === 'percentage' ? '%' : 'USD'}</span>
        </div>
        <button onClick={handleSaveCommission}
          className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900">
          Save
        </button>
      </div>

      <FeeCard title="Cancellation Fees" settingKey="cancellation_fees" />
      <FeeCard title="Changing Fees" settingKey="changing_fees" />
    </div>
  );
};

// ─── Sub-tab: General ─────────────────────────────────────────────────────────
const GeneralTab = () => {
  const { value: confirmTime, setValue: setConfirmTime, save: saveConfirmTime } = useSetting('confirmation_time');
  const { value: terms, setValue: setTerms, save: saveTerms } = useSetting('terms_and_conditions');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-gray-700 text-sm">Confirmation Time</p>
        <div className="flex gap-2 items-center">
          <input type="text" value={confirmTime} onChange={e => setConfirmTime(e.target.value)}
            placeholder="e.g. 24 hours"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#243670]" />
          <span className="text-gray-500 text-sm">hrs</span>
        </div>
        <button onClick={() => saveConfirmTime(confirmTime)}
          className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900">Save</button>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-gray-700 text-sm">Terms and Conditions</p>
        <textarea value={terms} onChange={e => setTerms(e.target.value)}
          placeholder="Enter terms and conditions..." rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#243670] resize-none" />
        <button onClick={() => saveTerms(terms)}
          className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900">Save</button>
      </div>
    </div>
  );
};

// ─── Sub-tab: Payment Details ─────────────────────────────────────────────────
const AdminPaymentDetailsTab = () => {
  const [form, setForm] = useState({
    bankName: '', branchName: '', accountHolder: '', accountNumber: '',
    iban: '', swiftCode: '', paymentInstructions: '', paypalEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE_URL}/freight/admin/payment-details`, { headers })
      .then(r => r.json())
      .then(data => {
        setForm({
          bankName: data.bank_name || '',
          branchName: data.branch_name || '',
          accountHolder: data.account_holder || '',
          accountNumber: data.account_number || '',
          iban: data.iban || '',
          swiftCode: data.swift_code || '',
          paymentInstructions: data.payment_instructions || '',
          paypalEmail: data.paypal_email || '',
        });
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/admin/payment-details`, {
        method: 'PUT', headers, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Payment details saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#243670]';
  const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
        <p className="font-bold text-gray-800 text-sm uppercase tracking-widest">🏦 Bank Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Bank Name</label>
            <input value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} className={inp} placeholder="e.g. National Bank" />
          </div>
          <div>
            <label className={lbl}>Branch Name</label>
            <input value={form.branchName} onChange={e => setForm(p => ({ ...p, branchName: e.target.value }))} className={inp} placeholder="e.g. Main Branch" />
          </div>
          <div>
            <label className={lbl}>Account Holder Name</label>
            <input value={form.accountHolder} onChange={e => setForm(p => ({ ...p, accountHolder: e.target.value }))} className={inp} placeholder="Full name on account" />
          </div>
          <div>
            <label className={lbl}>Account Number</label>
            <input value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} className={inp} placeholder="Account number" />
          </div>
          <div>
            <label className={lbl}>IBAN Number</label>
            <input value={form.iban} onChange={e => setForm(p => ({ ...p, iban: e.target.value }))} className={inp} placeholder="e.g. BH29BMAG1299123456BH00" />
          </div>
          <div>
            <label className={lbl}>SWIFT Code</label>
            <input value={form.swiftCode} onChange={e => setForm(p => ({ ...p, swiftCode: e.target.value }))} className={inp} placeholder="e.g. NBOBBHBM" />
          </div>
        </div>
        <div>
          <label className={lbl}>Payment Instructions (Optional)</label>
          <textarea value={form.paymentInstructions} onChange={e => setForm(p => ({ ...p, paymentInstructions: e.target.value }))} rows={2} className={inp} placeholder="Any special instructions for users..." />
        </div>
      </div>


      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Payment Details'}
      </button>
    </div>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
const SUBTABS = ['Payment Details'];
// const SUBTABS = ['Shipment', 'Port', 'Pricing', 'General', 'Payment Details'];


const FreightSettingsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('Payment Details');

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6 flex-wrap">
        {SUBTABS.map(tab => (
          <button key={tab} onClick={() => setActiveSubTab(tab)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeSubTab === tab ? 'bg-[#243670] text-white' : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}>
            {tab}
          </button>
        ))}
      </div>
      {/* {activeSubTab === 'Shipment' && <ShipmentTab />}
      {activeSubTab === 'Port' && <PortTab />}
      {activeSubTab === 'Pricing' && <PricingTab />}
      {activeSubTab === 'General' && <GeneralTab />} */}
      {activeSubTab === 'Payment Details' && <AdminPaymentDetailsTab />}
    </div>
  );
};

export default FreightSettingsPage;



