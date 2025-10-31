import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ListChecks, Edit, Trash2, PlusCircle, Loader, ArrowLeft, Eye, X } from 'lucide-react';
import SearchableSelect from './SearchableSelect'; // Assuming this component exists and is suitable

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const FREQUENCY_OPTIONS = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'];

// --- Form Component for Managed Tasks ---
const ManageTaskForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        locationId: '', workGroupId: '', workstationId: '', taskId: '',
        frequency: 'DAILY', lastPerformedOn: '', alertBeforeDays: 0, notifyEmployeeIds: []
    });
    const [selectOptions, setSelectOptions] = useState({
        locations: [], workGroups: [], workstations: [], tasks: [], employees: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [locRes, wgRes, wsRes, taskRes, empRes] = await Promise.all([
                    axios.get(`${API_URL}/locations`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/work-groups`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/work-stations`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/tasks`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/employees/all`, { headers: getAuthHeaders() }),
                ]);
                setSelectOptions({
                    locations: locRes.data, workGroups: wgRes.data, workstations: wsRes.data,
                    tasks: taskRes.data, employees: empRes.data
                });
            } catch (err) {
                console.error("Failed to fetch form dependency data", err);
                alert("Failed to load necessary data for the form. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                locationId: item.locationId || '',
                workGroupId: item.workGroupId || '',
                workstationId: item.workstationId || '',
                taskId: item.taskId || '',
                frequency: item.frequency || 'DAILY',
                lastPerformedOn: item.lastPerformedOn || '',
                alertBeforeDays: item.alertBeforeDays || 0,
                notifyEmployeeIds: item.notifyEmployees?.map(e => e.id) || [],
            });
        }
    }, [item]);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleEmployeeSelect = (selectedOption) => {
        const employeeId = selectedOption.value;
        setFormData(prev => ({
            ...prev,
            notifyEmployeeIds: prev.notifyEmployeeIds.includes(employeeId)
                ? prev.notifyEmployeeIds.filter(id => id !== employeeId)
                : [...prev.notifyEmployeeIds, employeeId]
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        const payload = {
            ...formData,
            locationId: formData.locationId || null,
            workstationId: formData.workstationId || null,
            alertBeforeDays: Number(formData.alertBeforeDays) || 0,
        };
        onSave(payload);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

    const employeeOptions = selectOptions.employees.map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName}` }));

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-foreground">{item?.id ? 'Edit Managed Task' : 'Add New Managed Task'}</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="label">Task</label><select name="taskId" value={formData.taskId} onChange={handleChange} className="input" required><option value="">Select Task</option>{selectOptions.tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    <div><label className="label">Work Group</label><select name="workGroupId" value={formData.workGroupId} onChange={handleChange} className="input" required><option value="">Select Work Group</option>{selectOptions.workGroups.map(wg => <option key={wg.id} value={wg.id}>{wg.name}</option>)}</select></div>
                    <div><label className="label">Workstation (Optional)</label><select name="workstationId" value={formData.workstationId} onChange={handleChange} className="input"><option value="">Select Workstation</option>{selectOptions.workstations.map(ws => <option key={ws.id} value={ws.id}>{ws.workstationName}</option>)}</select></div>
                    <div><label className="label">Location (Optional)</label><select name="locationId" value={formData.locationId} onChange={handleChange} className="input"><option value="">Select Location</option>{selectOptions.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                    <div><label className="label">Frequency</label><select name="frequency" value={formData.frequency} onChange={handleChange} className="input" required>{FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                    <div><label className="label">Last Performed On</label><input type="date" name="lastPerformedOn" value={formData.lastPerformedOn} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Alert Before (Days)</label><input type="number" name="alertBeforeDays" value={formData.alertBeforeDays} onChange={handleChange} className="input" min="0" /></div>
                </div>
                <div>
                    <label className="label">Notify Employees (Optional)</label>
                    <SearchableSelect options={employeeOptions} selected={formData.notifyEmployeeIds} onSelect={handleEmployeeSelect} placeholder="Search and select employees..." />
                </div>
                <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Task</button></div>
            </form>
        </div>
    );
};

// --- Details Modal Component ---
const ManageTaskDetailsModal = ({ isOpen, onClose, task }) => {
    if (!isOpen || !task) return null;

    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-xs text-foreground-muted">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">Managed Task Details: {task.taskName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-4">
                        <DetailItem label="Task" value={task.taskName} />
                        <DetailItem label="Work Group" value={task.workGroupName} />
                        <DetailItem label="Workstation" value={task.workstationName} />
                        <DetailItem label="Location" value={task.locationName} />
                        <DetailItem label="Frequency" value={task.frequency} />
                        <DetailItem label="Last Performed On" value={task.lastPerformedOn} />
                        <DetailItem label="Alert Before (Days)" value={task.alertBeforeDays} />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-foreground">Employees to Notify</h4>
                        <ul className="space-y-2">
                            {task.notifyEmployees?.length > 0 ? (
                                task.notifyEmployees.map(emp => <li key={emp.id} className="text-sm p-2 bg-background-muted rounded">{emp.name}</li>)
                            ) : (
                                <li>No employees assigned for notification.</li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="p-4 bg-background-muted border-t flex justify-end"><button onClick={onClose} className="btn-secondary">Close</button></div>
            </div>
        </div>
    );
};

// --- Main Component for Managed Tasks Tab ---
const ManageTask = ({ locationId, workstationId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [currentItem, setCurrentItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const fetchTasks = useCallback(() => {
        setLoading(true);
        axios.get(`${API_URL}/production/manage-tasks`, { headers: getAuthHeaders() })
            .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching managed tasks:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const filteredData = useMemo(() => {
        let filtered = tasks;
        if (locationId === 'none') {
            filtered = tasks.filter(item => !item.locationId);
        } else if (locationId && locationId !== 'all') {
            filtered = tasks.filter(item => String(item.locationId) === String(locationId));
        }

        if (workstationId) {
            filtered = filtered.filter(item => String(item.workstationId) === String(workstationId));
        }

        return filtered;
    }, [tasks, locationId, workstationId]);

    const handleAdd = () => {
        setCurrentItem({ locationId: locationId !== 'all' ? locationId : '' });
        setView('form');
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setView('form');
    };

    const handleViewDetails = (item) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingItem(null);
    };

    const handleCancelForm = () => {
        setView('list');
        setCurrentItem(null);
    };

    const handleSave = async (itemData) => {
        const isUpdating = Boolean(currentItem?.id);
        const url = isUpdating ? `${API_URL}/production/manage-tasks/${currentItem.id}` : `${API_URL}/production/manage-tasks`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: getAuthHeaders() });
            fetchTasks();
            handleCancelForm();
        } catch (err) {
            alert(`Error saving managed task: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this managed task?')) {
            try {
                await axios.delete(`${API_URL}/production/manage-tasks/${id}`, { headers: getAuthHeaders() });
                fetchTasks();
            } catch (err) {
                alert(`Error deleting managed task: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (view === 'form') {
        return <ManageTaskForm item={currentItem} onSave={handleSave} onCancel={handleCancelForm} />;
    }

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Recurring Tasks</h3>
                <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Managed Task</button>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">Task</th>
                            <th className="th-cell">Work Group</th>
                            <th className="th-cell">Workstation</th>
                            <th className="th-cell">Location</th>
                            <th className="th-cell">Frequency</th>
                            <th className="th-cell">Last Performed</th>
                            <th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {filteredData.length > 0 ? (
                            filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-medium">{item.taskName}</td>
                                    <td className="td-cell">{item.workGroupName}</td>
                                    <td className="td-cell">{item.workstationName || 'N/A'}</td>
                                    <td className="td-cell">{item.locationName || 'N/A'}</td>
                                    <td className="td-cell">{item.frequency}</td>
                                    <td className="td-cell">{item.lastPerformedOn || 'Never'}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleViewDetails(item)} className="text-sky-500 hover:text-sky-600" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-6 text-sm text-foreground-muted text-center">No managed tasks found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ManageTaskDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} task={viewingItem} />
        </>
    );
};

export default ManageTask;