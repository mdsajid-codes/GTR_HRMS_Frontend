import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Scale, Handshake, Play, Loader, Edit, Trash2, PlusCircle, Layers } from 'lucide-react';
import axios from 'axios';

// --- Helper Components ---
const InputField = ({ label, id, type = 'text', children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        {type === 'select' ? (
            <select id={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                {children}
            </select>
        ) : type === 'textarea' ? (
            <textarea id={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
        ) : (
            <input id={id} type={type} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
        )}
    </div>
);

const CheckboxField = ({ label, id, ...props }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" {...props} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
        <label htmlFor={id} className="ml-2 block text-sm text-slate-900">{label}</label>
    </div>
);

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

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value || <span className="text-slate-400">N/A</span>}</p>
    </div>
);

// --- General Settings Tab ---
const GeneralSettingsTab = () => {
    const [settings, setSettings] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    const initialFormData = {
        payFrequency: 'MONTHLY', payCycleDay: 1, payslipGenerationDay: 25,
        includeHolidaysInPayslip: false, includeLeaveBalanceInPayslip: false,
    };
    const [formData, setFormData] = useState(initialFormData);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchSettings = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/payroll-settings`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                if (response.data && response.data.payFrequency) {
                    setSettings(response.data);
                    setFormData(response.data);
                } else {
                    setSettings(null);
                    setFormData(initialFormData);
                }
            })
            .catch(error => console.error("Error fetching payroll settings:", error))
            .finally(() => setLoading(false));
    }, [API_URL]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaveLoading(true);
        const token = localStorage.getItem('token');
        axios.post(`${API_URL}/payroll-settings`, formData, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setSettings(response.data);
                setFormData(response.data);
                setIsEditing(false);
                alert('Payroll settings saved successfully!');
            })
            .catch(error => {
                console.error("Error saving settings:", error);
                alert('Failed to save settings.');
            })
            .finally(() => setSaveLoading(false));
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (isEditing || !settings) {
        return (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                {!settings && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
                        <h3 className="text-sm font-medium text-slate-900">No Payroll Settings Found</h3>
                        <p className="mt-1 text-sm text-slate-500">Configure your payroll settings for the first time.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Pay Frequency" as="select" name="payFrequency" value={formData.payFrequency} onChange={handleChange}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="BI_WEEKLY">Bi-Weekly</option>
                        <option value="WEEKLY">Weekly</option>
                    </InputField>
                    <InputField label="Pay Cycle Day (e.g., 1 for 1st of month)" name="payCycleDay" type="number" value={formData.payCycleDay} onChange={handleChange} min="1" max="31" />
                    <InputField label="Payslip Generation Day" name="payslipGenerationDay" type="number" value={formData.payslipGenerationDay} onChange={handleChange} min="1" max="31" />
                </div>
                <div className="space-y-4">
                     <CheckboxField label="Include holidays in payslip" name="includeHolidaysInPayslip" checked={formData.includeHolidaysInPayslip} onChange={handleChange} />
                     <CheckboxField label="Include leave balance in payslip" name="includeLeaveBalanceInPayslip" checked={formData.includeLeaveBalanceInPayslip} onChange={handleChange} />
                </div>
                <div className="flex justify-end gap-2">
                    {settings && <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" disabled={saveLoading}>Cancel</button>}
                    <button type="submit" className="btn-primary flex items-center" disabled={saveLoading}>
                        {saveLoading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                        Save Settings
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2"> <Edit size={16} /> Edit </button>
            </div>
            <div className="space-y-6 max-w-2xl">
                <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-4">Payroll Cycle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoDisplay label="Pay Frequency" value={settings.payFrequency} />
                        <InfoDisplay label="Pay Cycle Day" value={settings.payCycleDay} />
                        <InfoDisplay label="Payslip Generation Day" value={settings.payslipGenerationDay} />
                    </div>
                </div>
                <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-4">Payslip Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoDisplay label="Include Holidays" value={settings.includeHolidaysInPayslip ? 'Yes' : 'No'} />
                        <InfoDisplay label="Include Leave Balance" value={settings.includeLeaveBalanceInPayslip ? 'Yes' : 'No'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CRUD Factory and Forms ---
const CrudTable = ({ title, columns, data, onAdd, onEdit, onDelete, addLabel }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onAdd} className="flex items-center gap-2 btn-secondary"> <PlusCircle size={16} /> {addLabel} </button>
        </div>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map(col => <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{col.header}</th>)}
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                    {data.map(item => (
                        <tr key={item.id}>
                            {columns.map(col => <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">{typeof item[col.key] === 'boolean' ? (item[col.key] ? 'Yes' : 'No') : item[col.key]}</td>)}
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={16} /></button>
                                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const createCrudTab = (config) => () => {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchItems = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}${config.endpoints.getAll}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setItems(res.data))
            .catch(err => console.error(`Error fetching ${config.name}:`, err))
            .finally(() => setLoading(false));
    }, [config.endpoints.getAll, config.name, API_URL]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete this ${config.singularName}?`)) {
            const token = localStorage.getItem('token');
            axios.delete(`${API_URL}${config.endpoints.delete}/${id}`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(() => fetchItems())
                .catch(err => console.error(`Error deleting ${config.singularName}:`, err));
        }
    };

    const handleSave = (data) => {
        const token = localStorage.getItem('token');
        const request = data.id
            ? axios.put(`${API_URL}${config.endpoints.update}/${data.id}`, data, { headers: { "Authorization": `Bearer ${token}` } })
            : axios.post(`${API_URL}${config.endpoints.create}`, data, { headers: { "Authorization": `Bearer ${token}` } });

        request.then(() => { fetchItems(); setIsModalOpen(false); })
            .catch(err => { console.error(`Error saving ${config.singularName}:`, err); alert(`Failed to save ${config.singularName}.`); });
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    return (
        <>
            <CrudTable title={config.title} columns={config.columns} data={items} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addLabel={config.addLabel} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit ${config.singularName}` : `Add ${config.singularName}`}>
                <config.FormComponent initialData={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </>
    );
};

const SalaryComponentForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        code: '',
        type: 'EARNING',
        calculationType: 'FLAT_AMOUNT',
        formula: '',
        taxable: true,
        partOfGrossSalary: true,
        displayOrder: 0
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Component Name" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Code" name="code" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Type" name="type" type="select" value={formData.type} onChange={handleChange} required>
                    <option value="EARNING">Earning</option>
                    <option value="DEDUCTION">Deduction</option>
                </InputField>
                <InputField label="Calculation Type" name="calculationType" type="select" value={formData.calculationType} onChange={handleChange} required>
                    <option value="FLAT_AMOUNT">Flat Amount</option>
                    <option value="PERCENTAGE_OF_BASIC">Percentage of Basic</option>
                    <option value="PERCENTAGE_OF_GROSS">Percentage of Gross</option>
                    <option value="FORMULA_BASED">Formula Based</option>
                </InputField>
            </div>
            {formData.calculationType === 'FORMULA_BASED' && (
                <InputField label="Formula" name="formula" type="textarea" rows="3" value={formData.formula} onChange={handleChange} placeholder="e.g., (basic * 0.4)" />
            )}
            <InputField label="Display Order" name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} />
            <div className="flex gap-6">
                <CheckboxField label="Taxable" id="taxable" name="taxable" checked={formData.taxable} onChange={handleChange} />
                <CheckboxField label="Part of Gross Salary" id="partOfGrossSalary" name="partOfGrossSalary" checked={formData.partOfGrossSalary} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Component</button>
            </div>
        </form>
    );
};

const StatutoryRuleForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { ruleName: '', description: '', employeeContributionRate: 0, employerContributionRate: 0, contributionCap: 0, taxSlabsJson: '', active: true });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Rule Name" name="ruleName" value={formData.ruleName} onChange={handleChange} required />
            <InputField label="Description" name="description" value={formData.description} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Employee Rate (%)" name="employeeContributionRate" type="number" step="0.01" value={formData.employeeContributionRate} onChange={handleChange} />
                <InputField label="Employer Rate (%)" name="employerContributionRate" type="number" step="0.01" value={formData.employerContributionRate} onChange={handleChange} />
            </div>
            <InputField label="Contribution Cap" name="contributionCap" type="number" value={formData.contributionCap} onChange={handleChange} />
            <InputField label="Tax Slabs (JSON)" name="taxSlabsJson" type="textarea" rows="4" value={formData.taxSlabsJson} onChange={handleChange} />
            <CheckboxField label="Active" id="statutoryActive" name="active" checked={formData.active} onChange={handleChange} />
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Rule</button>
            </div>
        </form>
    );
};

const LoanProductForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { productName: '', description: '', interestRate: 0, maxInstallments: 0, maxLoanAmount: 0, active: true, availabilityStartDate: '', availabilityEndDate: '', deductFromSalary: true });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Product Name" name="productName" value={formData.productName} onChange={handleChange} required />
            <InputField label="Description" name="description" value={formData.description} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Interest Rate (%)" name="interestRate" type="number" step="0.01" value={formData.interestRate} onChange={handleChange} />
                <InputField label="Max Installments" name="maxInstallments" type="number" value={formData.maxInstallments} onChange={handleChange} />
            </div>
            <InputField label="Max Loan Amount" name="maxLoanAmount" type="number" value={formData.maxLoanAmount} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Availability Start Date" name="availabilityStartDate" type="date" value={formData.availabilityStartDate || ''} onChange={handleChange} />
                <InputField label="Availability End Date" name="availabilityEndDate" type="date" value={formData.availabilityEndDate || ''} onChange={handleChange} />
            </div>
            <div className="flex gap-6">
                <CheckboxField label="Active" id="loanActive" name="active" checked={formData.active} onChange={handleChange} />
                <CheckboxField label="Deduct from Salary" id="deductFromSalary" name="deductFromSalary" checked={formData.deductFromSalary} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
            </div>
        </form>
    );
};

const StatutoryRulesTab = createCrudTab({
    name: 'statutory rules', singularName: 'rule', title: 'Statutory Rules', addLabel: 'Add Rule',
    columns: [
        { header: 'Rule Name', key: 'ruleName' },
        { header: 'Employee Rate', key: 'employeeContributionRate' },
        { header: 'Employer Rate', key: 'employerContributionRate' },
        { header: 'Active', key: 'active' },
    ],
    endpoints: { getAll: '/statutory-rules', create: '/statutory-rules', update: '/statutory-rules', delete: '/statutory-rules' },
    FormComponent: StatutoryRuleForm,
});

const SalaryComponentsTab = createCrudTab({
    name: 'salary components',
    singularName: 'component',
    title: 'Salary Components',
    addLabel: 'Add Component',
    columns: [
        { header: 'Name', key: 'name' },
        { header: 'Code', key: 'code' },
        { header: 'Type', key: 'type' },
        { header: 'Calc Type', key: 'calculationType' },
        { header: 'Taxable', key: 'taxable' },
    ],
    endpoints: { getAll: '/salary-components', create: '/salary-components', update: '/salary-components', delete: '/salary-components' },
    FormComponent: SalaryComponentForm,
});

const LoanProductsTab = createCrudTab({
    name: 'loan products', singularName: 'product', title: 'Loan Products', addLabel: 'Add Product',
    columns: [
        { header: 'Product Name', key: 'productName' },
        { header: 'Interest Rate', key: 'interestRate' },
        { header: 'Max Installments', key: 'maxInstallments' },
        { header: 'Active', key: 'active' },
    ],
    endpoints: { getAll: '/loan-products', create: '/loan-products', update: '/loan-products', delete: '/loan-products' },
    FormComponent: LoanProductForm,
});

// --- Payroll Runs Tab ---
const statusStyles = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PAID: 'bg-teal-100 text-teal-800',
    GENERATED: 'bg-green-100 text-green-800', // For compatibility
    FAILED: 'bg-red-100 text-red-800',
};

const PayrollRunsTab = () => {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isPayslipsModalOpen, setPayslipsModalOpen] = useState(false);
    const [selectedRun, setSelectedRun] = useState(null);
    const [payslips, setPayslips] = useState([]);
    const [payslipsLoading, setPayslipsLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchRuns = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/payroll-runs`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setRuns(res.data.sort((a, b) => new Date(b.payPeriodStart) - new Date(a.payPeriodStart))))
            .catch(err => {
                console.error("Error fetching payroll runs:", err);
                setError('Failed to load payroll runs.');
            })
            .finally(() => setLoading(false));
    }, [API_URL]);

    useEffect(() => {
        fetchRuns();
    }, [fetchRuns]);

    const handleCreateRun = async (year, month) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/payroll-runs`, { year, month }, { headers: { "Authorization": `Bearer ${token}` } });
            setCreateModalOpen(false);
            fetchRuns();
            alert('Payroll run created successfully as a draft.');
        } catch (err) {
            console.error("Error creating payroll run:", err);
            alert(err.response?.data?.message || 'Failed to create payroll run.');
        }
    };

    const handleExecuteRun = async (runId) => {
        if (!window.confirm('Are you sure you want to execute this payroll run? This will generate payslips for all employees and cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/payroll-runs/${runId}/execute`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            fetchRuns();
            alert('Payroll run executed successfully.');
        } catch (err) {
            console.error("Error executing payroll run:", err);
            alert(err.response?.data?.message || 'Failed to execute payroll run.');
        }
    };

    const handleViewPayslips = async (run) => {
        setSelectedRun(run);
        setPayslipsModalOpen(true);
        setPayslipsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll-runs/${run.id}/payslips`, { headers: { "Authorization": `Bearer ${token}` } });
            setPayslips(response.data);
        } catch (err) {
            console.error("Error fetching payslips:", err);
            alert('Failed to fetch payslips for this run.');
        } finally {
            setPayslipsLoading(false);
        }
    };

    const CreateRunModal = ({ isOpen, onClose, onCreate }) => {
        const [year, setYear] = useState(new Date().getFullYear());
        const [month, setMonth] = useState(new Date().getMonth() + 1);

        const handleSubmit = (e) => {
            e.preventDefault();
            onCreate(year, month);
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Create New Payroll Run">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                    <InputField label="Month" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} required />
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Create Draft</button>
                    </div>
                </form>
            </Modal>
        );
    };

    const PayslipsModal = ({ isOpen, onClose, run, payslips, loading }) => {
        if (!run) return null;
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={`Payslips for ${new Date(run.payPeriodStart).toLocaleString('default', { month: 'long' })} ${run.year}`}>
                {loading ? (
                    <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>
                ) : (
                    <div className="overflow-y-auto max-h-[60vh]">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Salary</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                                {payslips.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{p.employeeName || p.employeeId}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{p.netSalary}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{p.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Payroll Runs</h3>
                <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 btn-primary">
                    <PlusCircle size={16} /> Create Payroll Run
                </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pay Period</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Executed At</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                        {runs.map(run => (
                            <tr key={run.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{new Date(run.payPeriodStart).toLocaleString('default', { month: 'long' })} {run.year}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[run.status] || 'bg-slate-100 text-slate-800'}`}>
                                        {run.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{run.executedAt ? new Date(run.executedAt).toLocaleString() : 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    {run.status === 'DRAFT' && (
                                        <button onClick={() => handleExecuteRun(run.id)} className="btn-secondary py-1 px-2 text-xs">Execute</button>
                                    )}
                                    {run.status === 'PROCESSING' && (
                                        <span className="text-xs italic text-slate-500">Processing...</span>
                                    )}
                                    {(run.status === 'COMPLETED' || run.status === 'PAID' || run.status === 'GENERATED') && (
                                        <button onClick={() => handleViewPayslips(run)} className="btn-secondary py-1 px-2 text-xs">View Payslips</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CreateRunModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateRun} />
            <PayslipsModal isOpen={isPayslipsModalOpen} onClose={() => setPayslipsModalOpen(false)} run={selectedRun} payslips={payslips} loading={payslipsLoading} />
        </>
    );
};

// --- Main Component ---
const PayrollSettings = () => {
    const [activeSubTab, setActiveSubTab] = useState('General');

    const subTabs = [
        { name: 'General', icon: Settings, component: GeneralSettingsTab },
        { name: 'Salary Components', icon: Layers, component: SalaryComponentsTab },
        { name: 'Statutory Rules', icon: Scale, component: StatutoryRulesTab },
        { name: 'Loan Products', icon: Handshake, component: LoanProductsTab },
        { name: 'Payroll Runs', icon: Play, component: PayrollRunsTab },
    ];

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div>
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
            <div>
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
}

export default PayrollSettings;
