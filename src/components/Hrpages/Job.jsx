import React, { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import axios from 'axios';

// Reusable component for a field in a profile card
const InfoField = ({ label, value, type = 'text' }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-base font-medium text-slate-800">{value || 'N/A'}</p>
    </div>
);

// Reusable card component for job sections
const JobInfoCard = ({ title, isEditing, onEdit, onSave, onCancel, children }) => (
    <div className="bg-slate-50 rounded-lg p-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={onSave}
                            className="p-1.5 rounded-md hover:bg-green-100 text-green-600 hover:text-green-800 transition-colors"
                            aria-label={`Save ${title}`}
                        >
                            <Check className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-1.5 rounded-md hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                            aria-label={`Cancel editing ${title}`}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </>
                ) : (
                    onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                            aria-label={`Edit ${title}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )
                )}
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            {children}
        </div>
    </div>
);

// Reusable component for an editable field
const EditField = ({ label, name, value, onChange, type = 'text', options = [] }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        className: "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
            {type === 'select' ? (
                <select {...commonProps}>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input {...commonProps} type={type} />
            )}
        </div>
    );
};

const Job = ({employee}) => {
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState(employee);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const employmentTypeOptions = [ { value: 'FULL_TIME', label: 'Full-time' }, { value: 'PART_TIME', label: 'Part-time' }, { value: 'CONTRACT', label: 'Contract' }, { value: 'INTERN', label: 'Intern' }, ];
    const workModeOptions = [ { value: 'ON_SITE', label: 'On-site' }, { value: 'REMOTE', label: 'Remote' }, { value: 'HYBRID', label: 'Hybrid' }, ];
    const backgroundStatusOptions = [ { value: 'PENDING', label: 'Pending' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'CLEAR', label: 'Completed' }, { value: 'FAILED', label: 'Failed' }, ];
    const booleanOptions = [ { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }, ];

    const hirringSource = [
        { value: 'REFERRAL', label: 'Referral'}, {value: 'CAMPUS', label: 'Campus'}, {value: 'AGENCY', label: 'Agency'}, {value: 'JOB_PORTAL', label: 'Job Portal'}
    ]

    const payFrequency = [
        {value: 'MONTHLY', label: 'Monthly'}, {value: 'ANNUALLY', label:'Annually'}, {value: "WEEKLY", label: 'Weekly'}, {value: 'BIWEEKLY', label: 'Bi-Weekly'}
    ]

    const componentType = [
        {value: 'BASIC', label: 'Basic'}, {value: 'HRA', label: 'HRA'}, {value: 'LTA', label: 'LTA'}, {value: 'SPECIAL_ALLOWANCE', label: 'Special Allowance'}, {value: 'VARIABLE_PAY', label: 'Variable Pay'}, {value: 'PF_EMPLOYER', label: 'Pf Employer'}, {value: 'GRATUITY', label: 'Gratuity'}
    ]

    const taxTreatment = [
        {value: 'TAXABLE', label: 'Taxable'}, {value: 'EXEMPT', label: 'Exempt'}, {value: 'PARTIAL_EXEMPT', label: 'Partial Exempt'}
    ]

    useEffect(() => {
        // Reset local form data when the main employee prop changes
        setFormData(employee);
    }, [employee]);

    // Use optional chaining and default objects to prevent errors if employee or nested properties are null/undefined
    const jobDetails = formData?.jobDetails?.[0] || {};
    const jobFillings = formData?.jobFillings?.[0] || {};
    const salaryDetails = formData?.salaryDetails?.[0] || {};
    const compensationDetails = salaryDetails?.compensationComponents?.[0] || {};
    const bankDetails = salaryDetails?.bankDetails?.[0] || {}

    const formattedStartDate = jobDetails.startDate
        ? new Date(jobDetails.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const handleEdit = (section) => {
        setEditingSection(section);
    };

    const handleSave = async (section) => {
        // The data for the section being saved.
        let sectionData;

        // Special handling for nested data structures
        if (section === 'compensations') {
            sectionData = formData?.salaryDetails?.[0]?.compensationComponents?.[0];
        } else if (section === 'bankdetails') {
            sectionData = formData?.salaryDetails?.[0]?.bankDetails?.[0];
        } else {
            sectionData = formData?.[section]?.[0];
        }

        if (!sectionData) {
            console.error(`Could not find data for section: ${section}`);
            setEditingSection(null);
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/${section}/${section == "compensations" || section == "bankdetails" ? sectionData.id : employee.employeeCode}`,
                sectionData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            alert(`${section} updated successfully!`);
            setEditingSection(null);
        } catch (err) {
            console.error(`Error updating ${section}:`, err);
            alert(`Failed to update ${section}. Please try again.`);
        }
    };

    const handleCancel = () => {
        setFormData(employee); // Revert any changes
        setEditingSection(null);
    };

    // Generic handler for nested state updates
    const createChangeHandler = (section, subSection = null) => (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation issues

            let targetObject;
            if (subSection) {
                targetObject = newData[section]?.[0]?.[subSection]?.[0];
            } else {
                targetObject = newData[section]?.[0];
            }

            if (targetObject) {
                const originalValue = subSection ? prev[section]?.[0]?.[subSection]?.[0]?.[name] : prev[section]?.[0]?.[name];
                if (typeof originalValue === 'boolean') {
                    targetObject[name] = value === 'true';
                } else {
                    targetObject[name] = value;
                }
            }
            
            return newData;
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobInfoCard title="Job Details" isEditing={editingSection === 'Job Details'} onEdit={() => handleEdit('Job Details')} onSave={() => handleSave('jobDetails')} onCancel={handleCancel}>
                {editingSection === 'Job Details' ? (
                    <>
                        <EditField label="Designation" name="designationTitle" value={jobDetails.designationTitle} onChange={createChangeHandler('jobDetails')} />
                        <EditField label="Department" name="departmentName" value={jobDetails.departmentTitle} onChange={createChangeHandler('jobDetails')} />
                        <EditField label="Location" name="location" value={jobDetails.location} onChange={createChangeHandler('jobDetails')} />
                        <EditField label="Probation Date" name="probationEndDate" value={jobDetails.probationEndDate} onChange={createChangeHandler('jobDetails')} type="date" />
                        <EditField label="Employment Type" name="employmentType" value={jobDetails.employmentType} onChange={createChangeHandler('jobDetails')} type="select" options={employmentTypeOptions} />
                        <EditField label="Work Mode" name="workMode" value={jobDetails.workMode} onChange={createChangeHandler('jobDetails')} type="select" options={workModeOptions} />
                        <EditField label="Shift" name="shift" value={jobDetails.shift} onChange={createChangeHandler('jobDetails')} />
                        <EditField label="Notice Period Day" name="noticePeriodDay" value={jobDetails.noticePeriodDay} onChange={createChangeHandler('jobDetails')} type="number" />
                    </>
                ) : (
                    <>
                        <InfoField label="Designation" value={jobDetails.designationTitle} />
                        <InfoField label="Department" value={jobDetails.departmentTitle} />
                        <InfoField label="Location" value={jobDetails.location} />
                        <InfoField label="Probation Date" value={jobDetails.probationEndDate} />
                        <InfoField label="Employment Type" value={jobDetails.employmentType} />
                        <InfoField label="Work Mode" value={jobDetails.workMode} />
                        <InfoField label="Shift" value={jobDetails.shift} />
                        <InfoField label="Notice Period Day" value={jobDetails.noticePeriodDay} />
                    </>
                )}
            </JobInfoCard>

            <JobInfoCard title="Job Filling" isEditing={editingSection === 'Job Filling'} onEdit={() => handleEdit('Job Filling')} onSave={() => handleSave('jobFillings')} onCancel={handleCancel}>
                {editingSection === 'Job Filling' ? (
                    <>
                        <EditField label="Hiring Source" name="hiringSource" value={jobFillings.hiringSource} onChange={createChangeHandler('jobFillings')} type='select' options={hirringSource} />
                        <EditField label="Offer Date" name="offerDate" value={jobFillings.offerDate} onChange={createChangeHandler('jobFillings')} type="date" />
                        <EditField label="Offer Accepted Date" name="offerAcceptedDate" value={jobFillings.offerAcceptedDate} onChange={createChangeHandler('jobFillings')} type="date" />
                        <EditField label="Joining Date" name="joiningDate" value={jobFillings.joiningDate} onChange={createChangeHandler('jobFillings')} type="date" />
                        <EditField label="Background Status" name="backgroundStatus" value={jobFillings.backgroundStatus} onChange={createChangeHandler('jobFillings')} type="select" options={backgroundStatusOptions} />
                    </>
                ) : (
                    <>
                        <InfoField label="Hiring Source" value={jobFillings.hiringSource} />
                        <InfoField label="Offer Date" value={jobFillings.offerDate} />
                        <InfoField label="Offer Accepted Date" value={jobFillings.offerAcceptedDate} />
                        <InfoField label="Joining Date" value={jobFillings.joiningDate} />
                        <InfoField label="Background Status" value={jobFillings.backgroundStatus} />
                    </>
                )}
            </JobInfoCard>

            <JobInfoCard title="Salary Details" isEditing={editingSection === 'Salary Details'} onEdit={() => handleEdit('Salary Details')} onSave={() => handleSave('salaryDetails')} onCancel={handleCancel}>
                {editingSection === 'Salary Details' ? (
                     <>
                        <EditField label="CTC Annual" name="ctcAnnual" value={salaryDetails.ctcAnnual} onChange={createChangeHandler('salaryDetails')} type="number" />
                        <EditField label="Pay Frequency" name="payFrequency" value={salaryDetails.payFrequency} onChange={createChangeHandler('salaryDetails')} type='select' options={payFrequency} />
                        <EditField label="Currency" name="currency" value={salaryDetails.currency} onChange={createChangeHandler('salaryDetails')} />
                        <EditField label="Bonus Eligible" name="bonusEligible" value={String(salaryDetails.bonusEligible)} onChange={createChangeHandler('salaryDetails')} type="select" options={booleanOptions} />
                        <EditField label="Bonus Target Pct" name="bonusTargetPct" value={salaryDetails.bonusTargetPct} onChange={createChangeHandler('salaryDetails')} type="number" />
                    </>
                ) : (
                    <>
                        <InfoField label="CTC Annual" value={salaryDetails.ctcAnnual} />
                        <InfoField label="Pay Frequency" value={salaryDetails.payFrequency} />
                        <InfoField label="Currency" value={salaryDetails.currency} />
                        <InfoField label="Bonus Eligible" value={salaryDetails.bonusEligible ? "Eligible" : "Not Eligible"} />
                        <InfoField label="Bonus Target Pct" value={salaryDetails.bonusTargetPct} />
                    </>
                )}
            </JobInfoCard>

            <JobInfoCard title="Compensation Details" isEditing={editingSection === 'Compensation Details'} onEdit={() => handleEdit('Compensation Details')} onSave={() => handleSave('compensations')} onCancel={handleCancel}>
                 {editingSection === 'Compensation Details' ? (
                    <>
                        <EditField label="Component Type" name="componentType" value={compensationDetails.componentType} onChange={createChangeHandler('salaryDetails', 'compensationComponents')} type='select' options={componentType} />
                        <EditField label="Amount" name="amount" value={compensationDetails.amount} onChange={createChangeHandler('salaryDetails', 'compensationComponents')} type="number" />
                        <EditField label="Tax Treatment" name="taxTreatment" value={compensationDetails.taxTreatment} onChange={createChangeHandler('salaryDetails', 'compensationComponents')} type='select' options={taxTreatment} />
                        <EditField label="Percent of Basic" name="percentOfBasic" value={compensationDetails.percentOfBasic} onChange={createChangeHandler('salaryDetails', 'compensationComponents')} type="number" />
                    </>
                ) : (
                    <>
                        <InfoField label="Component Type" value={compensationDetails.componentType} />
                        <InfoField label="Amount" value={compensationDetails.amount} />
                        <InfoField label="Tax Treatment" value={compensationDetails.taxTreatment} />
                        <InfoField label="Percent of Basic" value={compensationDetails.percentOfBasic} />
                    </>
                )}
            </JobInfoCard>

            <JobInfoCard title="Bank Details" isEditing={editingSection === 'Bank Details'} onEdit={() => handleEdit('Bank Details')} onSave={() => handleSave('bankdetails')} onCancel={handleCancel}>
                {editingSection === 'Bank Details' ? (
                    <>
                        <EditField label="Bank Name" name="bankName" value={bankDetails.bankName} onChange={createChangeHandler('salaryDetails', 'bankDetails')} />
                        <EditField label="Account Number" name="accountNumber" value={bankDetails.accountNumber} onChange={createChangeHandler('salaryDetails', 'bankDetails')} />
                        <EditField label="IFSC Code" name="ifscOrSwift" value={bankDetails.ifscOrSwift} onChange={createChangeHandler('salaryDetails', 'bankDetails')} />
                        <EditField label="Account Holder Name" name="accountHolderName" value={bankDetails.accountHolderName} onChange={createChangeHandler('salaryDetails', 'bankDetails')} />
                        <EditField label="Branch" name="branch" value={bankDetails.branch} onChange={createChangeHandler('salaryDetails', 'bankDetails')} />
                        <EditField label="Payout Active" name="payoutActive" value={String(bankDetails.payoutActive)} onChange={createChangeHandler('salaryDetails', 'bankDetails')} type="select" options={booleanOptions} />
                    </>
                ) : (
                    <>
                        <InfoField label="Bank Name" value={bankDetails.bankName} />
                        <InfoField label="Account Number" value={bankDetails.accountNumber} />
                        <InfoField label="IFSC Code" value={bankDetails.ifscOrSwift} />
                        <InfoField label="Account Holder Name" value={bankDetails.accountHolderName} />
                        <InfoField label="Branch" value={bankDetails.branch} />
                        <InfoField label="Payout Active" value={bankDetails.payoutActive ? "Active" : "InActive"} />
                    </>
                )}
            </JobInfoCard>
        </div>
    );
}

export default Job;
