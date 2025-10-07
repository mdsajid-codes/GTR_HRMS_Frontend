import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle } from 'lucide-react';
import * as leaveApi from '../../api/leaveApi';
import Modal from './Modal'; // A generic modal component

const LeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLeaveType, setCurrentLeaveType] = useState(null);

    const fetchLeaveTypes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await leaveApi.getAllLeaveTypes();
            setLeaveTypes(response.data);
        } catch (err) {
            setError('Failed to fetch leave types.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaveTypes();
    }, [fetchLeaveTypes]);

    const handleOpenModal = (leaveType = null) => {
        setCurrentLeaveType(leaveType);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLeaveType(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this leave type?')) {
            try {
                await leaveApi.deleteLeaveType(id);
                fetchLeaveTypes(); // Refresh list
            } catch (err) {
                setError('Failed to delete leave type.');
                console.error(err);
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (currentLeaveType?.id) {
                await leaveApi.updateLeaveType(currentLeaveType.id, formData);
            } else {
                await leaveApi.createLeaveType(formData);
            }
            fetchLeaveTypes();
            handleCloseModal();
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save leave type. Check console for details.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-red-600 bg-red-100 p-4 rounded-lg flex items-center"><AlertCircle className="mr-2"/>{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-700">Manage Leave Types</h2>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={18} /> Add New
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Leave Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Max Days/Year</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {leaveTypes.map((type) => (
                            <tr key={type.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{type.leaveType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{type.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{type.isPaid ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{type.maxDaysPerYear}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <button onClick={() => handleOpenModal(type)} className="text-blue-600 hover:text-blue-800 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(type.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <LeaveTypeFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    leaveType={currentLeaveType}
                />
            )}
        </div>
    );
};

// This would be a new component, likely in the same file or a separate one.
const LeaveTypeFormModal = ({ isOpen, onClose, onSave, leaveType }) => {
    const [formData, setFormData] = useState({
        leaveType: leaveType?.leaveType || '',
        description: leaveType?.description || '',
        isPaid: leaveType?.isPaid || false,
        maxDaysPerYear: leaveType?.maxDaysPerYear || 0,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={leaveType ? 'Edit Leave Type' : 'Add Leave Type'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields for leaveType, description, isPaid, maxDaysPerYear */}
                {/* Example for one field: */}
                <div>
                    <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700">Leave Type Name</label>
                    <input type="text" name="leaveType" id="leaveType" value={formData.leaveType} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                {/* ... other fields ... */}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                </div>
            </form>
        </Modal>
    );
};

export default LeaveTypes;