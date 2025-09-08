import React, { useState } from 'react';
import { X, Loader, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import axios from 'axios';

// Reusable component for an editable field
const EditField = ({ label, name, value, onChange, type = 'text', options = [], required = false }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        required: required,
        className: "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select {...commonProps}>
                    <option value="">Select...</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : (
                <input {...commonProps} type={type} />
            )}
        </div>
    );
};

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [salarySubStep, setSalarySubStep] = useState(1);
    const [formData, setFormData] = useState({
        // User Details
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: ['EMPLOYEE'],
        isActive: true,
        isLocked: false,
        loginAttempts: 0,
        lastLoginIp:'',

        // Employee Basic Details
        employeeCode: '',
        firstName: '',
        middleName: '',
        lastName: '',
        emailWork: '',
        emailPersonal: '',
        phonePrimary: '',
        phoneSecondary: '',
        dob: '',
        gender: '',
        martialStatus: '',
        currentAddress: '',
        permanentAddress: '',
        nationalIdType: '',
        nationalIdNumber: '',
        status: 'ACTIVE',

        // Job Details
        jobDetails: {
            designationTitle: '',
            departmentTitle: '',
            location: '',
            probationEndDate: '',
            employmentType: 'FULL_TIME',
            workMode: 'ON_SITE',
            shift: 'GENERAL',
            noticePeriodDay: 0,
        },

        // Job Filling
        jobFillings: {
            hiringSource: '',
            offerDate: '',
            offerAcceptedDate: '',
            joiningDate: '',
            backgroundStatus: 'PENDING',
        },

        // Salary Details
        salaryDetails: {
            ctcAnnual: 0,
            payFrequency: 'MONTHLY',
            currency: 'INR',
            bonusEligible: false,
            bonusTargetPct: 0,
            compensationComponents: {
                componentType: 'BASIC',
                amount: 0,
                taxTreatment: 'TAXABLE',
                percentOfBasic: 0,
            },
            bankDetails: {
                bankName: '',
                accountNumber: '',
                ifscOrSwift: '',
                accountHolderName: '',
                branch: '',
                payoutActive: true,
            }
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section, subSection = null) => (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (subSection) {
                newData[section][subSection][name] = finalValue;
            } else {
                newData[section][name] = finalValue;
            }
            return newData;
        });
    };

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // NOTE: The following is a sequence of assumed API calls.
            // The backend might have a single endpoint to handle this, which would be more robust.
            // 1. Create User.
            // The client-side check for an existing user has been removed. It's more efficient
            // and safer to let the backend handle uniqueness checks. If the user already
            // exists, the backend should return a 409 Conflict error, which will be
            // caught and displayed to the user.
            await axios.post(`${API_URL}/users`, {
                name: formData.name, 
                email: formData.email, 
                passwordHash: formData.password, 
                roles: formData.roles, 
                isActive: formData.isActive, 
                isLocked: formData.isLocked,loginAttempts:formData.loginAttempts, lastLoginIp: formData.lastLoginIp}, { headers });

            // 2. Create Employee
            const employeeRequest = {
                email: formData.email, employeeCode: formData.employeeCode, firstName: formData.firstName, middleName: formData.middleName, lastName: formData.lastName, emailWork: formData.emailWork, emailPersonal: formData.emailPersonal, phonePrimary: formData.phonePrimary, phoneSecondary: formData.phoneSecondary, dob: formData.dob, gender: formData.gender, martialStatus: formData.martialStatus, currentAddress: formData.currentAddress, permanentAddress: formData.permanentAddress, nationalIdType: formData.nationalIdType, nationalIdNumber: formData.nationalIdNumber, status: formData.status
            }
            await axios.post(`${API_URL}/employees/register`, employeeRequest, { headers });
            const newEmployeeCode = formData.employeeCode;

            // 3. Create Job Details, Fillings, and Salary
            await axios.post(`${API_URL}/jobDetails/${newEmployeeCode}`, formData.jobDetails, { headers });
            await axios.post(`${API_URL}/jobFillings/${newEmployeeCode}`, formData.jobFillings, { headers });
            await axios.post(`${API_URL}/salaryDetails/${newEmployeeCode}`, { ...formData.salaryDetails, compensationComponents: null, bankDetails: null }, { headers });

            // 4. Create Compensation and Bank Details
            // The backend controllers for compensation and bank details expect the employeeCode.
            await axios.post(`${API_URL}/compensations/${newEmployeeCode}`, formData.salaryDetails.compensationComponents, { headers });
            await axios.post(`${API_URL}/bankdetails/${newEmployeeCode}`, formData.salaryDetails.bankDetails, { headers });

            alert('Employee added successfully!');
            if (onEmployeeAdded) onEmployeeAdded();
            onClose();

        } catch (err) {
            console.error("Error adding employee:", err);
            let errorMessage = 'An error occurred. Please check the console.';
            if (err.response?.status === 409) {
                errorMessage = err.response.data.message || `A user with email ${formData.email} already exists.`;
            } else {
                errorMessage = err.response?.data?.message || err.response?.data || errorMessage;
            }
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const steps = [ { title: 'Basic Details' }, { title: 'Job Details' }, { title: 'Job Filling' }, { title: 'Salary Details' }, ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Basic Details
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full font-semibold text-lg mb-2">User Account</h3>
                        <EditField label="Name" name="name" value={formData.name} onChange={handleChange} type="text" required />
                        <EditField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                        <EditField label="Password" name="password" value={formData.password} onChange={handleChange} type="password" required />
                        <EditField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required />
                        
                        <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Employee Information</h3>
                        <EditField label="Employee Code" name="employeeCode" value={formData.employeeCode} onChange={handleChange} required />
                        <EditField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        <EditField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                        <EditField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        <EditField label="Work Email" name="emailWork" value={formData.emailWork} onChange={handleChange} type="email" />
                        <EditField label="Personal Email" name="emailPersonal" value={formData.emailPersonal} onChange={handleChange} type="email" />
                        <EditField label="Primary Phone" name="phonePrimary" value={formData.phonePrimary} onChange={handleChange} />
                        <EditField label="Secondary Phone" name="phoneSecondary" value={formData.phoneSecondary} onChange={handleChange} />
                        <EditField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" />
                        <EditField label="Gender" name="gender" value={formData.gender} onChange={handleChange} type="select" options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
                        <EditField label="Marital Status" name="martialStatus" value={formData.martialStatus} onChange={handleChange} type="select" options={[{ value: 'SINGLE', label: 'Single' }, { value: 'MARRIED', label: 'Married' }]} />
                        <div className="md:col-span-2"> <EditField label="Current Address" name="currentAddress" value={formData.currentAddress} onChange={handleChange} /> </div>
                        <div className="md:col-span-2"> <EditField label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} /> </div>
                        <EditField label="National ID Type" name="nationalIdType" value={formData.nationalIdType} onChange={handleChange} />
                        <EditField label="National ID Number" name="nationalIdNumber" value={formData.nationalIdNumber} onChange={handleChange} />
                    </div>
                );
            case 2: // Job Details
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditField label="Designation" name="designationTitle" value={formData.jobDetails.designationTitle} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Department" name="departmentTitle" value={formData.jobDetails.departmentTitle} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Location" name="location" value={formData.jobDetails.location} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Probation End Date" name="probationEndDate" value={formData.jobDetails.probationEndDate} onChange={handleNestedChange('jobDetails')} type="date" />
                        <EditField label="Employment Type" name="employmentType" value={formData.jobDetails.employmentType} onChange={handleNestedChange('jobDetails')} type="select" options={[{ value: 'FULL_TIME', label: 'Full-time' }, { value: 'PART_TIME', label: 'Part-time' }]} />
                        <EditField label="Work Mode" name="workMode" value={formData.jobDetails.workMode} onChange={handleNestedChange('jobDetails')} type="select" options={[{ value: 'ONSITE', label: 'On-site' }, { value: 'REMOTE', label: 'Remote' },{value: 'HYBRID', label: 'Hybrid'}]} />
                        <EditField label="Shift" name="shift" value={formData.jobDetails.shift} onChange={handleNestedChange('jobDetails')} type='select' options={[{value: "GENERAL", label: "General"}, {value: "NIGHT", label: "Night"}, {value: 'ROTATIONAL', label: 'Rotaional'}]} />
                        <EditField label="Notice Period (Days)" name="noticePeriodDay" value={formData.jobDetails.noticePeriodDay} onChange={handleNestedChange('jobDetails')} type="number" />
                    </div>
                );
            case 3: // Job Filling
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditField label="Hiring Source" name="hiringSource" value={formData.jobFillings.hiringSource} onChange={handleNestedChange('jobFillings')} type="select" options={[{ value: 'REFERRAL', label: 'Referral' }, { value: 'JOB_PORTAL', label: 'Job Portal' }, {value: 'CAMPUS', label: 'Campus'}, {value: 'AGENCY', label: 'Agency'}]} />
                        <EditField label="Offer Date" name="offerDate" value={formData.jobFillings.offerDate} onChange={handleNestedChange('jobFillings')} type="date" />
                        <EditField label="Offer Accepted Date" name="offerAcceptedDate" value={formData.jobFillings.offerAcceptedDate} onChange={handleNestedChange('jobFillings')} type="date" />
                        <EditField label="Joining Date" name="joiningDate" value={formData.jobFillings.joiningDate} onChange={handleNestedChange('jobFillings')} type="date" />
                        <EditField label="Background Status" name="backgroundStatus" value={formData.jobFillings.backgroundStatus} onChange={handleNestedChange('jobFillings')} type="select" options={[{ value: 'PENDING', label: 'Pending' }, { value: 'CLEAR', label: 'Clear' }, {value: 'FLAGGED', label: 'Flagged'}, {value: 'FAILED', label: 'Failed'}]} />
                    </div>
                );
            case 4: // Salary Details
                return (
                    <div>
                        <div className="flex border-b mb-4">
                            <button type="button" onClick={() => setSalarySubStep(1)} className={`px-4 py-2 text-sm font-medium ${salarySubStep === 1 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>Salary & Compensation</button>
                            <button type="button" onClick={() => setSalarySubStep(2)} className={`px-4 py-2 text-sm font-medium ${salarySubStep === 2 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>Bank Details</button>
                        </div>
                        {salarySubStep === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <h3 className="col-span-full font-semibold text-lg mb-2">Salary</h3>
                                <EditField label="CTC Annual" name="ctcAnnual" value={formData.salaryDetails.ctcAnnual} onChange={handleNestedChange('salaryDetails')} type="number" />
                                <EditField label="Pay Frequency" name="payFrequency" value={formData.salaryDetails.payFrequency} onChange={handleNestedChange('salaryDetails')} type="select" options={[{ value: 'MONTHLY', label: 'Monthly' }, { value: 'ANNUALLY', label: 'Annually' }, {value: 'WEEKLY', label: 'Weekly'}, {value: 'BIWEEKLY', label: 'BiWeekly'}]} />
                                <EditField label="Currency" name="currency" value={formData.salaryDetails.currency} onChange={handleNestedChange('salaryDetails')} />
                                <EditField label="Bonus Eligible" name="bonusEligible" value={formData.salaryDetails.bonusEligible} onChange={handleNestedChange('salaryDetails')} type="select" options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]} />
                                <EditField label="Bonus Target %" name="bonusTargetPct" value={formData.salaryDetails.bonusTargetPct} onChange={handleNestedChange('salaryDetails')} type="number" />
                                
                                <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Compensation Component</h3>
                                <EditField label="Component Type" name="componentType" value={formData.salaryDetails.compensationComponents.componentType} onChange={handleNestedChange('salaryDetails', 'compensationComponents')} type="select" options={[{value: 'BASIC', label: 'Basic'}, {value: 'HRA', label: 'HRA'}, {value: 'LTA', label: 'LTA'}, {value: 'SPECIAL_ALLOWANCE', label: 'Special Allowance'}, {value: 'VARIABLE_PAY', label: 'Variable Pay'}, {value: 'PF_EMPLOYER', label: 'Pf Employer'}, {value: 'GRATUITY', label: 'Gratuity'}]} />
                                <EditField label="Amount" name="amount" value={formData.salaryDetails.compensationComponents.amount} onChange={handleNestedChange('salaryDetails', 'compensationComponents')} type="number" />
                                <EditField label="Tax Treatment" name="taxTreatment" value={formData.salaryDetails.compensationComponents.taxTreatment} onChange={handleNestedChange('salaryDetails', 'compensationComponents')} type="select" options={[{ value: 'TAXABLE', label: 'Taxable' }, { value: 'EXEMPT', label: 'Exempt' }, {value: 'PARTIAL_EXEMPT', label: 'Partial Exempt'}]} />
                                <EditField label="% of Basic" name="percentOfBasic" value={formData.salaryDetails.compensationComponents.percentOfBasic} onChange={handleNestedChange('salaryDetails', 'compensationComponents')} type="number" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EditField label="Bank Name" name="bankName" value={formData.salaryDetails.bankDetails.bankName} onChange={handleNestedChange('salaryDetails', 'bankDetails')} />
                                <EditField label="Account Number" name="accountNumber" value={formData.salaryDetails.bankDetails.accountNumber} onChange={handleNestedChange('salaryDetails', 'bankDetails')} />
                                <EditField label="IFSC Code" name="ifscOrSwift" value={formData.salaryDetails.bankDetails.ifscOrSwift} onChange={handleNestedChange('salaryDetails', 'bankDetails')} />
                                <EditField label="Account Holder Name" name="accountHolderName" value={formData.salaryDetails.bankDetails.accountHolderName} onChange={handleNestedChange('salaryDetails', 'bankDetails')} />
                                <EditField label="Branch" name="branch" value={formData.salaryDetails.bankDetails.branch} onChange={handleNestedChange('salaryDetails', 'bankDetails')} />
                                <EditField label="Payout Active" name="payoutActive" value={formData.salaryDetails.bankDetails.payoutActive} onChange={handleNestedChange('salaryDetails', 'bankDetails')} type="select" options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]} />
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Add New Employee - {steps[currentStep - 1].title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
                    {renderStepContent()}
                </form>
                <div className="p-4 border-t flex justify-between items-center">
                    <div>
                        Step {currentStep} of {steps.length}
                    </div>
                    <div className="flex gap-2">
                        {currentStep > 1 && (
                            <button type="button" onClick={handleBack} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </button>
                        )}
                        {currentStep < steps.length ? (
                            <button type="button" onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                                Next <ArrowRight className="h-4 w-4 ml-2" />
                            </button>
                        ) : (
                            <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center" disabled={loading}>
                                {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeModal;