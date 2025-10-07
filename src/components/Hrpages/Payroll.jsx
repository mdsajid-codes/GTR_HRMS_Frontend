import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Download, FileText, Loader, PlusCircle, Search } from 'lucide-react';
import axios from 'axios';

// --- Helper Components & Functions ---

const statusStyles = {
    PROCESSED: { bg: 'bg-green-100', text: 'text-green-800' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A';
const formatDateForInput = (dateString) => dateString ? dateString.split('T')[0] : '';

const formatCurrency = (amount, currency = 'AED') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-base font-medium text-slate-800">{value || 'N/A'}</p>
    </div>
);

const EditField = ({ label, name, value, onChange, type = 'text', options = [] }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        className: "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
            {type === 'select' ? (
                <select {...commonProps}>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : (
                <input {...commonProps} type={type} />
            )}
        </div>
    );
};

// --- PayrollCard Component ---

const PayrollCard = ({ payroll, isEditing, onEdit, onSave, onCancel, onChange, onDownload }) => {
    const { id, payPeriodStart, payPeriodEnd, status, grossSalary, netSalary, currency, payoutDate, basicSalary, allowances, deductions, taxAmount, remarks } = payroll;
    const displayStatus = status || 'PENDING';

    const payFrequencyOptions = [ { value: 'MONTHLY', label: 'Monthly' }, { value: 'ANNUALLY', label: 'Annually' } ];
    const statusOptions = [ { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSED', label: 'Processed' }, { value: 'FAILED', label: 'Failed' } ];

    return (
        <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                    {formatDate(payPeriodStart)} - {formatDate(payPeriodEnd)}
                </h3>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => onSave(id)} className="p-1.5 rounded-md hover:bg-green-100 text-green-600"><Check className="h-5 w-5" /></button>
                            <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-red-100 text-red-600"><X className="h-5 w-5" /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onDownload(id)} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500"><Download className="h-4 w-4" /></button>
                            <button onClick={() => onEdit(payroll)} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500"><Pencil className="h-4 w-4" /></button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                {isEditing ? (
                    <>
                        <EditField label="Gross Salary" name="grossSalary" value={payroll.grossSalary} onChange={onChange} type="number" />
                        <EditField label="Net Salary" name="netSalary" value={payroll.netSalary} onChange={onChange} type="number" />
                        <EditField label="Basic Salary" name="basicSalary" value={payroll.basicSalary} onChange={onChange} type="number" />
                        <EditField label="Allowances" name="allowances" value={payroll.allowances} onChange={onChange} type="number" />
                        <EditField label="Deductions" name="deductions" value={payroll.deductions} onChange={onChange} type="number" />
                        <EditField label="Tax Amount" name="taxAmount" value={payroll.taxAmount} onChange={onChange} type="number" />
                        <EditField label="Payout Date" name="payoutDate" value={formatDateForInput(payroll.payoutDate)} onChange={onChange} type="date" />
                        <EditField label="Status" name="status" value={payroll.status} onChange={onChange} type="select" options={statusOptions} />
                        <div className="sm:col-span-2 md:col-span-3">
                            <EditField label="Remarks" name="remarks" value={payroll.remarks} onChange={onChange} />
                        </div>
                    </>
                ) : (
                    <>
                        <InfoField label="Gross Salary" value={formatCurrency(grossSalary, currency)} />
                        <InfoField label="Net Salary" value={formatCurrency(netSalary, currency)} />
                        <InfoField label="Payout Date" value={payoutDate ? new Date(payoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'} />
                        <InfoField label="Basic Salary" value={formatCurrency(basicSalary, currency)} />
                        <InfoField label="Allowances" value={formatCurrency(allowances, currency)} />
                        <InfoField label="Deductions" value={formatCurrency(deductions, currency)} />
                        <InfoField label="Tax" value={formatCurrency(taxAmount, currency)} />
                        <div>
                            <p className="text-sm text-slate-500">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[displayStatus]?.bg} ${statusStyles[displayStatus]?.text}`}>
                                {displayStatus.toLowerCase()}
                            </span>
                        </div>
                        <div className="sm:col-span-2 md:col-span-3">
                            <InfoField label="Remarks" value={remarks} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Payroll Component ---

const Payroll = ({ employee }) => {
    const [payrolls, setPayrolls] = useState(employee?.payrolls || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchDate, setSearchDate] = useState('');    const [newPayrollData, setNewPayrollData] = useState({ payPeriodStart: '', payPeriodEnd: '', payFrequency: 'MONTHLY', grossSalary: 0, netSalary: 0, basicSalary: 0, allowances: 0, deductions: 0, taxAmount: 0, currency: 'AED', status: 'PENDING', remarks: '' });
    const [editingPayrollId, setEditingPayrollId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        setPayrolls(employee?.payrolls || []);
        setEditingPayrollId(null);
    }, [employee]);

    const handleEdit = (payroll) => {
        setEditingPayrollId(payroll.id);
        setFormData(payroll);
    };

    const handleCancel = () => {
        setEditingPayrollId(null);
        setFormData({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (payrollId) => {
        setLoading(true);
        setError('');
        try {
            await axios.put(`${API_URL}/payrolls/${employee.employeeCode}/${payrollId}`, formData, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            
            // Optimistic update of local state
            const updatedPayrolls = payrolls.map(p => 
                p.id === payrollId ? { ...p, ...formData } : p
            );
            setPayrolls(updatedPayrolls);
            alert(`Payroll ID ${payrollId} updated successfully!`);
            setEditingPayrollId(null);
        } catch (err) {
            console.error("Error updating payroll:", err);
            setError('Failed to update payroll. Please try again.');
            alert('Failed to update payroll.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (payrollId) => {
        try {
            const response = await axios.get(`${API_URL}/payrolls/${payrollId}/payslip`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = `payslip-${payrollId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading payslip:", err);
            alert('Failed to download payslip. The record might not exist or an error occurred.');
        }
    };

    const handleGenerateChange = (e) => {
        const { name, value } = e.target;
        setNewPayrollData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_URL}/payrolls/${employee.employeeCode}`, newPayrollData, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });

            const response = await axios.get(`${API_URL}/employees/${employee.employeeCode}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            setPayrolls(response.data.payrolls || []);

            alert('Payroll generated successfully!');
            setIsGenerating(false);
            setNewPayrollData({ payPeriodStart: '', payPeriodEnd: '', payFrequency: 'MONTHLY', grossSalary: 0, netSalary: 0, basicSalary: 0, allowances: 0, deductions: 0, taxAmount: 0, currency: 'AED', status: 'PENDING', remarks: '' });
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to generate payroll. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayrolls = payrolls.filter(payroll => 
        !searchDate || (payroll.payPeriodStart && payroll.payPeriodStart.startsWith(searchDate))
    );

    const statusOptions = [ { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSED', label: 'Processed' }, { value: 'FAILED', label: 'Failed' } ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <label htmlFor="searchDate" className="sr-only">Search by start date</label>
                    <input
                        id="searchDate"
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full sm:w-56 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-600"
                    />
                </div>
                <button onClick={() => setIsGenerating(true)} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Generate Payroll
                </button>
            </div>

            {loading && <div className="text-center"><Loader className="animate-spin h-6 w-6 mx-auto text-blue-600" /></div>}
            {error && <div className="text-center text-red-600 p-3 bg-red-50 rounded-md">{error}</div>}

            {isGenerating && (
                <div className="bg-slate-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3 mb-4">New Payroll Record</h3>
                    <form onSubmit={handleGenerateSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                        <EditField label="Pay Period Start" name="payPeriodStart" value={newPayrollData.payPeriodStart} onChange={handleGenerateChange} type="date" required />
                        <EditField label="Pay Period End" name="payPeriodEnd" value={newPayrollData.payPeriodEnd} onChange={handleGenerateChange} type="date" required />
                        <EditField label="Gross Salary" name="grossSalary" value={newPayrollData.grossSalary} onChange={handleGenerateChange} type="number" />
                        <EditField label="Net Salary" name="netSalary" value={newPayrollData.netSalary} onChange={handleGenerateChange} type="number" />
                        <EditField label="Basic Salary" name="basicSalary" value={newPayrollData.basicSalary} onChange={handleGenerateChange} type="number" />
                        <EditField label="Allowances" name="allowances" value={newPayrollData.allowances} onChange={handleGenerateChange} type="number" />
                        <EditField label="Deductions" name="deductions" value={newPayrollData.deductions} onChange={handleGenerateChange} type="number" />
                        <EditField label="Tax Amount" name="taxAmount" value={newPayrollData.taxAmount} onChange={handleGenerateChange} type="number" />
                        <EditField label="Currency" name="currency" value={newPayrollData.currency} onChange={handleGenerateChange} />
                        <EditField label="Status" name="status" value={newPayrollData.status} onChange={handleGenerateChange} type="select" options={statusOptions} />
                        <div className="sm:col-span-2 md:col-span-3">
                            <EditField label="Remarks" name="remarks" value={newPayrollData.remarks} onChange={handleGenerateChange} />
                        </div>
                        <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsGenerating(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {filteredPayrolls.length > 0 ? (
                filteredPayrolls.map(payroll => (
                    <PayrollCard
                        key={payroll.id}
                        payroll={editingPayrollId === payroll.id ? formData : payroll}
                        isEditing={editingPayrollId === payroll.id}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onChange={handleChange}
                        onDownload={handleDownload}
                    />
                ))
            ) : (
                payrolls.length > 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        <Search className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No Payroll Found</h3>
                        <p className="mt-1 text-sm text-slate-500">No records match your search criteria.</p>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 py-10">
                        <FileText className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No Payroll Data</h3>
                        <p className="mt-1 text-sm text-slate-500">There is no payroll history available for this employee.</p>
                    </div>
                )
            )}
        </div>
    );
}

export default Payroll;
