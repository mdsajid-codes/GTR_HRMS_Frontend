import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
    User,
    FileText,
    Briefcase,
    Calendar,
    Clock,
    DollarSign,
    Percent,
    Landmark,
    Receipt,
    HandCoins,
    Search,
    Loader,
    Camera,
} from 'lucide-react';
import axios from 'axios';
import Profile from '../components/Hrpages/Profile';
import Leave from '../components/Hrpages/Leave';
import Payroll from '../components/Hrpages/Payroll';
import Address from '../components/Hrpages/Address';
import Documents from '../components/Hrpages/Documents';
import JobDetails from '../components/Hrpages/JobDetails';
import TimeAttendence from '../components/Hrpages/TimeAttendence';

const employeeNavLinks = [
    { name: 'Summary', icon: User },
    { name: 'Profile', icon: User },
    { name: 'Job Details', icon: Briefcase },
    { name: 'Address & Bank Details', icon: Briefcase },
    { name: 'Documents', icon: FileText },
    { name: 'Time & Attendance', icon: Clock }
];

const Employee = () => {
    const [activeTab, setActiveTab] = useState('Summary');
    const [employee, setEmployee] = useState(null);
    const [employeeId, setEmployeeId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [photoUrl, setPhotoUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSearch = async(e)=>{
        e.preventDefault();
        if (!employeeId) {
            setError("Please enter an Employee ID.");
            return;
        }
        setLoading(true);
        setError("");
        setEmployee(null);

        if (!API_URL) {
            setError("API URL is not configured. Please check your .env file.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Use Promise.all to fetch employee and job details concurrently
            const [employeeRes, jobDetailsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/${employeeId}`, { headers }),
                axios.get(`${API_URL}/job-details/${employeeId}`, { headers }).catch(err => {
                    // Don't fail the whole search if job details are not found (404)
                    if (err.response && err.response.status === 404) {
                        return { data: null };
                    }
                    // For other errors, re-throw to be caught by the main catch block
                    throw err;
                })
            ]);

            const employeeData = employeeRes.data;
            const name = employeeData.firstName + " " + employeeData.lastName;
            const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
            
            setEmployee({ ...employeeData, jobDetails: jobDetailsRes.data, initials });
        } catch (err) {
            console.error("Error searching for employee:", err);
            if (err.response){
                if (err.response.status === 404) {
                    setError(`Employee with ID "${employeeId}" not found.`);
                } else {
                    setError(err.response.data.message || "An error occurred while searching.");
                }
            } else if (err.request) {
                setError("No response from server. Please check your network connection.");
            } else {
                setError("Failed to search for employee. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employee?.employeeCode && employee.photoPath) {
            const fetchPhoto = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/employees/${employee.employeeCode}/photo`, {
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

        // Cleanup function
        return () => {
            if (photoUrl) {
                URL.revokeObjectURL(photoUrl);
            }
        };
    }, [employee]);

    const handleEmployeeUpdate = (updatedEmployee) => {
        setEmployee(updatedEmployee);
    };

    const renderContent = () => {
        if (!employee) {
            return <div className="text-center text-slate-500">Please search for an employee to see their details.</div>;
        }
        switch (activeTab) {
            case 'Summary':
                return <div>Summary Details for {employee.name}</div>;
            case 'Profile':
                return <Profile employee={employee} onUpdate={handleEmployeeUpdate} />
            case 'Job Details':
                return <JobDetails employee={employee} />
            case 'Address & Bank Details' :
                return <Address employee={employee} />
            case 'Documents' :
                return <Documents employee = {employee} />
            case 'Time & Attendance':
                return <TimeAttendence employee={employee} />
            case 'Leave' :
                return <Leave employee={employee} />
            case 'Salary':
                return <Payroll employee={employee} />
            default:
                return <div>Details for {activeTab}</div>;
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !employee) return;

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/employees/${employee.employeeCode}/photo`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            // Update employee state to trigger photo refetch
            setEmployee(response.data);
        } catch (err) {
            console.error("Error uploading photo:", err);
            alert("Failed to upload photo. Please ensure it's a valid image file.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full">
                {/* Employee Header & Sub-Navigation */}
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[104px]">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="relative group">
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Employee" className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white shadow-md">
                                        {employee ? employee.initials : '?'}
                                    </div>
                                )}
                                {employee && (
                                    <label htmlFor="photo-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full cursor-pointer transition-opacity">
                                        {uploadingPhoto ? (
                                            <Loader className="animate-spin h-6 w-6 text-white" />
                                        ) : (
                                            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </label>
                                )}
                                <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-800 truncate">
                                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Details'}
                                    </h1>
                                    {employee && (
                                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                            employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>{employee.status.toLowerCase()}</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">{employee?.jobDetails?.designation || 'Search by ID to begin'}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search by Employee Id"
                                value={employeeId}
                                onChange={(e)=>setEmployeeId(e.target.value)}
                                className="w-full sm:w-72 pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 rounded-full" disabled={loading}>
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </button>
                        </form>
                    </div>
                    {employee && (
                        <nav className="flex overflow-x-auto">
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
                    )}
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        {error ? (
                            <div className="text-center text-red-600">{error}</div>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-slate-800 mb-4">{activeTab}</h2>
                                {renderContent()}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Employee;
