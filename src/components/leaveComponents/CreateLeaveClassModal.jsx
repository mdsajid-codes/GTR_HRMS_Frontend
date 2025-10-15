import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import * as leaveApi from '../../pages/leaveApi';

const CreateLeaveClassModal = ({ isOpen, onClose, onNext, policyToEdit, onSaveEdit, isSaving }) => {
    const [policyName, setPolicyName] = useState('');
    const [appliesTo, setAppliesTo] = useState('All Employees');
    const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
    const [allLeaveTypes, setAllLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isEditMode = !!policyToEdit;

    useEffect(() => {
        if (isOpen) {
            setError('');

            if (isEditMode) {
                setPolicyName(policyToEdit.name);
                setAppliesTo(policyToEdit.appliesToExpression || 'All Employees');
                setLoading(false);
            } else {
                // Reset state for creation
                setPolicyName('');
                setAppliesTo('All Employees');
                setSelectedLeaveTypeId('');

                const fetchAllLeaveTypes = async () => {
                    setLoading(true);
                    try {
                        const response = await leaveApi.getAllLeaveTypes();
                        const leaveTypes = response.data || [];
                        setAllLeaveTypes(leaveTypes);
                        if (leaveTypes.length > 0) {
                            setSelectedLeaveTypeId(leaveTypes[0].id.toString());
                        }
                    } catch (error) {
                        console.error("Failed to fetch leave types", error);
                        setError('Could not load available leave types.');
                    } finally {
                        setLoading(false);
                    }
                };
                fetchAllLeaveTypes();
            }
        }
    }, [isOpen, isEditMode, policyToEdit]);

    const handleNext = () => {
        if (!policyName.trim() || (!isEditMode && !selectedLeaveTypeId)) {
            setError('Policy Name and a starting Leave Type are required.');
            return;
        }
        const selectedType = allLeaveTypes.find(lt => lt.id.toString() === selectedLeaveTypeId);

        if (isEditMode) {
            // Call the save handler for edits
            onSaveEdit({
                name: policyName,
                appliesToExpression: appliesTo === 'All Employees' ? null : appliesTo,
                defaultPolicy: policyToEdit.defaultPolicy, // Preserve default status
            });
        } else {
            // Call the next handler for creation wizard
            onNext({
                name: policyName,
                appliesToExpression: appliesTo === 'All Employees' ? null : appliesTo,
                defaultPolicy: false,
                leaveTypePolicies: [],
            }, selectedType);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Leave Class' : 'Create New Leave Class'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    {error && <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</div>}
                    <div>
                        <label htmlFor="policyName" className="block text-sm font-medium text-slate-700">Leave Class Name</label>
                        <input type="text" id="policyName" value={policyName} onChange={e => setPolicyName(e.target.value)} className="input mt-1" placeholder="e.g., Standard Employee Policy" />
                    </div>
                    <div>
                        <label htmlFor="appliesTo" className="block text-sm font-medium text-slate-700">Applicable To</label>
                        <input type="text" id="appliesTo" value={appliesTo} onChange={e => setAppliesTo(e.target.value)} className="input mt-1" placeholder="e.g., All Employees, or an expression" />
                    </div>
                    {!isEditMode && (
                        <div className="border-t pt-4">
                            <label htmlFor="leaveTypeSelect" className="block text-sm font-medium text-slate-700">Select first leave type to configure</label>
                            <p className="text-xs text-slate-500 mb-2">You must configure at least one leave type to create a class.</p>
                            {loading ? <Loader className="animate-spin" /> : <select id="leaveTypeSelect" value={selectedLeaveTypeId} onChange={e => setSelectedLeaveTypeId(e.target.value)} className="input"><option value="" disabled>Select a type</option>{allLeaveTypes.map(lt => (<option key={lt.id} value={lt.id}>{lt.leaveType}</option>))}</select>}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleNext} className="btn-primary" disabled={loading || isSaving || (!isEditMode && !selectedLeaveTypeId)}>
                        {isEditMode ? 'Save Changes' : 'Next: Configure Rules'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateLeaveClassModal;