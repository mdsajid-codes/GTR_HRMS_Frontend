import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, ChevronLeft, ChevronRight, Eye, List, Lock, Unlock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ManageSemiFinishedBOMForm from './ManageSemiFinishedBOMForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ManageSemiFinishedBOM = ({ locationId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, size: pageSize, search: searchTerm };
            // Note: Backend doesn't seem to support locationId filtering on BOMs directly, filtering happens via item.
            // This fetch will get all BOMs.
            const response = await axios.get(`${API_URL}/production/bom-semi-finished`, { headers: authHeaders, params });
            let fetchedItems = response.data.content || [];
            if (locationId && locationId !== 'all') {
                fetchedItems = fetchedItems.filter(bom => bom.item?.locationId === Number(locationId));
            }
            setItems(fetchedItems);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            setError('Failed to fetch data. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [authHeaders, currentPage, pageSize, locationId, searchTerm]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => { setEditingItem(null); setIsFormOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsFormOpen(true); };
    const handleCloseForm = () => { setIsFormOpen(false); setEditingItem(null); };
    const handleView = (item) => { setViewingItem(item); };

    const handleSave = async (itemData) => {
        setFormLoading(true);
        const isUpdating = Boolean(editingItem?.id);
        const url = isUpdating ? `${API_URL}/production/bom-semi-finished/${editingItem.id}` : `${API_URL}/production/bom-semi-finished`;
        const method = isUpdating ? 'put' : 'post';
        try {
            await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            handleCloseForm();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save BOM.'}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this BOM?')) {
            try {
                await axios.delete(`${API_URL}/production/bom-semi-finished/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete BOM.'}`);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Bill of Materials (BOM)</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" /></div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add BOM</button>
                </div>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border border-collapse">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell w-12">#</th>
                            <th className="th-cell">Product Name</th>
                            <th className="th-cell">BOM Name</th>
                            <th className="th-cell">Locked</th>
                            <th className="th-cell w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : items.length > 0 ? (
                            items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="td-cell text-center">{currentPage * pageSize + index + 1}</td>
                                    <td className="td-cell font-medium text-foreground">{item.item?.name}</td>
                                    <td className="td-cell">{item.bomName}</td>
                                    <td className="td-cell">{item.isLocked ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-green-500" />}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleView(item)} className="text-blue-500 hover:text-blue-600" title="View"><Eye size={16} /></button>
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No BOMs Found</h3><p className="mt-1 text-sm">Get started by creating a new Bill of Materials.</p></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm">
                <p className="text-foreground-muted">Page {currentPage + 1} of {totalPages}</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="btn-secondary disabled:opacity-50"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} className="btn-secondary disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseForm} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-3xl bg-card shadow-2xl z-50 flex flex-col">
                            <ManageSemiFinishedBOMForm item={editingItem} onSave={handleSave} onCancel={handleCloseForm} loading={formLoading} locationId={locationId} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Viewing Modal can be added here if needed */}

        </div>
    );
};

export default ManageSemiFinishedBOM;