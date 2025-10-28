import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground-muted">{label}</label>
        {children}
    </div>
);

const WorkstationFormPage = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ workstationName: '', workGroupId: '', employeeIds: [] });
    const [workGroups, setWorkGroups] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const [wgRes, empRes] = await Promise.all([
                    axios.get(`${API_URL}/production/work-groups`, { headers }),
                    axios.get(`${API_URL}/employees/all`, { headers }),
                ]);
                setWorkGroups(wgRes.data);
                setEmployees(empRes.data);
            } catch (err) {
                console.error("Failed to fetch data for form", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                workstationName: item.workstationName || '',
                workGroupId: item.workGroup?.id || '',
                employeeIds: item.employees?.map(emp => emp.id) || [],
            });
        }
    }, [item]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleEmployeeSelect = (selectedOption) => {
        const employeeId = selectedOption.value;
        setFormData(prev => ({
            ...prev,
            employeeIds: prev.employeeIds.includes(employeeId)
                ? prev.employeeIds.filter(id => id !== employeeId)
                : [...prev.employeeIds, employeeId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const employeeOptions = employees.map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})` }));

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-foreground">{item ? 'Edit Workstation' : 'Add New Workstation'}</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <FormField label="Workstation Name"><input name="workstationName" value={formData.workstationName} onChange={handleChange} required className="input bg-background-muted border-border" /></FormField>
                <FormField label="Work Group"><select name="workGroupId" value={formData.workGroupId} onChange={handleChange} required className="input bg-background-muted border-border"><option value="">Select Work Group</option>{workGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></FormField>
                <FormField label="Assign Employees"><SearchableSelect options={employeeOptions} selected={formData.employeeIds} onSelect={handleEmployeeSelect} placeholder="Search and select employees..." /></FormField>
                <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
            </form>
        </div>
    );
};

export default WorkstationFormPage;