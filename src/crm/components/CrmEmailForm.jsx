import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Send, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-foreground-muted">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const CrmEmailForm = ({ lead, onSave, onCancel, loading: isSubmitting }) => {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        ccAddress: '',
        leadId: lead?.id || null,
        sentByEmployeeId: '', // You should populate this with the logged-in user's employee ID
    });
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        // Fetch employees to populate the "Sent By" dropdown
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/employees/all`, { headers: { Authorization: `Bearer ${token}` } });
                setEmployees(res.data);
                // TODO: Set the default selected employee to the current logged-in user
            } catch (error) {
                console.error("Failed to fetch employees", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.sentByEmployeeId) {
            alert("Please select the sender.");
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card">
            <header className="p-4 border-b flex-shrink-0 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">Compose Email</h3>
                <button type="button" onClick={onCancel} className="p-1.5 rounded-full hover:bg-background-muted"><X size={20} /></button>
            </header>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div className="p-2 bg-background-muted rounded-md text-sm">
                    <span className="text-foreground-muted">To: </span>
                    <span className="font-medium text-foreground">{lead?.email || 'No recipient email'}</span>
                </div>
                <FormField label="CC">
                    <input type="email" name="ccAddress" value={formData.ccAddress} onChange={handleChange} placeholder="cc@example.com" className="input bg-background-muted border-border" />
                </FormField>
                <FormField label="Subject" required>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="input bg-background-muted border-border" />
                </FormField>
                <FormField label="Body" required>
                    <textarea name="body" value={formData.body} onChange={handleChange} required rows="10" className="input bg-background-muted border-border"></textarea>
                </FormField>
                <FormField label="Send As (Internal Tracker)" required>
                    <select name="sentByEmployeeId" value={formData.sentByEmployeeId} onChange={handleChange} required className="input bg-background-muted border-border">
                        <option value="">Select Your Name</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                </FormField>
            </div>

            <footer className="p-4 bg-background-muted border-t flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting || !lead?.email}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Email
                </button>
            </footer>
        </form>
    );
};

export default CrmEmailForm;