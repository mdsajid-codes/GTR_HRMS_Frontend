import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import SyncPolicyModal from '../attendance/SyncPolicyModal';

// Modal for adding/editing leave groups
const LeaveGroupModal = ({ isOpen, onClose, onSave, leaveGroup, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (leaveGroup) {
            setFormData({
                name: leaveGroup.name || '',
                code: leaveGroup.code || ''
            });
        } else {
            setFormData({ name: '', code: '' });
        }
        setModalError('');
    }, [leaveGroup, isOpen]);

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
                    <h2 className="text-xl font-semibold">{leaveGroup ? 'Edit' : 'Add'} Leave Group</h2>
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

const LeaveGroup = ({ embedded = false }) => {
    const [leaveGroups, setLeaveGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLeaveGroup, setEditingLeaveGroup] = useState(null);
    const [syncingLeaveGroup, setSyncingLeaveGroup] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchLeaveGroups = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/leave-groups`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setLeaveGroups(response.data);
        } catch (err) {
            setError('Failed to fetch leave groups. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveGroups();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingLeaveGroup(null);
        setIsModalOpen(true);
    };

    const handleEdit = (leaveGroup) => {
        setEditingLeaveGroup(leaveGroup);
        setIsModalOpen(true);
    };

    const handleDelete = async (leaveGroupId, leaveGroupName) => {
        if (window.confirm(`Are you sure you want to delete the leave group "${leaveGroupName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/leave-groups/${leaveGroupId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setLeaveGroups(leaveGroups.filter(lg => lg.id !== leaveGroupId));
            } catch (err) {
                setError('Failed to delete leave group.');
                console.error(err);
            }
        }
    };

    const handleSave = async (leaveGroupData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingLeaveGroup) {
                await axios.put(`${API_URL}/leave-groups/${editingLeaveGroup.id}`, leaveGroupData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/leave-groups`, leaveGroupData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchLeaveGroups();
        } catch (err) {
            setError(err.response?.data || 'Failed to save leave group. The name or code might already exist.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenSyncModal = (leaveGroup) => {
        setSyncingLeaveGroup(leaveGroup);
    };

    const handleConfirmSync = async (leaveGroup, selectedEmployeeCodes) => {
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
                    const payload = { leaveGroupId: leaveGroup.id };
                    await axios.put(`${BASE_URL}/time-attendence/${employeeCode}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
                    successCount++;
                } catch (updateErr) {
                    console.error(`Failed to update leave group for ${employeeCode}:`, updateErr);
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
                    <h1 className="text-3xl font-bold text-slate-800">Leave Groups</h1>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Leave Group
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
                                    {leaveGroups.length > 0 ? (
                                        leaveGroups.map(lg => (
                                            <tr key={lg.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{lg.name}</td>
                                                <td className="td-cell text-sm text-slate-500">{lg.code}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2"> 
                                                        <button onClick={() => handleOpenSyncModal(lg)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full" title="Sync to employees" disabled={!!syncingLeaveGroup}>
                                                            {syncingLeaveGroup?.id === lg.id
                                                                ? <Loader className="h-4 w-4 animate-spin" />
                                                                : <RefreshCw className="h-4 w-4" />}
                                                        </button>
                                                        <button onClick={() => handleEdit(lg)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit" disabled={!!syncingLeaveGroup}>
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(lg.id, lg.name)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete" disabled={!!syncingLeaveGroup}>
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
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No leave groups found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new leave group.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <LeaveGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                leaveGroup={editingLeaveGroup}
                loading={modalLoading}
            />
            <SyncPolicyModal 
                isOpen={!!syncingLeaveGroup} 
                onClose={() => setSyncingLeaveGroup(null)} 
                policy={syncingLeaveGroup}
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

export default LeaveGroup;
