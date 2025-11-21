import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Save, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-foreground-muted">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const CrmCallLogForm = ({ item, onSave, onCancel, loading: isSubmitting, leadId }) => {
    const [formData, setFormData] = useState({
        comments: '',
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().slice(0, 5),
        remindMeBefore: false,
        reminderTime: '',
        employeeId: '',
        contactId: '',
        leadId: leadId || null
    });

    const [selectData, setSelectData] = useState({ employees: [], contacts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [employeesRes, contactsRes] = await Promise.all([
                    axios.get(`${API_URL}/employees/all`, { headers }),
                    axios.get(`${API_URL}/contacts?size=200`, { headers }),
                ]);
                setSelectData({
                    employees: employeesRes.data,
                    contacts: contactsRes.data.content || contactsRes.data,
                });
            } catch (error) {
                console.error("Failed to fetch form select data", error);
                alert("Failed to load required data for the form.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                comments: item.comments || '',
                callDate: item.callDate || new Date().toISOString().split('T')[0],
                callTime: item.callTime || new Date().toTimeString().slice(0, 5),
                remindMeBefore: item.remindMeBefore || false,
                reminderTime: item.reminderTime || '',
                employeeId: item.employeeId || '',
                contactId: item.contactId || '',
                leadId: item.leadId || leadId,
            });
        } else {
            setFormData(prev => ({ ...prev, leadId }));
        }
    }, [item, leadId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, leadId });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card">
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">{item ? 'Edit Call Log' : 'Log a Call'}</h3>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><X size={20} /></button>
            </header>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <FormField label="Call Date" required><input type="date" name="callDate" value={formData.callDate} onChange={handleChange} required className="input bg-background-muted border-border" /></FormField>
                <FormField label="Call Time"><input type="time" name="callTime" value={formData.callTime} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                <FormField label="Assigned To (Caller)" required>
                    <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="input bg-background-muted border-border">
                        <option value="">Select Employee</option>
                        {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                </FormField>
                <FormField label="Related Contact (Optional)">
                    <select name="contactId" value={formData.contactId} onChange={handleChange} className="input bg-background-muted border-border">
                        <option value="">Select Contact</option>
                        {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                </FormField>
                <FormField label="Comments"><textarea name="comments" value={formData.comments} onChange={handleChange} rows="4" className="input bg-background-muted border-border"></textarea></FormField>
            </div>

            <footer className="p-4 bg-background-muted border-t flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Log
                </button>
            </footer>
        </form>
    );
};

export default CrmCallLogForm;