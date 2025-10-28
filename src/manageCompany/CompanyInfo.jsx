import React, { useState, useEffect, useCallback } from 'react';
import { Building, Edit, PlusCircle, Loader, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No authentication token found.");
    return { "Authorization": `Bearer ${token}` };
};

const api = {
    getCompanyInfo: async () => {
        const response = await axios.get(`${API_URL}/company-info`, { headers: getAuthHeaders() });
        return response.data;
    },
    saveCompanyInfo: async (data) => {
        // The backend uses POST for both create and update
        const response = await axios.post(`${API_URL}/company-info`, data, { headers: getAuthHeaders() });
        return response.data;
    },
};

// --- Reusable Components ---
const InputField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-foreground-muted mb-1">{label}</label>
        <input id={id} {...props} className="input bg-background-muted border-border text-foreground" />
    </div>
);

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-sm text-foreground-muted">{label}</p>
        <p className="font-medium text-foreground">{value || <span className="text-foreground-muted/50">N/A</span>}</p>
    </div>
);

const CompanyInfo = () => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const initialFormData = {
        companyName: '', address: '', city: '', state: '', postalCode: '', country: '',
        phone: '', email: '', website: '', pan: '', tan: '', gstIn: '',
        pfRegistrationNumber: '', esiRegistrationNumber: ''
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchCompanyInfo = useCallback(() => {
        setLoading(true);
        setError('');
        api.getCompanyInfo()
            .then(data => {
                if (data && data.companyName) {
                    setCompanyInfo(data);
                    setFormData(data);
                } else {
                    setCompanyInfo(null);
                    setFormData(initialFormData);
                }
            })
            .catch(err => {
                console.error("Error fetching company info:", err);
                setError('Failed to load company information.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchCompanyInfo();
    }, [fetchCompanyInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const savedData = await api.saveCompanyInfo(formData);
            setCompanyInfo(savedData);
            setFormData(savedData);
            setIsEditing(false);
            alert('Company information saved successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save company information.';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(companyInfo || initialFormData);
    };

    if (loading) {
        return <div className="flex justify-center items-center p-10"><Loader className="animate-spin text-blue-600" /></div>;
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm space-y-8">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Company Name" id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleChange} required />
                    <InputField label="Email" id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                    <InputField label="Phone" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                    <InputField label="Website" id="website" name="website" value={formData.website || ''} onChange={handleChange} />
                    <InputField label="Address" id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                    <InputField label="City" id="city" name="city" value={formData.city || ''} onChange={handleChange} />
                    <InputField label="State" id="state" name="state" value={formData.state || ''} onChange={handleChange} />
                    <InputField label="Postal Code" id="postalCode" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} />
                    <InputField label="Country" id="country" name="country" value={formData.country || ''} onChange={handleChange} />
                    <InputField label="PAN" id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} />
                    <InputField label="TAN" id="tan" name="tan" value={formData.tan || ''} onChange={handleChange} />
                    <InputField label="GSTIN" id="gstIn" name="gstIn" value={formData.gstIn || ''} onChange={handleChange} />
                    <InputField label="PF Registration No." id="pfRegistrationNumber" name="pfRegistrationNumber" value={formData.pfRegistrationNumber || ''} onChange={handleChange} />
                    <InputField label="ESI Registration No." id="esiRegistrationNumber" name="esiRegistrationNumber" value={formData.esiRegistrationNumber || ''} onChange={handleChange} />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <button type="button" onClick={handleCancel} className="btn-secondary" disabled={saving}>Cancel</button>
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                        {saving ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </form>
        );
    }

    if (!companyInfo) {
        return (
            <div className="text-center py-16 bg-card rounded-lg shadow-sm border-2 border-dashed border-border">
                <Building className="mx-auto h-12 w-12 text-foreground-muted/50" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No Company Information</h3>
                <p className="mt-1 text-sm text-foreground-muted">Get started by adding your company's details.</p>
                <div className="mt-6">
                    <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center mx-auto gap-2">
                        <PlusCircle size={16} /> Add Company Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-card rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-foreground">Company Profile</h3>
                <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                    <Edit size={16} /> Edit
                </button>
            </div>
            <div className="space-y-6">
                <Section title="General Information">
                    <InfoDisplay label="Company Name" value={companyInfo.companyName} />
                    <InfoDisplay label="Email" value={companyInfo.email} />
                    <InfoDisplay label="Phone" value={companyInfo.phone} />
                    <InfoDisplay label="Website" value={companyInfo.website} />
                </Section>
                <Section title="Address">
                    <InfoDisplay label="Address" value={companyInfo.address} />
                    <InfoDisplay label="City" value={companyInfo.city} />
                    <InfoDisplay label="State" value={companyInfo.state} />
                    <InfoDisplay label="Postal Code" value={companyInfo.postalCode} />
                    <InfoDisplay label="Country" value={companyInfo.country} />
                </Section>
                <Section title="Statutory Details">
                    <InfoDisplay label="PAN" value={companyInfo.pan} />
                    <InfoDisplay label="TAN" value={companyInfo.tan} />
                    <InfoDisplay label="GSTIN" value={companyInfo.gstIn} />
                    <InfoDisplay label="PF Registration No." value={companyInfo.pfRegistrationNumber} />
                    <InfoDisplay label="ESI Registration No." value={companyInfo.esiRegistrationNumber} />
                </Section>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="p-4 border border-border rounded-lg bg-background-muted">
        <h4 className="font-semibold mb-4 text-foreground-muted">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

export default CompanyInfo;
