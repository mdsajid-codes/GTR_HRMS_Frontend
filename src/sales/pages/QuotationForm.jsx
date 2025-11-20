import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Loader, Plus, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const QuotationForm = ({ quotation, onSave, onCancel, loading: isSubmitting }) => {
    const [formData, setFormData] = useState({
        number: '', date: new Date().toISOString().split('T')[0], expiryDate: '',
        customerId: '', currency: 'USD', status: 'DRAFT', notes: '',
    });
    const [items, setItems] = useState([{ productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(true);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchDependencies = useCallback(async () => {
        setLoadingDeps(true);
        try {
            // Assuming these endpoints exist. Replace with actual endpoints if different.
            const [customerRes, productRes] = await Promise.all([
                axios.get(`${API_URL}/sales/customers`, { headers: authHeaders }),
                axios.get(`${API_URL}/production/raw-materials`, { headers: authHeaders }) // Assuming products are raw materials for now
            ]);
            setCustomers(customerRes.data || []);
            setProducts(productRes.data.content || []);
        } catch (error) {
            console.error("Failed to fetch form dependencies", error);
            alert("Could not load customers or products. Please try again.");
        } finally {
            setLoadingDeps(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    useEffect(() => {
        if (quotation) {
            setFormData({
                number: quotation.number || '',
                date: quotation.date ? new Date(quotation.date).toISOString().split('T')[0] : '',
                expiryDate: quotation.expiryDate ? new Date(quotation.expiryDate).toISOString().split('T')[0] : '',
                customerId: quotation.customerId || '',
                currency: quotation.currency || 'USD',
                status: quotation.status || 'DRAFT',
                notes: quotation.notes || '',
            });
            setItems(quotation.items && quotation.items.length > 0 ? quotation.items.map(it => ({...it, productId: it.productId || ''})) : [{ productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
        }
    }, [quotation]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;

        if (name === 'productId') {
            const selectedProduct = products.find(p => String(p.id) === value);
            if (selectedProduct) {
                newItems[index].description = selectedProduct.name;
                newItems[index].unitPrice = selectedProduct.salesPrice || 0;
            }
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, items };
        onSave(payload);
    };

    const { subtotal, taxTotal, grandTotal } = useMemo(() => {
        let sub = 0;
        let tax = 0;
        items.forEach(item => {
            const lineTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
            sub += lineTotal;
            if (item.taxRate > 0) {
                tax += lineTotal * (item.taxRate / 100);
            }
        });
        return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
    }, [items]);

    if (loadingDeps) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <>
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                    <h2 className="text-xl font-semibold text-foreground">{quotation ? 'Edit Quotation' : 'New Quotation'}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" form="quotation-form" className="btn-primary flex items-center" disabled={isSubmitting}>
                        {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
                    </button>
                </div>
            </header>

            <form id="quotation-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Header Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="label">Quotation #</label><input name="number" value={formData.number} onChange={handleFormChange} required className="input" /></div>
                    <div><label className="label">Date</label><input name="date" type="date" value={formData.date} onChange={handleFormChange} required className="input" /></div>
                    <div><label className="label">Expiry Date</label><input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleFormChange} required className="input" /></div>
                    <div className="md:col-span-2">
                        <label className="label">Customer</label>
                        <select name="customerId" value={formData.customerId} onChange={handleFormChange} required className="input">
                            <option value="">Select a customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select name="status" value={formData.status} onChange={handleFormChange} className="input">
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-background-muted">
                            <tr>
                                <th className="th-cell w-2/5">Product</th>
                                <th className="th-cell">Qty</th>
                                <th className="th-cell">Price</th>
                                <th className="th-cell">Discount</th>
                                <th className="th-cell">Tax (%)</th>
                                <th className="th-cell text-right">Total</th>
                                <th className="th-cell w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-border">
                                    <td className="p-1">
                                        <select name="productId" value={item.productId} onChange={(e) => handleItemChange(index, e)} className="input-sm">
                                            <option value="">Select Product</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1"><input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="input-sm w-16 text-center" /></td>
                                    <td className="p-1"><input type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} className="input-sm w-24 text-right" /></td>
                                    <td className="p-1"><input type="number" name="discount" value={item.discount} onChange={(e) => handleItemChange(index, e)} className="input-sm w-20 text-right" /></td>
                                    <td className="p-1"><input type="number" name="taxRate" value={item.taxRate} onChange={(e) => handleItemChange(index, e)} className="input-sm w-16 text-right" /></td>
                                    <td className="p-1 text-right font-mono pr-2">{((item.quantity * item.unitPrice) - (item.discount || 0)).toFixed(2)}</td>
                                    <td className="p-1 text-center"><button type="button" onClick={() => removeItem(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full" disabled={items.length <= 1}><Trash2 size={14} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button type="button" onClick={addItem} className="btn-secondary text-sm flex items-center gap-2"><Plus size={16} /> Add Item</button>

                {/* Footer and Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                        <label className="label">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleFormChange} className="input" rows="4"></textarea>
                    </div>
                    <div className="bg-background-muted rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-foreground-muted">Subtotal</span>
                            <span className="font-mono">{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-foreground-muted">Tax</span>
                            <span className="font-mono">{taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                            <span>Grand Total</span>
                            <span className="font-mono">{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default QuotationForm;