import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Target, Sliders, Edit, Trash2, PlusCircle, Loader, X, AlertCircle, Users, Search } from 'lucide-react';
import axios from 'axios';
import KpiList from './KpiList';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const RangeForm = ({ item, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({ fromPercent: 0, toPercent: 100, color: '#4ade80' });

    useEffect(() => {
        if (item) {
            setFormData({ fromPercent: item.fromPercent || 0, toPercent: item.toPercent || 100, color: item.color || '#4ade80' });
        } else {
            setFormData({ fromPercent: 0, toPercent: 100, color: '#4ade80' });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...item, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fromPercent" className="block text-sm font-medium text-foreground-muted">From %</label>
                    <input type="number" id="fromPercent" name="fromPercent" value={formData.fromPercent} onChange={handleChange} className="input bg-background-muted border-border" />
                </div>
                <div>
                    <label htmlFor="toPercent" className="block text-sm font-medium text-foreground-muted">To %</label>
                    <input type="number" id="toPercent" name="toPercent" value={formData.toPercent} onChange={handleChange} className="input bg-background-muted border-border" />
                </div>
            </div>
            <div>
                <label htmlFor="color" className="block text-sm font-medium text-foreground-muted">Color</label>
                <input type="color" id="color" name="color" value={formData.color} onChange={handleChange} className="input p-1 h-10 w-full bg-background-muted border-border" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                    {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save Range
                </button>
            </div>
        </form>
    );
};

const KpiRangeTab = () => {
    const [kpis, setKpis] = useState([]);
    const [selectedKpiId, setSelectedKpiId] = useState('');
    const [ranges, setRanges] = useState([]);
    const [loading, setLoading] = useState({ kpis: true, ranges: false });
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    useEffect(() => {
        const fetchKpis = async () => {
            setLoading(prev => ({ ...prev, kpis: true }));
            try {
                const response = await axios.get(`${API_URL}/crm/kpis`, { headers: authHeaders });
                setKpis(response.data);
                if (response.data.length > 0) {
                    setSelectedKpiId(response.data[0].id);
                }
            } catch (err) {
                setError('Failed to fetch KPIs.');
            } finally {
                setLoading(prev => ({ ...prev, kpis: false }));
            }
        };
        fetchKpis();
    }, [authHeaders]);

    useEffect(() => {
        if (!selectedKpiId) {
            setRanges([]);
            return;
        }
        const fetchRanges = async () => {
            setLoading(prev => ({ ...prev, ranges: true }));
            try {
                const response = await axios.get(`${API_URL}/crm/kpis/${selectedKpiId}/ranges`, { headers: authHeaders });
                setRanges(response.data);
            } catch (err) {
                setError(`Failed to fetch ranges for the selected KPI.`);
            } finally {
                setLoading(prev => ({ ...prev, ranges: false }));
            }
        };
        fetchRanges();
    }, [selectedKpiId, authHeaders]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/crm/kpis/${selectedKpiId}/ranges/${itemData.id}` : `${API_URL}/crm/kpis/${selectedKpiId}/ranges`;
        const method = isUpdating ? 'put' : 'post';
        try {
            await axios[method](url, itemData, { headers: authHeaders });
            // Refetch ranges for the current KPI
            const response = await axios.get(`${API_URL}/crm/kpis/${selectedKpiId}/ranges`, { headers: authHeaders });
            setRanges(response.data);
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save range.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this range?')) {
            try {
                await axios.delete(`${API_URL}/crm/kpis/${selectedKpiId}/ranges/${id}`, { headers: authHeaders });
                setRanges(prev => prev.filter(r => r.id !== id));
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete range.'}`);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <label htmlFor="kpi-select" className="text-sm font-medium text-foreground-muted">Select KPI:</label>
                    <select id="kpi-select" value={selectedKpiId} onChange={e => setSelectedKpiId(e.target.value)} className="input bg-background-muted border-border" disabled={loading.kpis}>
                        {loading.kpis ? <option>Loading KPIs...</option> : kpis.map(kpi => <option key={kpi.id} value={kpi.id}>{kpi.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary" disabled={!selectedKpiId}><PlusCircle size={16} /> Add Range</button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">From (%)</th><th className="th-cell">To (%)</th><th className="th-cell">Color</th><th className="th-cell w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading.ranges ? (
                            <tr><td colSpan="4" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : ranges.length > 0 ? (
                            ranges.map(item => (
                                <tr key={item.id}>
                                    <td className="td-cell">{item.fromPercent}</td>
                                    <td className="td-cell">{item.toPercent}</td>
                                    <td className="td-cell"><div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: item.color }}></div></td>
                                    <td className="td-cell"><div className="flex items-center gap-2"><button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button><button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button></div></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No ranges found</h3><p className="mt-1 text-sm">Get started by adding a new range for this KPI.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Range' : 'Add Range'}>
                <RangeForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} loading={modalLoading} />
            </Modal>
        </div>
    );
};

const KpiEmployeeDetailsTab = () => {
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    useEffect(() => {
        const fetchAllKpiAssignments = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_URL}/crm/kpis`, { headers: authHeaders });
                const allKpis = Array.isArray(response.data) ? response.data : [];
                const allAssignments = allKpis.flatMap(kpi =>
                    (kpi.assignedEmployees || []).map(emp => ({
                        ...emp,
                        kpiName: kpi.name
                    }))
                );
                setAssignedEmployees(allAssignments);
            } catch (err) {
                setError('Failed to fetch employee KPI assignments.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllKpiAssignments();
    }, [authHeaders]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return assignedEmployees;
        const lowercasedFilter = searchTerm.toLowerCase();
        return assignedEmployees.filter(item =>
            (item.employeeName || '').toLowerCase().includes(lowercasedFilter) ||
            (item.kpiName || '').toLowerCase().includes(lowercasedFilter)
        );
    }, [assignedEmployees, searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">All Employee KPI Assignments</h3>
                <div className="relative">
                    <input type="text" placeholder="Search by employee or KPI..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell w-16">#</th><th className="th-cell">Employee Name</th><th className="th-cell">KPI Name</th><th className="th-cell">Target Value</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={`${item.kpiId}-${item.employeeId}`}>
                                    <td className="td-cell">{index + 1}</td><td className="td-cell font-medium text-foreground">{item.employeeName}</td><td className="td-cell">{item.kpiName}</td><td className="td-cell font-semibold">{item.targetValue}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Assignments Found</h3><p className="mt-1 text-sm">No employees have been assigned to any KPIs yet.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const tabs = [
    { name: 'KPIs', icon: Target, component: KpiList },
    { name: 'Ranges', icon: Sliders, component: KpiRangeTab },
    { name: 'Employee Details', icon: Users, component: KpiEmployeeDetailsTab },
];

const ManageKpi = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.name
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
            <div>
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
}

export default ManageKpi;
