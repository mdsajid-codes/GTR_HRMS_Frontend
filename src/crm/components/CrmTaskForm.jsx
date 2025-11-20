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

const CrmTaskForm = ({ item, onSave, onCancel, loading: isSubmitting, leadId }) => {
    const [formData, setFormData] = useState({
        subject: 'TASK', comments: '', dueDate: '', callTime: '',
        assignedToEmployeeId: '', employeeIds: [], contactIds: [], status: 'OPEN', leadId: leadId || null
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
                    axios.get(`${API_URL}/crm/contacts`, { headers }),
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
                subject: item.subject || 'TASK',
                comments: item.comments || '',
                dueDate: item.dueDate || '',
                callTime: item.callTime || '',
                assignedToEmployeeId: item.assignedToId || '',
                employeeIds: item.employees?.map(e => e.id) || [],
                contactIds: item.contacts?.map(c => c.id) || [],
                status: item.status || 'OPEN',
                leadId: item.leadId || leadId,
            });
        } else {
            // Reset for new item, ensuring leadId is set
            setFormData(prev => ({ ...prev, leadId }));
        }
    }, [item, leadId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormData(prev => ({ ...prev, [name]: value }));
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
                <h3 className="text-xl font-semibold text-foreground">{item ? 'Edit Task' : 'New Task'}</h3>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><X size={20} /></button>
            </header>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <FormField label="Subject" required>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="input bg-background-muted border-border">
                        <option value="TASK">Task</option>
                        <option value="CALL">Call</option>
                        <option value="EVENT">Event</option>
                        <option value="MEETING">Meeting</option>
                        <option value="OTHER">Other</option>
                    </select>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Due Date"><input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                    <FormField label="Time"><input type="time" name="callTime" value={formData.callTime} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                </div>

                <FormField label="Assigned To" required>
                    <select name="assignedToEmployeeId" value={formData.assignedToEmployeeId} onChange={handleChange} required className="input bg-background-muted border-border">
                        <option value="">Select Employee</option>
                        {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                </FormField>

                <FormField label="Additional Employees">
                    <select name="employeeIds" value={formData.employeeIds} onChange={handleMultiSelectChange} multiple className="input h-24 bg-background-muted border-border">
                        {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                </FormField>

                <FormField label="Related Contacts">
                    <select name="contactIds" value={formData.contactIds} onChange={handleMultiSelectChange} multiple className="input h-24 bg-background-muted border-border">
                        {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                </FormField>

                <FormField label="Status">
                    <select name="status" value={formData.status} onChange={handleChange} className="input bg-background-muted border-border">
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </FormField>

                <FormField label="Comments">
                    <textarea name="comments" value={formData.comments} onChange={handleChange} rows="4" className="input bg-background-muted border-border"></textarea>
                </FormField>
            </div>

            <footer className="p-4 bg-background-muted border-t flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Task
                </button>
            </footer>
        </form>
    );
};

export default CrmTaskForm;