import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Edit, Loader, AlertCircle, Star, ArrowLeft } from 'lucide-react';
import * as leaveApi from '../../pages/leaveApi';
import LeaveTypes from '../../pages/LeaveTypes'; // We will use the LeaveTypes component
import LeavePolicySetupModal from './LeavePolicySetupModal';
import AddLeaveTypeToPolicyModal from './AddLeaveTypeToPolicyModal';
import CreateLeaveClassModal from './CreateLeaveClassModal';
import LeavePolicyReviewModal from './LeavePolicyReviewModal';

const LeaveCategory = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('policies'); // 'policies' or 'types'
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [newPolicyData, setNewPolicyData] = useState(null);
    const [isSavingPolicy, setIsSavingPolicy] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [policyForAdding, setPolicyForAdding] = useState(null);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState(null);
    const [setupContext, setSetupContext] = useState({ policy: null, leaveType: null });

    const { policy: setupPolicy, leaveType: setupLeaveType } = setupContext;

    const fetchPolicies = useCallback(async () => {
        if (view !== 'policies') return; // Only fetch if we are on the policies view

        setLoading(true);
        setError('');
        try {
            const response = await leaveApi.getAllLeavePolicies();
            setPolicies(response.data);
        } catch (err) {
            setError('Failed to fetch leave policies.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [view]);

    useEffect(() => {
        fetchPolicies();
    }, [view, fetchPolicies]);

    const handleSetDefault = async (policyToSet) => {
        if (policyToSet.defaultPolicy) return; // Already default

        if (!window.confirm(`Are you sure you want to set "${policyToSet.name}" as the default policy?`)) {
            return;
        }

        try {
            // Your backend logic handles unsetting the old default when a new one is set.
            await leaveApi.updateLeavePolicy(policyToSet.id, { ...policyToSet, defaultPolicy: true });
            fetchPolicies(); // Refresh the list to show the change
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set default policy.');
            console.error(err);
        }
    };

    const handleOpenSetupModal = (policy, leaveType) => {
        setSetupContext({ policy, leaveType });
        setIsSetupModalOpen(true);
    };

    const handleOpenAddModal = (policy) => {
        setPolicyForAdding(policy);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (policy) => {
        setPolicyToEdit(policy);
        setIsCreateModalOpen(true); // Reuse the create modal for editing
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setPolicyForAdding(null);
    };

    const handleSelectLeaveTypeToAdd = (leaveType) => {
        handleCloseAddModal();
        handleOpenSetupModal(policyForAdding, leaveType);
    };
    const handleCloseSetupModal = () => {
        setIsSetupModalOpen(false);
        setSetupContext({ policy: null, leaveType: null });
    };

    const handleSaveSetup = async (leaveTypePolicyData) => {
        if (setupContext.isCreating) {
            // We are building a new policy. Add/update the configured leave type policy.
            setNewPolicyData(prev => {
                // The data from the setup modal has the leaveTypeId, but we also need the leaveType object for the review modal.
                const newLtp = { ...leaveTypePolicyData, leaveType: setupLeaveType };

                const existingIndex = prev.leaveTypePolicies.findIndex(ltp => ltp.leaveTypeId === newLtp.leaveTypeId);
                const newLeaveTypePolicies = [...prev.leaveTypePolicies];

                if (existingIndex > -1) {
                    newLeaveTypePolicies[existingIndex] = newLtp;
                } else {
                    newLeaveTypePolicies.push(newLtp);
                }
                return { ...prev, leaveTypePolicies: newLeaveTypePolicies };
            });
            setIsSetupModalOpen(false); // Close setup
            setIsReviewModalOpen(true); // Open review
            return;
        }

        // This is for editing an existing policy, not creating a new one.
        if (!setupPolicy || !setupLeaveType) return;

        // Find if a policy for this leave type already exists in the class
        const existingLTP = setupPolicy.leaveTypePolicies.find(
            ltp => ltp.leaveType.id === setupLeaveType.id
        );

        if (existingLTP) {
            // It's an update
            await leaveApi.updateLeaveTypePolicy(existingLTP.id, leaveTypePolicyData);
        } else {
            // It's a new addition
            await leaveApi.addLeaveTypePolicyToPolicy(setupPolicy.id, leaveTypePolicyData);
        }
        setIsSetupModalOpen(false); // Close setup modal after save
        // Refresh policies to get the latest data
        fetchPolicies();
    };

    const handleNextFromCreate = (policyData, leaveType) => {
        setIsCreateModalOpen(false);
        // Mark this context as a creation flow
        setNewPolicyData(policyData); // Start building the new policy object
        setSetupContext({ policy: policyData, leaveType, isCreating: true });
        setIsSetupModalOpen(true);
    };

    const handleSaveEdit = async (editedPolicyData) => {
        if (!policyToEdit) return;
        setIsSavingPolicy(true);
        try {
            await leaveApi.updateLeavePolicy(policyToEdit.id, editedPolicyData);
            alert("Leave Class updated successfully!");
            setIsCreateModalOpen(false);
            setPolicyToEdit(null);
            fetchPolicies();
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || 'Could not update leave class.'}`);
        } finally {
            setIsSavingPolicy(false);
        }
    };
    const handleAddAnotherFromReview = () => {
        setIsReviewModalOpen(false);
        handleOpenAddModal(newPolicyData); // Open the 'add' modal in the context of the new policy
    };

    const handleEditFromReview = (leaveTypeToEdit) => {
        setIsReviewModalOpen(false);
        const ltpData = newPolicyData.leaveTypePolicies.find(ltp => ltp.leaveTypeId === leaveTypeToEdit.id);
        setSetupContext({ policy: newPolicyData, leaveType: leaveTypeToEdit, leaveTypePolicy: ltpData, isCreating: true });
        setIsSetupModalOpen(true);
    };

    const handleFinalSavePolicy = async () => {
        if (!newPolicyData || newPolicyData.leaveTypePolicies.length === 0) {
            alert("Cannot save a leave class with no configured leave types.");
            return;
        }
        setIsSavingPolicy(true);
        try {
            await leaveApi.createLeavePolicy(newPolicyData);
            alert("Leave Class created successfully!");
            setIsReviewModalOpen(false);
            setNewPolicyData(null);
            fetchPolicies();
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || 'Could not create leave class.'}`);
        } finally {
            setIsSavingPolicy(false);
        }
    };

    if (view === 'types') {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center mb-6">
                    <button onClick={() => setView('policies')} className="btn-secondary flex items-center mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Leave Classes
                    </button>
                </div>
                <LeaveTypes onSetupClick={(leaveType) => alert(`Setup for '${leaveType.leaveType}' needs a policy context. Use the 'Action' button on a Leave Class.`)} />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Leave Class List</h2>
                <div className="flex gap-2">
                    <button onClick={() => setView('types')} className="btn-secondary flex items-center">
                        <Settings className="h-4 w-4 mr-2" /> Leave Settings
                    </button>
                    <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" /> Create Leave Class
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            {view === 'policies' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="th-cell">Leave Class Name</th>
                                        <th className="th-cell">Applicable to Employee</th>
                                        <th className="th-cell text-center">No. of Leaves</th>
                                        <th className="th-cell text-center">Click to make Default</th>
                                        <th className="th-cell">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {policies.map(policy => (
                                        <tr key={policy.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="td-cell font-medium">{policy.name}</td>
                                            <td className="td-cell text-sm text-slate-500">{policy.appliesToExpression || 'All Employees'}</td>
                                            <td className="td-cell text-center text-sm">{policy.leaveTypePolicies?.length || 0}</td>
                                            <td className="td-cell text-center">
                                                <button onClick={() => handleSetDefault(policy)} title={policy.defaultPolicy ? "This is the default policy" : "Click to make this the default policy"} disabled={policy.defaultPolicy}>
                                                    <Star className={`h-5 w-5 mx-auto ${policy.defaultPolicy ? 'text-yellow-500 fill-current' : 'text-slate-300 hover:text-yellow-400'}`} />
                                                </button>
                                            </td>
                                            <td className="td-cell">
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        onChange={(e) => {
                                                            const leaveTypeId = e.target.value;
                                                            if (leaveTypeId) {
                                                                const leaveType = policy.leaveTypePolicies.find(ltp => ltp.leaveType.id.toString() === leaveTypeId)?.leaveType || { id: leaveTypeId, leaveType: e.target.options[e.target.selectedIndex].text };
                                                                handleOpenSetupModal(policy, leaveType);
                                                                e.target.value = ''; // Reset dropdown
                                                            }
                                                        }}
                                                        className="btn-secondary py-1 px-2 text-xs"
                                                    >
                                                        <option value="">Configure...</option>
                                                        {policy.leaveTypePolicies?.map(ltp => (
                                                            // Ensure ltp and ltp.leaveType exist before rendering
                                                            ltp && ltp.leaveType && <option key={ltp.leaveType.id} value={ltp.leaveType.id}>Configure {ltp.leaveType.leaveType}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={() => handleOpenAddModal(policy)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full" title="Add Leave Type to this Class">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleOpenEditModal(policy)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Update">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {isAddModalOpen && policyForAdding && (
                <AddLeaveTypeToPolicyModal
                    isOpen={isAddModalOpen}
                    onClose={handleCloseAddModal}
                    onSelect={handleSelectLeaveTypeToAdd}
                    policy={policyForAdding}
                />
            )}

            <CreateLeaveClassModal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setPolicyToEdit(null); }}
                onNext={handleNextFromCreate}
                onSaveEdit={handleSaveEdit}
                policyToEdit={policyToEdit}
                isSaving={isSavingPolicy}
            />

            {newPolicyData && (
                <LeavePolicyReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => { setIsReviewModalOpen(false); setNewPolicyData(null); }}
                    onSave={handleFinalSavePolicy}
                    onAddAnother={handleAddAnotherFromReview}
                    onEdit={handleEditFromReview}
                    policyData={newPolicyData}
                    loading={isSavingPolicy}
                />
            )}

            {isSetupModalOpen && setupPolicy && setupLeaveType && (
                <LeavePolicySetupModal
                    isOpen={isSetupModalOpen}
                    onClose={handleCloseSetupModal}
                    onSave={handleSaveSetup}
                    policy={setupPolicy}
                    leaveType={setupLeaveType}
                    leaveTypePolicy={setupPolicy.leaveTypePolicies?.find(ltp => ltp.leaveType.id === setupLeaveType.id)}
                />
            )}
        </div>
    );
}

export default LeaveCategory;
