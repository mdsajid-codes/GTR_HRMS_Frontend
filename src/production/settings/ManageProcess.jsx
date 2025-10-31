import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, ChevronsUpDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProcessModal = ({ isOpen, onClose, onSave, process, loading, locations, workGroups }) => {
    const [formData, setFormData] = useState({ name: '', locationId: '', workGroups: [] });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (process) {
            setFormData({
                name: process.name || '',
                locationId: process.locationId || '',
                workGroups: process.workGroups ? process.workGroups.map(wg => ({ workGroupId: wg.workGroupId, sequenceIndex: wg.sequenceIndex })) : []
            });
        } else {
            setFormData({ name: '', locationId: '', workGroups: [] });
        }
        setModalError('');
    }, [process, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWorkGroupChange = (index, field, value) => {
        const updatedWorkGroups = [...formData.workGroups];
        updatedWorkGroups[index][field] = value;
        setFormData(prev => ({ ...prev, workGroups: updatedWorkGroups }));
    };

    const addWorkGroup = () => {
        const nextSequence = formData.workGroups.length > 0 ? Math.max(...formData.workGroups.map(wg => wg.sequenceIndex)) + 1 : 1;
        setFormData(prev => ({
            ...prev,
            workGroups: [...prev.workGroups, { workGroupId: '', sequenceIndex: nextSequence }]
        }));
    };

    const removeWorkGroup = (index) => {
        setFormData(prev => ({
            ...prev,
            workGroups: prev.workGroups.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setModalError('Process name is required.');
            return;
        }
        onSave({ id: process?.id, ...formData });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">{process ? 'Edit' : 'Add'} Process</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="label">Process Name</label>
                                <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" />
                            </div>
                            <div>
                                <label htmlFor="locationId" className="label">Location</label>
                                <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input">
                                    <option value="">All Locations</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <h4 className="font-semibold mb-2">Workgroups Sequence</h4>
                            <div className="space-y-3">
                                {formData.workGroups.sort((a, b) => a.sequenceIndex - b.sequenceIndex).map((wg, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-background-muted rounded-md">
                                        <ChevronsUpDown className="h-5 w-5 text-foreground-muted" />
                                        <input
                                            type="number"
                                            value={wg.sequenceIndex}
                                            onChange={(e) => handleWorkGroupChange(index, 'sequenceIndex', parseInt(e.target.value, 10))}
                                            className="input w-20 text-center"
                                            min="1"
                                        />
                                        <select
                                            value={wg.workGroupId}
                                            onChange={(e) => handleWorkGroupChange(index, 'workGroupId', e.target.value)}
                                            className="input flex-grow"
                                            required
                                        >
                                            <option value="">Select Workgroup</option>
                                            {workGroups.map(w => <option key={w.id} value={w.id}>{w.name} ({w.number})</option>)}
                                        </select>
                                        <button type="button" onClick={() => removeWorkGroup(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addWorkGroup} className="btn-secondary btn-sm w-full">
                                    <PlusCircle size={16} className="mr-2" /> Add Workgroup Step
                                </button>
                            </div>
                        </div>

                        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Save Process
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageProcess = ({ locationId }) => {
    const [processes, setProcesses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [workGroups, setWorkGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [processesRes, locationsRes, workGroupsRes] = await Promise.all([
                axios.get(`${API_URL}/production/processes?page=${currentPage}&size=${pageSize}`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
                axios.get(`${API_URL}/production/work-groups`, { headers: authHeaders }),
            ]);
            setProcesses(Array.isArray(processesRes.data.content) ? processesRes.data.content : []);
            setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
            setTotalPages(processesRes.data.totalPages || 0);
            setTotalElements(processesRes.data.totalElements || 0);
            setWorkGroups(Array.isArray(workGroupsRes.data.content) ? workGroupsRes.data.content : []);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders, currentPage, pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData, currentPage, pageSize]);

    const handleAdd = () => { setEditingProcess(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingProcess(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingProcess(null); };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const payload = { ...itemData, locationId: itemData.locationId || null };
        const isUpdating = Boolean(itemData.id);
        const url = isUpdating ? `${API_URL}/production/processes/${itemData.id}` : `${API_URL}/production/processes`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, payload, { headers: authHeaders });
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save process.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this process?')) {
            try {
                await axios.delete(`${API_URL}/production/processes/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete process.'}`);
            }
        }
    };

    const filteredData = useMemo(() => {
        let filtered = processes;
        // The location filter is applied on the client side as the API doesn't seem to support it.
        // For a large number of processes, consider adding server-side filtering.
        if (locationId && locationId !== 'all') {
            filtered = processes.filter(item => String(item.locationId) === String(locationId));
        }
        return filtered.filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [processes, searchTerm, locationId]);

    const handlePageSizeChange = (e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); };
    const handlePrevPage = () => { setCurrentPage(p => Math.max(p - 1, 0)); };
    const handleNextPage = () => { setCurrentPage(p => Math.min(p + 1, totalPages - 1)); };
    return (
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Processes</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Process</button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">Process Name</th>
                            <th className="th-cell">Location</th>
                            <th className="th-cell">Workgroups</th>
                            <th className="th-cell w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-medium text-foreground">{item.name}</td>
                                    <td className="td-cell">{item.locationName || 'All Locations'}</td>
                                    <td className="td-cell text-xs">
                                        {item.workGroups?.sort((a, b) => a.sequenceIndex - b.sequenceIndex).map(wg => wg.workGroupName).join(' → ') || 'None'}
                                    </td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No processes found</h3><p className="mt-1 text-sm">Get started by adding a new process.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-foreground-muted">
                <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select value={pageSize} onChange={handlePageSizeChange} className="input py-1 px-2 h-auto text-sm">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    <span>entries</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}</span>
                    <button onClick={handlePrevPage} disabled={currentPage === 0} className="btn-secondary btn-sm disabled:opacity-50">
                        Previous
                    </button>
                    <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="btn-secondary btn-sm disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>

            <ProcessModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} process={editingProcess} loading={modalLoading} locations={locations} workGroups={workGroups} />
        </div>
    );
}

export default ManageProcess;