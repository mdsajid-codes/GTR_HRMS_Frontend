import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';

const InputField = ({ label, id, type = 'text', ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <input id={id} type={type} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const SelectField = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <select id={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            {children}
        </select>
    </div>
);

const EmployeeBenefitProvisionForm = ({ initialData, onSave, onCancel, employeeCode }) => {
    const [formData, setFormData] = useState(initialData || {
        benefitTypeId: '',
        cycleStartDate: '',
        cycleEndDate: '',
    });
    const [benefitTypes, setBenefitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchBenefitTypes = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/benefit-types`, { headers: { "Authorization": `Bearer ${token}` } });
                setBenefitTypes(response.data.filter(bt => bt.active));
            } catch (error) {
                console.error("Failed to fetch benefit types:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBenefitTypes();
    }, [API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, employeeCode });
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField label="Benefit Type" name="benefitTypeId" value={formData.benefitTypeId} onChange={handleChange} required>
                <option value="">Select a benefit</option>
                {benefitTypes.map(bt => (
                    <option key={bt.id} value={bt.id}>{bt.name}</option>
                ))}
            </SelectField>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Cycle Start Date" name="cycleStartDate" type="date" value={formData.cycleStartDate} onChange={handleChange} required />
                <InputField label="Cycle End Date" name="cycleEndDate" type="date" value={formData.cycleEndDate} onChange={handleChange} required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Provision</button>
            </div>
        </form>
    );
};

export default EmployeeBenefitProvisionForm;