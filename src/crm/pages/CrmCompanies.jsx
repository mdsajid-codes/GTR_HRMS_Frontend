import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, Building, ArrowLeft, Eye, Download, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CrmCompanyForm from '../components/CrmCompanyForm';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Reusable Modal for Viewing Details
const CompanyDetailsModal = ({ isOpen, onClose, company, companies, selectData }) => {
    if (!isOpen || !company) return null;

    const findNameById = (id, list) => list.find(item => item.id === id)?.name || 'N/A';

    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">Company Details: {company.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <DetailItem label="Company Name" value={company.name} />
                    <DetailItem label="Company Owner" value={company.companyOwner} />
                    <DetailItem label="Phone" value={company.phone} />
                    <DetailItem label="Email" value={company.email} />
                    <DetailItem label="Website" value={company.website} />
                    <DetailItem label="Parent Company" value={findNameById(company.parentCompanyId, companies)} />
                    <DetailItem label="Industry" value={findNameById(company.industryId, selectData.industries)} />
                    <DetailItem label="Company Type" value={findNameById(company.companyTypeId, selectData.companyTypes)} />
                    <DetailItem label="Location" value={findNameById(company.locationId, selectData.locations)} />

                    <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <h4 className="font-semibold text-foreground mb-3">Billing Address</h4>
                                <div className="space-y-3 text-sm">
                                    <p>{company.billingStreet}</p>
                                    <p>{company.billingCity}, {company.billingState} {company.billingZip}</p>
                                    <p>{company.billingCountry}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground mb-3">Shipping Address</h4>
                                <div className="space-y-3 text-sm">
                                    <p>{company.shippingStreet}</p>
                                    <p>{company.shippingCity}, {company.shippingState} {company.shippingZip}</p>
                                    <p>{company.shippingCountry}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-background-muted border-t flex justify-end">
                    <button onClick={onClose} className="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const CrmCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [selectData, setSelectData] = useState({ companyTypes: [], industries: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);

    const authHeaders = useMemo(() => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` }), []);

    const fetchData = useCallback(async () => {
        if (!loading) setLoading(true);
        setError('');
        try {
            const [companiesRes, typesRes, industriesRes, locationsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/companies`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/company-types`, { headers: authHeaders }),
                axios.get(`${API_URL}/settings/industries`, { headers: authHeaders }),
                axios.get(`${API_URL}/locations`, { headers: authHeaders }),
            ]);
            setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
            setSelectData({
                companyTypes: Array.isArray(typesRes.data) ? typesRes.data : [],
                industries: Array.isArray(industriesRes.data) ? industriesRes.data : [],
                locations: Array.isArray(locationsRes.data) ? locationsRes.data : [],
            });
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleViewDetails = (item) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingItem(null);
    };

    const handleSave = async (itemData) => {
        setModalLoading(true);
        const payload = { ...itemData };
        // Ensure empty strings for optional IDs are sent as null
        ['locationId', 'companyTypeId', 'industryId', 'parentCompanyId'].forEach(key => {
            if (payload[key] === '') payload[key] = null;
        });

        const isUpdating = Boolean(payload.id);
        const url = isUpdating ? `${API_URL}/crm/companies/${payload.id}` : `${API_URL}/crm/companies`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: authHeaders });
            await fetchData();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save company.'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this company? This may affect associated leads and contacts.')) {
            try {
                await axios.delete(`${API_URL}/crm/companies/${id}`, { headers: authHeaders });
                await fetchData();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete company.'}`);
            }
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/crm/companies/bulk-template`, {
                headers: authHeaders,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'crm_companies_bulk_upload_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download template.');
            console.error(err);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/crm/companies/bulk`, formData, { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' } });
            alert('Companies imported successfully!');
            fetchData();
        } catch (err) {
            const errors = err.response?.data;
            const errorMessage = Array.isArray(errors) ? `Upload failed with the following errors:\n- ${errors.join('\n- ')}` : (errors || 'An unknown error occurred.');
            setUploadError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsUploading(false);
            event.target.value = null; // Reset file input
        }
    };

    const filteredData = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return companies;
        return companies.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.email?.toLowerCase().includes(q) ||
            item.companyOwner?.toLowerCase().includes(q)
        );
    }, [companies, searchTerm]);

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-2xl font-bold text-foreground">Companies</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                    <button onClick={handleDownloadTemplate} className="btn-secondary flex items-center gap-2" title="Download bulk upload template">
                        <Download size={16} />
                        <span className="hidden sm:inline">Template</span>
                    </button>
                    <button onClick={() => fileInputRef.current.click()} className="btn-secondary flex items-center gap-2" disabled={isUploading}>
                        {isUploading ? <Loader className="animate-spin h-4 w-4" /> : <Upload size={16} />}
                        <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Bulk Upload'}</span>
                    </button>
                    <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                        <PlusCircle size={16} /> Add Company
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {uploadError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 whitespace-pre-wrap" role="alert">{uploadError}</div>}

            <div className="flex-grow overflow-auto">
                <table className="min-w-full border-collapse border border-border">
                    <thead className="bg-background-muted sticky top-0">
                        <tr>
                            <th className="th-cell border border-border">Name</th>
                            <th className="th-cell border border-border">Owner</th>
                            <th className="th-cell border border-border">Phone</th>
                            <th className="th-cell border border-border">Email</th>
                            <th className="th-cell border border-border">Industry</th>
                            <th className="th-cell border border-border w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors border-t border-border">
                                    <td className="td-cell border border-border font-medium text-foreground">{item.name}</td>
                                    <td className="td-cell border border-border">{item.companyOwner || 'N/A'}</td>
                                    <td className="td-cell border border-border">{item.phone || 'N/A'}</td>
                                    <td className="td-cell border border-border">{item.email || 'N/A'}</td>
                                    <td className="td-cell border border-border">{item.industryName || 'N/A'}</td>
                                    <td className="td-cell border border-border">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleViewDetails(item)} className="text-sky-500 hover:text-sky-600" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10">
                                    <Building className="mx-auto h-12 w-12 text-foreground-muted/50" />
                                    <h3 className="mt-2 text-sm font-medium text-foreground">No companies found</h3>
                                    <p className="mt-1 text-sm">Get started by adding a new company.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Side Panel for Add/Edit */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-60 z-40"
                            onClick={handleCloseModal}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-3xl bg-card shadow-2xl z-50 flex flex-col"
                        >
                            <CrmCompanyForm
                                item={editingItem}
                                onSave={handleSave}
                                onCancel={handleCloseModal}
                                loading={modalLoading}
                                companies={companies}
                                companyTypes={selectData.companyTypes}
                                industries={selectData.industries}
                                locations={selectData.locations}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <CompanyDetailsModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} company={viewingItem} companies={companies} selectData={selectData} />
        </div>
    );
};

export default CrmCompanies;