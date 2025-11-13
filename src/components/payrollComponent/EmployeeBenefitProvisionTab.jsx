import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, PlusCircle, Edit, Trash2, HandCoins, Eye, Download } from 'lucide-react';
import EmployeeBenefitProvisionForm from './EmployeeBenefitProvisionForm';
import ProvisionPayoutForm from './ProvisionPayoutForm';

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

const statusStyles = {
    ACCRUING: 'bg-yellow-100 text-yellow-800',
    PAID_OUT: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-red-100 text-red-600',
};

const StatusBadge = ({ status }) => {
    const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${style}`}>
            {status.replace('_', ' ').toLowerCase()}
        </span>
    );
};

const formatCurrency = (amount, currency = 'AED') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

const EmployeeBenefitProvisionTab = ({ employee }) => {
    const [provisions, setProvisions] = useState([]);
    const [salaryStructure, setSalaryStructure] = useState(null);
    const [benefitTypes, setBenefitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutProvision, setPayoutProvision] = useState(null);
    const [editingProvision, setEditingProvision] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchProvisions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [provisionsRes, benefitTypesRes, structureRes] = await Promise.all([
                axios.get(`${API_URL}/provisions/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } }),
                axios.get(`${API_URL}/benefit-types`, { headers: { "Authorization": `Bearer ${token}` } }),
                axios.get(`${API_URL}/salary-structures/employee/${employee.employeeCode}`, { headers }).catch(() => ({ data: null }))
            ]);
            setProvisions(provisionsRes.data);
            setBenefitTypes(benefitTypesRes.data);
            setSalaryStructure(structureRes.data);
        } catch (error) {
            console.error("Error fetching benefit provisions:", error);
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode, API_URL]);

    useEffect(() => {
        fetchProvisions();
    }, [fetchProvisions]);

    const handleAdd = () => {
        setEditingProvision(null);
        setIsModalOpen(true);
    };

    const handleEdit = (provision) => {
        setEditingProvision({
            ...provision,
            cycleStartDate: provision.cycleStartDate?.split('T')[0] || '',
            cycleEndDate: provision.cycleEndDate?.split('T')[0] || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit provision?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/provisions/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchProvisions();
            } catch (error) {
                alert('Failed to delete provision.');
            }
        }
    };

    const handleSave = async (data) => {
        const token = localStorage.getItem('token');
        const request = editingProvision
            ? axios.put(`${API_URL}/provisions/${editingProvision.id}`, data, { headers: { "Authorization": `Bearer ${token}` } })
            : axios.post(`${API_URL}/provisions`, data, { headers: { "Authorization": `Bearer ${token}` } });

        try {
            await request;
            fetchProvisions();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save provision.');
        }
    };

    const handlePayout = (provision) => {
        setPayoutProvision(provision);
        setIsPayoutModalOpen(true);
    };

    const handleSavePayout = async (formData) => {
        if (!payoutProvision) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/provisions/${payoutProvision.id}/payout`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            fetchProvisions();
            setIsPayoutModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save payout.');
        }
    };

    const handleViewConfirmation = async (filePath) => {
        // This function now needs a specific file path to view.
        // The backend should provide a way to get a file by its path or ID.
        // Assuming a generic file download endpoint exists at `/files/{filePath}`.
        // If not, this needs to be implemented in the backend.
        try {
            const token = localStorage.getItem('token');
            // A more robust backend would be `GET /files/download?path=${filePath}`
            // For now, let's assume a simple structure.
            const response = await axios.get(`${API_URL}/files/download/${filePath}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            // Create a URL for the blob
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);
            // Open the URL in a new tab
            window.open(fileURL, '_blank');
            // Revoke the object URL after some time to free up memory
            setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
        } catch (err) {
            alert("Could not load the confirmation file. It may not exist or an error occurred.");
        }
    };

    const handleDownloadVoucher = async (provisionId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/provisions/${provisionId}/download-voucher`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = `BenefitVoucher-${provisionId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) filename = filenameMatch[1];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert('Failed to download voucher.'); }
    };

    const getProvisionTotalAmount = (provision) => {
        const benefitType = benefitTypes.find(bt => bt.name === provision.benefitTypeName);
        if (!benefitType) return 0;

        switch (benefitType.calculationType) {
            case 'FLAT_AMOUNT':
                return benefitType.valueForAccrual;
            case 'PERCENTAGE_OF_BASIC':
                if (!salaryStructure || !salaryStructure.components) return 0;
                const basicComponent = salaryStructure.components.find(c => c.componentCode === 'BASIC');
                if (!basicComponent || !basicComponent.value) return 0;
                
                const basicSalary = parseFloat(basicComponent.value);
                const percentage = parseFloat(benefitType.valueForAccrual);
                return (basicSalary * percentage) / 100;
            default:
                return 0;
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Benefit Provisions</h3>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><PlusCircle size={16} /> Add Provision</button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="th-cell">Benefit</th><th className="th-cell">Total Amount</th><th className="th-cell">Accrued</th><th className="th-cell">Cycle Dates</th><th className="th-cell">Status</th><th className="th-cell">Payout Info</th><th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                        {provisions.map(p => (
                            <tr key={p.id}>
                                <td className="td-cell">{p.benefitTypeName}</td><td className="td-cell">{formatCurrency(getProvisionTotalAmount(p))}</td><td className="td-cell">{formatCurrency(p.accruedAmount)}</td><td className="td-cell">{p.cycleStartDate} to {p.cycleEndDate}</td><td className="td-cell"><StatusBadge status={p.status} /></td>
                                <td className="td-cell text-xs">
                                    {p.paidOutDate && <div>Paid: {p.paidOutDate}</div>}
                                    {p.paymentDetails && <div className="truncate max-w-[150px]" title={p.paymentDetails}>Details: {p.paymentDetails}</div>}
                                    {p.confirmationFiles && p.confirmationFiles.length > 0 && (
                                        <div className="mt-1 space-y-1">
                                            {p.confirmationFiles.map(file => (
                                                <button key={file.id} onClick={() => handleViewConfirmation(file.filePath)} className="text-blue-600 hover:underline flex items-center gap-1 w-full truncate">
                                                    <Eye size={14}/> <span className="truncate">{file.originalFilename}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="td-cell">
                                    {p.status === 'ACCRUING' && (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handlePayout(p)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full" title="Pay Out"><HandCoins size={16} /></button>
                                            <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                    {p.status === 'PAID_OUT' && (
                                        <button onClick={() => handleDownloadVoucher(p.id)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full" title="Download Voucher">
                                            <Download size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProvision ? 'Edit Provision' : 'Add Provision'}>
                <EmployeeBenefitProvisionForm
                    initialData={editingProvision}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    employeeCode={employee.employeeCode}
                />
            </Modal>
            <Modal isOpen={isPayoutModalOpen} onClose={() => setIsPayoutModalOpen(false)} title={`Pay Out: ${payoutProvision?.benefitTypeName}`}>
                <ProvisionPayoutForm
                    provision={payoutProvision}
                    onSave={handleSavePayout}
                    onCancel={() => setIsPayoutModalOpen(false)}
                />
            </Modal>
        </>
    );
};

export default EmployeeBenefitProvisionTab;