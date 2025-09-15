import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Modal for adding/editing work types
const WorkTypeModal = ({ isOpen, onClose, onSave, workType, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (workType) {
            setFormData({
                name: workType.name || '',
                code: workType.code || ''
            });
        } else {
            setFormData({ name: '', code: '' });
        }
        setModalError('');
    }, [workType, isOpen]);

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
                    <h2 className="text-xl font-semibold">{workType ? 'Edit' : 'Add'} Work Type</h2>
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

const WorkType = ({ embedded = false }) => {
    const [workTypes, setWorkTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkType, setEditingWorkType] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchWorkTypes = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/work-types`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setWorkTypes(response.data);
        } catch (err) {
            setError('Failed to fetch work types. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkTypes();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingWorkType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (workType) => {
        setEditingWorkType(workType);
        setIsModalOpen(true);
    };

    const handleDelete = async (workTypeId, workTypeName) => {
        if (window.confirm(`Are you sure you want to delete the work type "${workTypeName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/work-types/${workTypeId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setWorkTypes(workTypes.filter(t => t.id !== workTypeId));
            } catch (err) {
                setError('Failed to delete work type.');
                console.error(err);
            }
        }
    };

    const handleSave = async (workTypeData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingWorkType) {
                await axios.put(`${API_URL}/work-types/${editingWorkType.id}`, workTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/work-types`, workTypeData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchWorkTypes();
        } catch (err) {
            setError(err.response?.data || 'Failed to save work type. The name or code might already exist.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const content = (
        <>
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Work Types</h1>
                    <button
                        onClick={handleAdd}
                        className="btn-primary flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Work Type
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
                                    {workTypes.length > 0 ? (
                                        workTypes.map(wt => (
                                            <tr key={wt.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{wt.name}</td>
                                                <td className="td-cell text-sm text-slate-500">{wt.code}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(wt)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(wt.id, wt.name)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete">
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
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No work types found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new work type.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <WorkTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                workType={editingWorkType}
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

export default WorkType;
