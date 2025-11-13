import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, Calculator, Download, AlertCircle } from 'lucide-react';

const InputField = ({ label, id, type = 'text', children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        {type === 'select' ? (
            <select id={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                {children}
            </select>
        ) : (
            <input id={id} type={type} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
        )}
    </div>
);

const InfoDisplay = ({ label, value, isCurrency = false }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{isCurrency ? formatCurrency(value) : (value || <span className="text-slate-400">N/A</span>)}</p>
    </div>
);

const formatCurrency = (amount, currency = 'AED') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

const EndOfServiceTab = ({ employee }) => {
    const [eosDetails, setEosDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [formData, setFormData] = useState({
        lastWorkingDay: '',
        terminationReason: 'RESIGNATION',
    });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchEosDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/eos/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } });
            setEosDetails(response.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setEosDetails(null); // No record found, which is a valid state
            } else {
                setError('Failed to fetch End of Service details.');
            }
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode, API_URL]);

    useEffect(() => {
        fetchEosDetails();
    }, [fetchEosDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setIsCalculating(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/eos/calculate/${employee.employeeCode}`, formData, { headers: { "Authorization": `Bearer ${token}` } });
            setEosDetails(response.data);
            alert('Gratuity calculated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to calculate gratuity.');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/eos/download-settlement/${employee.employeeCode}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Final-Settlement-${employee.employeeCode}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download settlement PDF.');
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-slate-50">
                <h3 className="text-lg font-semibold mb-4">Calculate Final Settlement</h3>
                <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <InputField label="Last Working Day" name="lastWorkingDay" type="date" value={formData.lastWorkingDay} onChange={handleChange} required />
                    <InputField label="Reason for Leaving" name="terminationReason" type="select" value={formData.terminationReason} onChange={handleChange} required>
                        <option value="RESIGNATION">Resignation</option>
                        <option value="TERMINATION">Termination</option>
                        <option value="REDUNDANCY">Redundancy</option>
                        <option value="TERMINATION_FOR_CAUSE">Termination for Cause</option>
                    </InputField>
                    <button type="submit" className="btn-primary h-10 flex items-center justify-center" disabled={isCalculating}>
                        {isCalculating ? <Loader className="animate-spin h-5 w-5" /> : <Calculator className="h-5 w-5 mr-2" />}
                        {eosDetails ? 'Re-calculate' : 'Calculate'}
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {eosDetails ? (
                <div className="p-6 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Settlement Details</h3>
                        <button onClick={handleDownload} className="btn-secondary flex items-center gap-2"><Download size={16} /> Download Statement</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoDisplay label="Joining Date" value={new Date(eosDetails.joiningDate).toLocaleDateString()} />
                        <InfoDisplay label="Last Working Day" value={new Date(eosDetails.lastWorkingDay).toLocaleDateString()} />
                        <InfoDisplay label="Years of Service" value={eosDetails.totalYearsOfService.toFixed(2)} />
                        <InfoDisplay label="Last Basic Salary" value={eosDetails.lastBasicSalary} isCurrency />
                        <div className="md:col-span-3 p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-sm text-blue-800 font-medium">Calculated Gratuity Amount</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(eosDetails.gratuityAmount)}</p>
                        </div>
                        <div className="md:col-span-3">
                            <p className="text-sm text-slate-500">Calculation Details</p>
                            <p className="font-mono text-xs bg-slate-100 p-3 rounded mt-1">{eosDetails.calculationDetails}</p>
                        </div>
                        <InfoDisplay label="Paid Status" value={eosDetails.paid ? `Paid on ${new Date(eosDetails.paymentDate).toLocaleDateString()}` : 'Unpaid'} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <AlertCircle className="mx-auto h-10 w-10 text-slate-400" />
                    <h4 className="mt-2 text-sm font-medium text-slate-900">No Settlement Calculated</h4>
                    <p className="mt-1 text-sm text-slate-500">Use the form above to calculate the final settlement for this employee.</p>
                </div>
            )}
        </div>
    );
};

export default EndOfServiceTab;