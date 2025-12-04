
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Eye, User, Monitor } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusColor = (status) => {
    switch (status) {
        case 'DRAFT': return 'text-gray-600';
        case 'SENT': return 'text-blue-600';
        case 'ACCEPTED': return 'text-green-600';
        case 'REJECTED': return 'text-red-600';
        case 'INVOICED': return 'text-purple-600';
        default: return 'text-gray-600';
    }
};

const Quotation = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        customerName: '',
        fromDate: '',
        toDate: '',
        type: 'All',
        status: 'All',
        teamMember: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/employees/all`, authHeaders);
            setEmployees(response.data || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    }, [authHeaders]);

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                search: filters.customerName, // Using customer name as general search for now
                // Add other filter params if backend supports them
                // fromDate: filters.fromDate,
                // toDate: filters.toDate,
                // status: filters.status !== 'All' ? filters.status : null,
                // salespersonId: filters.teamMember
            };
            const response = await axios.get(`${API_URL}/sales/quotations`, { params, ...authHeaders });
            let fetchedQuotations = response.data.content || [];

            // Extract unique customer IDs
            const customerIds = [...new Set(fetchedQuotations.map(q => q.customerId).filter(id => id))];

            // Fetch party details for each customer ID
            if (customerIds.length > 0) {
                const partyPromises = customerIds.map(id =>
                    axios.get(`${API_URL}/parties/${id}`, authHeaders)
                        .then(res => ({ id, data: res.data }))
                        .catch(err => ({ id, data: null }))
                );

                const parties = await Promise.all(partyPromises);
                const partyMap = parties.reduce((acc, curr) => {
                    if (curr.data) acc[curr.id] = curr.data;
                    return acc;
                }, {});

                // Merge party details into quotations
                fetchedQuotations = fetchedQuotations.map(q => ({
                    ...q,
                    customerParty: partyMap[q.customerId] || q.customerParty // Fallback to existing if fetch fails or not found
                }));
            }

            setQuotations(fetchedQuotations);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch quotations. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchQuotations();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchQuotations]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0); // Reset to first page on filter change
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this quotation?')) {
            try {
                await axios.delete(`${API_URL}/sales/quotations/${id}`, authHeaders);
                fetchQuotations();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete quotation.'}`);
            }
        }
    };

    const handleView = (id) => {
        navigate(`/sales/quotations/${id}`);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-[#0099cc] p-4 flex justify-between items-center text-white">
                <h1 className="text-xl font-semibold">Manage Quotation</h1>
                <div className="text-sm">Home &gt; Sales &gt; Manage Quotation</div>
            </div>

            <div className="p-4 space-y-4">
                {/* Filters */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                            <input type="text" name="customerName" value={filters.customerName} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                            <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                                <option value="All">All</option>
                                <option value="WITH_DISCOUNT">With Discount</option>
                                <option value="WITHOUT_DISCOUNT">Without Discount</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quotation Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                                <option value="All">All</option>
                                <option value="DRAFT">Draft</option>
                                <option value="SENT">Sent</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Team Members</label>
                            <select name="teamMember" value={filters.teamMember} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                                <option value="">Select Team Member</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button onClick={fetchQuotations} className="bg-[#0099cc] text-white px-4 py-1.5 rounded text-sm hover:bg-[#0088b5]">Search</button>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => navigate('/sales/quotations/new')} className="bg-[#0099cc] text-white px-4 py-1.5 rounded text-sm hover:bg-[#0088b5] flex items-center gap-1">
                                <Plus size={14} /> New Quotation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-2 border-b flex justify-between items-center">
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-xs">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <span className="text-xs text-gray-500">records per page</span>
                        <div className="flex-grow"></div>
                        <input type="text" placeholder="Search..." className="border border-gray-300 rounded px-2 py-1 text-xs w-48" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-3 border-r">S.No.</th>
                                    <th className="px-4 py-3 border-r">Date</th>
                                    <th className="px-4 py-3 border-r">Quotation Status</th>
                                    <th className="px-4 py-3 border-r">Follow Up</th>
                                    <th className="px-4 py-3 border-r">Next Followup Date</th>
                                    <th className="px-4 py-3 border-r">Quotation#</th>
                                    <th className="px-4 py-3 border-r">Company Name</th>
                                    <th className="px-4 py-3 border-r">Customer Name</th>
                                    <th className="px-4 py-3 border-r">Contact Person Name</th>
                                    <th className="px-4 py-3 border-r">Contact Person Number</th>
                                    <th className="px-4 py-3 border-r">Status</th>
                                    <th className="px-4 py-3 border-r">Amount</th>
                                    <th className="px-4 py-3">Operation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="13" className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="13" className="text-center py-10 text-red-500">{error}</td></tr>
                                ) : quotations.length === 0 ? (
                                    <tr><td colSpan="13" className="text-center py-10 font-medium text-gray-500">No data available in table</td></tr>
                                ) : (
                                    quotations.map((q, index) => (
                                        <tr key={q.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 border-r">{currentPage * pageSize + index + 1}</td>
                                            <td className="px-4 py-2 border-r">{new Date(q.quotationDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 border-r"></td> {/* Quotation Status (Internal?) */}
                                            <td className="px-4 py-2 border-r space-y-1">
                                                <button className="flex items-center gap-1 bg-[#5cb85c] text-white px-2 py-0.5 rounded text-[10px] w-full justify-center"><User size={10} /> Follow Up</button>
                                                <button className="flex items-center gap-1 bg-[#0099cc] text-white px-2 py-0.5 rounded text-[10px] w-full justify-center"><Monitor size={10} /> View History</button>
                                            </td>
                                            <td className="px-4 py-2 border-r"></td> {/* Next Followup Date */}
                                            <td className="px-4 py-2 border-r text-[#0099cc] cursor-pointer hover:underline" onClick={() => handleView(q.id)}>{q.quotationNumber}</td>
                                            <td className="px-4 py-2 border-r">{q.customerParty?.companyName || 'N/A'}</td>
                                            <td className="px-4 py-2 border-r">{q.customerParty?.primaryContactPerson || q.customerName || 'N/A'}</td>
                                            <td className="px-4 py-2 border-r">{q.customerParty?.primaryContactPerson || 'N/A'}</td>
                                            <td className="px-4 py-2 border-r">
                                                <div>{q.customerParty?.mobile}</div>
                                                <div>{q.customerParty?.contactPhone}</div>
                                            </td>
                                            <td className="px-4 py-2 border-r font-medium">
                                                <span className={getStatusColor(q.status)}>{q.status}</span>
                                            </td>
                                            <td className="px-4 py-2 border-r">AED {q.netTotal.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-2 flex gap-1">
                                                <button onClick={() => navigate(`/sales/quotations/edit/${q.id}`)} className="p-1.5 bg-[#0099cc] text-white rounded hover:bg-[#0088b5]"><Edit size={12} /></button>
                                                <button onClick={() => handleDelete(q.id)} className="p-1.5 bg-[#d9534f] text-white rounded hover:bg-[#c9302c]"><Trash2 size={12} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="p-2 border-t flex justify-between items-center text-xs">
                            <div className="text-gray-600">Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, quotations.length + currentPage * pageSize)} of {quotations.length} entries</div> {/* Note: Total count logic needs backend support for exact total elements */}
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Previous</button>
                                <span className="px-2 py-1 bg-[#0099cc] text-white rounded">{currentPage + 1}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quotation;

