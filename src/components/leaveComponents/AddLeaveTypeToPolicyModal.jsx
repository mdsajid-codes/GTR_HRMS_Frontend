import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import * as leaveApi from '../../pages/leaveApi';

const AddLeaveTypeToPolicyModal = ({ isOpen, onClose, onSelect, policy }) => {
    const [allLeaveTypes, setAllLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchAllLeaveTypes = async () => {
                setLoading(true);
                try {
                    const response = await leaveApi.getAllLeaveTypes();
                    const existingTypeIds = new Set(policy.leaveTypePolicies.map(ltp => ltp.leaveType.id));
                    const availableTypes = response.data.filter(lt => !existingTypeIds.has(lt.id));
                    setAllLeaveTypes(availableTypes);
                    if (availableTypes.length > 0) {
                        setSelectedLeaveTypeId(availableTypes[0].id);
                    }
                } catch (error) {
                    console.error("Failed to fetch leave types", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAllLeaveTypes();
        }
    }, [isOpen, policy]);

    const handleSelect = () => {
        const selectedType = allLeaveTypes.find(lt => lt.id.toString() === selectedLeaveTypeId);
        if (selectedType) {
            onSelect(selectedType);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-semibold">Add Leave Type to "{policy.name}"</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
                <div className="p-6 space-y-4">{loading ? <p>Loading...</p> : allLeaveTypes.length > 0 ? <><label htmlFor="leaveTypeSelect" className="block text-sm font-medium text-slate-700">Select a leave type to add:</label><select id="leaveTypeSelect" value={selectedLeaveTypeId} onChange={e => setSelectedLeaveTypeId(e.target.value)} className="input"><option value="" disabled>Select a type</option>{allLeaveTypes.map(lt => (<option key={lt.id} value={lt.id}>{lt.leaveType}</option>))}</select></> : <p className="text-slate-500">All available leave types are already in this policy.</p>}</div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="button" onClick={handleSelect} className="btn-primary" disabled={!selectedLeaveTypeId || loading}>Configure</button></div>
            </div>
        </div>
    );
};

export default AddLeaveTypeToPolicyModal;