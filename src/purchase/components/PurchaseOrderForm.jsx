import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft, Paperclip, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input {...props} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <select {...props} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
      {children}
    </select>
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <textarea {...props} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
);

const PurchaseOrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        // Header
        locationId: '',
        orderCategory: 'Domestic',
        supplierId: '',
        poNumber: '', // Auto Generate if empty
        reference: '',
        date: new Date().toISOString().split('T')[0],
        projectNumber: '',
        
        // Settings
        discountMode: 'Without Discount',
        currency: 'AED',
        remark: '',
        
        // Deliver To
        deliverToType: 'Organization', // Organization | Customer
        deliverToId: '',
        deliverToAddress: '',
        
        // Template / Email
        template: 'Standard',
        emailTo: '',

        status: 'Draft',
        createdBy: '',
        
        items: [], 
        attachments: [],
        
        // Footer
        termsAndConditions: '',
        notes: '',
        otherCharges: 0
    });

    const [loading, setLoading] = useState(false);
    const [attachmentFiles, setAttachmentFiles] = useState([]); 
    const [error, setError] = useState(null);

    // Masters
    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [units, setUnits] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                // Parallel fetch of masters
                const [
                    rawRes,
                    unitRes,
                    taxRes,
                    catRes,
                    supRes,
                    locRes,
                    custRes
                ] = await Promise.all([
                    axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 1000 } }),
                    axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 100 } }),
                    axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
                    axios.get(`${API_URL}/locations`, { headers }), // Assuming /locations returns list directly or via .content
                    axios.get(`${API_URL}/parties`, { headers, params: { type: 'CUSTOMER', page: 0, size: 500 } })
                ]);

                setRawMaterials(rawRes.data.content ?? rawRes.data ?? []);
                setUnits(unitRes.data.content ?? unitRes.data ?? []);
                setTaxes(taxRes.data.content ?? taxRes.data ?? []);
                setCategories(catRes.data.content ?? catRes.data ?? []);
                setSuppliers(supRes.data.content ?? supRes.data ?? []);
                setLocations(Array.isArray(locRes.data) ? locRes.data : (locRes.data.content ?? []));
                setCustomers(custRes.data.content ?? custRes.data ?? []);

                if (isEditing) {
                    const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
                    const po = poRes.data;
                    
                    // Helper to fix attachments URL if missing
                    const attachmentsWithUrl = (po.attachments ?? []).map(a => ({
                        ...a,
                        url: a.url || (a.filePath ? `${API_URL.replace(/\/$/, '')}/uploads/${a.filePath}` : null)
                    }));

                    setForm(prev => ({
                        ...prev,
                        locationId: po.locationId ?? '',
                        orderCategory: po.orderCategory ?? 'Domestic',
                        supplierId: po.supplierId ?? '',
                        poNumber: po.poNumber ?? '',
                        reference: po.reference ?? '',
                        date: po.date ? new Date(po.date).toISOString().split('T')[0] : prev.date,
                        projectNumber: po.projectNumber ?? '',
                        discountMode: po.discountMode ?? 'Without Discount',
                        currency: po.currency ?? 'AED',
                        remark: po.remark ?? '',
                        
                        deliverToType: po.deliverToType ?? 'Organization',
                        deliverToId: po.deliverToId ?? '',
                        deliverToAddress: po.deliverToAddress ?? '',
                        
                        template: po.template ?? 'Standard',
                        emailTo: po.emailTo ?? '',
                        
                        termsAndConditions: po.termsAndConditions ?? '',
                        notes: po.notes ?? '',
                        otherCharges: po.otherCharges ?? 0,

                        status: po.status ?? prev.status,
                        createdBy: po.createdBy ?? '',
                        items: (po.items ?? []).map(it => ({
                            id: it.id ?? null,
                            lineNumber: it.lineNumber ?? 1,
                            categoryId: it.categoryId ?? '',
                            subCategoryId: it.subCategoryId ?? '',
                            itemId: it.itemId ?? '',
                            description: it.description ?? '',
                            quantity: it.quantity ?? 0,
                            unitId: it.unitId ?? '',
                            rate: it.rate ?? 0,
                            taxId: it.taxId ?? '',
                            taxExempt: !!it.taxExempt,
                            taxPercent: it.taxPercent ?? '',
                            lineDiscount: it.lineDiscount ?? 0
                        })),
                        attachments: attachmentsWithUrl
                    }));
                    
                    // Prefetch subcategories
                    const catIds = Array.from(new Set((po.items ?? []).map(it => it.categoryId).filter(Boolean)));
                    await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
                }
            } catch (err) {
                console.error('Failed to load data', err);
                setError('Failed to load required data. Please check your connection or permissions.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEditing]);

    const fetchSubCategoriesForCategory = async (categoryId) => {
        if (!categoryId) return [];
        if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
            const arr = res.data.content ?? res.data ?? [];
            setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: arr }));
            return arr;
        } catch (err) {
            setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
            return [];
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
    };

    // Auto-fill address when Deliver To target changes
    const handleDeliverToIdChange = (e) => {
        const { value } = e.target;
        const idVal = value ? Number(value) : '';
        let address = '';
        
        if (form.deliverToType === 'Organization') {
            const loc = locations.find(l => l.id === idVal);
            if (loc) address = [loc.address, loc.city, loc.state, loc.country].filter(Boolean).join(', ');
        } else {
            const cust = customers.find(c => c.id === idVal);
            if (cust) address = [cust.billingAddress, cust.city, cust.country].filter(Boolean).join(', '); // Adjust based on Customer fields
        }

        setForm(prev => ({ ...prev, deliverToId: idVal, deliverToAddress: address }));
    };

    const toggleDeliverToType = (type) => {
        setForm(prev => ({ ...prev, deliverToType: type, deliverToId: '', deliverToAddress: '' }));
    };

    // --- Items ---
    const handleItemChange = (idx, e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => {
            const items = [...prev.items];
            items[idx] = { 
                ...items[idx], 
                [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value) 
            };
            return { ...prev, items };
        });
    };

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, {
                lineNumber: prev.items.length + 1,
                categoryId: '',
                subCategoryId: '',
                itemId: '',
                description: '',
                quantity: 1,
                unitId: '',
                rate: 0,
                taxId: '',
                taxExempt: false,
                taxPercent: '',
                lineDiscount: 0
            }]
        }));
    };

    const removeItem = (idx) => {
        setForm(prev => {
            const items = prev.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, lineNumber: i + 1 }));
            return { ...prev, items };
        });
    };

    // --- Attachments ---
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files) {
            setAttachmentFiles(prev => [...prev, ...Array.from(files)]);
        }
    };

    const removeNewFile = (index) => {
        setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = async (attId) => {
        if (!window.confirm('Delete this attachment permanently?')) return;
        // Optimistic UI update
        setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attId) }));
        
        // Try backend delete if needed/supported (Placeholder)
        // try { await axios.delete(`${API_URL}/...`); } catch(e) { ... }
    };

    // --- Totals ---
    const totals = useMemo(() => {
        let subTotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;
        (form.items || []).forEach(it => {
            const qty = Number(it.quantity) || 0;
            const rate = Number(it.rate) || 0;
            const lineDiscount = Number(it.lineDiscount) || 0;
            const amount = qty * rate;
            const net = Math.max(0, amount - lineDiscount);
            
            subTotal += amount;
            totalDiscount += lineDiscount;
            
            const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
            const taxRate = Number(it.taxPercent !== '' ? it.taxPercent : (taxMaster ? taxMaster.rate : 0)) || 0;
            
            if (!it.taxExempt && taxRate > 0) {
                totalTax += net * (taxRate / 100);
            }
        });
        
        const otherCharges = Number(form.otherCharges) || 0;
        const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;
        
        return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
    }, [form.items, form.otherCharges, taxes]);

    // --- Submit ---
    const validate = () => {
        if (!form.locationId) return 'Location is required';
        if (!form.date) return 'Date is required';
        if (form.items.length === 0) return 'At least one item is required';
        return null; // Valid
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (v) { setError(v); window.scrollTo(0,0); return; }
        
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

            const orderPayload = {
                ...form,
                items: form.items.map(it => ({
                    lineNumber: it.lineNumber,
                    categoryId: it.categoryId || null,
                    subCategoryId: it.subCategoryId || null,
                    itemId: it.itemId || null,
                    description: it.description || null,
                    quantity: it.quantity || 0,
                    unitId: it.unitId || null,
                    rate: it.rate || 0,
                    taxId: it.taxId || null,
                    taxExempt: !!it.taxExempt,
                    taxPercent: it.taxPercent !== '' ? Number(it.taxPercent) : null,
                    lineDiscount: Number(it.lineDiscount) || 0,
                    discountPercent: null
                })),
                attachments: undefined, // Handled separately
                otherCharges: Number(form.otherCharges) || 0
            };

            let savedOrder;
            if (isEditing) {
                const response = await axios.put(`${API_URL}/purchase/orders/${id}`, orderPayload, { headers });
                savedOrder = response.data;
            } else {
                const response = await axios.post(`${API_URL}/purchase/orders`, orderPayload, { headers });
                savedOrder = response.data;
            }

            // Upload new attachments
            if (attachmentFiles.length > 0) {
                const attachmentPayload = new FormData();
                attachmentFiles.forEach(file => attachmentPayload.append('files', file));
                if (form.createdBy) attachmentPayload.append('uploadedBy', form.createdBy);

                await axios.post(`${API_URL}/purchase/orders/${savedOrder.id}/attachments`, attachmentPayload, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                });
            }

            navigate('/purchase-dashboard/purchase-orders');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Failed to save purchase order.';
            setError(msg);
            window.scrollTo(0,0);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isEditing) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-800">{isEditing ? `Edit PO #${form.poNumber}` : 'Add New Purchase Order'}</h1>
                <Link to="/purchase-dashboard/purchase-orders" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <ArrowLeft size={18} /> Back to List
                </Link>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Top Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-md border">
                    <Select label="Location" name="locationId" value={form.locationId} onChange={handleChange} required>
                        <option value="">Select Location</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Select>
                    
                    <Select label="Purchase Order Type" name="orderCategory" value={form.orderCategory} onChange={handleChange}>
                        <option value="Domestic">Domestic</option>
                        <option value="Imported">Imported</option>
                    </Select>

                    <Select label="Supplier Name" name="supplierId" value={form.supplierId} onChange={handleChange}>
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName} ${s.lastName}`}</option>)}
                    </Select>

                    <div className="flex items-end">
                        <div className="w-24 mr-2">
                             <label className="block text-sm font-medium text-slate-600 mb-1">Currency</label>
                             <div className="w-full px-3 py-2 bg-blue-600 text-white text-center rounded text-sm font-bold">{form.currency}</div>
                        </div>
                    </div>

                    <Input label="Purchase Order NO" name="poNumber" value={form.poNumber} onChange={handleChange} placeholder="Auto Generate" disabled={!isEditing && !form.poNumber} />
                    <Input label="Reference" name="reference" value={form.reference} onChange={handleChange} />
                    
                    <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
                    <Input label="Remark" name="remark" value={form.remark} onChange={handleChange} />

                    <div className="md:col-span-2">
                        <Input label="Project Number" name="projectNumber" value={form.projectNumber} onChange={handleChange} />
                    </div>
                </div>

                {/* Section 2: Items */}
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <Select label="Purchase Order Mode" name="discountMode" value={form.discountMode} onChange={handleChange} style={{ width: '250px' }}>
                            <option value="Without Discount">Without Discount</option>
                            <option value="Item level">With Discount At Item Level</option>
                            <option value="Order level">With Discount At Order Level</option>
                        </Select>
                        <button type="button" onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 text-sm">
                            <Plus size={16} /> Add Item
                        </button>
                     </div>
                     
                     <div className="overflow-x-auto border rounded-t-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left">Item & Description</th>
                                    <th className="px-4 py-3 w-32">Quantity</th>
                                    <th className="px-4 py-3 w-32">Rate</th>
                                    {form.discountMode === 'Item level' && <th className="px-4 py-3 w-32">Discount</th>}
                                    <th className="px-4 py-3 w-32">Tax</th>
                                    <th className="px-4 py-3 w-32 text-right">Amount</th>
                                    <th className="px-2 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {form.items.map((it, idx) => {
                                    const qty = Number(it.quantity) || 0;
                                    const rate = Number(it.rate) || 0;
                                    const discount = Number(it.lineDiscount) || 0;
                                    const amount = Math.max(0, (qty * rate) - discount);
                                    
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 space-y-2">
                                                <div className="flex gap-2">
                                                    <select name="categoryId" value={it.categoryId} onChange={async (e) => {
                                                        handleItemChange(idx, e);
                                                        await fetchSubCategoriesForCategory(e.target.value);
                                                    }} className="w-1/2 p-1 border rounded text-xs bg-white">
                                                        <option value="">Category</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                    <select name="subCategoryId" value={it.subCategoryId} onChange={e => handleItemChange(idx, e)} className="w-1/2 p-1 border rounded text-xs bg-white">
                                                        <option value="">Subcategory</option>
                                                        {(subCategoriesByCategory[it.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                                    </select>
                                                </div>
                                                <select name="itemId" value={it.itemId} onChange={e => handleItemChange(idx, e)} className="w-full p-1 border rounded text-sm bg-white font-medium">
                                                    <option value="">Select Item</option>
                                                    {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </select>
                                                <input name="description" value={it.description} onChange={e => handleItemChange(idx, e)} placeholder="Description" className="w-full p-1 border rounded text-xs" />
                                            </td>
                                            <td className="px-4 py-2 align-top">
                                                <input type="number" name="quantity" value={it.quantity} onChange={e => handleItemChange(idx, e)} className="w-full p-1 border rounded text-right" min="0" />
                                                <select name="unitId" value={it.unitId} onChange={e => handleItemChange(idx, e)} className="w-full mt-1 p-1 border rounded text-xs bg-white">
                                                    <option value="">Unit</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 align-top">
                                                <input type="number" name="rate" value={it.rate} onChange={e => handleItemChange(idx, e)} className="w-full p-1 border rounded text-right" min="0" />
                                            </td>
                                            
                                            {form.discountMode === 'Item level' && (
                                                <td className="px-4 py-2 align-top">
                                                    <input type="number" name="lineDiscount" value={it.lineDiscount} onChange={e => handleItemChange(idx, e)} className="w-full p-1 border rounded text-right" min="0" />
                                                </td>
                                            )}

                                            <td className="px-4 py-2 align-top">
                                                <select name="taxId" value={it.taxId} onChange={e => handleItemChange(idx, e)} className="w-full p-1 border rounded text-xs bg-white">
                                                    <option value="">No Tax</option>
                                                    {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
                                                </select>
                                                <div className="mt-1 flex items-center">
                                                     <input type="checkbox" name="taxExempt" checked={it.taxExempt} onChange={e => handleItemChange(idx, e)} id={`exempt-${idx}`} className="mr-1" />
                                                     <label htmlFor={`exempt-${idx}`} className="text-[10px] text-slate-500">Exempt</label>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-700 align-top pt-3">
                                                {amount.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-2 text-center align-top pt-3">
                                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {form.items.length === 0 && (
                                    <tr><td colSpan="7" className="p-8 text-center text-slate-400">No items added yet. Click "Add Item" to start.</td></tr>
                                )}
                            </tbody>
                        </table>
                     </div>

                     {/* Totals Section */}
                     <div className="flex flex-col md:flex-row justify-between mt-4">
                        <div className="w-full md:w-1/2"></div>
                        <div className="w-full md:w-1/3 bg-slate-50 p-4 rounded border space-y-2">
                             <div className="flex justify-between text-sm"><span>Sub Total</span><span>{totals.subTotal.toFixed(2)}</span></div>
                             <div className="flex justify-between text-sm text-slate-500"><span>Total Discount</span><span>{totals.totalDiscount.toFixed(2)}</span></div>
                             <div className="flex justify-between text-sm text-slate-500"><span>Total Tax</span><span>{totals.totalTax.toFixed(2)}</span></div>
                             <div className="flex justify-between items-center text-sm">
                                 <span>Other Charges</span>
                                 <input type="number" name="otherCharges" value={form.otherCharges} onChange={handleChange} className="w-24 p-1 border rounded text-right text-sm" />
                             </div>
                             <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                 <span>Total</span>
                                 <span>{totals.totalAmount.toFixed(2)} {form.currency}</span>
                             </div>
                        </div>
                     </div>
                </div>

                {/* Section 3: Attachments */}
                <div className="border bg-slate-50 p-4 rounded-md">
                    <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><Paperclip size={18} /> Attach File(s)</h3>
                    <div className="flex gap-4 items-center">
                        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="cursor-pointer bg-white border px-3 py-2 rounded text-sm hover:bg-slate-100 flex items-center gap-2 shadow-sm">
                            <Upload size={14} /> Browse...
                        </label>
                        <span className="text-sm text-slate-500">{attachmentFiles.length > 0 ? `${attachmentFiles.length} file(s) ready to upload` : 'No file selected.'}</span>
                    </div>
                    
                    {/* File List */}
                    <div className="mt-3 space-y-2">
                        {form.attachments.map(att => (
                            <div key={att.id} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                                <span className="text-blue-600 truncate underline cursor-pointer" onClick={() => att.url && window.open(att.url, '_blank')}>{att.fileName}</span>
                                <button type="button" onClick={() => removeExistingAttachment(att.id)} className="text-red-500 hover:text-red-700 px-2">Remove</button>
                            </div>
                        ))}
                        {attachmentFiles.map((f, i) => (
                             <div key={`new-${i}`} className="flex justify-between items-center bg-blue-50 p-2 border border-blue-100 rounded text-sm">
                                <span className="text-slate-700 truncate">{f.name} (New)</span>
                                <button type="button" onClick={() => removeNewFile(i)} className="text-red-500 hover:text-red-700 px-2">Cancel</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 4: Delivery & Others */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-md border">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Deliver To</label>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="deliverToType" checked={form.deliverToType === 'Organization'} onChange={() => toggleDeliverToType('Organization')} />
                                    <span className="text-sm">Organization</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="deliverToType" checked={form.deliverToType === 'Customer'} onChange={() => toggleDeliverToType('Customer')} />
                                    <span className="text-sm">Customer</span>
                                </label>
                            </div>
                            
                            {form.deliverToType === 'Organization' ? (
                                <Select value={form.deliverToId} onChange={handleDeliverToIdChange}>
                                    <option value="">Select Location</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </Select>
                            ) : (
                                <Select value={form.deliverToId} onChange={handleDeliverToIdChange}>
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName} ${c.lastName}`}</option>)}
                                </Select>
                            )}
                            
                            <div className="mt-2">
                                 <textarea 
                                    placeholder="Address" 
                                    className="w-full px-3 py-2 border rounded text-sm" 
                                    rows={3} 
                                    value={form.deliverToAddress} 
                                    onChange={(e) => setForm(prev => ({ ...prev, deliverToAddress: e.target.value }))}
                                 />
                                 <button type="button" className="text-xs text-blue-600 mt-1 hover:underline">Change destination to deliver</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Template:</span>
                            <span className="text-sm font-bold text-blue-600">Standard</span>
                            <button type="button" className="text-xs text-slate-400 hover:text-blue-500"><Loader size={12} /></button>
                        </div>

                        <Input label="Email To" name="emailTo" value={form.emailTo} onChange={handleChange} placeholder="email@example.com" />
                    </div>

                    <div className="space-y-4">
                        <TextArea label="Terms & Conditions" name="termsAndConditions" value={form.termsAndConditions} onChange={handleChange} rows={4} placeholder="Mention your company's Terms and Conditions." />
                        <TextArea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Will be displayed on purchase order" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="px-6 py-2 border rounded-md hover:bg-slate-50 text-slate-600">Cancel</button>
                    {/* <button type="button" className="px-6 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600">Save as Draft</button> */}
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2" disabled={loading}>
                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} 
                        {isEditing ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseOrderForm;
