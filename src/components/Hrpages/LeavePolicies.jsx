import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader, AlertCircle, Settings } from 'lucide-react';
import * as leaveApi from '../../pages/leaveApi';
import LeavePolicySetupModal from '../leaveComponents/LeavePolicySetupModal';

const LeavePolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [selectedLeaveTypePolicy, setSelectedLeaveTypePolicy] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [policiesRes, leaveTypesRes] = await Promise.all([
                leaveApi.getAllLeavePolicies(),
                leaveApi.getAllLeaveTypes(),
            ]);
            setPolicies(policiesRes.data);
            setLeaveTypes(leaveTypesRes.data);
        } catch (err) {
            setError('Failed to fetch leave policies or types.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (policy, leaveType, leaveTypePolicy = null) => {
        setSelectedPolicy(policy);
        setSelectedLeaveType(leaveType);
        setSelectedLeaveTypePolicy(leaveTypePolicy);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPolicy(null);
        setSelectedLeaveType(null);
        setSelectedLeaveTypePolicy(null);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedLeaveTypePolicy?.id) {
                // Update existing leave type policy
                await leaveApi.updateLeaveTypePolicy(selectedLeaveTypePolicy.id, formData);
            } else {
                // Add new leave type to policy
                await leaveApi.addLeaveTypePolicyToPolicy(selectedPolicy.id, formData);
            }
            handleCloseModal();
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Save error:", err);
            alert(`Error: ${err.response?.data?.message || 'Could not save settings.'}`);
        }
    };

    const handleDeletePolicy = async (policyId) => {
        if (window.confirm('Are you sure you want to delete this entire policy? This action cannot be undone.')) {
            try {
                await leaveApi.deleteLeavePolicy(policyId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete policy.');
            }
        }
    };

    const handleDeleteLeaveTypeFromPolicy = async (leaveTypePolicyId) => {
        if (window.confirm('Are you sure you want to remove this leave type from the policy?')) {
            try {
                await leaveApi.deleteLeaveTypePolicy(leaveTypePolicyId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to remove leave type from policy.');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Leave Policies</h2>
                {/* <button onClick={() => {}} className="btn-primary flex items-center"><Plus className="h-4 w-4 mr-2" /> New Policy</button> */}
            </div>

            {policies.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No policies found</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating a new leave policy.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {policies.map(policy => (
                        <div key={policy.id} className="bg-white border border-slate-200 rounded-lg">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-slate-800">{policy.name} {policy.defaultPolicy && <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full ml-2">Default</span>}</h3>
                                <button onClick={() => handleDeletePolicy(policy.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                            </div>
                            <div className="p-4 space-y-3">
                                {Array.isArray(policy.leaveTypePolicies) && policy.leaveTypePolicies.map(ltp => {
                                    const fullLeaveType = leaveTypes.find(lt => lt.id === ltp.leaveTypeId);
                                    if (!fullLeaveType) return null; // Skip if leave type not found

                                    return (
                                        <div key={ltp.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                                            <span className="font-medium text-slate-700">{fullLeaveType.leaveType.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal(policy, fullLeaveType, ltp)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Configure"><Settings size={16} /></button>
                                                <button onClick={() => handleDeleteLeaveTypeFromPolicy(ltp.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Remove from policy"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="pt-2">
                                    <select onChange={(e) => e.target.value && handleOpenModal(policy, leaveTypes.find(lt => lt.id === parseInt(e.target.value)))} className="input text-sm" value="">
                                        <option value="" disabled>+ Add Leave Type to Policy...</option>
                                        {leaveTypes.filter(lt => !(policy.leaveTypePolicies || []).some(plt => plt.leaveTypeId === lt.id)).map(lt => (
                                            <option key={lt.id} value={lt.id}>{lt.leaveType.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <LeavePolicySetupModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    policy={selectedPolicy}
                    leaveType={selectedLeaveType}
                    leaveTypePolicy={selectedLeaveTypePolicy}
                />
            )}
        </div>
    );
};

export default LeavePolicies;