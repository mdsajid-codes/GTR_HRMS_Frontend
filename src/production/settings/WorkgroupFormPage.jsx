import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, name, value, onChange, required = false, type = 'text', ...props }) => (
    <div className="space-y-1 w-full">
        <label htmlFor={name} className="block text-sm font-medium text-foreground-muted">{label}</label>
        <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} required={required} className="input bg-background-muted border-border text-foreground" {...props} />
    </div>
);

const WorkgroupFormPage = ({ item, onSave, onCancel }) => {
    const initialSchedule = { MONDAY: { startTime: '', endTime: '' }, TUESDAY: { startTime: '', endTime: '' }, WEDNESDAY: { startTime: '', endTime: '' }, THURSDAY: { startTime: '', endTime: '' }, FRIDAY: { startTime: '', endTime: '' }, SATURDAY: { startTime: '', endTime: '' }, SUNDAY: { startTime: '', endTime: '' } };
    const [formData, setFormData] = useState({ name: '', designation: '', numberOfEmployees: 1, instanceCount: 1, hourlyRate: '', fixedWorkingMinutes: 480, customWorkingHours: false, colorHex: '#FFFFFF', locationId: '', ...item });
    const [schedules, setSchedules] = useState(initialSchedule);
    const [designations, setDesignations] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/designations`, { headers: { Authorization: `Bearer ${token}` } });
                setDesignations(res.data);
            } catch (err) {
                console.error("Failed to fetch designations:", err);
            }
        };
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } });
                setLocations(res.data);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
            }
        };
        fetchDesignations();
        fetchLocations();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name, designation: item.designation || '', numberOfEmployees: item.numberOfEmployees || 1,
                instanceCount: item.instanceCount, hourlyRate: item.hourlyRate, fixedWorkingMinutes: item.fixedWorkingMinutes,
                customWorkingHours: item.customWorkingHours, colorHex: item.colorHex || '#FFFFFF', locationId: item.locationId || ''
            });
            const newSchedules = { ...initialSchedule };
            item.daySchedules?.forEach(s => {
                newSchedules[s.dayOfWeek] = { startTime: s.startTime || '', endTime: s.endTime || '' };
            });
            setSchedules(newSchedules);
        }
    }, [item]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleScheduleChange = (day, field, value) => {
        setSchedules(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        const payload = { ...formData };
        if (formData.customWorkingHours) {
            payload.daySchedules = Object.entries(schedules)
                .filter(([, times]) => times.startTime && times.endTime)
                .map(([day, times]) => ({ dayOfWeek: day, ...times }));
        }
        const finalPayload = {
            ...payload,
            locationId: payload.locationId || null,
        };
        onSave(finalPayload);
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-foreground">{item ? 'Edit Work Group' : 'Add New Work Group'}</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Work Group Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Assembly Line A" />
                    <div className="space-y-1">
                        <label htmlFor="designation" className="block text-sm font-medium text-foreground-muted">Designation</label>
                        <select id="designation" name="designation" value={formData.designation} onChange={handleChange} className="input bg-background-muted border-border text-foreground">
                            <option value="">Select Designation</option>
                            {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="locationId" className="block text-sm font-medium text-foreground-muted">Location (Optional)</label>
                        <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="input bg-background-muted border-border text-foreground">
                            <option value="">Select Location</option>
                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                    <FormField label="Number of Employees" name="numberOfEmployees" type="number" value={formData.numberOfEmployees} onChange={handleChange} required min="1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-3 col-span-full">
                        <h3 className="text-base font-semibold text-foreground">Advanced Options</h3>
                        <label className="flex items-center cursor-pointer">
                            <span className="text-sm mr-2">{isAdvancedMode ? 'On' : 'Off'}</span>
                            <div className="relative">
                                <input type="checkbox" checked={isAdvancedMode} onChange={() => setIsAdvancedMode(prev => !prev)} className="sr-only" />
                                <div className={`block w-10 h-6 rounded-full ${isAdvancedMode ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAdvancedMode ? 'transform translate-x-full' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {isAdvancedMode && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Color" name="colorHex" type="color" value={formData.colorHex} onChange={handleChange} className="input p-1 h-10 w-full" />
                            <FormField label="Instance Count" name="instanceCount" type="number" value={formData.instanceCount} onChange={handleChange} required min="1" />
                            <FormField label="Hourly Rate" name="hourlyRate" type="number" step="0.01" value={formData.hourlyRate} onChange={handleChange} required placeholder="e.g., 25.50" />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input type="checkbox" id="customWorkingHours" name="customWorkingHours" checked={formData.customWorkingHours} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                            <label htmlFor="customWorkingHours" className="text-sm font-medium text-foreground-muted">Use Custom Working Hours per Day</label>
                        </div>
                        {formData.customWorkingHours ? (
                            <div className="space-y-2 pt-2 border-t border-border">
                                <h4 className="text-md font-semibold text-foreground-muted">Daily Schedule</h4>
                                {Object.keys(schedules).map(day => (
                                    <div key={day} className="grid grid-cols-3 gap-2 items-center">
                                        <label className="text-sm capitalize text-foreground-muted">{day.toLowerCase()}</label>
                                        <input type="time" value={schedules[day].startTime} onChange={e => handleScheduleChange(day, 'startTime', e.target.value)} className="input bg-background-muted border-border" />
                                        <input type="time" value={schedules[day].endTime} onChange={e => handleScheduleChange(day, 'endTime', e.target.value)} className="input bg-background-muted border-border" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <FormField label="Fixed Working Minutes per Day" name="fixedWorkingMinutes" type="number" value={formData.fixedWorkingMinutes} onChange={handleChange} required min="0" />
                        )}
                    </div>
                )}
                <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
            </form>
        </div>
    );
};

export default WorkgroupFormPage;