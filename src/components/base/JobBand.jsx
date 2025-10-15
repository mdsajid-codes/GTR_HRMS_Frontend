import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, Edit, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Modal for adding/editing job bands
const JobBandModal = ({ isOpen, onClose, onSave, jobBand, loading, designations }) => {
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        minSalary: '',
        maxSalary: '',
        notes: '',
        designationId: ''
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (jobBand) {
            setFormData({
                name: jobBand.name || '',
                level: jobBand.level || '',
                minSalary: jobBand.minSalary || '',
                maxSalary: jobBand.maxSalary || '',
                notes: jobBand.notes || '',
                designationId: jobBand.designationId || ''
            });
        } else {
            setFormData({ name: '', level: '', minSalary: '', maxSalary: '', notes: '', designationId: '' });
        }
        setModalError('');
    }, [jobBand, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.designationId) {
            setModalError('Name and Designation are required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{jobBand ? 'Edit' : 'Add'} Job Band</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Band Name</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} required className="input" />
                        </div>
                        <div>
                            <label htmlFor="level" className="block text-sm font-medium text-slate-700">Level</label>
                            <input id="level" name="level" type="number" value={formData.level} onChange={handleChange} className="input" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="designationId" className="block text-sm font-medium text-slate-700">Designation</label>
                            <select id="designationId" name="designationId" value={formData.designationId} onChange={handleChange} required className="input" disabled={!!jobBand}>
                                <option value="">Select a designation</option>
                                {designations?.map(desig => (
                                    <option key={desig.id} value={desig.id}>{desig.title} ({desig.departmentName})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="minSalary" className="block text-sm font-medium text-slate-700">Min Salary</label>
                            <input id="minSalary" name="minSalary" type="number" value={formData.minSalary} onChange={handleChange} className="input" />
                        </div>
                        <div>
                            <label htmlFor="maxSalary" className="block text-sm font-medium text-slate-700">Max Salary</label>
                            <input id="maxSalary" name="maxSalary" type="number" value={formData.maxSalary} onChange={handleChange} className="input" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" className="input" />
                        </div>
                        {modalError && <p className="md:col-span-2 text-red-500 text-sm">{modalError}</p>}
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

const JobBand = ({ embedded = false }) => {
    const [jobBands, setJobBands] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJobBand, setEditingJobBand] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchJobBands = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/jobBands`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setJobBands(response.data);
        } catch (err) {
            setError('Failed to fetch job bands. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDesignations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/designations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setDesignations(response.data);
        } catch (err) {
            console.error('Failed to fetch designations for modal:', err);
            setError(prev => prev ? `${prev} Also failed to load designations.` : 'Failed to load designations.');
        }
    };

    useEffect(() => {
        fetchJobBands();
        fetchDesignations();
    }, [API_URL]);

    const handleAdd = () => {
        setEditingJobBand(null);
        setIsModalOpen(true);
    };

    const handleEdit = (jobBand) => {
        setEditingJobBand(jobBand);
        setIsModalOpen(true);
    };

    const handleDelete = async (jobBandId, jobBandName) => {
        if (window.confirm(`Are you sure you want to delete the job band "${jobBandName}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/jobBands/${jobBandId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setJobBands(jobBands.filter(jb => jb.id !== jobBandId));
            } catch (err) {
                setError('Failed to delete job band.');
                console.error(err);
            }
        }
    };

    const handleSave = async (jobBandData) => {
        setModalLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingJobBand) {
                // When editing, we don't send designationId as it's not editable
                const { designationId, ...updateData } = jobBandData;
                await axios.put(`${API_URL}/jobBands/${editingJobBand.id}`, updateData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } else {
                const { designationId, ...createData } = jobBandData;
                await axios.post(`${API_URL}/jobBands/for-designation/${designationId}`, createData, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchJobBands();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save job band. The name or designation might already have a band.');
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const formatSalary = (amount) => {
        if (amount == null) return 'N/A';
        // Assuming amount is in smallest unit (paise)
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const content = (
        <>
            <div className={embedded ? "p-4 sm:p-6" : "p-6 md:p-8"}>
                <div className="flex justify-between items-center mb-4">
                    {!embedded && (
                        <h1 className="text-3xl font-bold text-slate-800">Job Bands</h1>
                    )}
                    <button
                        onClick={handleAdd}
                        className={`btn-primary flex items-center ${embedded ? 'ml-auto' : ''}`}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Job Band
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
                                        <th className="th-cell">Band Name</th>
                                        <th className="th-cell">Designation</th>
                                        <th className="th-cell">Level</th>
                                        <th className="th-cell">Min Salary</th>
                                        <th className="th-cell">Max Salary</th>
                                        <th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {jobBands.length > 0 ? (
                                        jobBands.map(jb => (
                                            <tr key={jb.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="td-cell font-medium">{jb.name}</td>
                                                <td className="td-cell text-sm text-slate-500">{jb.designationTitle || 'N/A'}</td>
                                                <td className="td-cell text-sm text-slate-500">{jb.level}</td>
                                                <td className="td-cell text-sm text-slate-500">{formatSalary(jb.minSalary)}</td>
                                                <td className="td-cell text-sm text-slate-500">{formatSalary(jb.maxSalary)}</td>
                                                <td className="td-cell">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleEdit(jb)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(jb.id, jb.name)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-10 text-slate-500">
                                                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No job bands found</h3>
                                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new job band.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <JobBandModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                jobBand={editingJobBand}
                designations={designations}
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

export default JobBand;