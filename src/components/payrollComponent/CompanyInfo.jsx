import React, { useState, useEffect, useCallback } from 'react';
import { Building, Landmark, Edit, Trash2, PlusCircle, Loader } from 'lucide-react';
import axios from 'axios';

// --- Helper Components ---
const InputField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-foreground-muted">{label}</label>
        <input id={id} {...props} className="input bg-background-muted border-border text-foreground" />
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-sm text-foreground-muted">{label}</p>
        <p className="font-medium text-foreground">{value || <span className="text-foreground-muted/50">N/A</span>}</p>
    </div>
);

// --- Company Info Sub-Components ---

const CompanyDetailsTab = () => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    const initialFormData = {
        companyName: '', address: '', city: '', state: '', postalCode: '', country: '',
        phone: '', email: '', website: '', pan: '', tan: '', gstIn: '',
        pfRegistrationNumber: '', esiRegistrationNumber: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchCompanyInfo = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/company-info`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                if (response.data && response.data.companyName) {
                    setCompanyInfo(response.data);
                    setFormData(response.data);
                } else {
                    setCompanyInfo(null);
                    setFormData(initialFormData);
                }
            })
            .catch(error => console.error("Error fetching company info:", error))
            .finally(() => setLoading(false));
    }, [API_URL]);

    useEffect(() => {
        fetchCompanyInfo();
    }, [fetchCompanyInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaveLoading(true);
        const token = localStorage.getItem('token');
        axios.post(`${API_URL}/company-info`, formData, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                setCompanyInfo(response.data);
                setFormData(response.data);
                setIsEditing(false);
                alert('Company information saved successfully!');
            })
            .catch(error => {
                console.error("Error saving company info:", error);
                alert('Failed to save company information.');
            })
            .finally(() => setSaveLoading(false));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(companyInfo || initialFormData);
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Company Name" id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleChange} required />
                    <InputField label="Email" id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                    <InputField label="Phone" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                    <InputField label="Website" id="website" name="website" value={formData.website || ''} onChange={handleChange} />
                    <InputField label="Address" id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                    <InputField label="City" id="city" name="city" value={formData.city || ''} onChange={handleChange} />
                    <InputField label="State" id="state" name="state" value={formData.state || ''} onChange={handleChange} />
                    <InputField label="Postal Code" id="postalCode" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} />
                    <InputField label="Country" id="country" name="country" value={formData.country || ''} onChange={handleChange} />
                    <InputField label="PAN" id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} />
                    <InputField label="TAN" id="tan" name="tan" value={formData.tan || ''} onChange={handleChange} />
                    <InputField label="GSTIN" id="gstIn" name="gstIn" value={formData.gstIn || ''} onChange={handleChange} />
                    <InputField label="PF Registration No." id="pfRegistrationNumber" name="pfRegistrationNumber" value={formData.pfRegistrationNumber || ''} onChange={handleChange} />
                    <InputField label="ESI Registration No." id="esiRegistrationNumber" name="esiRegistrationNumber" value={formData.esiRegistrationNumber || ''} onChange={handleChange} />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={handleCancel} className="btn-secondary" disabled={saveLoading}>Cancel</button>
                    <button type="submit" className="btn-primary flex items-center" disabled={saveLoading}>
                        {saveLoading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                        Save Changes
                    </button>
                </div>
            </form>
        );
    }

    if (!companyInfo) {
        return (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-card text-card-foreground">
                <Building className="mx-auto h-12 w-12 text-foreground-muted/50" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No Company Information</h3>
                <p className="mt-1 text-sm text-foreground-muted">Get started by adding your company's details.</p>
                <div className="mt-6">
                    <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center mx-auto">
                        <PlusCircle size={16} className="mr-2" />
                        Add Company Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                    <Edit size={16} /> Edit
                </button>
            </div>
            <div className="space-y-6 bg-card p-6 rounded-xl shadow-sm">
                <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-4">General Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoDisplay label="Company Name" value={companyInfo.companyName} />
                        <InfoDisplay label="Email" value={companyInfo.email} />
                        <InfoDisplay label="Phone" value={companyInfo.phone} />
                        <InfoDisplay label="Website" value={companyInfo.website} />
                    </div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-4">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoDisplay label="Address" value={companyInfo.address} />
                        <InfoDisplay label="City" value={companyInfo.city} />
                        <InfoDisplay label="State" value={companyInfo.state} />
                        <InfoDisplay label="Postal Code" value={companyInfo.postalCode} />
                        <InfoDisplay label="Country" value={companyInfo.country} />
                    </div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-4">Statutory Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoDisplay label="PAN" value={companyInfo.pan} />
                        <InfoDisplay label="TAN" value={companyInfo.tan} />
                        <InfoDisplay label="GSTIN" value={companyInfo.gstIn} />
                        <InfoDisplay label="PF Registration No." value={companyInfo.pfRegistrationNumber} />
                        <InfoDisplay label="ESI Registration No." value={companyInfo.esiRegistrationNumber} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CrudTable = ({ title, columns, data, onAdd, onEdit, onDelete, addLabel }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button onClick={onAdd} className="flex items-center gap-2 btn-secondary">
                <PlusCircle size={16} /> {addLabel}
            </button>
        </div>
        <div className="overflow-x-auto border border-border rounded-lg">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-background-muted">
                    <tr>
                        {columns.map(col => <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{col.header}</th>)}
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border text-foreground-muted">
                    {data.map(item => (
                        <tr key={item.id}>
                            {columns.map(col => <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">{col.key === 'primary' ? (item[col.key] ? 'Yes' : 'No') : item[col.key]}</td>)}
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground-muted">
                                <button onClick={() => onEdit(item)} className="text-primary hover:text-primary/80 mr-3"><Edit size={16} /></button>
                                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const BankAccountForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', branchName: '', isPrimary: false });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} required />
            <InputField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required />
            <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
            <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required />
            <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} />
            <div className="flex items-center">
                <input type="checkbox" id="isPrimaryAccount" name="isPrimary" checked={formData.isPrimary} onChange={handleChange} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <label htmlFor="isPrimaryAccount" className="ml-2 block text-sm text-slate-900">Set as primary account</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Account</button>
            </div>
        </form>
    );
};

const createCrudTab = (config) => () => {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchItems = useCallback(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}${config.endpoints.getAll}`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setItems(res.data))
            .catch(err => console.error(`Error fetching ${config.name}:`, err));
    }, [config.endpoints.getAll, config.name, API_URL]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

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

        request.then(() => {
            fetchItems();
            setIsModalOpen(false);
        }).catch(err => console.error(`Error saving ${config.singularName}:`, err));
    };

    return (
        <>
            <CrudTable
                title={config.title}
                columns={config.columns}
                data={items}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                addLabel={config.addLabel}
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit ${config.singularName}` : `Add ${config.singularName}`}>
                <config.FormComponent
                    initialData={editingItem}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </>
    );
};

const CompanyBankAccountTab = createCrudTab({
    name: 'bank accounts',
    singularName: 'bank account',
    title: 'Company Bank Accounts',
    addLabel: 'Add Bank Account',
    columns: [
        { header: 'Bank Name', key: 'bankName' },
        { header: 'Account Number', key: 'accountNumber' },
        { header: 'IFSC', key: 'ifscCode' },
        { header: 'Primary', key: 'primary' },
    ],
    endpoints: {
        getAll: '/company-bank-accounts',
        create: '/company-bank-accounts',
        update: '/company-bank-accounts',
        delete: '/company-bank-accounts',
    },
    FormComponent: BankAccountForm,
});

const CompanyInfo = () => {
    const [activeSubTab, setActiveSubTab] = useState('Company Details');

    const subTabs = [
        { name: 'Company Details', icon: Building, component: CompanyDetailsTab },
        { name: 'Bank Accounts', icon: Landmark, component: CompanyBankAccountTab },
    ];

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div>
            <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-6 text-foreground" aria-label="Sub-tabs">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveSubTab(tab.name)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeSubTab === tab.name
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                            }`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
}

export default CompanyInfo;
