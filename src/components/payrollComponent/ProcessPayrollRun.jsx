import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Loader, ArrowLeft, Play, User, CheckCircle, XCircle, FileClock, Users, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusIcons = {
    GENERATED: <CheckCircle className="h-5 w-5 text-green-500" />,
    PENDING: <FileClock className="h-5 w-5 text-yellow-500" />,
    FAILED: <XCircle className="h-5 w-5 text-red-500" />,
};

const ProcessPayrollRun = ({ run, onBack, onRunComplete }) => {
    const [allEmployees, setAllEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [completedPayslips, setCompletedPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(new Set());
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [employeesRes, payslipsRes, departmentsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/payroll-runs/${run.id}/payslips`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/departments`, { headers }),
            ]);

            // Fetch job details for each employee since it's not in the /employees/all response
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
            setCompletedPayslips(payslipsRes.data);
            setDepartments(departmentsRes.data);
        } catch (err) {
            console.error("Failed to fetch employee data for payroll run", err);
        } finally {
            setLoading(false);
        }
    }, [run.id, API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerateSingle = async (employeeId, employeeCode) => {
        setProcessing(prev => new Set(prev).add(employeeCode));
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/payroll-runs/${run.id}/execute/employee/${employeeId}`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            // Add the newly generated payslip to the completed list
            setCompletedPayslips(prev => [...prev, response.data]);
        } catch (err) {
            alert(`Failed to generate payslip for ${employeeCode}.`);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(employeeCode);
                return newSet;
            });
        }
    };

    const handleGenerateAll = async () => {
        const pendingEmployees = allEmployees.filter(emp => !completedPayslips.some(p => p.employeeCode === emp.employeeCode));
        if (pendingEmployees.length === 0) return;
        if (!window.confirm(`Are you sure you want to generate payslips for all ${pendingEmployees.length} pending employees?`)) return;
        const pendingEmployeeCodes = pendingEmployees.map(e => e.employeeCode);
        setProcessing(new Set(pendingEmployeeCodes));
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/payroll-runs/${run.id}/execute`, {}, { headers: { "Authorization": `Bearer ${token}` } });
            onRunComplete(); // This will trigger a refetch on the parent and navigate back.
        } catch (err) {
            alert('Failed to execute the payroll run for all employees.');
            setProcessing(new Set());
        }
    };

    const pendingEmployees = useMemo(() => {
        const completedCodes = new Set(completedPayslips.map(p => p.employeeCode));
        let filtered = allEmployees.filter(emp => !completedCodes.has(emp.employeeCode));

        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(emp => emp.jobDetails?.department === selectedDepartment);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(emp => `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lower) || emp.employeeCode.toLowerCase().includes(lower));
        }
        return filtered;
    }, [allEmployees, completedPayslips, searchTerm, selectedDepartment]);

    const completedEmployees = useMemo(() => {
        let filtered = completedPayslips;

        if (selectedDepartment !== 'all') {
            const employeeMap = new Map(allEmployees.map(e => [e.employeeCode, e]));
            filtered = filtered.filter(p => employeeMap.get(p.employeeCode)?.jobDetails?.department === selectedDepartment);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.employeeName.toLowerCase().includes(lower) || p.employeeCode.toLowerCase().includes(lower));
        }
        return filtered;
    }, [completedPayslips, searchTerm, allEmployees, selectedDepartment]);

    const getHeaderButton = () => {
        if (pendingEmployees.length === 0) {
            return <button className="btn-secondary flex items-center gap-2" disabled><CheckCircle size={16} /> All Generated</button>;
        }
        const buttonText = completedPayslips.length > 0 ? `Generate Remaining (${pendingEmployees.length})` : `Generate for All (${pendingEmployees.length})`;
        return <button onClick={handleGenerateAll} className="btn-primary flex items-center gap-2" disabled={processing.size > 0}><Play size={16} /> {buttonText}</button>;
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2">
                        <ArrowLeft size={16} /> Back to Payroll Runs
                    </button>
                    <h2 className="text-2xl font-bold">Process Payroll for {new Date(run.payPeriodStart).toLocaleString('default', { month: 'long' })} {run.year}</h2>
                </div>
                {getHeaderButton()}
            </div>

            <div className="flex justify-between items-center mb-4 border-b border-slate-200">
                <div className="flex">
                    <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>Pending ({pendingEmployees.length})</button>
                    <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>Completed ({completedEmployees.length})</button>
                </div>
                <div className="flex items-center gap-2">
                    <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="input w-48">
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                    <div className="relative">
                        <input type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-64 pr-10" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                {activeTab === 'pending' && (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50"><tr><th className="th-cell">Employee</th><th className="th-cell text-right">Actions</th></tr></thead>
                        <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                            {pendingEmployees.map(emp => (
                                <tr key={emp.employeeCode}>
                                    <td className="td-cell">
                                        <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                                        <div className="text-xs text-slate-500">{emp.employeeCode} ({emp.jobDetails?.department || 'No Dept'})</div>
                                    </td>
                                    <td className="td-cell text-right">
                                        {processing.has(emp.employeeCode) ? (
                                            <button className="btn-secondary py-1 px-3 text-xs w-24 justify-center" disabled><Loader className="animate-spin h-4 w-4" /></button>
                                        ) : (
                                            <button onClick={() => handleGenerateSingle(emp.id, emp.employeeCode)} className="btn-secondary py-1 px-3 text-xs w-24 justify-center">Generate</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeTab === 'completed' && (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50"><tr><th className="th-cell">Employee</th><th className="th-cell">Net Salary</th><th className="th-cell">Status</th></tr></thead>
                        <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                            {completedEmployees.map(p => (
                                <tr key={p.id}>
                                    <td className="td-cell">
                                        <div className="font-medium">{p.employeeName}</div>
                                        <div className="text-xs text-slate-500">{p.employeeCode} ({allEmployees.find(e => e.employeeCode === p.employeeCode)?.jobDetails?.department || 'No Dept'})</div>
                                    </td>
                                    <td className="td-cell font-mono">{p.netSalary}</td>
                                    <td className="td-cell">
                                        <span className="flex items-center gap-2 text-sm capitalize">
                                            {statusIcons[p.status] || statusIcons.PENDING} {p.status.toLowerCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProcessPayrollRun;