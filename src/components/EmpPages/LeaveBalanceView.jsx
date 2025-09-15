import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, TrendingUp, TrendingDown, Hourglass } from 'lucide-react';

const BalanceCard = ({ title, balance }) => {
    const { available = 0, pending = 0, used = 0, totalAllocated = 0 } = balance || {};

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title.replace('_', ' ')}</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span>Available</span>
                    </div>
                    <p className="font-bold text-slate-800">{available} <span className="text-sm font-normal text-slate-500">days</span></p>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Hourglass className="h-5 w-5 text-yellow-500" />
                        <span>Pending Approval</span>
                    </div>
                    <p className="font-bold text-slate-800">{pending} <span className="text-sm font-normal text-slate-500">days</span></p>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <span>Used</span>
                    </div>
                    <p className="font-bold text-slate-800">{used} <span className="text-sm font-normal text-slate-500">days</span></p>
                </div>
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center">
                    <p className="font-semibold text-slate-600">Total Allotted</p>
                    <p className="font-bold text-lg text-blue-600">{totalAllocated} <span className="text-sm font-normal text-slate-500">days</span></p>
                </div>
            </div>
        </div>
    );
};


const LeaveBalanceView = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const employeeCode = localStorage.getItem('employeeCode');

    useEffect(() => {
        const fetchBalances = async () => {
            if (!employeeCode) {
                setError("Employee code not found. Cannot fetch leave balances.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                // NOTE: This assumes an endpoint exists at `/api/leave-balances/employee/{employeeCode}`
                // that returns a list of leave balance objects.
                const response = await axios.get(`${API_URL}/leave-balances/employee/${employeeCode}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setBalances(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('No leave balance records found for this employee.');
                } else {
                    setError('Failed to fetch leave balances. Please try again later.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();
    }, [API_URL, employeeCode]);

    if (loading) return <div className="p-8 flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-600"><AlertCircle className="mx-auto h-12 w-12 text-red-400" /><h3 className="mt-2 text-lg font-medium">Error</h3><p className="mt-1 text-sm">{error}</p></div>;

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">My Leave Balances</h1>
            {balances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {balances.map(balance => (
                        <BalanceCard key={balance.id} title={balance.leaveType.leaveType} balance={balance} />
                    ))}
                </div>
            ) : (
                 <div className="text-center text-slate-500 py-10 bg-white rounded-xl shadow-sm">
                    <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">No Leave Balances Found</h3>
                    <p className="mt-1 text-sm text-slate-500">Your leave balances will appear here once they are configured by HR.</p>
                </div>
            )}
        </div>
    );
};

export default LeaveBalanceView;