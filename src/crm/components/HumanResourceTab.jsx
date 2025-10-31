import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader, Search, AlertCircle } from 'lucide-react';
import AddEmployeeModal from '../../pages/AddEmployeeModal'; // Assuming this path

const API_URL = import.meta.env.VITE_API_BASE_URL;

const HumanResourceTab = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null); // New state for editing

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const employeesRes = await axios.get(`${API_URL}/employees/all`, { headers: authHeaders });
            
            // Fetch job details for each employee to get department and designation
            const employeesWithDetails = await Promise.all(
                employeesRes.data.map(async (emp) => {
                    try {
                        const jobDetailsRes = await axios.get(`${API_URL}/job-details/${emp.employeeCode}`, { headers: authHeaders });
                        console.log(`Job details for ${emp.employeeCode}:`, jobDetailsRes.data); // Inspect this to debug department/designation
                        // Assuming roles are part of the user object, which might need a separate fetch or backend join.
                        // For now, we'll default to 'EMPLOYEE' if not available.
                        const userRes = await axios.get(`${API_URL}/users/email/${emp.emailWork}`, { headers: authHeaders }).catch(() => ({ data: { roles: ['EMPLOYEE'] } }));
                        return { ...emp, jobDetails: jobDetailsRes.data, roles: userRes.data.roles };
                    } catch (err) {
                        console.warn(`Could not fetch job details or user roles for ${emp.employeeCode}:`, err);
                        return { ...emp, jobDetails: null, roles: ['EMPLOYEE'] }; // Default roles
                    }
                })
            );
            setEmployees(employeesWithDetails);
        } catch (err) {
            setError('Failed to fetch employee data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowercasedFilter = searchTerm.toLowerCase();
        return employees.filter(emp =>
            (emp.firstName && emp.firstName.toLowerCase().includes(lowercasedFilter)) ||
            (emp.lastName && emp.lastName.toLowerCase().includes(lowercasedFilter)) ||
            (emp.employeeCode && emp.employeeCode.toLowerCase().includes(lowercasedFilter)) ||
            (emp.emailWork && emp.emailWork.toLowerCase().includes(lowercasedFilter)) ||
            (emp.jobDetails?.department && emp.jobDetails.department.toLowerCase().includes(lowercasedFilter)) ||
            (emp.jobDetails?.designation && emp.jobDetails.designation.toLowerCase().includes(lowercasedFilter))
        );
    }, [employees, searchTerm]);

    const handleEmployeeAdded = () => {
        fetchEmployees(); // Refresh the list after a new employee is added or updated
        setIsAddEmployeeModalOpen(false);
        setEmployeeToEdit(null); // Reset employeeToEdit after successful add/edit
    };
    const handleEditEmployee = (employee) => {
        setIsAddEmployeeModalOpen(true);
        setEmployeeToEdit(employee);
    };

    const handleDeleteEmployee = async (employeeCode, employeeName) => {
        if (!window.confirm(`Are you sure you want to delete employee ${employeeName} (${employeeCode})? This action cannot be undone.`)) {
            return;
        }
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/employees/${employeeCode}`, { headers: authHeaders });
            alert('Employee deleted successfully!');
            fetchEmployees(); // Refresh the list
        } catch (err) {
            setError(`Failed to delete employee: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Employees</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input w-full sm:w-64 pr-10 bg-background-muted border-border text-foreground"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={() => { setIsAddEmployeeModalOpen(true); setEmployeeToEdit(null); }} className="flex items-center gap-2 btn-secondary">
                        <Plus size={16} /> Add Employee
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell w-16">#</th>
                            <th className="th-cell">Department</th>
                            <th className="th-cell">Designation</th>
                            <th className="th-cell">Name</th>
                            <th className="th-cell">Employee Code</th>
                            <th className="th-cell">Reports To</th>
                            <th className="th-cell">Email ID</th>
                            <th className="th-cell">Mobile Number</th>
                            <th className="th-cell">Roles</th>
                            <th className="th-cell w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="10" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp, index) => (
                                <tr key={emp.employeeCode} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-medium">{index + 1}</td>
                                    <td className="td-cell">{emp.jobDetails?.department || 'N/A'}</td>
                                    <td className="td-cell">{emp.jobDetails?.designation || 'N/A'}</td>
                                    <td className="td-cell font-medium text-foreground">{`${emp.firstName} ${emp.lastName}`}</td>
                                    <td className="td-cell">{emp.employeeCode}</td>
                                    <td className="td-cell">{emp.jobDetails?.reportsTo || 'N/A'}</td>
                                    <td className="td-cell">{emp.emailWork || 'N/A'}</td>
                                    <td className="td-cell">{emp.phonePrimary || 'N/A'}</td>
                                    <td className="td-cell">{emp.roles?.join(', ') || 'N/A'}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEditEmployee(emp)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteEmployee(emp.employeeCode, `${emp.firstName} ${emp.lastName}`)} className="text-red-500 hover:text-red-600 p-1" title="Delete" disabled={loading}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="10" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No employees found</h3><p className="mt-1 text-sm">Add new employees to get started.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => {
                    setIsAddEmployeeModalOpen(false); // Close the modal
                    setEmployeeToEdit(null); // Reset employeeToEdit when modal closes
                }}
                onEmployeeAdded={handleEmployeeAdded} // This will also handle updates and close modal
                simplified={true}
                employeeToEdit={employeeToEdit} // Pass the employee to edit
            />
        </div>
    );
};

export default HumanResourceTab;