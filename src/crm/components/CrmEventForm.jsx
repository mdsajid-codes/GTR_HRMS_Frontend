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

const CrmEventForm = ({ item, onSave, onCancel, loading: isSubmitting, leadId }) => {
    const [formData, setFormData] = useState({
        subject: 'MEETING', description: '', sameStartEnd: false, date: '', fromTime: '', toTime: '',
        primaryContactId: '', employeeIds: [], contactIds: [],
        status: 'OPEN', priority: 'NORMAL', meetingType: 'ONLINE', meetingWith: '', leadId: leadId || null
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
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                subject: item.subject || 'MEETING',
                description: item.description || '',
                sameStartEnd: item.sameStartEnd || false,
                date: item.date || '',
                fromTime: item.fromTime || '',
                toTime: item.toTime || '',
                primaryContactId: item.primaryContactId || '',
                employeeIds: item.employeeIds || [],
                contactIds: item.contactIds || [],
                status: item.status || 'OPEN',
                priority: item.priority || 'NORMAL',
                meetingType: item.meetingType || 'ONLINE',
                meetingWith: item.meetingWith || '',
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
                <h3 className="text-xl font-semibold text-foreground">{item ? 'Edit Event' : 'New Event'}</h3>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><X size={20} /></button>
            </header>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <FormField label="Subject" required>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="input bg-background-muted border-border">
                        <option value="MEETING">Meeting</option>
                        <option value="CALL">Call</option>
                        <option value="EVENT">Event</option>
                        <option value="TASK">Task</option>
                        <option value="OTHER">Other</option>
                    </select>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Date" required><input type="date" name="date" value={formData.date} onChange={handleChange} required className="input bg-background-muted border-border" /></FormField>
                    <FormField label="From Time" required><input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} required className="input bg-background-muted border-border" /></FormField>
                    <FormField label="To Time"><input type="time" name="toTime" value={formData.toTime} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                    <FormField label="Priority">
                        <select name="priority" value={formData.priority} onChange={handleChange} className="input bg-background-muted border-border">
                            <option value="NORMAL">Normal</option>
                            <option value="LOW">Low</option>
                            <option value="HIGH">High</option>
                        </select>
                    </FormField>
                </div>

                {formData.subject === 'MEETING' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Meeting Type">
                            <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="input bg-background-muted border-border">
                                <option value="ONLINE">Online</option>
                                <option value="ONSITE">On-site</option>
                            </select>
                        </FormField>
                        <FormField label="Meeting Link/Location">
                            <input name="meetingWith" value={formData.meetingWith} onChange={handleChange} className="input bg-background-muted border-border" placeholder="e.g., Google Meet Link or Address" />
                        </FormField>
                    </div>
                )}

                <FormField label="Primary Contact">
                    <select name="primaryContactId" value={formData.primaryContactId} onChange={handleChange} className="input bg-background-muted border-border">
                        <option value="">Select Contact</option>
                        {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                </FormField>

                <FormField label="Participating Employees">
                    <select name="employeeIds" value={formData.employeeIds} onChange={handleMultiSelectChange} multiple className="input h-24 bg-background-muted border-border">
                        {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                </FormField>

                <FormField label="Additional Contacts">
                    <select name="contactIds" value={formData.contactIds} onChange={handleMultiSelectChange} multiple className="input h-24 bg-background-muted border-border">
                        {selectData.contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                </FormField>

                <FormField label="Description">
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="input bg-background-muted border-border"></textarea>
                </FormField>
            </div>

            <footer className="p-4 bg-background-muted border-t flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Event
                </button>
            </footer>
        </form>
    );
};

export default CrmEventForm;