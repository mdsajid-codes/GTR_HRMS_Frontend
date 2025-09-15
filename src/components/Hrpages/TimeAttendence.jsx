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

const TimeAttendence = ({ employee }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [timeAttendence, setTimeAttendence] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectOptions, setSelectOptions] = useState({
        timeTypes: [], workTypes: [], shiftTypes: [], weeklyOffPolicies: [], leaveGroups: [],
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const initialFormState = {
        timeType: '', workType: '', shiftType: '', weeklyOffPolicy: '', leaveGroup: '',
        attendenceCaptureScheme: '', holidayList: '', expensePolicy: '',
        attendenceTrackingPolicy: '', recruitmentPolicy: '', isRosterBasedEmployee: false
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!employee?.employeeCode) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };

                const [detailsRes, timeTypeRes, workTypeRes, shiftTypeRes, weekOffRes, leaveGroupRes] = await Promise.all([
                    axios.get(`${API_URL}/time-attendence/${employee.employeeCode}`, { headers }).catch(err => {
                        if (err.response && err.response.status === 404) return { data: null };
                        throw err;
                    }),
                    axios.get(`${API_URL}/time-types`, { headers }),
                    axios.get(`${API_URL}/work-types`, { headers }),
                    axios.get(`${API_URL}/shift-types`, { headers }),
                    axios.get(`${API_URL}/weekly-off-policies`, { headers }),
                    axios.get(`${API_URL}/leave-groups`, { headers })
                ]);

                const detailsData = detailsRes.data;
                setTimeAttendence(detailsData);
                setFormData(detailsData || initialFormState);

                setSelectOptions({
                    timeTypes: timeTypeRes.data,
                    workTypes: workTypeRes.data,
                    shiftTypes: shiftTypeRes.data,
                    weeklyOffPolicies: weekOffRes.data,
                    leaveGroups: leaveGroupRes.data,
                });

            } catch (err) {
                console.error("Error fetching time & attendance data:", err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employee, API_URL]);

    if (!employee) {
        return <div className="text-center text-slate-500">No employee selected.</div>;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(timeAttendence || initialFormState);
        setError('');
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/time-attendence/${employee.employeeCode}`, formData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTimeAttendence(response.data);
            setFormData(response.data);
            setIsEditing(false);
            alert('Time & Attendance details updated successfully!');
        } catch (err) {
            console.error("Error updating details:", err);
            const errorMessage = err.response?.data?.message || 'Failed to update details. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    const currentData = isEditing ? formData : timeAttendence || {};

    const fields = [
        { name: 'timeType', label: 'Time Type', type: 'select', options: selectOptions.timeTypes.map(o => ({ value: o.name, label: o.name })) },
        { name: 'workType', label: 'Work Type', type: 'select', options: selectOptions.workTypes.map(o => ({ value: o.name, label: o.name })) },
        { name: 'shiftType', label: 'Shift Type', type: 'select', options: selectOptions.shiftTypes.map(o => ({ value: o.name, label: `${o.name} (${o.startTime} - ${o.endTime})` })) },
        { name: 'weeklyOffPolicy', label: 'Weekly Off Policy', type: 'select', options: selectOptions.weeklyOffPolicies.map(o => ({ value: o.name, label: o.name })) },
        { name: 'leaveGroup', label: 'Leave Group', type: 'select', options: selectOptions.leaveGroups.map(o => ({ value: o.name, label: o.name })) },
        { name: 'attendenceCaptureScheme', label: 'Attendance Capture Scheme' },
        { name: 'holidayList', label: 'Holiday List' },
        { name: 'expensePolicy', label: 'Expense Policy' },
        { name: 'attendenceTrackingPolicy', label: 'Attendance Tracking Policy' },
        { name: 'recruitmentPolicy', label: 'Recruitment Policy' },
    ];

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
                        Edit Policy
                    </button>
                )}
            </div>
            {error && <div className="text-center text-red-600 p-3 bg-red-50 rounded-md mb-4">{error}</div>}
            <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                    {fields.map(field => (
                        isEditing ? (
                            <EditField key={field.name} {...field} value={formData[field.name]} onChange={handleChange} />
                        ) : (
                            <InfoField key={field.name} label={field.label} value={currentData[field.name]} />
                        )
                    ))}
                    {isEditing ? (
                        <div className="md:col-span-3">
                            <label className="inline-flex items-center">
                                <input type="checkbox" name="isRosterBasedEmployee" checked={formData.isRosterBasedEmployee} onChange={handleChange} className="h-4 w-4 rounded" />
                                <span className="ml-2 text-sm">Is Roster Based Employee</span>
                            </label>
                        </div>
                    ) : (
                        <InfoField label="Roster Based" value={currentData.isRosterBasedEmployee ? 'Yes' : 'No'} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default TimeAttendence;
