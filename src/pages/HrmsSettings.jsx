import React, { useState } from 'react';
import { Building2, Briefcase, ChevronDown, Loader } from 'lucide-react';
import axios from 'axios';
import Button from '../components/Button';
import MasterAdmin, { MasterAdminHeader } from './MasterAdmin'; // Reusing header from MasterAdmin

const HrmsSettings = () => {
    const [formData, setFormData] = useState({
        tenantId: '',
        companyName: '',
        adminEmail: '',
        adminPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        let tenantIdToProvision = formData.tenantId;
        if (!tenantIdToProvision.toLowerCase().startsWith('hrms-')) {
            tenantIdToProvision = `hrms-${tenantIdToProvision}`;
        }

        const provisionRequest = {
            ...formData,
            tenantId: tenantIdToProvision,
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/master/tenants/provision`, provisionRequest, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setSuccess(`Tenant "${tenantIdToProvision}" has been provisioned successfully!`);
            setFormData({
                tenantId: '',
                companyName: '',
                adminEmail: '',
                adminPassword: '',
            });
        } catch (err) {
            console.error('Tenant provisioning failed:', err);
            if (err.response) {
                setError(err.response.data.message || `Failed to provision tenant. The ID "${tenantIdToProvision}" might already be taken.`);
            } else if (err.request) {
                setError('No response from server. Please check your network connection.');
            } else {
                setError('Failed to submit provisioning request. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <MasterAdminHeader />
            <main className="p-6 md:p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Provision New HRMS Tenant</h1>
                    <p className="text-slate-500 mb-6">Directly create a new tenant for the HRMS system.</p>

                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <InputField label="Tenant ID" name="tenantId" value={formData.tenantId} onChange={handleChange} placeholder="e.g., acme-corp (will become hrms-acme-corp)" required />
                            <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g., Acme Corporation" required />
                            <InputField label="Admin Email" name="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} placeholder="e.g., admin@acme.com" required />
                            <InputField label="Admin Password" name="adminPassword" type="password" value={formData.adminPassword} onChange={handleChange} placeholder="A secure password for the tenant admin" required />

                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                            {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="justify-center" disabled={isLoading}>
                                    {isLoading ? <><Loader className="animate-spin h-5 w-5 mr-3" /> Provisioning...</> : <><Building2 className="h-5 w-5 mr-2" /> Provision Tenant</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

const InputField = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input id={props.name} {...props} className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm" />
    </div>
);

const SelectField = ({ label, children, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative mt-1">
            <Briefcase className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select id={props.name} {...props} className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm">
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
    </div>
);

export default HrmsSettings;
