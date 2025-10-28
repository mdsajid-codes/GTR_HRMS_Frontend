import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SyncPolicyModal = ({ isOpen, onClose, policy, onSync, entityName = 'policy' }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchEmployees = async () => {
                setSearchTerm('');
                setSelectedEmployees(new Set());
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/employees/all`, { headers: { "Authorization": `Bearer ${token}` } });
                    setEmployees(res.data);
                } catch (err) {
                    console.error("Failed to fetch employees for sync:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchEmployees();
        }
    }, [isOpen]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowercasedFilter = searchTerm.toLowerCase();
        return employees.filter(emp =>
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lowercasedFilter) ||
            emp.employeeCode.toLowerCase().includes(lowercasedFilter));
    }, [employees, searchTerm]);

    const handleSelect = (employeeCode) => {
        setSelectedEmployees(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeCode)) {
                newSet.delete(employeeCode);
            } else {
                newSet.add(employeeCode);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allVisibleCodes = new Set(filteredEmployees.map(emp => emp.employeeCode));
            setSelectedEmployees(allVisibleCodes);
        } else {
            setSelectedEmployees(new Set());
        }
    };

    const areAllSelected = useMemo(() => {
        return filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.has(emp.employeeCode));
    }, [filteredEmployees, selectedEmployees]);

    const handleSync = async () => {
        setIsSyncing(true);
        await onSync(policy, Array.from(selectedEmployees));
        setIsSyncing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <h3 className="text-lg font-semibold p-4 border-b">Sync '{policy?.policyName || policy?.name || 'Item'}'</h3>
                <div className="p-4 border-b relative">
                    <input type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full pl-10" />
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <div className="p-4 overflow-y-auto space-y-2">
                    {loading ? <Loader className="animate-spin mx-auto" /> : <>
                        <label className="flex items-center gap-3 p-2 rounded bg-slate-50 cursor-pointer font-medium">
                            <input type="checkbox" checked={areAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded" />
                            <span>Select All Visible</span>
                        </label>
                        {filteredEmployees.map(emp => (
                            <label key={emp.employeeCode} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                                <input type="checkbox" checked={selectedEmployees.has(emp.employeeCode)} onChange={() => handleSelect(emp.employeeCode)} className="h-4 w-4 rounded" />
                                <span>{emp.firstName} {emp.lastName} ({emp.employeeCode})</span>
                            </label>
                        ))}
                    </>}
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="btn-secondary" disabled={isSyncing}>Cancel</button>
                    <button onClick={handleSync} className="btn-primary flex items-center gap-2" disabled={isSyncing || selectedEmployees.size === 0}>
                        {isSyncing && <Loader className="animate-spin h-4 w-4" />} Sync to Selected ({selectedEmployees.size})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyncPolicyModal;