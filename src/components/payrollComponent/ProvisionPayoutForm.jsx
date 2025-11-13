import React, { useState, useEffect } from 'react';

const InputField = ({ label, id, type = 'text', ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <input id={id} type={type} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const SelectField = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <select id={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">{children}</select>
    </div>
);

const ProvisionPayoutForm = ({ provision, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        paidOutDate: new Date().toISOString().split('T')[0],
        paymentDetails: '',
        paymentMethod: 'BANK_TRANSFER',
        paidAmount: 0,
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (provision) {
            setFormData(prev => ({ ...prev, paidAmount: provision.accruedAmount || 0 }));
        }
    }, [provision]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files); // Handle multiple files
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        submissionData.append('payoutDetails', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        if (file && file.length > 0) {
            for (let i = 0; i < file.length; i++) { // Changed to 'files' to match backend
                submissionData.append('files', file[i]);
            }
        }
        onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Paid Out Date" name="paidOutDate" type="date" value={formData.paidOutDate} onChange={handleChange} required />
            <InputField label="Paid Amount" name="paidAmount" type="number" value={formData.paidAmount} onChange={handleChange} readOnly className="bg-slate-100" />
            <SelectField label="Payment Method" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="IN_KIND">In Kind (e.g., Ticket)</option>
            </SelectField>
            <InputField label="Payment Details / Remarks" name="paymentDetails" type="textarea" value={formData.paymentDetails} onChange={handleChange} required placeholder="e.g., Ticket booked on Emirates EK201" />
            <div>
                <label htmlFor="confirmationFile" className="block text-sm font-medium text-slate-700">Confirmation File (Optional)</label>
                {/* Add 'multiple' attribute to allow multiple file selection */}
                <input id="confirmationFile" name="file" type="file" onChange={handleFileChange} multiple className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm Payout</button>
            </div>
        </form>
    );
};

export default ProvisionPayoutForm;