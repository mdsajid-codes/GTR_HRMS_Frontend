import React, { useState, useEffect } from 'react';
import { Loader, Save, UploadCloud } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No authentication token found.");
    return { "Authorization": `Bearer ${token}` };
};

const api = {
    getTenantInfo: async () => {
       const response = await axios.get(`${API_URL}/pos/tenant/current`, { headers: getAuthHeaders() });
        return response.data;
    },
    updateTenantInfo: async (data) => {
        const response = await axios.put(`${API_URL}/pos/tenant/current`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/pos/tenant/current/logo`, formData, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

const FormField = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1">{label}</label>
        {children}
    </div>
);

const ReadOnlyField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1">{label}</label>
        <div className="w-full p-2 bg-background-muted border border-border rounded-md text-foreground-muted">
            {value}
        </div>
    </div>
);

const TenantInfo = () => {
    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
    });
    const [staticData, setStaticData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await api.getTenantInfo();
                // Set editable fields
                setFormData({
                    name: data.name || '',
                    contactEmail: data.contactEmail,
                    contactPhone: data.contactPhone,
                    address: data.address || '',
                });
                setLogoPreview(data.logoImgUrl);
                // Set non-editable fields
                setStaticData({
                    id: data.id,
                });
            } catch (err) {
                console.error("Failed to fetch tenant info", error);
                setError('Failed to load tenant information.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.updateTenantInfo(formData);
            alert("Tenant information updated successfully!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to update tenant information.";
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile) {
            alert("Please select a logo file to upload.");
            return;
        }
        setUploading(true);
        setError('');
        try {
            const updatedTenant = await api.uploadLogo(logoFile);
            setLogoPreview(updatedTenant.logoImgUrl); // Update preview with the new final URL
            setLogoFile(null); // Clear the selected file
            alert("Logo updated successfully!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to upload logo.";
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-10"><Loader className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-6 bg-card rounded-lg shadow-sm space-y-8">
            {error && <div className="bg-red-500/10 text-red-700 p-3 rounded-md text-sm">{error}</div>}
            
            {/* Logo Section */}
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Company Logo</h3>
                <div className="flex items-center gap-6">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-20 w-20 object-contain rounded-md border p-1 bg-card" />
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-background-muted rounded-md text-foreground-muted text-sm">No Logo</div>
                    )}
                    <div className="flex-1">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        <button type="button" onClick={handleLogoUpload} className="btn-secondary mt-2 flex items-center gap-2" disabled={uploading || !logoFile}>
                            {uploading ? <Loader className="animate-spin h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
                            {uploading ? 'Uploading...' : 'Upload Logo'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <form onSubmit={handleSubmit} className="space-y-6 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField label="Database ID" value={staticData.id} />
                    <FormField label="Company Name"><input type="text" name="name" value={formData.name} onChange={handleChange} className="input bg-background-muted border-border text-foreground" /></FormField>
                    <FormField label="Primary Contact Email"><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="input bg-background-muted border-border text-foreground" /></FormField>
                    <FormField label="Primary Contact Phone"><input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="input bg-background-muted border-border text-foreground" /></FormField>
                    <FormField label="Address"><input type="text" name="address" value={formData.address} onChange={handleChange} className="input bg-background-muted border-border text-foreground" /></FormField>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                        {saving ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantInfo;