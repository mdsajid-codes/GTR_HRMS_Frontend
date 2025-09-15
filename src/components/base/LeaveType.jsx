import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Modal for adding/editing leave types
const LeaveTypeModal = ({ isOpen, onClose, onSave, leaveType, loading }) => {
    const [formData, setFormData] = useState({
        leaveType: '',
        description: '',
        isPaid: true,
        maxDaysPerYear: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (leaveType) {
            setFormData({
                leaveType: leaveType.leaveType || '',
                description: leaveType.description || '',
                isPaid: leaveType.isPaid || false,
                maxDaysPerYear: leaveType.maxDaysPerYear ?? ''
            });
        } else {
            setFormData({ leaveType: '', description: '', isPaid: true, maxDaysPerYear: '' });
        }
        setModalError('');
    }, [leaveType, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.leaveType.trim()) {
            setModalError('Leave Type name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{leaveType ? 'Edit' : 'Add'} Leave Type</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700">Leave Type Name</label>
                            <input id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="input" />
                        </div>
                        <div>
                            <label htmlFor="maxDaysPerYear" className="block text-sm font-medium text-slate-700">Max Days Per Year</label>
                            <input id="maxDaysPerYear" name="maxDaysPerYear" type="number" value={formData.maxDaysPerYear} onChange={handleChange} className="input" placeholder="e.g., 12" />
                        </div>
                        <div>
                            <label className="inline-flex items-center">
                                <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} className="h-4 w-4 rounded" />
                                <span className="ml-2 text-sm">Is Paid Leave</span>
                            </label>
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

const LeaveType = ({ embedded = false }) => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLeaveType, setEditingLeaveType] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchLeaveTypes = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/leave-types`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setLeaveTypes(response.data);
        } catch (err) {
            setError('Failed to fetch leave types. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingLeaveType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (leaveType) => {
        setEditingLeaveType(leaveType);
        setIsModalOpen(true);
    };

    const handleDelete = async (leaveTypeId, leaveTypeName) => {
        if (window.confirm(`Are you sure you want to delete the leave type "${leaveTypeName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/leave-types/${leaveTypeId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setLeaveTypes(leaveTypes.filter(lt => lt.id !== leaveTypeId));
            } catch (err) {
                setError('Failed to delete leave type.');
                console.error(err);
            }
        }
    };

    const handleSave = async (leaveTypeData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingLeaveType) {
                await axios.put(`${API_URL}/leave-types/${editingLeaveType.id}`, leaveTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/leave-types`, leaveTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchLeaveTypes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save leave type. The name might already exist.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const content = (
        <>
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Leave Types</h1>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Leave Type
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
                                        <th className="th-cell">Leave Type</th>
                                        <th className="th-cell">Description</th>
                                        <th className="th-cell">Paid</th>
                                        <th className="th-cell">Max Days/Year</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {leaveTypes.length > 0 ? (
                                        leaveTypes.map(lt => (
                                            <tr key={lt.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{lt.leaveType}</td>
                                                <td className="td-cell text-sm text-slate-500 max-w-xs truncate" title={lt.description}>{lt.description}</td>
                                                <td className="td-cell text-sm text-slate-500">{lt.isPaid ? 'Yes' : 'No'}</td>
                                                <td className="td-cell text-sm text-slate-500">{lt.maxDaysPerYear ?? 'N/A'}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(lt)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(lt.id, lt.leaveType)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-slate-500">
                                                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No leave types found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new leave type.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <LeaveTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                leaveType={editingLeaveType}
                loading={modalLoading}
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

export default LeaveType;
