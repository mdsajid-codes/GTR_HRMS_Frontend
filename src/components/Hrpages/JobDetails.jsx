import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader } from 'lucide-react';
import axios from 'axios';

// Reusable component for a field in view mode
const InfoField = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-base font-medium text-slate-800">{value || 'N/A'}</p>
    </div>
);

// Reusable component for an editable field
const EditField = ({ label, name, value, onChange, type = 'text', options = [] }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        className: "input" // Using the global .input style from index.css
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
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

const JobDetails = ({ employee }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [jobDetails, setJobDetails] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectOptions, setSelectOptions] = useState({
        departments: [],
        designations: [],
        jobBands: [],
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const initialFormState = {
        location: '', actualLocation: '', department: '', designation: '', jobBand: '',
        reportsTo: '', dateOfJoining: '', probationEndDate: '', loginId: '',
        profileName: '', employeeNumber: '', legalEntity: '',
    };

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!employee?.employeeCode) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [detailsRes, deptRes, desigRes, jobBandRes] = await Promise.all([
                    axios.get(`${API_URL}/job-details/${employee.employeeCode}`, { headers }),
                    axios.get(`${API_URL}/departments`, { headers }),
                    axios.get(`${API_URL}/designations`, { headers }),
                    axios.get(`${API_URL}/jobBands`, { headers })
                ]);

                setJobDetails(detailsRes.data);
                setFormData(detailsRes.data);
                setSelectOptions({
                    departments: deptRes.data,
                    designations: desigRes.data,
                    jobBands: jobBandRes.data,
                });
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setJobDetails(null);
                    setFormData(initialFormState);
                    // Optional: Inform the user that no details were found and they can add them.
                    setError('No job details found for this employee. You can add them now.');
                } else {
                    console.error("Error fetching job details:", err);
                    setError('Failed to load job details. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [employee, API_URL]);

    if (!employee) {
        return <div className="text-center text-slate-500">No employee selected.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(jobDetails || initialFormState);
        setError('');
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/job-details/${employee.employeeCode}`, formData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setJobDetails(response.data);
            setFormData(response.data);
            setIsEditing(false);
            alert('Job details updated successfully!');
        } catch (err) {
            console.error("Error updating job details:", err);
            const errorMessage = err.response?.data?.message || 'Failed to update job details. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    const currentData = isEditing ? formData : jobDetails || {};

    return (
        <div>
            <div className="flex justify-end mb-4 gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="btn-secondary">Cancel</button>
                        <button onClick={handleSave} className="btn-primary flex items-center" disabled={saveLoading}>
                            {saveLoading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Save
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Details
                    </button>
                )}
            </div>
            {error && <div className="text-center text-red-600 p-3 bg-red-50 rounded-md mb-4">{error}</div>}
            <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                    {isEditing ? (
                        <>
                            <EditField label="Department" name="department" value={formData.department} onChange={handleChange} type="select" options={selectOptions.departments.map(d => ({ value: d.name, label: d.name }))} />
                            <EditField label="Designation" name="designation" value={formData.designation} onChange={handleChange} type="select" options={selectOptions.designations.map(d => ({ value: d.title, label: d.title }))} />
                            <EditField label="Job Band" name="jobBand" value={formData.jobBand} onChange={handleChange} type="select" options={selectOptions.jobBands.map(j => ({ value: j.name, label: j.name }))} />
                            <EditField label="Reports To" name="reportsTo" value={formData.reportsTo} onChange={handleChange} />
                            <EditField label="Date of Joining" name="dateOfJoining" value={formData.dateOfJoining?.split('T')[0]} onChange={handleChange} type="date" />
                            <EditField label="Probation End Date" name="probationEndDate" value={formData.probationEndDate?.split('T')[0]} onChange={handleChange} type="date" />
                            <EditField label="Location" name="location" value={formData.location} onChange={handleChange} />
                            <EditField label="Actual Location" name="actualLocation" value={formData.actualLocation} onChange={handleChange} />
                            <EditField label="Legal Entity" name="legalEntity" value={formData.legalEntity} onChange={handleChange} />
                            <EditField label="Login ID" name="loginId" value={formData.loginId} onChange={handleChange} />
                            <EditField label="Profile Name" name="profileName" value={formData.profileName} onChange={handleChange} />
                            <EditField label="Employee Number" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} />
                        </>
                    ) : (
                        <>
                            <InfoField label="Department" value={currentData.department} />
                            <InfoField label="Designation" value={currentData.designation} />
                            <InfoField label="Job Band" value={currentData.jobBand} />
                            <InfoField label="Reports To" value={currentData.reportsTo} />
                            <InfoField label="Date of Joining" value={currentData.dateOfJoining} />
                            <InfoField label="Probation End Date" value={currentData.probationEndDate} />
                            <InfoField label="Location" value={currentData.location} />
                            <InfoField label="Actual Location" value={currentData.actualLocation} />
                            <InfoField label="Legal Entity" value={currentData.legalEntity} />
                            <InfoField label="Login ID" value={currentData.loginId} />
                            <InfoField label="Profile Name" value={currentData.profileName} />
                            <InfoField label="Employee Number" value={currentData.employeeNumber} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobDetails;
