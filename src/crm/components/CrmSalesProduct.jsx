import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Outlet } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import CrmSalesProductForm from './CrmSalesProductForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmSalesProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const isFormOpen = location.pathname.includes('/crm-products/new') || location.pathname.includes('/crm-products/edit');

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                size: pageSize,
                search: searchTerm,
            });
            const response = await axios.get(`${API_URL}/crm/sales-products?${params.toString()}`, authHeaders);
            setProducts(response.data.content || []);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, authHeaders]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search
        return () => clearTimeout(handler);
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/crm/sales-products/${id}`, authHeaders);
                fetchProducts(); // Refresh the list
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete product.'}`);
            }
        }
    };

    const handleFormClose = (needsRefresh) => {
        navigate('/crm-products');
        if (needsRefresh) {
            fetchProducts();
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        // The backend controller serves images from /api/crm/sales-products/images/**
        return `${API_URL}/crm/sales-products/images/${path}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <header className="bg-white shadow-sm p-4 border-b border-slate-200">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">CRM Products</h1>
                            <p className="text-sm text-slate-500">Manage your sales products and services.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/crm-products/new')} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </button>
                </div>
            </header>

            <div className="flex-grow p-4 sm:p-6 flex flex-col">
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or item code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}

                <main className="flex-grow overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                    ) : products.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Image</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Item Code</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Sales Price</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {product.imageUrl ? (
                                                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400"><ImageOff size={20} /></div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4">{product.itemCode}</td>
                                            <td className="px-6 py-4">{product.itemType}</td>
                                            <td className="px-6 py-4">₹{product.salesPrice}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => navigate(`/crm-products/edit/${product.id}`)} className="p-2 rounded-md hover:bg-gray-100"><Edit className="h-4 w-4 text-gray-600" /></button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 rounded-md hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-500" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16"><h3 className="text-lg font-semibold">No Products Found</h3></div>
                    )}
                </main>

                {!loading && totalPages > 1 && (
                    <footer className="flex justify-between items-center pt-4 mt-4 border-t">
                        <span className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 rounded-md border disabled:opacity-50">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-2 rounded-md border disabled:opacity-50">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </footer>
                )}
            </div>

            {/* Sidebar Form Outlet */}
            <Routes>
                <Route path="new" element={<CrmSalesProductForm onFormClose={handleFormClose} />} />
                <Route path="edit/:id" element={<CrmSalesProductForm onFormClose={handleFormClose} />} />
            </Routes>
            
        </div>
    );
};

export default CrmSalesProduct;
