import React, { useState, useEffect } from 'react';
import { X, Save, Loader, UserPlus, Edit, ArrowLeft } from 'lucide-react';

const Input = ({ label, ...props }) => (
    <div>
        <label className="label text-sm">{label}</label>
        <input {...props} className="input" />
    </div>
);

const initialFormData = {
    code: '', name: '', email: '', phone: '', 
    billingAddress: { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
    shippingAddress: { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
    gstOrVatNumber: '', status: 'ACTIVE'
};

const CustomerForm = ({ onSave, onCancel, loading, customer }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [sameAsBilling, setSameAsBilling] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                code: customer.code || '', name: customer.name || '', email: customer.email || '', phone: customer.phone || '',
                billingAddress: { ...initialFormData.billingAddress, ...customer.billingAddress },
                shippingAddress: { ...initialFormData.shippingAddress, ...customer.shippingAddress },
                gstOrVatNumber: customer.gstOrVatNumber || '', status: customer.status || 'ACTIVE'
            });
        } else {
            setFormData(initialFormData);
        }
    }, [customer]);

    useEffect(() => {
        if (sameAsBilling) {
            setFormData(prev => ({ ...prev, shippingAddress: prev.billingAddress }));
        }
    }, [sameAsBilling, formData.billingAddress]);

    const handleSameAsBillingChange = (e) => {
        const isChecked = e.target.checked;
        setSameAsBilling(isChecked);
        if (!isChecked) {
            // Optionally reset shipping address when unchecked
            setFormData(prev => ({ ...prev, shippingAddress: initialFormData.shippingAddress }));
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (type, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], [name]: value },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        {customer ? <Edit size={20}/> : <UserPlus size={20}/>}
                        {customer ? 'Edit Customer' : 'Create Customer'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                    <button type="submit" form="customer-form" className="btn-primary flex items-center" disabled={loading}>
                        {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Customer
                    </button>
                </div>
            </header>
            <form id="customer-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 bg-background">
                <div className="p-6 bg-card rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Customer Code" name="code" value={formData.code} onChange={handleChange} required />
                        <Input label="Customer Name" name="name" value={formData.name} onChange={handleChange} required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                        <Input label="GST/VAT Number" name="gstOrVatNumber" value={formData.gstOrVatNumber} onChange={handleChange} />
                        <div>
                            <label className="label text-sm">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 bg-card rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Billing Address</h3>
                        <div className="space-y-2">
                            <Input label="Address Line 1" name="line1" value={formData.billingAddress.line1} onChange={(e) => handleAddressChange('billingAddress', e)} />
                            <Input label="Address Line 2" name="line2" value={formData.billingAddress.line2} onChange={(e) => handleAddressChange('billingAddress', e)} />
                            <Input label="City" name="city" value={formData.billingAddress.city} onChange={(e) => handleAddressChange('billingAddress', e)} />
                            <Input label="State / Province" name="state" value={formData.billingAddress.state} onChange={(e) => handleAddressChange('billingAddress', e)} />
                            <Input label="Postal Code" name="postalCode" value={formData.billingAddress.postalCode} onChange={(e) => handleAddressChange('billingAddress', e)} />
                            <Input label="Country" name="country" value={formData.billingAddress.country} onChange={(e) => handleAddressChange('billingAddress', e)} />
                        </div>
                    </div>
                    <div className="p-6 bg-card rounded-lg shadow-sm">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-lg font-semibold">Shipping Address</h3>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sameAsBilling} onChange={handleSameAsBillingChange} className="h-4 w-4 rounded" /> Same as Billing</label>
                        </div>
                        <div className="space-y-2">
                            <Input label="Address Line 1" name="line1" value={formData.shippingAddress.line1} onChange={(e) => handleAddressChange('shippingAddress', e)} disabled={sameAsBilling} />
                            <Input label="Address Line 2" name="line2" value={formData.shippingAddress.line2} onChange={(e) => handleAddressChange('shippingAddress', e)} disabled={sameAsBilling} />
                            <Input label="City" name="city" value={formData.shippingAddress.city} onChange={(e) => handleAddressChange('shippingAddress', e)} disabled={sameAsBilling} />
                            <Input label="State / Province" name="state" value={formData.shippingAddress.state} onChange={(e) => handleAddressChange('shippingAddress', e)} disabled={sameAsBilling} />
                            <Input label="Postal Code" name="postalCode" value={formData.shippingAddress.postalCode} onChange={(e) => handleAddressChange('shippingAddress', e)} disabled={sameAsBilling} />
                            <Input label="Country" name="country" value={formData.shippingAddress.country} onChange={(e) => handleAddressChange('shippingAddress', e)} disabled={sameAsBilling} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;