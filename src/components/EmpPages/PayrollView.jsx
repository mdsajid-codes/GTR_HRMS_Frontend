import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Download, FileText, Search, Loader, Landmark, HandCoins, Receipt, Edit, PlusCircle } from 'lucide-react';

// --- Helper Functions & Components ---

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

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value || <span className="text-slate-400">N/A</span>}</p>
    </div>
);

const formatCurrency = (amount, currency = 'AED') => {
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

const loanAndExpenseStatusStyles = {
    SUBMITTED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
    ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-800' },
    COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const PayrollHistoryCard = ({ payroll, onDownload, isDownloading }) => {
    const { id, payDate, netSalary, status, currency } = payroll;
    const displayStatus = status || 'PENDING';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">{formatDate(payDate)}</h3>
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

const PayslipsTab = ({ payrolls, onDownload, downloadingId }) => {
    const [filterYear, setFilterYear] = useState('all');

    const availableYears = useMemo(() => {
        if (!payrolls.length) return [new Date().getFullYear().toString()];
        const years = new Set(
            payrolls.map(p => new Date(p.payPeriodStart).getFullYear()).filter(year => !isNaN(year)).map(String)
        );
        return ['all', ...Array.from(years).sort((a, b) => b - a)];
    }, [payrolls]);

    const filteredPayrolls = useMemo(() => {
        if (filterYear === 'all') return payrolls;
        return payrolls.filter(p => new Date(p.payPeriodStart).getFullYear().toString() === filterYear);
    }, [payrolls, filterYear]);

    return (
        <div>
            <div className="flex justify-end mb-6">
                <select id="year-filter" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full sm:w-40 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm">
                    {availableYears.map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
            </div>
            <div className="space-y-6">
                {filteredPayrolls.length > 0 ? (
                    filteredPayrolls.map(payroll => (<PayrollHistoryCard key={payroll.id} payroll={payroll} onDownload={onDownload} isDownloading={downloadingId === payroll.id} />))
                ) : (
                    <div className="text-center text-slate-500 py-16 bg-slate-50 rounded-xl">
                        {payrolls.length > 0 ? (<><Search className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No Payroll Found</h3><p className="mt-1 text-sm text-slate-500">No records match your search for the year {filterYear}.</p></>)
                            : (<><FileText className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No Payroll Data</h3><p className="mt-1 text-sm text-slate-500">Your payroll history will appear here.</p></>)}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Bank Account Tab ---
const BankAccountTab = ({ employee }) => {
    const [account, setAccount] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const initialFormData = { bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', primary: true };
    const [formData, setFormData] = useState(initialFormData);

    const fetchAccount = useCallback(() => {
        if (!employee?.employeeCode) return;
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/employee-bank-accounts/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setAccount(response.data);
                setFormData(response.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    setAccount(null);
                    setFormData(initialFormData);
                } else {
                    setError('Failed to load bank account details.');
                }
            })
            .finally(() => setLoading(false));
    }, [API_URL, employee?.employeeCode]);

    useEffect(() => { fetchAccount(); }, [fetchAccount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaveLoading(true);
        const token = localStorage.getItem('token');
        axios.put(`${API_URL}/employee-bank-accounts/${employee.employeeCode}`, formData, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setAccount(response.data);
                setFormData(response.data);
                setIsEditing(false);
                alert('Bank account details saved successfully!');
            })
            .catch(err => {
                alert(err.response?.data?.message || 'Failed to save bank account details.');
            })
            .finally(() => setSaveLoading(false));
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>;

    if (!isEditing && !account) {
        return (
            <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg">
                <h3 className="text-sm font-medium text-slate-900">No Bank Account Found</h3>
                <p className="mt-1 text-sm text-slate-500">Add your bank account details for salary processing.</p>
                <div className="mt-6">
                    <button onClick={() => setIsEditing(true)} className="btn-primary">Add Account Details</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Bank Account for Salary</h2>
            {!isEditing && (
                <div className="flex justify-end mb-4">
                    <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2"><Edit size={16} /> Edit</button>
                </div>
            )}
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required />
                    <InputField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required />
                    <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
                    <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required />
                    <div className="flex items-center">
                        <input type="checkbox" id="isPrimary" name="primary" checked={formData.primary} onChange={handleChange} className="h-4 w-4" />
                        <label htmlFor="isPrimary" className="ml-2 text-sm">This is my primary account</label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" disabled={saveLoading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={saveLoading}>
                            {saveLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4 max-w-lg">
                    <InfoDisplay label="Bank Name" value={account.bankName} />
                    <InfoDisplay label="Account Holder Name" value={account.accountHolderName} />
                    <InfoDisplay label="Account Number" value={account.accountNumber} />
                    <InfoDisplay label="IFSC Code" value={account.ifscCode} />
                    <InfoDisplay label="Primary Account" value={account.primary ? 'Yes' : 'No'} />
                </div>
            )}
        </div>
    );
};

// --- Loans Tab ---
const LoanRequestModal = ({ isOpen, onClose, employeeCode, onLoanRequested }) => {
    const [loanProducts, setLoanProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        loanProductId: '',
        requestedAmount: '',
        installments: '',
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            axios.get(`${API_URL}/loan-products`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => {
                    const activeProducts = res.data.filter(p => p.active);
                    setLoanProducts(activeProducts);
                    if (activeProducts.length > 0) {
                        setFormData(prev => ({ ...prev, loanProductId: activeProducts[0].id }));
                    }
                })
                .catch(() => setError('Could not load available loan products.'))
                .finally(() => setLoading(false));
        }
    }, [isOpen, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                employeeCode,
                requestedAmount: parseFloat(formData.requestedAmount),
                installments: parseInt(formData.installments, 10),
            };
            await axios.post(`${API_URL}/employee-loans/request`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            alert('Loan request submitted successfully!');
            onLoanRequested();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit loan request.');
        } finally {
            setSubmitLoading(false);
        }
    };
    
    const selectedProduct = loanProducts.find(p => p.id == formData.loanProductId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request a New Loan">
            {loading ? (
                <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Loan Type"
                        id="loanProductId"
                        name="loanProductId"
                        type="select"
                        value={formData.loanProductId}
                        onChange={handleChange}
                        required
                    >
                        {loanProducts.length > 0 ? (
                            loanProducts.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)
                        ) : (
                            <option disabled>No loan products available</option>
                        )}
                    </InputField>
                    
                    {selectedProduct && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            Max Amount: {formatCurrency(selectedProduct.maxLoanAmount)} | Max Installments: {selectedProduct.maxInstallments} | Interest: {selectedProduct.interestRate}%
                        </div>
                    )}

                    <InputField
                        label="Amount Requested"
                        id="requestedAmount"
                        name="requestedAmount"
                        type="number"
                        value={formData.requestedAmount}
                        onChange={handleChange}
                        required
                        max={selectedProduct?.maxLoanAmount}
                    />
                    <InputField
                        label="Number of Installments"
                        id="installments"
                        name="installments"
                        type="number"
                        value={formData.installments}
                        onChange={handleChange}
                        required
                        max={selectedProduct?.maxInstallments}
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={submitLoading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={submitLoading || !selectedProduct}>
                            {submitLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Submit Request
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

const LoansTab = ({ employee }) => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchLoans = useCallback(() => {
        if (!employee?.employeeCode) return;
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/employee-loans/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setLoans(res.data))
            .catch(() => setError('Could not fetch loan history.'))
            .finally(() => setLoading(false));
    }, [API_URL, employee?.employeeCode]);

    useEffect(() => { fetchLoans(); }, [fetchLoans]);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Loans</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> Request New Loan
                </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">EMI</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Installments</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Requested On</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                        {loans.length > 0 ? loans.map(loan => (
                            <tr key={loan.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{loan.loanProductName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(loan.loanAmount)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(loan.emiAmount)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{loan.remainingInstallments}/{loan.totalInstallments}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${loanAndExpenseStatusStyles[loan.status]?.bg || 'bg-slate-100'} ${loanAndExpenseStatusStyles[loan.status]?.text || 'text-slate-800'}`}>
                                        {loan.status.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(loan.requestedAt).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-10 text-slate-500">No loan history found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <LoanRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                employeeCode={employee.employeeCode}
                onLoanRequested={fetchLoans}
            />
        </>
    );
};

// --- Expenses Tab ---
const ExpenseRequestModal = ({ isOpen, onClose, employeeCode, onExpenseSubmitted }) => {
    const [formData, setFormData] = useState({
        expenseDate: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        description: '',
        receiptPath: '',
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                employeeCode,
                amount: parseFloat(formData.amount),
            };
            await axios.post(`${API_URL}/expenses`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            alert('Expense submitted successfully!');
            onExpenseSubmitted();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit expense.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit New Expense">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Expense Date" id="expenseDate" name="expenseDate" type="date" value={formData.expenseDate} onChange={handleChange} required />
                    <InputField label="Category" id="category" name="category" type="text" value={formData.category} onChange={handleChange} required placeholder="e.g., Travel, Food" />
                </div>
                <InputField label="Amount" id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required placeholder="e.g., 1500.50" />
                <InputField label="Description" id="description" name="description" type="text" value={formData.description} onChange={handleChange} required />
                <InputField label="Receipt Path/URL (Optional)" id="receiptPath" name="receiptPath" type="text" value={formData.receiptPath} onChange={handleChange} placeholder="e.g., https://example.com/receipt.pdf" />
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary" disabled={submitLoading}>Cancel</button>
                    <button type="submit" className="btn-primary flex items-center" disabled={submitLoading}>
                        {submitLoading && <Loader className="animate-spin h-4 w-4 mr-2" />} Submit Expense
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ExpensesTab = ({ employee }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchExpenses = useCallback(() => {
        if (!employee?.employeeCode) return;
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/expenses/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setExpenses(res.data))
            .catch(() => setError('Could not fetch expense history.'))
            .finally(() => setLoading(false));
    }, [API_URL, employee?.employeeCode]);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Expenses</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> Submit New Expense
                </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                        {expenses.length > 0 ? expenses.map(exp => (
                            <tr key={exp.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{exp.category}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(exp.amount)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm truncate max-w-xs">{exp.description}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${loanAndExpenseStatusStyles[exp.status]?.bg || 'bg-slate-100'} ${loanAndExpenseStatusStyles[exp.status]?.text || 'text-slate-800'}`}>
                                        {exp.status.toLowerCase()}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-10 text-slate-500">No expense claims found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ExpenseRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                employeeCode={employee.employeeCode}
                onExpenseSubmitted={fetchExpenses}
            />
        </>
    );
};

const subTabs = [
    { name: 'Payslips', icon: FileText, component: PayslipsTab },
    { name: 'Bank Account', icon: Landmark, component: BankAccountTab },
    { name: 'Loans', icon: HandCoins, component: LoansTab },
    { name: 'Expenses', icon: Receipt, component: ExpensesTab },
];

const PayrollView = ({ employee, setActiveItem }) => {
    const [activeSubTab, setActiveSubTab] = useState('Payslips');
    const [payrolls, setPayrolls] = useState([]);
    const [downloadingId, setDownloadingId] = useState(null);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchPayslips = async () => {
            if (employee?.employeeCode) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/payslips/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } });
                    setPayrolls(response.data);
                } catch (err) { setError("Could not load your payslip history."); }
            }
        };
        fetchPayslips();
    }, [employee]);

    const handleDownload = async (payrollId) => {
        setDownloadingId(payrollId);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payslips/${payrollId}/download`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = `payslip-${payrollId}.pdf`;
            if (contentDisposition) {
                // More robust regex to handle quoted and unquoted filenames
                const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/);
                if (filenameMatch && filenameMatch[1])
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

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    const renderContent = () => {
        if (!ActiveComponent) return null;
        if (activeSubTab === 'Payslips') {
            return <PayslipsTab payrolls={payrolls} onDownload={handleDownload} downloadingId={downloadingId} />;
        }
        return <ActiveComponent employee={employee} />;
    };

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Payroll</h1>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Sub-tabs">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveSubTab(tab.name)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeSubTab === tab.name
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>)}

            <div>{renderContent()}</div>
        </div>
    );
}

export default PayrollView;
