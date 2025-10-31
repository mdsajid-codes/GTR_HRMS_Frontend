import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search } from 'lucide-react';
import WorkstationFormPage from './WorkstationFormPage';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const WorkstationTab = ({ locationId, onSwitchTab }) => {
    const [workstations, setWorkstations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [editingWorkstation, setEditingWorkstation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWorkstations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const workstationsRes = await axios.get(`${API_URL}/production/work-stations`, { headers: { "Authorization": `Bearer ${token}` } });
            setWorkstations(workstationsRes.data);
        } catch (err) {
            console.error("Error fetching workstations:", err);
            alert(`Error fetching workstations: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkstations();
    }, [fetchWorkstations]);

    const filteredWorkstations = useMemo(() => {
        let filtered = workstations;
        if (locationId === 'none') {
            filtered = workstations.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = workstations.filter(item => String(item.locationId) === String(locationId));
        }

        if (!searchTerm) return filtered;
        const lowercasedFilter = searchTerm.toLowerCase();
        return filtered.filter(ws =>
            ws.workstationName.toLowerCase().includes(lowercasedFilter) ||
            ws.workGroupName.toLowerCase().includes(lowercasedFilter)
        );
    }, [workstations, searchTerm, locationId]);

    const handleAdd = () => {
        setEditingWorkstation({ locationId: locationId !== 'all' ? locationId : '' });
        setView('form');
    };

    const handleEdit = (workstation) => {
        setEditingWorkstation(workstation);
        setView('form');
    };

    const handleCancelForm = () => {
        setView('list');
        setEditingWorkstation(null);
    };

    const handleSave = async (workstationData) => {
        const isUpdating = editingWorkstation?.id;
        const url = isUpdating ? `${API_URL}/production/work-stations/${editingWorkstation.id}` : `${API_URL}/production/work-stations`;
        const method = isUpdating ? 'put' : 'post';
        try {
            const token = localStorage.getItem('token');
            await axios[method](url, workstationData, { headers: { "Authorization": `Bearer ${token}` } });
            fetchWorkstations();
            handleCancelForm();
            alert('Workstation saved successfully!');
        } catch (err) {
            alert(`Error saving workstation: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this workstation?')) {
            const token = localStorage.getItem('token');
            axios.delete(`${API_URL}/production/work-stations/${id}`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(() => fetchWorkstations())
                .catch(err => alert(`Error deleting workstation: ${err.response?.data?.message || err.message}`));
        }
    };

    const columns = [
        { header: 'Workstation Number', key: 'workstationNumber' },
        { header: 'Workstation Name', key: 'workstationName' },
        { header: 'Work Group', key: 'workGroupName' },
        { header: 'Location', key: 'locationName' },
        { header: 'Assigned Employees', key: 'employees' },
        { header: 'Maintenance Plan', key: 'maintenancePlan' },
    ];

    if (view === 'form') {
        return <WorkstationFormPage item={editingWorkstation} onSave={handleSave} onCancel={handleCancelForm} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Workstations</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary">
                        <PlusCircle size={16} /> Add Workstation
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">#</th>
                            {columns.map((col) => (
                                <th key={col.key} className="th-cell">
                                    {col.header}
                                </th>
                            ))}
                            <th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-10">
                                    <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </td>
                            </tr>
                        ) : filteredWorkstations.length > 0 ? (
                            filteredWorkstations.map((ws, index) => (
                                <tr key={ws.id} className="border-b border-border hover:bg-background-muted">
                                    <td className="td-cell">{index + 1}</td>
                                    <td className="td-cell">{ws.workstationNumber}</td>
                                    <td className="td-cell">{ws.workstationName}</td>
                                    <td className="td-cell">{ws.workGroupName}</td>
                                    <td className="td-cell">{ws.locationName || 'N/A'}</td>
                                    <td className="td-cell">
                                        {ws.employees && ws.employees.length > 0
                                            ? ws.employees.map(emp => emp.name).join(', ')
                                            : 'N/A'}
                                    </td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onSwitchTab('Manage Tools', ws.id)} className="btn-secondary btn-sm">Manage Tool</button>
                                            <button onClick={() => onSwitchTab('Manage Tasks', ws.id)} className="btn-secondary btn-sm">Manage Task</button>
                                        </div>
                                    </td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(ws)} className="text-primary hover:text-primary/80" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(ws.id)} className="text-red-500 hover:text-red-600" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    className="px-4 py-6 text-sm text-foreground-muted text-center"
                                    colSpan={columns.length + 2}
                                >
                                    No workstations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkstationTab;