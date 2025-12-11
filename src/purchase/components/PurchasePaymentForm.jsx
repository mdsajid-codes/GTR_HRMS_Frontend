import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft, Paperclip, Calculator } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    <input {...props} className="input mt-1 bg-background-muted border-border w-full rounded border px-3 py-2 text-sm" />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    <select {...props} className="input mt-1 bg-background-muted border-border w-full rounded border px-3 py-2 text-sm">{children}</select>
  </div>
);

const PurchasePaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    supplierId: '',
    amount: '',
    payFullAmount: false,
    taxDeducted: false,
    tdsAmount: 0,
    tdsSection: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: '',
    paidThrough: '',
    reference: '',
    chequeNumber: '',
    notes: '',
    createdBy: 'Admin', // Default or from context
    allocations: [], // { invoiceId, allocatedAmount, allocationNote }
    attachments: []
  });

  const [suppliers, setSuppliers] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]); // Invoices available for allocation
  const [loading, setLoading] = useState(false);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);
  const [newAttachmentFiles, setNewAttachmentFiles] = useState([]);
  const [error, setError] = useState('');

  // Fetch Suppliers on Mount & Handle Pre-fill
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } });
        setSuppliers(res.data.content || res.data || []);

        // Pre-fill from navigation state (Bill View -> Make Payment)
        if (!isEditing && location.state?.supplierId) {
             setForm(prev => ({ ...prev, supplierId: location.state.supplierId }));
             // Trigger fetching invoices
             fetchUnpaidInvoices(location.state.supplierId);
        }

      } catch (err) {
        console.error('Failed to load suppliers', err);
      }
    };
    loadSuppliers();
  }, [location.state, isEditing]); // Depend on location.state

  // Fetch Payment Data if Editing
  useEffect(() => {
    if (!isEditing) return;

    const loadPayment = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/purchases/payments/${id}`, { headers });
        const d = res.data;

        setForm({
          supplierId: d.supplierId || '',
          amount: d.amount ?? '',
          payFullAmount: !!d.payFullAmount,
          taxDeducted: !!d.taxDeducted,
          tdsAmount: d.tdsAmount ?? 0,
          tdsSection: d.tdsSection || '',
          paymentDate: d.paymentDate ? new Date(d.paymentDate).toISOString().split('T')[0] : '',
          paymentMode: d.paymentMode || '',
          paidThrough: d.paidThrough || '',
          reference: d.reference || '',
          chequeNumber: d.chequeNumber || '',
          notes: d.notes || '',
          createdBy: d.createdBy || '',
          allocations: (d.allocations || []).map(a => ({
            id: a.id || null, // Allocation ID
            invoiceId: a.invoiceId,
            allocatedAmount: a.allocatedAmount || 0,
            allocationNote: a.allocationNote || ''
          })),
          attachments: (d.attachments || []).map(a => ({
            id: a.id,
            fileName: a.fileName,
            filePath: a.filePath,
            uploadedBy: a.uploadedBy,
            uploadedAt: a.uploadedAt,
            url: a.url
          }))
        });

        if (d.supplierId) {
            fetchUnpaidInvoices(d.supplierId);
        }

      } catch (err) {
        console.error('Failed to load payment', err);
        setError('Failed to load payment details.');
      } finally {
        setLoading(false);
      }
    };
    loadPayment();
  }, [id, isEditing]);

  const fetchUnpaidInvoices = async (supId) => {
    if (!supId) {
        setUnpaidInvoices([]);
        return;
    }
    setFetchingInvoices(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/purchases/payments/unpaid-invoices`, { 
        headers, 
        params: { supplierId: supId } 
      });
      setUnpaidInvoices(res.data || []);
    } catch (err) {
      console.error('Failed to load unpaid invoices', err);
    } finally {
      setFetchingInvoices(false);
    }
  };

  // Effect to auto-allocate invoice from navigation state once invoices are loaded
  useEffect(() => {
     if (!isEditing && location.state?.invoiceId && unpaidInvoices.length > 0) {
         // Check if already allocated to avoid loops or overwrites
         const alreadyAllocated = form.allocations.some(a => a.invoiceId === location.state.invoiceId); 
         if (!alreadyAllocated) {
             const targetInv = unpaidInvoices.find(inv => inv.id === location.state.invoiceId);
             if (targetInv) {
                 const due = targetInv.netTotal - (targetInv.paidAmount || 0);
                 setForm(prev => ({
                     ...prev,
                     amount: due, 
                     allocations: [{ invoiceId: targetInv.id, allocatedAmount: due, allocationNote: '' }]
                 }));
             }
         }
     }
  }, [unpaidInvoices, location.state, isEditing]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSupplierChange = (e) => {
      const supId = e.target.value;
      setForm(prev => ({ ...prev, supplierId: supId, allocations: [] }));
      fetchUnpaidInvoices(supId);
  };

  const handleFileChange = (e) => {
      setNewAttachmentFiles(Array.from(e.target.files));
  };

  // Allocations Logic
  const handleAllocationChange = (index, field, value) => {
      const newAlloc = [...form.allocations];
      newAlloc[index][field] = value;
      setForm(prev => ({ ...prev, allocations: newAlloc }));
  };

  const addAllocation = () => {
      setForm(prev => ({
          ...prev,
          allocations: [...prev.allocations, { invoiceId: '', allocatedAmount: 0, allocationNote: '' }]
      }));
  };

  const removeAllocation = (index) => {
      const newAlloc = [...form.allocations];
      newAlloc.splice(index, 1);
      setForm(prev => ({ ...prev, allocations: newAlloc }));
  };

  // Auto-calculate Total Allocation vs Amount
  const totalAllocated = form.allocations.reduce((acc, curr) => acc + Number(curr.allocatedAmount || 0), 0);
  const excessAmount = (Number(form.amount || 0) - totalAllocated);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId) {
        alert("Please select a supplier");
        return;
    }
    if (Number(form.amount) <= 0) {
        alert("Amount must be greater than zero");
        return;
    }
    
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };
        
        const formData = new FormData();
        // Append simple fields
        Object.keys(form).forEach(key => {
            if (key !== 'allocations' && key !== 'attachments') {
                formData.append(key, form[key]);
            }
        });
        
        // Append allocations complex list
        // Backend expects List<AllocationDTO> logic usually via indexed keys or JSON string 
        // For FormData with Spring Boot DTO binding, indexed approach: allocations[0].invoiceId
        form.allocations.forEach((alloc, index) => {
             formData.append(`allocations[${index}].invoiceId`, alloc.invoiceId);
             if(alloc.id) formData.append(`allocations[${index}].id`, alloc.id);
             formData.append(`allocations[${index}].allocatedAmount`, alloc.allocatedAmount);
             formData.append(`allocations[${index}].allocationNote`, alloc.allocationNote || '');
        });

        // Append New Attachments
        newAttachmentFiles.forEach(file => {
            formData.append('files', file);
        });

        if (isEditing) {
            await axios.put(`${API_URL}/purchases/payments/${id}`, formData, { headers });
            alert("Payment updated successfully");
        } else {
            await axios.post(`${API_URL}/purchases/payments`, formData, { headers });
            alert("Payment created successfully");
        }
        navigate('/purchase-dashboard/payments');

    } catch (err) {
        console.error("Submit error", err);
        alert("Failed to save payment. " + (err.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
         <div className="flex items-center gap-4">
             <Link to="/purchase-dashboard/payments" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
                 <ArrowLeft size={20} />
             </Link>
             <div>
                <h1 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Payment' : 'Record Payment'}</h1>
                <p className="text-xs text-slate-500">Record a payment made to a supplier</p>
             </div>
         </div>
         <div className="flex gap-2">
             <button onClick={() => navigate('/purchase-dashboard/payments')} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 text-sm font-medium">Cancel</button>
             <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                 {loading ? <Loader size={16} className="animate-spin"/> : <Save size={16}/>} Save Payment
             </button>
         </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - MAIN FORM */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Supplier & Amount Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 pb-2 border-b">Payment Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select label="Supplier *" name="supplierId" value={form.supplierId} onChange={handleSupplierChange} disabled={isEditing || (location.state?.supplierId && !isEditing)}>
                          <option value="">Select Supplier</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</option>)}
                      </Select>
                      
                      <div className="relative">
                          <Input label="Amount Paid *" type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className="pl-8 font-bold text-lg" />
                          <span className="absolute left-3 top-9 text-slate-400 font-bold">AED</span>
                      </div>

                      <Input label="Payment Date *" type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} />
                      
                      <Select label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={handleChange}>
                          <option value="">Select Mode</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Credit Card">Credit Card</option>
                      </Select>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select label="Paid Through" name="paidThrough" value={form.paidThrough} onChange={handleChange}>
                          <option value="">Select Account</option>
                          <option value="Petty Cash">Petty Cash</option>
                          <option value="Main Bank Account">Main Bank Account</option>
                      </Select>
                      <Input label="Reference #" name="reference" value={form.reference} onChange={handleChange} placeholder="e.g. TRN-10293" />
                  </div>

                   {form.paymentMode === 'Cheque' && (
                       <div className="mt-6">
                           <Input label="Cheque Number" name="chequeNumber" value={form.chequeNumber} onChange={handleChange} />
                       </div>
                   )}
              </div>

               {/* Allocation Section */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                   <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Bill Allocation</h2>
                      <div className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                          Total Allocated: {totalAllocated.toFixed(2)} / {Number(form.amount || 0).toFixed(2)}
                      </div>
                   </div>

                   {form.supplierId ? (
                       <div className="space-y-4">
                           {form.allocations.map((alloc, idx) => {
                               const selectedInv = unpaidInvoices.find(inv => inv.id == alloc.invoiceId);
                               const maxDue = selectedInv ? (selectedInv.netTotal - (selectedInv.paidAmount || 0)) : 0;
                               
                               return (
                                   <div key={idx} className="flex gap-4 items-end bg-slate-50 p-3 rounded border border-slate-200">
                                        <div className="flex-1">
                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Bill Number</label>
                                            <select 
                                                className="w-full text-sm border rounded p-2"
                                                value={alloc.invoiceId}
                                                onChange={(e) => handleAllocationChange(idx, 'invoiceId', e.target.value)}
                                            >
                                                <option value="">Select Bill</option>
                                                {unpaidInvoices.map(inv => (
                                                    <option key={inv.id} value={inv.id}>
                                                        {inv.billNumber} (Due: {inv.netTotal - (inv.paidAmount||0)}) - {new Date(inv.billDate).toLocaleDateString()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
                                            <input 
                                                type="number" 
                                                className="w-full text-sm border rounded p-2 text-right"
                                                value={alloc.allocatedAmount}
                                                onChange={(e) => handleAllocationChange(idx, 'allocatedAmount', e.target.value)}
                                                max={maxDue}
                                            />
                                            {selectedInv && <div className="text-[10px] text-slate-400 text-right mt-1">Max: {maxDue}</div>}
                                        </div>
                                        <button onClick={() => removeAllocation(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                   </div>
                               );
                           })}
                           
                           <button onClick={addAllocation} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline mt-2">
                               <Plus size={16} /> Add another bill
                           </button>

                           {/* Excess Warning */}
                           {excessAmount > 0 && (
                               <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200 flex items-center gap-2">
                                   <Calculator size={16} />
                                   You have AED {excessAmount.toFixed(2)} in excess. This will be recorded as unused credits.
                               </div>
                           )}
                           {excessAmount < 0 && (
                               <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-200">
                                   Error: You have allocated more than the payment amount!
                               </div>
                           )}
                       </div>
                   ) : (
                       <div className="text-center py-8 text-slate-400 text-sm italic">
                           Select a supplier to see unpaid bills.
                       </div>
                   )}
               </div>
          </div>

          {/* RIGHT COLUMN - META */}
          <div className="space-y-6">
               <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 pb-2 border-b">Additional Info</h2>
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" name="payFullAmount" checked={form.payFullAmount} onChange={handleChange} className="rounded border-slate-300" />
                            Pay Full Amount
                        </label>
                        <div className="border-t pt-4">
                             <label className="block text-xs font-medium text-slate-500 mb-1">Notes / Remarks</label>
                             <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="w-full text-sm border-slate-300 rounded resize-none p-2 bg-slate-50" placeholder="Internal notes..." />
                        </div>
                    </div>
               </div>

               <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 pb-2 border-b">Attachments</h2>
                    <div className="space-y-3">
                         {form.attachments.map(att => (
                             <div key={att.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                                 <a href={att.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">{att.fileName}</a>
                                 <span className="text-slate-400">Existing</span>
                             </div>
                         ))}
                         
                         <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default PurchasePaymentForm;
