import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Modal component for adding/editing designations
const DesignationModal = ({ isOpen, onClose, onSave, designation, loading, departments }) => {
    const [formData, setFormData] = useState({
        title: '',
        level: '',
        description: '',
        departmentCode: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (designation) {
            setFormData({
                title: designation.title || '',
                level: designation.level || '',
                description: designation.description || '',
                // When editing, department is not changeable via this modal.
                departmentCode: designation.departmentCode || ''
            });
        } else {
            setFormData({ title: '', level: '', description: '', departmentCode: '' });
        }
        setModalError('');
    }, [designation, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !String(formData.level).trim()) {
            setModalError('Title and Level are required.');
            return;
        }
        if (!designation && !formData.departmentCode) {
            setModalError('Department is required for new designations.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{designation ? 'Edit' : 'Add'} Designation</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {designation ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Department</label>
                                <p className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-500">
                                    {designation.departmentName || 'N/A'}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="departmentCode" className="block text-sm font-medium text-slate-700">Department</label>
                                <select id="departmentCode" name="departmentCode" value={formData.departmentCode} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm">
                                    <option value="">Select a department</option>
                                    {departments?.map(dept => (
                                        <option key={dept.id} value={dept.code}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                            <input id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="level" className="block text-sm font-medium text-slate-700">Level</label>
                            <input id="level" name="level" value={formData.level} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm" />
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

const Designation = ({ embedded = false }) => {
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesignation, setEditingDesignation] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchDesignations = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/designations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setDesignations(response.data);
        } catch (err) {
            setError('Failed to fetch designations. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/departments`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setDepartments(response.data);
        } catch (err) {
            console.error('Failed to fetch departments for modal:', err);
            setError(prev => prev ? `${prev} Also failed to load departments.` : 'Failed to load departments.');
        }
    };

    useEffect(() => {
        fetchDesignations();
        fetchDepartments();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingDesignation(null);
        setIsModalOpen(true);
    };

    const handleEdit = (designation) => {
        setEditingDesignation(designation);
        setIsModalOpen(true);
    };

    const handleDelete = async (designationId, designationTitle) => {
        if (window.confirm(`Are you sure you want to delete the designation "${designationTitle}"? This action cannot be undone.`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/designations/${designationId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setDesignations(designations.filter(d => d.id !== designationId));
            } catch (err) {
                setError('Failed to delete designation.');
                console.error(err);
            }
        }
    };

    const handleSave = async (designationData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingDesignation) {
                const { departmentCode, ...updateData } = designationData;
                await axios.put(`${API_URL}/designations/${editingDesignation.id}`, updateData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                const { departmentCode, ...createData } = designationData;
                await axios.post(`${API_URL}/designations/for-department/${departmentCode}`, createData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchDesignations(); // Refetch to get the latest data
        } catch (err) {
            setError('Failed to save designation. The title might already exist in the selected department.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const content = (
        <>
            <div className={embedded ? "p-4 sm:p-6" : "p-6 md:p-8"}>
                <div className="flex justify-between items-center mb-4">
                    {!embedded && (
                        <h1 className="text-3xl font-bold text-slate-800">Designations</h1>
                    )}
                    <button 
                        onClick={handleAdd}
                        className={`btn-primary flex items-center ${embedded ? 'ml-auto' : ''}`}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Designation
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
                                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Title</th>
                                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Department</th>
                                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Level</th>
                                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Description</th>
                                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {designations.length > 0 ? (
                                        designations.map(desig => (
                                            <tr key={desig.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="py-3 px-4 font-medium">{desig.title}</td>
                                                <td className="py-3 px-4 text-sm text-slate-500">{desig.departmentName || 'N/A'}</td>
                                                <td className="py-3 px-4 text-sm text-slate-500">{desig.level}</td>
                                                <td className="py-3 px-4 text-sm text-slate-500 max-w-sm truncate" title={desig.description}>{desig.description}</td>
                                                <td className="py-3 px-4 flex items-center gap-2">
                                                    <button onClick={() => handleEdit(desig)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(desig.id, desig.title)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-slate-500">
                                                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No designations found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new designation.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <DesignationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                designation={editingDesignation}
                departments={departments}
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

export default Designation;
