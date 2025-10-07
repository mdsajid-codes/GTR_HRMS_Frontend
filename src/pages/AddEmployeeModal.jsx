import React, { useState, useEffect } from 'react';
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
    const [formData, setFormData] = useState({
        // User Details
        user: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },

        // Employee Basic Details
        employee: {
            employeeCode: '',
            firstName: '',
            middleName: '',
            lastName: '',
            emailWork: '',
            emailPersonal: '',
            phonePrimary: '',
            dob: '',
            locationId: null,
            gender: '',
            martialStatus: '',
            status: 'ACTIVE',
        },

        // Profile Request
        profile: {
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            emergencyContactName: '',
            emergencyContactRelation: '',
            emergencyContactPhone: '',
            bankName: '',
            bankAccountNumber: '',
            ifscCode: '',
            bloodGroup: '',
            notes: '',
        },

        jobDetails: {
            location: '',
            actualLocation: '',
            department: '',
            designation: '',
            jobBand: '',
            reportsTo: '',
            dateOfJoining: '',
            probationEndDate: '',
            loginId: '',
            profileName: '',
            employeeNumber: '',
            legalEntity: ''
        },

        timeAttendence: {
            timeType: '',
            workType: '',
            shiftType: '',
            weeklyOffPolicy: '',
            leaveGroup: '',
            attendenceCaptureScheme: '',
            holidayList: '',
            expensePolicy: '',
            attendenceTrackingPolicy: '',
            recruitmentPolicy: '',
            isRosterBasedEmployee: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectOptions, setSelectOptions] = useState({
        departments: [],
        designations: [],
        jobBands: [],
        nationalities: [],
        workTypes: [],
        shiftTypes: [],
        leaveGroups: [],
        weeklyOffPolicies: [],
        timeTypes: []
    });
    const [locations, setLocations] = useState([]);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleNestedChange = (section) => (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: finalValue,
                },
            };
        });
    };

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);

    useEffect(() => {
        if (isOpen) {
            const fetchDropdownData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = { "Authorization": `Bearer ${token}` };
                    const [deptRes, desigRes, jobBandRes, natRes, workTypeRes, shiftTypeRes, leaveGroupRes, weekOffRes, timeTypeRes, locRes] = await Promise.all([
                        axios.get(`${API_URL}/departments`, { headers }),
                        axios.get(`${API_URL}/designations`, { headers }),
                        axios.get(`${API_URL}/jobBands`, { headers }),
                        axios.get(`${API_URL}/nationalities`, { headers }),
                        axios.get(`${API_URL}/work-types`, { headers }),
                        axios.get(`${API_URL}/shift-types`, { headers }),
                        axios.get(`${API_URL}/leave-groups`, { headers }),
                        axios.get(`${API_URL}/weekly-off-policies`, { headers }),
                        axios.get(`${API_URL}/time-types`, { headers }),
                        axios.get(`${API_URL}/locations`, { headers }),
                    ]);
                    setSelectOptions({
                        departments: deptRes.data,
                        designations: desigRes.data,
                        jobBands: jobBandRes.data,
                        nationalities: natRes.data,
                        workTypes: workTypeRes.data,
                        shiftTypes: shiftTypeRes.data,
                        leaveGroups: leaveGroupRes.data,
                        weeklyOffPolicies: weekOffRes.data,
                        timeTypes: timeTypeRes.data
                    });
                    setLocations(locRes.data);
                } catch (err) {
                    console.error("Failed to fetch dropdown data", err);
                    setError("Could not load necessary data for the form. Please try again.");
                }
            };
            fetchDropdownData();
        }
    }, [isOpen, API_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.user.password !== formData.user.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Step 1: Create User
            await axios.post(`${API_URL}/users/register`, {
                name: formData.user.name, 
                email: formData.user.email, 
                password: formData.user.password, 
                roles: ['EMPLOYEE'], 
                isActive: true, 
                isLocked: false,
            }, { headers });

            // Step 2: Register Employee (basic details)
            const employeeRequest = {
                email: formData.user.email, // for user lookup
                ...formData.employee
            };
            await axios.post(`${API_URL}/employees/register`, employeeRequest, { headers });
            const newEmployeeCode = formData.employee.employeeCode;

            // Step 3: Create/Update Employee Profile (address, emergency contact, etc.)
            await axios.put(`${API_URL}/employee-profiles/${newEmployeeCode}`, formData.profile, { headers });

            // Step 4: Create/Update Job Details
            await axios.put(`${API_URL}/job-details/${newEmployeeCode}`, formData.jobDetails, { headers });

            // Step 5: Create/Update Time & Attendance
            await axios.put(`${API_URL}/time-attendence/${newEmployeeCode}`, formData.timeAttendence, { headers });

            alert('Employee added successfully!');
            if (onEmployeeAdded) onEmployeeAdded();
            onClose();

        } catch (err) {
            console.error("Error adding employee:", err);
            let errorMessage = 'An error occurred. Please check the console.';
            if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
            }
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const steps = [ { title: 'User & Basic Info' }, { title: 'Personal & Contact' }, { title: 'Job & Attendance' }, { title: 'Profile Details' } ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // User & Basic Info
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full font-semibold text-lg mb-2">User Account</h3>
                        <EditField label="Full Name" name="name" value={formData.user.name} onChange={handleNestedChange('user')} type="text" required />
                        <EditField label="Login Email" name="email" value={formData.user.email} onChange={handleNestedChange('user')} type="email" required />
                        <EditField label="Password" name="password" value={formData.user.password} onChange={handleNestedChange('user')} type="password" required />
                        <EditField label="Confirm Password" name="confirmPassword" value={formData.user.confirmPassword} onChange={handleNestedChange('user')} type="password" required />
                        
                        <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Employee Information</h3>
                        <EditField label="Employee Code" name="employeeCode" value={formData.employee.employeeCode} onChange={handleNestedChange('employee')} required />
                        <EditField label="First Name" name="firstName" value={formData.employee.firstName} onChange={handleNestedChange('employee')} required />
                        <EditField label="Middle Name" name="middleName" value={formData.employee.middleName} onChange={handleNestedChange('employee')} />
                        <EditField label="Last Name" name="lastName" value={formData.employee.lastName} onChange={handleNestedChange('employee')} required />
                    </div>
                );
            case 2: // Personal & Contact
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full font-semibold text-lg mb-2">Personal Details</h3>
                        <EditField label="Date of Birth" name="dob" value={formData.employee.dob} onChange={handleNestedChange('employee')} type="date" />
                        <EditField label="Gender" name="gender" value={formData.employee.gender} onChange={handleNestedChange('employee')} type="select" options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
                        <EditField label="Marital Status" name="martialStatus" value={formData.employee.martialStatus} onChange={handleNestedChange('employee')} type="select" options={[{ value: 'SINGLE', label: 'Single' }, { value: 'MARRIED', label: 'Married' }]} />
                        <EditField label="Blood Group" name="bloodGroup" value={formData.profile.bloodGroup} onChange={handleNestedChange('profile')} />

                        <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Contact Information</h3>
                        <EditField label="Work Email" name="emailWork" value={formData.employee.emailWork} onChange={handleNestedChange('employee')} type="email" />
                        <EditField label="Personal Email" name="emailPersonal" value={formData.employee.emailPersonal} onChange={handleNestedChange('employee')} type="email" />
                        <EditField label="Primary Phone" name="phonePrimary" value={formData.employee.phonePrimary} onChange={handleNestedChange('employee')} />
                        <div className="md:col-span-2"><EditField label="Address" name="address" value={formData.profile.address} onChange={handleNestedChange('profile')} /></div>
                        <EditField label="City" name="city" value={formData.profile.city} onChange={handleNestedChange('profile')} />
                        <EditField label="State" name="state" value={formData.profile.state} onChange={handleNestedChange('profile')} />
                        <EditField 
                            label="Country" 
                            name="country" 
                            value={formData.profile.country} 
                            onChange={handleNestedChange('profile')} 
                            type="select"
                            options={selectOptions.nationalities.map(n => ({ value: n.name, label: n.name }))} />
                            <EditField label="Postal Code" name="postalCode" value={formData.profile.postalCode} onChange={handleNestedChange('profile')} />
                    </div>
                );
            case 3: // Job & Attendance
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full font-semibold text-lg mb-2">Job Details</h3>
                        <EditField 
                            label="Department" 
                            name="department" 
                            value={formData.jobDetails.department} 
                            onChange={handleNestedChange('jobDetails')} 
                            type="select"
                            options={selectOptions.departments.map(d => ({ value: d.name, label: d.name }))}
                        />
                        <EditField 
                            label="Designation" 
                            name="designation" 
                            value={formData.jobDetails.designation} 
                            onChange={handleNestedChange('jobDetails')} 
                            type="select"
                            options={selectOptions.designations.map(d => ({ value: d.title, label: `${d.title} (${d.departmentName})` }))}
                        />
                        <EditField 
                            label="Job Band" 
                            name="jobBand" 
                            value={formData.jobDetails.jobBand} 
                            onChange={handleNestedChange('jobDetails')} 
                            type="select"
                            options={selectOptions.jobBands.map(d => ({ value: d.name, label: `${d.name} (${d.designationTitle})` }))}
                        />
                        <EditField label="Date of Joining" name="dateOfJoining" value={formData.jobDetails.dateOfJoining} onChange={handleNestedChange('jobDetails')} type="date" />
                        <EditField label="Probation End Date" name="probationEndDate" value={formData.jobDetails.probationEndDate} onChange={handleNestedChange('jobDetails')} type="date" />
                        <EditField label="Reports To" name="reportsTo" value={formData.jobDetails.reportsTo} onChange={handleNestedChange('jobDetails')} />
                        <EditField
                            label="Location"
                            name="locationId"
                            value={formData.employee.locationId}
                            onChange={handleNestedChange('employee')}
                            type="select"
                            options={locations.map(l => ({ value: l.id, label: l.name }))} />
                        <EditField label="Actual Location" name="actualLocation" value={formData.jobDetails.actualLocation} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Legal Entity" name="legalEntity" value={formData.jobDetails.legalEntity} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Login ID" name="loginId" value={formData.jobDetails.loginId} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Profile Name" name="profileName" value={formData.jobDetails.profileName} onChange={handleNestedChange('jobDetails')} />
                        <EditField label="Employee Number" name="employeeNumber" value={formData.jobDetails.employeeNumber} onChange={handleNestedChange('jobDetails')} />

                        <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Time & Attendance Policy</h3>
                        <EditField
                            label="Time Type"
                            name="timeType"
                            value={formData.timeAttendence.timeType}
                            onChange={handleNestedChange('timeAttendence')}
                            type="select"
                            options={selectOptions.timeTypes.map(t => ({ value: t.name, label: t.name }))} />
                        <EditField 
                            label="Work Type" 
                            name="workType" 
                            value={formData.timeAttendence.workType} 
                            onChange={handleNestedChange('timeAttendence')} 
                            type="select"
                            options={selectOptions.workTypes.map(w => ({ value: w.name, label: w.name }))} />
                        <EditField 
                            label="Shift Type" 
                            name="shiftType" 
                            value={formData.timeAttendence.shiftType} 
                            onChange={handleNestedChange('timeAttendence')} 
                            type="select"
                            options={selectOptions.shiftTypes.map(s => ({ value: s.name, label: `${s.name} (${s.startTime} - ${s.endTime})` }))} />
                        <EditField 
                            label="Weekly Off Policy" 
                            name="weeklyOffPolicy" 
                            value={formData.timeAttendence.weeklyOffPolicy} 
                            onChange={handleNestedChange('timeAttendence')} 
                            type="select"
                            options={selectOptions.weeklyOffPolicies.map(p => ({ value: p.name, label: p.name }))} />
                        <EditField 
                            label="Leave Group" 
                            name="leaveGroup" 
                            value={formData.timeAttendence.leaveGroup} 
                            onChange={handleNestedChange('timeAttendence')} 
                            type="select"
                            options={selectOptions.leaveGroups.map(lg => ({ value: lg.name, label: lg.name }))} />
                        <EditField label="Attendance Capture Scheme" name="attendenceCaptureScheme" value={formData.timeAttendence.attendenceCaptureScheme} onChange={handleNestedChange('timeAttendence')} />
                        <EditField label="Holiday List" name="holidayList" value={formData.timeAttendence.holidayList} onChange={handleNestedChange('timeAttendence')} />
                        <EditField label="Expense Policy" name="expensePolicy" value={formData.timeAttendence.expensePolicy} onChange={handleNestedChange('timeAttendence')} />
                        <EditField label="Attendance Tracking Policy" name="attendenceTrackingPolicy" value={formData.timeAttendence.attendenceTrackingPolicy} onChange={handleNestedChange('timeAttendence')} />
                        <EditField label="Recruitment Policy" name="recruitmentPolicy" value={formData.timeAttendence.recruitmentPolicy} onChange={handleNestedChange('timeAttendence')} />
                        <div className="md:col-span-2">
                            <label className="inline-flex items-center">
                                <input type="checkbox" name="isRosterBasedEmployee" checked={formData.timeAttendence.isRosterBasedEmployee} onChange={handleNestedChange('timeAttendence')} className="h-4 w-4 rounded" />
                                <span className="ml-2 text-sm">Is Roster Based Employee</span>
                            </label>
                        </div>
                    </div>
                );
            case 4: // Profile Details
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="col-span-full font-semibold text-lg mb-2">Emergency Contact</h3>
                        <EditField label="Contact Name" name="emergencyContactName" value={formData.profile.emergencyContactName} onChange={handleNestedChange('profile')} />
                        <EditField label="Relation" name="emergencyContactRelation" value={formData.profile.emergencyContactRelation} onChange={handleNestedChange('profile')} />
                        <EditField label="Phone" name="emergencyContactPhone" value={formData.profile.emergencyContactPhone} onChange={handleNestedChange('profile')} />

                        <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Bank Details</h3>
                        <EditField label="Bank Name" name="bankName" value={formData.profile.bankName} onChange={handleNestedChange('profile')} />
                        <EditField label="Account Number" name="bankAccountNumber" value={formData.profile.bankAccountNumber} onChange={handleNestedChange('profile')} />
                        <EditField label="IFSC Code" name="ifscCode" value={formData.profile.ifscCode} onChange={handleNestedChange('profile')} />

                        <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Additional Information</h3>
                        <div className="md:col-span-2"><EditField label="Notes" name="notes" value={formData.profile.notes} onChange={handleNestedChange('profile')} /></div>
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