import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, FileText, Briefcase, MapPin, Search, Loader, Users, Camera, ArrowLeft, Mail, Phone, Clock, Calendar, DollarSign, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Profile from '../components/Hrpages/Profile';
import Leave from '../components/Hrpages/Leave';
import Payroll from '../components/Hrpages/Payroll';
import Address from '../components/Hrpages/Address';
import Documents from '../components/Hrpages/Documents';
import JobDetails from '../components/Hrpages/JobDetails';
import TimeAttendence from '../components/Hrpages/TimeAttendence';

const employeeNavLinks = [
    { name: 'Profile', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'Job Details', icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { name: 'Time & Attendance', icon: Clock, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    { name: 'Leave', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { name: 'Salary', icon: DollarSign, color: 'text-teal-600', bgColor: 'bg-teal-100' },
    { name: 'Address & Bank Details', icon: MapPin, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Documents', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
];

const Employee = () => {
    const [activeTab, setActiveTab] = useState('Profile');
    const [employee, setEmployee] = useState(null);
    const [allEmployees, setAllEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [photoUrl, setPhotoUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedGender, setSelectedGender] = useState('all');
    
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSearch = async (e) => {
        e.preventDefault(); // Prevent form submission from reloading the page
        // The list is already filtered by the `filteredEmployees` useMemo hook.
        // If the user hits enter, we can select the first result if it exists.
        if (filteredEmployees.length > 0) {
            await handleSelectEmployee(filteredEmployees[0]);
        } else {
            setError(`No employee found matching "${searchTerm}".`);
            // Clear the error after a few seconds
            setTimeout(() => {
                setError("");
            }, 3000);
        }
    };

    const fetchAllEmployeesAndLocations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [employeesRes, locationsRes, departmentsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/locations`, { headers }),
                axios.get(`${API_URL}/departments`, { headers }),
            ]);

            const employeesWithJobDetails = await Promise.all(
                employeesRes.data.map(async (emp) => {
                    try {
                        const jobDetailsRes = await axios.get(`${API_URL}/job-details/${emp.employeeCode}`, { headers });
                        return { ...emp, jobDetails: jobDetailsRes.data };
                    } catch (err) {
                        return { ...emp, jobDetails: null }; // Handle cases where job details might not exist
                    }
                })
            );

            setAllEmployees(employeesWithJobDetails);
            setLocations(locationsRes.data);
            setDepartments(departmentsRes.data);
        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError("Failed to load employee and location data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEmployeesAndLocations();
    }, []);

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

    const handleSelectEmployee = async (selectedEmp) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            // Fetch full details for the selected employee
            const [employeeRes, jobDetailsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/${selectedEmp.employeeCode}`, { headers }),
                axios.get(`${API_URL}/job-details/${selectedEmp.employeeCode}`, { headers }).catch(() => ({ data: null }))
            ]);

            const employeeData = employeeRes.data;
            const name = employeeData.firstName + " " + employeeData.lastName;
            const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
            
            setEmployee({ ...employeeData, jobDetails: jobDetailsRes.data, initials });
        } catch (err) {
            setError("Could not fetch employee details.");
            console.error("Error selecting employee:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return allEmployees.filter(emp => {
            const locationMatch = selectedLocation === 'all' || emp.location?.id === parseInt(selectedLocation);
            const departmentMatch = selectedDepartment === 'all' || emp.jobDetails?.department === selectedDepartment;
            const genderMatch = selectedGender === 'all' || emp.gender === selectedGender;

            if (!searchTerm.trim()) {
                return locationMatch && genderMatch && departmentMatch;
            }

            const searchMatch = 
                (emp.firstName && `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lowercasedFilter)) ||
                (emp.employeeCode && emp.employeeCode.toLowerCase().includes(lowercasedFilter));

            return locationMatch && genderMatch && departmentMatch && searchMatch;
        });
    }, [allEmployees, selectedLocation, selectedGender, searchTerm, selectedDepartment]);

    const EmployeeCard = ({ emp, onSelect }) => {
        const [photoSrc, setPhotoSrc] = useState(null);
        const initials = (emp.firstName?.[0] || '') + (emp.lastName?.[0] || '');

        useEffect(() => {
            let objectURL;
            if (emp.photoPath) {
                const fetchCardPhoto = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API_URL}/employees/${emp.employeeCode}/photo`, {
                            headers: { Authorization: `Bearer ${token}` },
                            responseType: 'blob'
                        });
                        objectURL = URL.createObjectURL(response.data);
                        setPhotoSrc(objectURL);
                    } catch (error) {
                        // Silently fail, initials will be shown
                    }
                };
                fetchCardPhoto();
            }
            return () => { if (objectURL) URL.revokeObjectURL(objectURL); };
        }, [emp.employeeCode, emp.photoPath]);

        return (
            <div 
                className="bg-card text-card-foreground rounded-xl shadow-sm border border-border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group" 
                onClick={() => onSelect(emp)}
            >
                <div className="relative bg-background-muted" style={{ aspectRatio: '4 / 3' }}>
                    {photoSrc ? (
                        <img src={photoSrc} alt={`${emp.firstName} ${emp.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary opacity-70">{initials}</span>
                        </div>
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        emp.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                    }`}>
                        {emp.status?.toLowerCase()}
                    </div>
                </div>
                <div className="p-4">
                    <h4 className="font-bold text-foreground truncate">{emp.firstName} {emp.lastName}</h4>
                    <p className="text-sm text-foreground-muted truncate">{emp.jobDetails?.designation || 'No Designation'}</p>
                    <p className="text-xs text-foreground-muted/80 truncate">{emp.jobDetails?.department || 'No Department'}</p>
                    <p className="text-xs text-foreground-muted/80 mt-1">{emp.employeeCode}</p>
                </div>
                <div className="border-t border-border/50 px-4 pt-3 pb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-foreground-muted">
                        <Mail size={14} className="flex-shrink-0 text-red-500" />
                        <span className="truncate text-xs">{emp.emailWork || 'No work email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground-muted">
                        <Phone size={14} className="flex-shrink-0 text-green-500" />
                        <span className="truncate text-xs">{emp.phonePrimary || 'No phone'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const EmployeeList = useCallback(({ employees, onSelect }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {employees.map(emp => <EmployeeCard key={emp.employeeCode} emp={emp} onSelect={onSelect} />)}
        </div>
    ), [API_URL]);

    const renderContent = () => {
        if (!employee) {
            return (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Employees ({filteredEmployees.length})</h3>
                    {loading ? (
                <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>
            ) : filteredEmployees.length > 0 ? (
                <EmployeeList employees={filteredEmployees} onSelect={handleSelectEmployee} />
                    ) : (
                <div className="text-center py-10 text-foreground-muted">
                    <h3 className="text-lg font-semibold text-foreground">No Employees Found</h3>
                    <p>No employees match the current filters.</p>
                </div>
                    )}
                </div>
            );
        }

        switch (activeTab) {
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
                <div className="bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[100px]">
                        <div className="flex items-center gap-4 min-w-0">
                            {employee && (
                            <button onClick={() => setEmployee(null)} className="p-2 rounded-full hover:bg-primary/10 text-primary -ml-2 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            )}
                            {employee && (
                            <div className="relative group">
                                {photoUrl ? ( 
                                    <img src={photoUrl} alt="Employee" className="w-16 h-16 rounded-full object-cover ring-4 ring-card shadow-md" />

                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold ring-4 ring-card shadow-md">
                                        {employee ? employee.initials : '?'}
                                    </div>
                                )}
                                    <label htmlFor="photo-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-full cursor-pointer transition-opacity">
                                        {uploadingPhoto ? (
                                            <Loader className="animate-spin h-6 w-6 text-white" />
                                        ) : (
                                            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </label>
                                <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </div>
                            )}
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Details'}
                                    </h1>
                                    {employee && (
                                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                            employee.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                        }`}>{employee.status.toLowerCase()}</span>
                                    )}
                                </div>
                                <p className="text-sm text-foreground-muted">{employee?.jobDetails?.designation || (employee ? 'No Designation' : 'Select an employee or search by ID')}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                                <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="input pl-10 pr-8 appearance-none w-full sm:w-auto bg-background-muted border-border text-foreground-muted hover:border-primary">
                                    <option value="all">All Locations</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                            </div>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                                <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="input pl-10 pr-8 appearance-none w-full sm:w-auto bg-background-muted border-border text-foreground-muted hover:border-primary">
                                    <option value="all">All Departments</option>
                                    {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                                <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} className="input pl-10 pr-8 appearance-none w-full sm:w-auto bg-background-muted border-border text-foreground-muted hover:border-primary">
                                    <option value="all">All Genders</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                            </div>
                            <form onSubmit={handleSearch} className="relative w-full sm:w-auto flex">
                                <input
                                    type="text"
                                    placeholder="Search by Name or ID"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-56 pl-4 pr-12 py-2 border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-card text-foreground"
                                />
                                <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 flex items-center justify-center" disabled={loading}>
                                    {loading && !employee ? <Loader className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                    {employee && (
                        <nav className="flex overflow-x-auto border-b border-border">
                            {employeeNavLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => setActiveTab(link.name)}
                                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 group ${
                                        activeTab === link.name
                                            ? `border-primary text-primary` // Active tab
                                            : `border-transparent text-foreground-muted hover:text-foreground hover:border-border` // Inactive tab
                                    }`}
                                > 
                                    <div className={`p-1.5 rounded-lg ${link.bgColor} ${activeTab === link.name ? 'shadow-sm' : 'opacity-70 group-hover:opacity-100'}`}>
                                        <link.icon className={`h-4 w-4 ${link.color}`} />
                                    </div>
                                    <span>{link.name}</span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background-muted">
                    <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-border">
                        {error ? (
                            <div className="text-center text-red-600">{error}</div>
                        ) : (
                            <>
                                {!employee && <h2 className="text-xl font-semibold text-foreground mb-4">All Employees</h2>}
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
