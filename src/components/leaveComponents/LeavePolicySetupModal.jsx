import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, X, Loader } from 'lucide-react';
import * as leaveApi from '../../pages/leaveApi';

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Field = ({ label, children, helpText }) => (
    <div className="py-3">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-1">{children}</div>
        {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
);

const TextInput = (props) => <input {...props} className="input" />;
const NumberInput = (props) => <input type="number" {...props} className="input" />;
const Select = (props) => <select {...props} className="input">{props.children}</select>;
const Checkbox = ({ label, ...props }) => (
    <label className="inline-flex items-center gap-2">
        <input type="checkbox" {...props} className="h-4 w-4 rounded" />
        <span className="text-sm">{label}</span>
    </label>
);

const STEPS = [
    { id: 1, title: 'Annual Quota' },
    { id: 2, title: 'Accrual & Rounding' },
    { id: 3, title: 'Application Rules' },
    { id: 4, title: 'Restrictions' },
    { id: 5, title: 'Holidays & Weekends' },
    { id: 6, title: 'Approvals' },
    { id: 7, title: 'Year-End Processing' },
];

const LeavePolicySetupModal = ({ isOpen, onClose, onSave, policy, leaveType, leaveTypePolicy }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialData = {
                leaveTypeId: leaveType.id,
                leaveType: leaveType, // Ensure the leaveType object is included
                quotaLimitType: 'LIMITED',
                quotaDays: 0,
                accrualType: 'ENTIRE_QUOTA',
                roundingPolicy: 'NO_ROUNDING',
                applicationSettings: { allowHalfDay: false, selfApplyAllowed: true, requireComment: false, ...leaveTypePolicy?.applicationSettings },
                restrictionSettings: { allowedInNoticePeriod: true, ...leaveTypePolicy?.restrictionSettings },
                sandwichRules: { holidayAdjacencyPolicy: 'COUNT_AS_LEAVE', weekOffAdjacencyPolicy: 'COUNT_AS_LEAVE', ...leaveTypePolicy?.sandwichRules },
                approvalFlow: { approvalRequired: true, levels: 1, selectionMode: 'ROLE_BASED', ...leaveTypePolicy?.approvalFlow },
                approvalLevels: [],
                yearEndProcessing: { positiveBalanceAction: 'EXPIRE_OR_RESET', negativeBalancePolicy: 'NULLIFY', ...leaveTypePolicy?.yearEndProcessing },
                // Important: Spread existing policy last to override defaults
                ...leaveTypePolicy,
                // But ensure nested objects are properly merged
                approvalLevels: leaveTypePolicy?.approvalLevels || [],
            };
            setFormData(initialData);
            setCurrentStep(1);
        }
    }, [isOpen, policy, leaveType, leaveTypePolicy]);

    const handleChange = (section, field) => (e) => {
        const { value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: val }));
        }
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            // Ensure approvalLevels is an array, even if it's empty.
            const payload = {
                ...formData,
                approvalLevels: formData.approvalLevels || []
            };
            // onSave now handles both creation and update logic in the parent
            await onSave(payload); 
        } catch (error) {
            console.error("Error during save setup:", error);
            alert(`Error: ${error.response?.data?.message || 'Could not save settings.'}`);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        const props = { data: formData, onChange: handleChange };
        switch (currentStep) {
            case 1: return <Step1_AnnualQuota {...props} />;
            case 2: return <Step2_Accrual {...props} />;
            case 3: return <Step3_Application {...props} />;
            case 4: return <Step4_Restrictions {...props} />;
            case 5: return <Step5_Sandwich {...props} />;
            case 6: return <Step6_Approvals {...props} />;
            case 7: return <Step7_YearEnd {...props} />;
            default: return null;
        }
    };

    const title = `Configure '${leaveType?.leaveType}' for '${policy?.name}'`;
    const stepTitle = STEPS[currentStep - 1]?.title;

    const fullTitle = `${title} - ${stepTitle}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={fullTitle}>
            <div className="flex-grow overflow-y-auto p-6">
                {renderStepContent()}
            </div>
            <div className="p-4 border-t flex justify-between items-center flex-shrink-0">
                <div>Step {currentStep} of {STEPS.length}</div>
                <div className="flex gap-2">
                    {currentStep > 1 && <button onClick={() => setCurrentStep(s => s - 1)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</button>}
                    {currentStep < STEPS.length && <button onClick={() => setCurrentStep(s => s + 1)} className="btn-primary flex items-center gap-2">Next <ArrowRight size={16} /></button>}
                    {currentStep === STEPS.length && (
                        <button onClick={handleSaveClick} className="btn-primary flex items-center gap-2" disabled={loading}>
                            {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const Step1_AnnualQuota = ({ data, onChange }) => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg">Annual Quota</h3>
        <Field label="Quota Limit Type">
            <Select name="quotaLimitType" value={data.quotaLimitType} onChange={onChange(null, 'quotaLimitType')}>
                <option value="LIMITED">Limited</option>
                <option value="UNLIMITED">Unlimited</option>
            </Select>
        </Field>
        {data.quotaLimitType === 'LIMITED' && (
            <>
                <Field label="Annual Quota (Days)">
                    <NumberInput name="quotaDays" value={data.quotaDays} onChange={onChange(null, 'quotaDays')} />
                </Field>
                <Field label="Prorate Policy for Mid-Year Joiners">
                    <Select name="midYearJoinProratePolicy" value={data.midYearJoinProratePolicy} onChange={onChange(null, 'midYearJoinProratePolicy')}>
                        <option value="">Select Policy</option>
                        <option value="PRORATE_ON_JOIN_DATE">Prorate based on joining date</option>
                        <option value="FULL_QUOTA">Give full quota regardless of joining date</option>
                    </Select>
                </Field>
                {data.midYearJoinProratePolicy === 'PRORATE_ON_JOIN_DATE' && (
                    <Field label="Joining Month Cutoff Day" helpText="No leave in joining month if joined after this day. (e.g., 15)">
                        <NumberInput name="joinMonthCutoffDay" value={data.joinMonthCutoffDay} onChange={onChange(null, 'joinMonthCutoffDay')} placeholder="1 to 31" />
                    </Field>
                )}
            </>
        )}
    </div>
);

const Step2_Accrual = ({ data, onChange }) => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg">Accrual & Rounding</h3>
        <Field label="Accrual Type">
            <Select name="accrualType" value={data.accrualType} onChange={onChange(null, 'accrualType')}>
                <option value="ENTIRE_QUOTA">Entire quota credited at start of year</option>
                <option value="PERIODIC">Earned periodically</option>
            </Select>
        </Field>
        {data.accrualType === 'PERIODIC' && (
            <>
                <Field label="Accrual Interval">
                    <Select name="accrualInterval" value={data.accrualInterval} onChange={onChange(null, 'accrualInterval')}>
                        <option value="">Select Interval</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="BI_ANNUALLY">Bi-Annually</option>
                    </Select>
                </Field>
                <Field label="Accrual Amount (Days per interval)">
                    <NumberInput name="accrualAmountDays" value={data.accrualAmountDays} onChange={onChange(null, 'accrualAmountDays')} />
                </Field>
            </>
        )}
        <Field label="Rounding Policy">
            <Select name="roundingPolicy" value={data.roundingPolicy} onChange={onChange(null, 'roundingPolicy')}>
                <option value="NO_ROUNDING">No Rounding</option>
                <option value="ROUND_UP">Round Up</option>
                <option value="ROUND_DOWN">Round Down</option>
                <option value="ROUND_NEAREST">Round to Nearest</option>
            </Select>
        </Field>
    </div>
);

const Step3_Application = ({ data, onChange }) => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg">Application Rules</h3>
        <div className="grid grid-cols-2 gap-4">
            <Checkbox label="Allow half-day applications" name="allowHalfDay" checked={data.applicationSettings?.allowHalfDay} onChange={onChange('applicationSettings', 'allowHalfDay')} />
            <Checkbox label="Employees can apply for this leave" name="selfApplyAllowed" checked={data.applicationSettings?.selfApplyAllowed} onChange={onChange('applicationSettings', 'selfApplyAllowed')} />
            <Checkbox label="Require a comment for requests" name="requireComment" checked={data.applicationSettings?.requireComment} onChange={onChange('applicationSettings', 'requireComment')} />
        </div>
        <Field label="Require attachment if leave exceeds (days)" helpText="Leave blank if not required.">
            <NumberInput name="attachmentIfExceedsDays" value={data.applicationSettings?.attachmentIfExceedsDays} onChange={onChange('applicationSettings', 'attachmentIfExceedsDays')} />
        </Field>
        <Field label="Allow back-dated applications">
            <Checkbox label="Yes, allow back-dated" name="allowBackdatedApplication" checked={data.applicationSettings?.allowBackdatedApplication} onChange={onChange('applicationSettings', 'allowBackdatedApplication')} />
        </Field>
        {data.applicationSettings?.allowBackdatedApplication && (
            <Field label="Maximum back-dated days">
                <NumberInput name="backdatedMaxDays" value={data.applicationSettings?.backdatedMaxDays} onChange={onChange('applicationSettings', 'backdatedMaxDays')} />
            </Field>
        )}
    </div>
);

const Step4_Restrictions = ({ data, onChange }) => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg">Restrictions</h3>
        <Field label="New Joiner Eligibility">
            <Select name="eligibilityAnchor" value={data.restrictionSettings?.eligibilityAnchor} onChange={onChange('restrictionSettings', 'eligibilityAnchor')}>
                <option value="">No Restriction</option>
                <option value="AFTER_PROBATION">After Probation Period</option>
                <option value="AFTER_JOINING">After a specific number of days from joining</option>
            </Select>
        </Field>
        {data.restrictionSettings?.eligibilityAnchor === 'AFTER_JOINING' && (
            <Field label="Eligible after (days)">
                <NumberInput name="eligibilityAfterDays" value={data.restrictionSettings?.eligibilityAfterDays} onChange={onChange('restrictionSettings', 'eligibilityAfterDays')} />
            </Field>
        )}
        <Field label="Consecutive Days Limit">
            <Checkbox label="Limit consecutive days per request" name="limitConsecutiveDays" checked={data.restrictionSettings?.limitConsecutiveDays} onChange={onChange('restrictionSettings', 'limitConsecutiveDays')} />
        </Field>
        {data.restrictionSettings?.limitConsecutiveDays && (
            <Field label="Max consecutive days allowed">
                <NumberInput name="maxConsecutiveDays" value={data.restrictionSettings?.maxConsecutiveDays} onChange={onChange('restrictionSettings', 'maxConsecutiveDays')} />
            </Field>
        )}
        <Field label="Monthly Usage Limit">
            <Checkbox label="Limit total days taken per month" name="limitMonthlyUsage" checked={data.restrictionSettings?.limitMonthlyUsage} onChange={onChange('restrictionSettings', 'limitMonthlyUsage')} />
        </Field>
        {data.restrictionSettings?.limitMonthlyUsage && (
            <Field label="Max days allowed per month">
                <NumberInput name="maxMonthlyDays" value={data.restrictionSettings?.maxMonthlyDays} onChange={onChange('restrictionSettings', 'maxMonthlyDays')} />
            </Field>
        )}
        <Field label="Notice Period">
            <Checkbox label="Allow applying during notice period" name="allowedInNoticePeriod" checked={data.restrictionSettings?.allowedInNoticePeriod} onChange={onChange('restrictionSettings', 'allowedInNoticePeriod')} />
        </Field>
    </div>
);

const Step5_Sandwich = ({ data, onChange }) => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg">Holidays & Weekends (Sandwich Rules)</h3>
        <Field label="Holiday Adjacency Policy" helpText="How to treat holidays that fall between leave days.">
            <Select name="holidayAdjacencyPolicy" value={data.sandwichRules?.holidayAdjacencyPolicy} onChange={onChange('sandwichRules', 'holidayAdjacencyPolicy')}>
                <option value="COUNT_AS_LEAVE">Count as Leave</option>
                <option value="DO_NOT_COUNT">Do Not Count</option>
            </Select>
        </Field>
        <Field label="Weekend Adjacency Policy" helpText="How to treat weekends that fall between leave days.">
            <Select name="weekOffAdjacencyPolicy" value={data.sandwichRules?.weekOffAdjacencyPolicy} onChange={onChange('sandwichRules', 'weekOffAdjacencyPolicy')}>
                <option value="COUNT_AS_LEAVE">Count as Leave</option>
                <option value="DO_NOT_COUNT">Do Not Count</option>
            </Select>
        </Field>
    </div>
);

const Step6_Approvals = ({ data, onChange }) => {
    const handleLevelChange = (index, field) => (e) => {
        const newLevels = [...(data.approvalLevels || [])];
        newLevels[index] = { ...newLevels[index], [field]: e.target.value };
        onChange({ target: { name: 'approvalLevels', value: newLevels } });
    };

    const addLevel = () => {
        const newLevel = { levelOrder: (data.approvalLevels?.length || 0) + 1, selectionMode: 'ROLE_BASED', roleKey: 'REPORTING_MANAGER' };
        const newLevels = [...(data.approvalLevels || []), newLevel];
        onChange({ target: { name: 'approvalLevels', value: newLevels } });
    };

    const removeLevel = (index) => {
        const newLevels = data.approvalLevels.filter((_, i) => i !== index);
        onChange({ target: { name: 'approvalLevels', value: newLevels } });
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Approval Workflow</h3>
            <Field label="Approval Requirement">
                <Checkbox label="This leave type requires approval" name="approvalRequired" checked={data.approvalFlow?.approvalRequired} onChange={onChange('approvalFlow', 'approvalRequired')} />
            </Field>
            {data.approvalFlow?.approvalRequired && (
                <>
                    {data.approvalLevels?.map((level, index) => (
                        <div key={index} className="p-4 border rounded-md bg-slate-50 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">Level {level.levelOrder}</h4>
                                <button onClick={() => removeLevel(index)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                            </div>
                            <Field label="Approver Type">
                                <Select value={level.selectionMode} onChange={handleLevelChange(index, 'selectionMode')}>
                                    <option value="ROLE_BASED">Role Based</option>
                                    <option value="NAMED_EMPLOYEES">Specific Employee</option>
                                </Select>
                            </Field>
                            {level.selectionMode === 'ROLE_BASED' ? (
                                <Field label="Role">
                                    <Select value={level.roleKey} onChange={handleLevelChange(index, 'roleKey')}>
                                        <option value="REPORTING_MANAGER">Reporting Manager</option>
                                        <option value="HR_MANAGER">HR Manager</option>
                                        <option value="DEPARTMENT_HEAD">Department Head</option>
                                    </Select>
                                </Field>
                            ) : (
                                <Field label="Employee ID">
                                    <TextInput value={level.employeeId} onChange={handleLevelChange(index, 'employeeId')} placeholder="Enter Employee ID" />
                                </Field>
                            )}
                        </div>
                    ))}
                    <button onClick={addLevel} className="btn-secondary text-sm">Add Approval Level</button>
                </>
            )}
        </div>
    );
};

const Step7_YearEnd = ({ data, onChange }) => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg">Year-End Processing</h3>
        <Field label="Positive Balance Action" helpText="What happens to unused leave balance at the end of the year?">
            <Select name="positiveBalanceAction" value={data.yearEndProcessing?.positiveBalanceAction} onChange={onChange('yearEndProcessing', 'positiveBalanceAction')}>
                <option value="EXPIRE_OR_RESET">Expire / Reset to Zero</option>
                <option value="PAY_OUT">Pay Out</option>
                <option value="CARRY_FORWARD">Carry Forward</option>
            </Select>
        </Field>
        {data.yearEndProcessing?.positiveBalanceAction === 'CARRY_FORWARD' && (
            <>
                <Field label="Carry Forward Expiry">
                    <Checkbox label="Carried forward balance expires" name="carryForwardExpires" checked={data.yearEndProcessing?.carryForwardExpires} onChange={onChange('yearEndProcessing', 'carryForwardExpires')} />
                </Field>
                {data.yearEndProcessing?.carryForwardExpires && (
                    <Field label="Expires after (days in next year)">
                        <NumberInput name="carryForwardExpiryDays" value={data.yearEndProcessing?.carryForwardExpiryDays} onChange={onChange('yearEndProcessing', 'carryForwardExpiryDays')} />
                    </Field>
                )}
            </>
        )}
        <Field label="Negative Balance Policy" helpText="How to handle negative leave balance at year-end.">
            <Select name="negativeBalancePolicy" value={data.yearEndProcessing?.negativeBalancePolicy} onChange={onChange('yearEndProcessing', 'negativeBalancePolicy')}>
                <option value="DEDUCT_FROM_SALARY">Deduct from Salary</option>
                <option value="NULLIFY">Nullify (Reset to Zero)</option>
                <option value="CARRY_FORWARD_NEGATIVE">Carry Forward Negative Balance</option>
            </Select>
        </Field>
    </div>
);

export default LeavePolicySetupModal;