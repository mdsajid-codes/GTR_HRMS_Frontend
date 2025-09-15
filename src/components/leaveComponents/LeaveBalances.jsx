import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Loader, AlertCircle, BookOpen, X, Plus, Trash2, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Balance Management Modal ---
const BalanceManagementModal = ({ employee, onClose, leaveTypes }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [newBalanceData, setNewBalanceData] = useState({
        leaveType: leaveTypes[0]?.leaveType || '',
        availableDays: '',
        asOfDate: new Date().toISOString().split('T')[0], // today's date
    });

    const fetchBalances = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/leave-balances/employee/${employee.employeeCode}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setBalances(response.data);
        } catch (err) {
            setError('Failed to fetch leave balances.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, [employee.employeeCode]);

    const handleAddBalance = async (e) => {
        e.preventDefault();
        if (!newBalanceData.leaveType || !newBalanceData.availableDays) {
            setError('Leave Type and Allocated Days are required.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...newBalanceData,
                employeeCode: employee.employeeCode,
            };
            await axios.post(`${API_URL}/leave-balances`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setIsAddFormVisible(false);
            setNewBalanceData({
                leaveType: leaveTypes[0]?.leaveType || '',
                availableDays: '',
                asOfDate: new Date().toISOString().split('T')[0],
            });
            fetchBalances(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add balance.');
        }
    };

    const handleDeleteBalance = async (balanceId) => {
        if (!window.confirm("Are you sure you want to delete this balance record? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/leave-balances/${balanceId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchBalances(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete balance.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewBalanceData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Manage Balances for {employee.firstName} {employee.lastName}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsAddFormVisible(!isAddFormVisible)} className="btn-primary flex items-center">
                            <Plus className="h-4 w-4 mr-2" /> {isAddFormVisible ? 'Cancel' : 'Add/Update Balance'}
                        </button>
                    </div>

                    {isAddFormVisible && (
                        <form onSubmit={handleAddBalance} className="p-4 border rounded-lg bg-slate-50 mb-6 space-y-4">
                            <h3 className="font-semibold">Add or Update Leave Balance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700">Leave Type</label>
                                    <select id="leaveType" name="leaveType" value={newBalanceData.leaveType} onChange={handleFormChange} required className="input">
                                        {leaveTypes.map(lt => <option key={lt.id} value={lt.leaveType}>{lt.leaveType.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="availableDays" className="block text-sm font-medium text-slate-700">Total Allocated Days</label>
                                    <input type="number" step="0.5" id="availableDays" name="availableDays" value={newBalanceData.availableDays} onChange={handleFormChange} required className="input" placeholder="e.g., 12" />
                                </div>
                                <div>
                                    <label htmlFor="asOfDate" className="block text-sm font-medium text-slate-700">As of Date</label>
                                    <input type="date" id="asOfDate" name="asOfDate" value={newBalanceData.asOfDate} onChange={handleFormChange} required className="input" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="btn-primary">Save Balance</button>
                            </div>
                        </form>
                    )}

                    {error && <div className="text-center text-red-600 p-3 bg-red-50 rounded-md mb-4">{error}</div>}

                    {loading ? (
                        <div className="flex justify-center items-center h-40"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : balances.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="th-cell">Leave Type</th><th className="th-cell text-right">Total Allocated</th><th className="th-cell text-right">Used</th><th className="th-cell text-right">Pending</th><th className="th-cell text-right font-bold">Available</th><th className="th-cell">As of Date</th><th className="th-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balances.map(bal => (
                                        <tr key={bal.id} className="border-b border-slate-200">
                                            <td className="td-cell font-medium">{bal.leaveType.leaveType.replace('_', ' ')}</td><td className="td-cell text-right">{bal.totalAllocated}</td><td className="td-cell text-right">{bal.used}</td><td className="td-cell text-right">{bal.pending}</td><td className="td-cell text-right font-bold">{bal.available}</td><td className="td-cell text-sm">{new Date(bal.asOfDate).toLocaleDateString('en-IN')}</td><td className="td-cell"><button onClick={() => handleDeleteBalance(bal.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-10"><BookOpen className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No Balances Found</h3><p className="mt-1 text-sm text-slate-500">No leave balances have been configured for this employee.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main LeaveBalances Component ---
const LeaveBalances = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [allBalances, setAllBalances] = useState({});
    const [syncProgress, setSyncProgress] = useState(0);
    const [totalSyncCount, setTotalSyncCount] = useState(0);

    const fetchInitialData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [employeesRes, leaveTypesRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/leave-types`, { headers })
            ]);
            const fetchedEmployees = employeesRes.data;
            setEmployees(fetchedEmployees);
            setLeaveTypes(leaveTypesRes.data);

            // Fetch all balances - NOTE: This can be slow with many employees.
            // A dedicated backend endpoint for all balances would be more performant.
            const balancePromises = fetchedEmployees.map(emp =>
                axios.get(`${API_URL}/leave-balances/employee/${emp.employeeCode}`, { headers })
            );
            const balanceResults = await Promise.allSettled(balancePromises);

            const balancesByEmployee = {};
            balanceResults.forEach((result, index) => {
                const employeeCode = fetchedEmployees[index].employeeCode;
                if (result.status === 'fulfilled') {
                    balancesByEmployee[employeeCode] = result.value.data;
                } else {
                    balancesByEmployee[employeeCode] = []; // Default to empty on error
                }
            });
            setAllBalances(balancesByEmployee);
        } catch (err) {
            setError('Failed to fetch employee or balance data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleSyncAllBalances = async () => {
        if (!window.confirm(`This will create or update leave balances for all ${employees.length} employees based on the defined leave types for the current year. This may take a while and cannot be undone. Do you want to proceed?`)) {
            return;
        }

        setSyncing(true);
        setError('');
        setSyncProgress(0);
        let successCount = 0;
        let errorCount = 0;

        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };
        const asOfDate = new Date().toISOString().split('T')[0];

        const applicableLeaveTypes = leaveTypes.filter(lt => lt.maxDaysPerYear != null && lt.maxDaysPerYear > 0);
        const totalOperations = employees.length * applicableLeaveTypes.length;
        setTotalSyncCount(totalOperations);

        if (totalOperations === 0) {
            alert("No applicable leave types with 'Max Days Per Year' found to sync.");
            setSyncing(false);
            return;
        }

        for (const employee of employees) {
            for (const leaveType of applicableLeaveTypes) {
                try {
                    const payload = {
                        employeeCode: employee.employeeCode,
                        leaveType: leaveType.leaveType,
                        availableDays: leaveType.maxDaysPerYear,
                        asOfDate: asOfDate,
                    };
                    await axios.post(`${API_URL}/leave-balances`, payload, { headers });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to sync for ${employee.employeeCode} and ${leaveType.leaveType}:`, err);
                    errorCount++;
                } finally {
                    setSyncProgress(prev => prev + 1);
                }
            }
        }

        setSyncing(false);
        alert(`Sync complete! \n- ${successCount} balances created/updated successfully. \n- ${errorCount} operations failed (check console for details).`);
    };

    const calculateTotalAvailable = (employeeCode) => {
        const balances = allBalances[employeeCode];
        if (!balances || balances.length === 0) {
            return 0;
        }
        // Sum up the 'available' getter from each balance object
        return balances.reduce((total, balance) => total + (balance.available || 0), 0);
    };

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowercasedFilter = searchTerm.toLowerCase();
        return employees.filter(emp =>
            emp.firstName.toLowerCase().includes(lowercasedFilter) ||
            emp.lastName.toLowerCase().includes(lowercasedFilter) ||
            emp.employeeCode.toLowerCase().includes(lowercasedFilter)
        );
    }, [employees, searchTerm]);

    const handleManageBalances = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Employee Leave Balances</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button onClick={handleSyncAllBalances} className="btn-secondary flex items-center w-full sm:w-auto justify-center" disabled={syncing || loading}>
                        {syncing ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Sync All Balances
                    </button>
                    <div className="relative w-full sm:w-64">
                        <input type="text" placeholder="Search by employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full pr-10" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                </div>
            </div>

            {syncing && (
                <div className="mb-4">
                    <p className="text-sm text-slate-600 text-center">Syncing balances... ({syncProgress} / {totalSyncCount})</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: totalSyncCount > 0 ? `${(syncProgress / totalSyncCount) * 100}%` : '0%' }}></div>
                    </div>
                </div>
            )}

            {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md mb-4">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr><th className="th-cell">Employee</th><th className="th-cell">Employee Code</th><th className="th-cell text-right">Total Available Balance</th><th className="th-cell">Actions</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10"><Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => (
                                <tr key={emp.employeeCode} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="td-cell font-medium">{`${emp.firstName} ${emp.lastName}`}</td>
                                    <td className="td-cell text-sm text-slate-500">{emp.employeeCode}</td>
                                    <td className="td-cell text-right font-semibold">
                                        {calculateTotalAvailable(emp.employeeCode)} days
                                    </td>
                                    <td className="td-cell"><button onClick={() => handleManageBalances(emp)} className="btn-secondary py-1 px-3 text-xs">Manage Balances</button></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center py-10 text-slate-500"><AlertCircle className="mx-auto h-12 w-12 text-slate-400" /><h3 className="mt-2 text-sm font-semibold text-slate-900">No employees found</h3><p className="mt-1 text-sm text-slate-500">No employees match your search criteria.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedEmployee && (
                <BalanceManagementModal employee={selectedEmployee} onClose={handleCloseModal} leaveTypes={leaveTypes} />
            )}
        </div>
    );
};

export default LeaveBalances;
