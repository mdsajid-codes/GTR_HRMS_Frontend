import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader } from 'lucide-react';
import axios from 'axios';

// Reusable component for a field in a profile card
const InfoField = ({ label, value }) => (
    <div>
        <p className="text-sm text-foreground-muted">{label}</p>
        <p className="text-base font-medium text-foreground">{value || 'N/A'}</p>
    </div>
);

// Reusable card component for profile sections
const ProfileCard = ({ title, children }) => (
    <div className="bg-background-muted rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">{title}</h3>
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
        className: "input bg-background-muted border-border text-foreground"
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-foreground-muted">{label}</label>
            {type === 'select' ? (
                <select {...commonProps}>
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

const Profile = ({ employee, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(employee);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        setFormData(employee);
    }, [employee]);

    // If no employee data is available, render a placeholder or nothing.
    if (!employee) {
        return <div className="text-center text-foreground-muted">No employee data available.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(employee); // Reset changes
        setError('');
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/employees/${employee.employeeCode}`, formData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setIsEditing(false);
            if (onUpdate) {
                onUpdate(response.data); // Propagate changes to parent
            }
            alert('Profile updated successfully!');
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMessage = err.response?.data || 'Failed to update profile. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const genderOptions = [ { value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' } ];
    const martialStatusOptions = [ { value: 'SINGLE', label: 'Single' }, { value: 'MARRIED', label: 'Married' }, { value: 'DIVORCED', label: 'Divorced' }, { value: 'WIDOWED', label: 'Widowed' } ];
    const statusOptions = [ { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_PROBATION', label: 'On Probation' }, { value: 'TERMINATED', label: 'Terminated' } ];

    return (
        <div>
            <div className="flex justify-end mb-4 gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button onClick={handleSave} className="btn-primary flex items-center" disabled={loading}>
                            {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Save
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                    </button>
                )}
            </div>
            {error && <div className="text-center text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-md mb-4">{error}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileCard title="Primary Details">
                    {isEditing ? <>
                        <EditField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                        <EditField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                        <EditField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                        <EditField label="Date of Birth" name="dob" value={formData.dob?.split('T')[0]} onChange={handleChange} type="date" />
                        <EditField label="Gender" name="gender" value={formData.gender} onChange={handleChange} type="select" options={genderOptions} />
                        <EditField label="Marital Status" name="martialStatus" value={formData.martialStatus} onChange={handleChange} type="select" options={martialStatusOptions} />
                    </> : <>
                        <InfoField label="First Name" value={employee.firstName} />
                        <InfoField label="Middle Name" value={employee.middleName} />
                        <InfoField label="Last Name" value={employee.lastName} />
                        <InfoField label="Date of Birth" value={employee.dob} />
                        <InfoField label="Gender" value={employee.gender} />
                        <InfoField label="Marital Status" value={employee.martialStatus} />
                    </>}
                </ProfileCard>

                <ProfileCard title="Contact Details">
                    {isEditing ? <>
                        <EditField label="Work Email" name="emailWork" value={formData.emailWork} onChange={handleChange} type="email" />
                        <EditField label="Personal Email" name="emailPersonal" value={formData.emailPersonal} onChange={handleChange} type="email" />
                        <EditField label="Primary Phone" name="phonePrimary" value={formData.phonePrimary} onChange={handleChange} />
                    </> : <>
                        <InfoField label="Work Email" value={employee.emailWork} />
                        <InfoField label="Personal Email" value={employee.emailPersonal} />
                        <InfoField label="Primary Phone" value={employee.phonePrimary} />
                    </>}
                </ProfileCard>

                <ProfileCard title="Employment Details">
                    {isEditing ? <>
                        <InfoField label="Joining Date" value={employee.joiningDate} />
                        <InfoField label="Exit Date" value={employee.exitDate} />
                        <EditField label="Status" name="status" value={formData.status} onChange={handleChange} type="select" options={statusOptions} />
                    </> : <>
                        <InfoField label="Joining Date" value={employee.joiningDate} />
                        <InfoField label="Exit Date" value={employee.exitDate} />
                        <InfoField label="Status" value={employee.status} />
                    </>}
                </ProfileCard>
            </div>
        </div>
    );
}

export default Profile;
