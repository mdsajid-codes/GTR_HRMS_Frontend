import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Loader, User, Briefcase, Calendar, DollarSign, ArrowLeft, Camera, Clock } from 'lucide-react';
import axios from 'axios';
import Profile from '../components/Hrpages/Profile';
import Address from '../components/Hrpages/Address';
import Documents from '../components/Hrpages/Documents';
import JobDetails from '../components/Hrpages/JobDetails';
import TimeAttendence from '../components/Hrpages/TimeAttendence';

const employeeNavLinks = [
    { name: 'Profile', icon: User },
    { name: 'Job Details', icon: Briefcase },
    { name: 'Address & Bank Details', icon: Briefcase },
    { name: 'Documents', icon: Calendar },
    { name: 'Time & Attendance', icon: Clock },
    // Add other tabs as needed
];

const ViewEmployeeModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('Profile');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (isOpen) {
            const fetchEmployees = async () => {
                setLoading(true);
                setError('');
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/employees/all`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    setEmployees(response.data);
                } catch (err) {
                    console.error("Error fetching employees:", err);
                    setError('Failed to fetch employees. Please try again later.');
                } finally {
                    setLoading(false);
                }
            };
            fetchEmployees();
        } else {
            // Reset state on close
            setEmployees([]);
            setSelectedEmployee(null);
            setSearchTerm('');
            setPhotoUrl(null);
            setError('');
        }
    }, [isOpen, API_URL]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowercasedFilter = searchTerm.toLowerCase();
        return employees.filter(emp =>
            (emp.firstName && emp.firstName.toLowerCase().includes(lowercasedFilter)) ||
            (emp.lastName && emp.lastName.toLowerCase().includes(lowercasedFilter)) ||
            (emp.employeeCode && emp.employeeCode.toLowerCase().includes(lowercasedFilter)) ||
            (emp.emailWork && emp.emailWork.toLowerCase().includes(lowercasedFilter))
        );
    }, [employees, searchTerm]);

    const handleSelectEmployee = async (employee) => {
        const name = employee.firstName + " " + employee.lastName;
        const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

        let employeeWithDetails = { ...employee, initials };

        // Fetch job details for the selected employee
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const jobDetailsRes = await axios.get(`${API_URL}/job-details/${employee.employeeCode}`, { headers });
            employeeWithDetails.jobDetails = jobDetailsRes.data;
        } catch (err) {
            console.error("Error fetching job details for selected employee:", err);
            // If job details are not found, we can proceed without them
            employeeWithDetails.jobDetails = null;
        }

        setSelectedEmployee(employeeWithDetails);
        setActiveTab('Profile');
    };
    
    const handleBackToList = () => {
        setSelectedEmployee(null);
        setPhotoUrl(null);
    };

    const handleEmployeeUpdate = (updatedEmployee) => {
        setSelectedEmployee(updatedEmployee);
        setEmployees(prev => prev.map(e => e.employeeCode === updatedEmployee.employeeCode ? updatedEmployee : e));
    };

    useEffect(() => {
        if (selectedEmployee?.employeeCode && selectedEmployee.photoPath) {
            const fetchPhoto = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/employees/${selectedEmployee.employeeCode}/photo`, {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: 'blob'
                    });
                    const objectURL = URL.createObjectURL(response.data);
                    setPhotoUrl(objectURL);
                } catch (error) {
                    console.error("Could not load employee photo", error);
                    setPhotoUrl(null);
                }
            };
            fetchPhoto();
        } else {
            setPhotoUrl(null);
        }
        return () => { if (photoUrl) URL.revokeObjectURL(photoUrl); };
    }, [selectedEmployee]);

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedEmployee) return;
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/employees/${selectedEmployee.employeeCode}/photo`, formData, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
            handleEmployeeUpdate(response.data);
        } catch (err) {
            alert("Failed to upload photo.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const renderContent = () => {
        if (!selectedEmployee) return null;
        switch (activeTab) {
            case 'Profile':
                return <Profile employee={selectedEmployee} onUpdate={handleEmployeeUpdate} />;
            case 'Job Details':
                return <JobDetails employee={selectedEmployee} />;
            case 'Address & Bank Details':
                return <Address employee={selectedEmployee} />;
            case 'Documents':
                return <Documents employee={selectedEmployee} />;
            case 'Time & Attendance':
                return <TimeAttendence employee={selectedEmployee} />;
            default:
                return <div>Details for {activeTab}</div>;
        }
    };

    const renderEmployeeList = () => (
        <div className="p-6">
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search by name, code, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <div className="overflow-y-auto" style={{maxHeight: 'calc(90vh - 250px)'}}>
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Employee Code</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Work Email</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Designation</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : error ? (
                            <tr><td colSpan="4" className="text-center py-10 text-red-500">{error}</td></tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => (
                                <tr key={emp.employeeCode} className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={() => handleSelectEmployee(emp)}>
                                    <td className="py-3 px-4 font-medium">{emp.firstName} {emp.lastName}</td>
                                    <td className="py-3 px-4 text-sm text-slate-500">{emp.employeeCode}</td>
                                    <td className="py-3 px-4 text-sm text-slate-500">{emp.emailWork}</td>
                                    <td className="py-3 px-4 text-sm text-slate-500">{emp.jobDetails?.designation || 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10 text-slate-500">No employees found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {selectedEmployee ? 'Employee Details' : 'Find Employee'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {selectedEmployee ? (
                        <>
                            {/* Header inside modal */}
                            <div className="bg-white shadow-sm sticky top-0 z-10">
                                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <button onClick={handleBackToList} className="p-2 rounded-full hover:bg-slate-100">
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                        <div className="relative group">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt="Employee" className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white shadow-md">
                                                    {selectedEmployee.initials}
                                                </div>
                                            )}
                                            <label htmlFor="modal-photo-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full cursor-pointer transition-opacity">
                                                {uploadingPhoto ? (
                                                    <Loader className="animate-spin h-6 w-6 text-white" />
                                                ) : (
                                                    <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </label>
                                            <input id="modal-photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-2xl font-bold text-slate-800 truncate">
                                                    {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                                                </h1>
                                                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                                    selectedEmployee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>{selectedEmployee.status.toLowerCase()}</span>
                                            </div>
                                            <p className="text-sm text-slate-500">{selectedEmployee.jobDetails?.designation || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <nav className="flex overflow-x-auto border-b border-slate-200">
                                    {employeeNavLinks.map((link) => (
                                        <button
                                            key={link.name}
                                            onClick={() => setActiveTab(link.name)}
                                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                                activeTab === link.name
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                            }`}
                                        >
                                            <link.icon className="h-4 w-4" />
                                            <span>{link.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Content Area */}
                            <main className="p-6">
                                {renderContent()}
                            </main>
                        </>
                    ) : (
                        renderEmployeeList()
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewEmployeeModal;