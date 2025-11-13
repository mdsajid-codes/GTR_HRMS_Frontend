import React, { useState, useEffect } from 'react';
import { Loader, ArrowLeft } from 'lucide-react';

const FormSection = ({ title, children }) => (
    <div className="pt-4">
        <h4 className="text-md font-semibold text-foreground-muted border-b border-border pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

const CrmCompanyForm = ({ item, onSave, onCancel, loading, companies, companyTypes, industries, locations }) => {
    const [formData, setFormData] = useState({
        name: '', companyOwner: '', phone: '', email: '', website: '',
        locationId: '', companyTypeId: '', industryId: '', parentCompanyId: '',
        billingStreet: '', billingCity: '', billingZip: '', billingState: '', billingCountry: '',
        shippingStreet: '', shippingCity: '', shippingZip: '', shippingState: '', shippingCountry: '',
    });
    const [isSameAddress, setIsSameAddress] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '', companyOwner: item.companyOwner || '', phone: item.phone || '', email: item.email || '', website: item.website || '',
                locationId: item.locationId || '', companyTypeId: item.companyTypeId || '', industryId: item.industryId || '', parentCompanyId: item.parentCompanyId || '',
                billingStreet: item.billingStreet || '', billingCity: item.billingCity || '', billingZip: item.billingZip || '', billingState: item.billingState || '', billingCountry: item.billingCountry || '',
                shippingStreet: item.shippingStreet || '', shippingCity: item.shippingCity || '', shippingZip: item.shippingZip || '', shippingState: item.shippingState || '', shippingCountry: item.shippingCountry || '',
            });
        } else {
            // Reset form for new entry
            setFormData({
                name: '', companyOwner: '', phone: '', email: '', website: '',
                locationId: '', companyTypeId: '', industryId: '', parentCompanyId: '',
                billingStreet: '', billingCity: '', billingZip: '', billingState: '', billingCountry: '',
                shippingStreet: '', shippingCity: '', shippingZip: '', shippingState: '', shippingCountry: '',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        if (isSameAddress) {
            setFormData(prev => ({
                ...prev,
                shippingStreet: prev.billingStreet,
                shippingCity: prev.billingCity,
                shippingState: prev.billingState,
                shippingZip: prev.billingZip,
                shippingCountry: prev.billingCountry,
            }));
        }
    }, [isSameAddress, formData.billingStreet, formData.billingCity, formData.billingState, formData.billingZip, formData.billingCountry]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: item?.id, ...formData });
    };

    return (
        <>
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-semibold text-foreground">
                        {item ? 'Edit Company' : 'Add New Company'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                    <button type="submit" form="company-form" className="btn-primary flex items-center" disabled={loading}>
                        {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save
                    </button>
                </div>
            </header>
            <form id="company-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                <FormSection title="Company Information">
                    <div><label className="label">Name</label><input name="name" value={formData.name} onChange={handleChange} required className="input" /></div>
                    <div><label className="label">Company Owner</label><input name="companyOwner" value={formData.companyOwner} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Phone</label><input name="phone" value={formData.phone} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Website</label><input name="website" value={formData.website} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Parent Company</label><select name="parentCompanyId" value={formData.parentCompanyId} onChange={handleChange} className="input"><option value="">None</option>{companies.filter(c => c.id !== item?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div><label className="label">Industry</label><select name="industryId" value={formData.industryId} onChange={handleChange} className="input"><option value="">Select Industry</option>{industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                    <div><label className="label">Company Type</label><select name="companyTypeId" value={formData.companyTypeId} onChange={handleChange} className="input"><option value="">Select Type</option>{companyTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}</select></div>
                    <div><label className="label">Location</label><select name="locationId" value={formData.locationId} onChange={handleChange} className="input"><option value="">Select Location</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                </FormSection>

                <FormSection title="Billing Address">
                    <div><label className="label">Street</label><input name="billingStreet" value={formData.billingStreet} onChange={handleChange} className="input" /></div>
                    <div><label className="label">City</label><input name="billingCity" value={formData.billingCity} onChange={handleChange} className="input" /></div>
                    <div><label className="label">State</label><input name="billingState" value={formData.billingState} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Zip Code</label><input name="billingZip" value={formData.billingZip} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Country</label><input name="billingCountry" value={formData.billingCountry} onChange={handleChange} className="input" /></div>
                </FormSection>

                <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isSameAddress} onChange={(e) => setIsSameAddress(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                        <span className="text-sm font-medium text-foreground-muted">Shipping address is the same as billing address</span>
                    </label>
                </div>

                <FormSection title="Shipping Address">
                    <div><label className="label">Street</label><input name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} className="input disabled:bg-background-muted" disabled={isSameAddress} /></div>
                    <div><label className="label">City</label><input name="shippingCity" value={formData.shippingCity} onChange={handleChange} className="input disabled:bg-background-muted" disabled={isSameAddress} /></div>
                    <div><label className="label">State</label><input name="shippingState" value={formData.shippingState} onChange={handleChange} className="input disabled:bg-background-muted" disabled={isSameAddress} /></div>
                    <div><label className="label">Zip Code</label><input name="shippingZip" value={formData.shippingZip} onChange={handleChange} className="input disabled:bg-background-muted" disabled={isSameAddress} /></div>
                    <div><label className="label">Country</label><input name="shippingCountry" value={formData.shippingCountry} onChange={handleChange} className="input disabled:bg-background-muted" disabled={isSameAddress} /></div>
                </FormSection>
            </form>
        </>
    );
};

export default CrmCompanyForm;