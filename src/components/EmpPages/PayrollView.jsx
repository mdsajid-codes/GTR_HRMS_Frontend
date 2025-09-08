import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Search, Loader } from 'lucide-react';

// --- Helper Functions & Components ---

const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A';

const statusStyles = {
    PROCESSED: { bg: 'bg-green-100', text: 'text-green-800' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
};

const PayrollHistoryCard = ({ payroll, onDownload, isDownloading }) => {
    const { id, payPeriodStart, netSalary, status, currency } = payroll;
    const displayStatus = status || 'PENDING';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">{formatDate(payPeriodStart)}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(netSalary, currency)}</p>
                <p className="text-sm text-slate-500">Net Salary</p>
            </div>
            <div className="flex flex-col sm:items-end gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[displayStatus]?.bg} ${statusStyles[displayStatus]?.text}`}>
                    {displayStatus.toLowerCase()}
                </span>
                <button
                    onClick={() => onDownload(id)}
                    disabled={isDownloading}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-slate-400"
                >
                    {isDownloading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    Download Payslip
                </button>
            </div>
        </div>
    );
};

const PayrollView = ({ employee }) => {
    const [payrolls, setPayrolls] = useState([]);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [downloadingId, setDownloadingId] = useState(null);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (employee?.payrolls) {
            // Sort by most recent first
            const sortedPayrolls = [...employee.payrolls].sort((a, b) => new Date(b.payPeriodStart) - new Date(a.payPeriodStart));
            setPayrolls(sortedPayrolls);
        }
    }, [employee]);

    const availableYears = useMemo(() => {
        if (!payrolls.length) return [new Date().getFullYear().toString()];
        const years = new Set(payrolls.map(p => new Date(p.payPeriodStart).getFullYear().toString()));
        return Array.from(years).sort((a, b) => b - a);
    }, [payrolls]);

    const filteredPayrolls = useMemo(() => {
        if (filterYear === 'all') return payrolls;
        return payrolls.filter(p => new Date(p.payPeriodStart).getFullYear().toString() === filterYear);
    }, [payrolls, filterYear]);

    const handleDownload = async (payrollId) => {
        setDownloadingId(payrollId);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payrolls/${payrollId}/payslip`, {
                headers: { "Authorization": `Bearer ${token}` },
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
            const errorMessage = 'Failed to download payslip. The record might not exist or an error occurred.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-slate-800">My Payroll</h1>
                <div>
                    <label htmlFor="year-filter" className="sr-only">Filter by Year</label>
                    <select id="year-filter" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full sm:w-40 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm">
                        <option value="all">All Years</option>
                        {availableYears.map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                </div>
            </div>

            {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>)}

            <div className="space-y-6">
                {filteredPayrolls.length > 0 ? (
                    filteredPayrolls.map(payroll => (<PayrollHistoryCard key={payroll.id} payroll={payroll} onDownload={handleDownload} isDownloading={downloadingId === payroll.id} />))
                ) : (
                    <div className="text-center text-slate-500 py-16 bg-white rounded-xl shadow-sm">
                        {payrolls.length > 0 ? (<><Search className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No Payroll Found</h3><p className="mt-1 text-sm text-slate-500">No records match your search for the year {filterYear}.</p></>) 
                        : (<><FileText className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No Payroll Data</h3><p className="mt-1 text-sm text-slate-500">Your payroll history will appear here.</p></>)}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PayrollView;
