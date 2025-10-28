import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import SyncPolicyModal from '../attendance/SyncPolicyModal';

// Modal for adding/editing time types
const TimeTypeModal = ({ isOpen, onClose, onSave, timeType, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (timeType) {
            setFormData({
                name: timeType.name || '',
                code: timeType.code || ''
            });
        } else {
            setFormData({ name: '', code: '' });
        }
        setModalError('');
    }, [timeType, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.code.trim()) {
            setModalError('Name and Code are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{timeType ? 'Edit' : 'Add'} Time Type</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-slate-700">Code</label>
                            <input id="code" name="code" value={formData.code} onChange={handleChange} required className="input" />
                        </div>
                        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TimeType = ({ embedded = false }) => {
    const [timeTypes, setTimeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTimeType, setEditingTimeType] = useState(null);
    const [syncingTimeType, setSyncingTimeType] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchTimeTypes = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/time-types`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTimeTypes(response.data);
        } catch (err) {
            setError('Failed to fetch time types. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeTypes();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingTimeType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (timeType) => {
        setEditingTimeType(timeType);
        setIsModalOpen(true);
    };

    const handleDelete = async (timeTypeId, timeTypeName) => {
        if (window.confirm(`Are you sure you want to delete the time type "${timeTypeName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/time-types/${timeTypeId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setTimeTypes(timeTypes.filter(t => t.id !== timeTypeId));
            } catch (err) {
                setError('Failed to delete time type.');
                console.error(err);
            }
        }
    };

    const handleSave = async (timeTypeData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingTimeType) {
                await axios.put(`${API_URL}/time-types/${editingTimeType.id}`, timeTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/time-types`, timeTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchTimeTypes();
        } catch (err) {
            setError(err.response?.data || 'Failed to save time type. The name or code might already exist.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenSyncModal = (timeType) => {
        setSyncingTimeType(timeType);
    };

    const handleConfirmSync = async (timeType, selectedEmployeeCodes) => {
        if (selectedEmployeeCodes.length === 0) {
            alert("No employees selected.");
            return;
        }

        setError('');
        let successCount = 0;
        let errorCount = 0;

        try {
            const token = localStorage.getItem('token');
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;

            for (const employeeCode of selectedEmployeeCodes) {
                try {
                    const payload = { timeTypeId: timeType.id };
                    await axios.put(`${BASE_URL}/time-attendence/${employeeCode}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
                    successCount++;
                } catch (updateErr) {
                    console.error(`Failed to update time type for ${employeeCode}:`, updateErr);
                    errorCount++;
                }
            }

            alert(`Sync complete!\n- ${successCount} employees updated successfully.\n- ${errorCount} updates failed.`);

        } catch (err) {
            setError('An unexpected error occurred during the sync process.');
            console.error(err);
        }
    };

    const content = (
        <>
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Time Types</h1>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Time Type
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="th-cell">Name</th>
                                        <th className="th-cell">Code</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {timeTypes.length > 0 ? (
                                        timeTypes.map(tt => (
                                            <tr key={tt.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{tt.name}</td>
                                                <td className="td-cell text-sm text-slate-500">{tt.code}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2"> 
                                                        <button onClick={() => handleOpenSyncModal(tt)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full" title="Sync to employees" disabled={!!syncingTimeType}>
                                                            {syncingTimeType?.id === tt.id
                                                                ? <Loader className="h-4 w-4 animate-spin" />
                                                                : <RefreshCw className="h-4 w-4" />}
                                                        </button>
                                                        <button onClick={() => handleEdit(tt)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit" disabled={!!syncingTimeType}>
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(tt.id, tt.name)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete" disabled={!!syncingTimeType}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-10 text-slate-500">
                                                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No time types found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new time type.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <TimeTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                timeType={editingTimeType}
                loading={modalLoading}
            />
            <SyncPolicyModal 
                isOpen={!!syncingTimeType} 
                onClose={() => setSyncingTimeType(null)} 
                policy={syncingTimeType}
                onSync={handleConfirmSync}
            />
        </>
    );

    if (embedded) {
        return content;
    }

    return (
        <DashboardLayout>{content}</DashboardLayout>
    );
}

export default TimeType;
