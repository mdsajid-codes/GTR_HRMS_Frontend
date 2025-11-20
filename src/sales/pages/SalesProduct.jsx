import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PlusCircle, Search, AlertCircle, Loader, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductForm from './ProductForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/sales/products`, {
                headers: authHeaders,
                params: { page: currentPage, size: pageSize }
            });
            setProducts(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            setError('Failed to fetch products.');
        } finally {
            setLoading(false);
        }
    }, [authHeaders, currentPage, pageSize]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddNew = () => { setEditingProduct(null); setIsFormOpen(true); };
    const handleEdit = (product) => { setEditingProduct(product); setIsFormOpen(true); };
    const handleCloseForm = () => { setIsFormOpen(false); setEditingProduct(null); };

    const handleSave = async (productData) => {
        setFormLoading(true);
        const isEditing = !!editingProduct;
        const url = isEditing ? `${API_URL}/sales/products/${editingProduct.id}` : `${API_URL}/sales/products`;
        const method = isEditing ? 'put' : 'post';

        try {
            await axios[method](url, productData, { headers: authHeaders });
            await fetchProducts();
            handleCloseForm();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save product.'}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/sales/products/${id}`, { headers: authHeaders });
                await fetchProducts();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete product.'}`);
            }
        }
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    if (isFormOpen) {
        return <ProductForm onSave={handleSave} onCancel={handleCloseForm} loading={formLoading} product={editingProduct} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Products</h1>
                <div className="flex items-center gap-2">
                    <div className="relative"><input type="text" placeholder="Search by SKU or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
                    <button onClick={handleAddNew} className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> New Product</button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-background-muted">
                            <tr>
                                <th className="th-cell w-12">#</th><th className="th-cell">SKU</th><th className="th-cell">Name</th><th className="th-cell">Category</th><th className="th-cell">Unit Price</th><th className="th-cell">Status</th><th className="th-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground-muted">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-16"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No Products Found</h3><p className="mt-1 text-sm">Get started by creating a new product.</p></td></tr>
                            ) : (filteredProducts.map((p, index) => (
                                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-background-muted">
                                    <td className="td-cell">{currentPage * pageSize + index + 1}</td>
                                    <td className="td-cell font-mono text-xs">{p.sku}</td>
                                    <td className="td-cell font-medium text-foreground">{p.name}</td>
                                    <td className="td-cell">{p.categoryName || 'N/A'}</td>
                                    <td className="td-cell font-mono">{p.unitPrice?.toFixed(2)}</td>
                                    <td className="td-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status?.toLowerCase() || 'N/A'}</span></td>
                                    <td className="td-cell"><div className="flex items-center gap-2"><button onClick={() => handleEdit(p)} className="p-1.5 hover:text-primary"><Edit size={16} /></button><button onClick={() => handleDelete(p.id)} className="p-1.5 hover:text-red-500"><Trash2 size={16} /></button></div></td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-foreground-muted">Rows per page:</span>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} className="input-sm bg-background-muted">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <p className="text-foreground-muted">Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="btn-secondary p-2 disabled:opacity-50"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} className="btn-secondary p-2 disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
};

export default SalesProduct;