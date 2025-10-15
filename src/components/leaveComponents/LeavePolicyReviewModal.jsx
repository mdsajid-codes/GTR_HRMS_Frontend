import React from 'react';
import { X, Plus, Edit, Save, Loader } from 'lucide-react';

const LeavePolicyReviewModal = ({
    isOpen,
    onClose,
    onSave,
    onAddAnother,
    onEdit,
    policyData,
    loading
}) => {
    if (!isOpen) return null;

    const { name, appliesToExpression, leaveTypePolicies = [] } = policyData;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Review New Leave Class</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="font-bold text-lg">{name}</h3>
                        <p className="text-sm text-slate-500">Applies to: {appliesToExpression || 'All Employees'}</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold">Configured Leave Types ({leaveTypePolicies.length})</h4>
                        {leaveTypePolicies.length > 0 ? (
                            <ul className="border rounded-md divide-y">
                                {leaveTypePolicies.map((ltp, index) => (
                                    <li key={index} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{ltp.leaveType.leaveType}</p>
                                            <p className="text-xs text-slate-500">Quota: {ltp.quotaLimitType === 'UNLIMITED' ? 'Unlimited' : `${ltp.quotaDays} days`}</p>
                                        </div>
                                        <button onClick={() => onEdit(ltp.leaveType)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit Rules">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 text-sm text-center py-4">No leave types configured yet.</p>
                        )}
                    </div>
                    <button onClick={onAddAnother} className="w-full btn-secondary flex items-center justify-center gap-2">
                        <Plus size={16} /> Add Another Leave Type
                    </button>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={onSave} className="btn-success flex items-center gap-2" disabled={loading || leaveTypePolicies.length === 0}>
                        {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Create Leave Class
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeavePolicyReviewModal;