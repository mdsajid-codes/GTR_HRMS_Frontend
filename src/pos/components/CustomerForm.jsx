import React, { useState } from 'react';
import { Loader } from 'lucide-react';

const CustomerForm = ({ onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input mt-1" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="input mt-1" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                <input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting && <Loader className="animate-spin h-4 w-4 mr-2" />}
                    Save Customer
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;