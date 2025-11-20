import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Loader2, Search, X, Building, User, Mail, Phone, ChevronLeft, ChevronRight, HelpCircle, Download, LayoutGrid, List, Eye, MapPin, Hash, Briefcase, Banknote, Users, FileText, ChevronDown, Landmark, CreditCard, Truck, CircleDollarSign, Code, Percent, Share2, Globe, CalendarDays, BookUser, Info, MessageSquare, Link as LinkIcon, TrendingUp, UserCheck, ShieldCheck, Upload, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const INITIAL_PARTY_STATE = {
    companyName: '',
    primaryContactPerson: '',
    contactEmail: '',
    contactPhone: '',
    partyType: 'CUSTOMER', // Default as per backend
};

const PartyCard = ({ party, onEdit, onDelete, onView }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1">
        <div>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-500" />
                    {party.companyName}
                </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-400" /> {party.primaryContactPerson || 'N/A'}</p>
                <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" /> {party.contactEmail || 'N/A'}</p>
                <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> {party.contactPhone || 'N/A'}</p>
            </div>
        </div>
        <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => onView(party)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Eye className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(party)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Edit className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(party.id)} className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    </div>
);

const ToggleSection = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <div className="flex items-center">
                    {icon}
                    <span className="font-semibold ml-3">{title}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 bg-gray-50 dark:bg-gray-900">{children}</div>}
        </div>
    );
};

const PartyViewModal = ({ party, onClose, onEdit, onDelete, isLoadingDetails }) => {
    if (!party) return null;

    const DetailItem = ({ icon, label, value }) => (
        <div className="flex items-start text-sm mb-3">
            <div className="text-gray-400 mr-3 mt-0.5">{icon}</div>
            <div className="flex-1">
                <p className="text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{value || 'N/A'}</p>
            </div>
        </div>
    );

    const formatFullName = (p) => {
        const parts = [p.primaryContactTitle, p.primaryFirstName, p.primaryLastName].filter(Boolean);
        if (parts.length > 0) {
            return parts.join(' ');
        }
        return p.primaryContactPerson || 'N/A';
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        if (typeof address !== 'object') return address; // It might already be a string

        const parts = [
            address.addressLine,
            address.city,
            address.state,
            address.zipCode,
            address.country
        ].filter(Boolean); // Filter out empty or null values

        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <Building className="w-6 h-6 mr-3 text-blue-500" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{party.companyName}</h2>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${party.partyType === 'CUSTOMER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{party.partyType}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(party)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                            <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => onDelete(party.id)} className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 focus:outline-none">
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="overflow-y-auto">
                    {isLoadingDetails ? <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div> : <>
                    <ToggleSection title="Primary Information" icon={<Info className="w-5 h-5" />} defaultOpen={true}>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                            <DetailItem icon={<UserCheck className="w-4 h-4" />} label="Primary Contact" value={formatFullName(party)} />
                            <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={party.contactEmail} />
                            <DetailItem icon={<Phone className="w-4 h-4" />} label="Contact Phone" value={party.contactPhone} />
                            <DetailItem icon={<Phone className="w-4 h-4" />} label="Mobile" value={party.mobile} />
                            <DetailItem icon={<Briefcase className="w-4 h-4" />} label="Designation" value={party.designation} />
                            <DetailItem icon={<Users className="w-4 h-4" />} label="Department" value={party.department} />
                            <DetailItem icon={<Hash className="w-4 h-4" />} label="Customer Code" value={party.customerCode} />
                            <DetailItem icon={<Hash className="w-4 h-4" />} label="Vendor/Customer Code" value={party.vendorCustomerCode} />
                            <DetailItem icon={<Globe className="w-4 h-4" />} label="Website" value={party.website} />
                            <DetailItem icon={<User className="w-4 h-4" />} label="Owner/CEO Name" value={party.ownerCeoName} />
                            <DetailItem icon={<Phone className="w-4 h-4" />} label="Owner/CEO Contact" value={party.ownerCeoContact} />
                            <DetailItem icon={<Mail className="w-4 h-4" />} label="Owner/CEO Email" value={party.ownerCeoEmail} />
                            <DetailItem icon={<MapPin className="w-4 h-4" />} label="City" value={party.city} />
                            <DetailItem icon={<MapPin className="w-4 h-4" />} label="Region" value={party.region} />
                            <DetailItem icon={<Briefcase className="w-4 h-4" />} label="Status" value={
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${party.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {party.active ? 'Active' : 'Inactive'}
                                </span>
                            } />
                        </div>
                    </ToggleSection>

                    <ToggleSection title="Address Details" icon={<MapPin className="w-5 h-5" />}>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Billing Address</h4>
                                <p className="text-gray-600 dark:text-gray-300">{formatAddress(party.billingAddress)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Shipping Address</h4>
                                <p className="text-gray-600 dark:text-gray-300">{party.shippingSameAsBilling ? 'Same as Billing Address' : formatAddress(party.shippingAddress)}</p>
                            </div>
                        </div>
                    </ToggleSection>

                    <ToggleSection title="Tax & Financials" icon={<Percent className="w-5 h-5" />}>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                            <DetailItem icon={<CreditCard className="w-4 h-4" />} label="PAN Number" value={party.panNumber} />
                            <DetailItem icon={<CreditCard className="w-4 h-4" />} label="TAN Number" value={party.tanNumber} />
                            <DetailItem icon={<CreditCard className="w-4 h-4" />} label="CIN Number" value={party.cinNo} />
                            <DetailItem icon={<ShieldCheck className="w-4 h-4" />} label="VAT Treatment" value={party.vatTreatment} />
                            <DetailItem icon={<Hash className="w-4 h-4" />} label="VAT Number" value={party.vatNumber} />
                            <DetailItem icon={<Hash className="w-4 h-4" />} label="VAT TRN Number" value={party.vatTrnNumber} />
                            <DetailItem icon={<CircleDollarSign className="w-4 h-4" />} label="Opening Balance" value={`${party.openingBalanceType || ''} ${party.openingBalance ? `₹${party.openingBalance}` : 'N/A'}`} />
                            <DetailItem icon={<CircleDollarSign className="w-4 h-4" />} label="Credit Limit" value={party.creditLimitAllowed ? `₹${party.creditLimitAllowed}` : 'N/A'} />
                            <DetailItem icon={<CalendarDays className="w-4 h-4" />} label="Credit Period" value={party.creditPeriodAllowed ? `${party.creditPeriodAllowed} days` : 'N/A'} />
                            <DetailItem icon={<TrendingUp className="w-4 h-4" />} label="Sales (Prev. Year)" value={party.salesValuePreviousYear ? `₹${party.salesValuePreviousYear}` : 'N/A'} />
                            <DetailItem icon={<CircleDollarSign className="w-4 h-4" />} label="Currency" value={party.currency} />
                            <DetailItem icon={<Briefcase className="w-4 h-4" />} label="Price Category" value={party.priceCategory} />
                        </div>
                    </ToggleSection>

                    <ToggleSection title="Terms & Delivery" icon={<Truck className="w-5 h-5" />}>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            <DetailItem icon={<FileText className="w-4 h-4" />} label="Mode of Payment" value={party.modeOfPayment} />
                            <DetailItem icon={<FileText className="w-4 h-4" />} label="Payment Terms" value={party.paymentTerms} />
                            <DetailItem icon={<Truck className="w-4 h-4" />} label="Delivery Type" value={party.deliveryType} />
                            <DetailItem icon={<Truck className="w-4 h-4" />} label="Dispatch Through" value={party.transportDispatchThrough} />
                            <DetailItem icon={<Truck className="w-4 h-4" />} label="Freight Terms" value={party.freightTerms} />
                            <div className="md:col-span-2 lg:col-span-3"><DetailItem icon={<FileText className="w-4 h-4" />} label="Internal T&C" value={party.termsAndConditionsInternal} /></div>
                            <div className="md:col-span-2 lg:col-span-3"><DetailItem icon={<FileText className="w-4 h-4" />} label="Display T&C" value={party.termsAndConditionsDisplay} /></div>
                            <div className="md:col-span-2 lg:col-span-3"><DetailItem icon={<MessageSquare className="w-4 h-4" />} label="Special Instructions" value={party.splInstruction} /></div>
                        </div>
                    </ToggleSection>

                    <ToggleSection title="Bank Details" icon={<Banknote className="w-5 h-5" />}>
                        {party.bankDetails && party.bankDetails.length > 0 ? (
                            <div className="space-y-4">
                                {party.bankDetails.map((bank, index) => (
                                    <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <DetailItem icon={<Landmark className="w-4 h-4" />} label="Bank Name" value={bank.bankName} />
                                        <DetailItem icon={<Hash className="w-4 h-4" />} label="Account Number" value={bank.accountNumber} />
                                        <DetailItem icon={<Code className="w-4 h-4" />} label="IFSC Code" value={bank.ifsCode} />
                                        <DetailItem icon={<Code className="w-4 h-4" />} label="IBAN Code" value={bank.ibanCode} />
                                        <DetailItem icon={<Hash className="w-4 h-4" />} label="Corporate ID" value={bank.corporateId} />
                                        <DetailItem icon={<MapPin className="w-4 h-4" />} label="Branch" value={bank.locationBranch} />
                                        <DetailItem icon={<Mail className="w-4 h-4" />} label="Beneficiary Email" value={bank.beneficiaryMailId} />
                                        <div className="sm:col-span-2 lg:col-span-4"><DetailItem icon={<MapPin className="w-4 h-4" />} label="Branch Address" value={bank.branchAddress} /></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bank details are not available for this party.</p>
                        )}
                    </ToggleSection>

                    <ToggleSection title="Other Person Details" icon={<BookUser className="w-5 h-5" />}>
                        {party.otherPersons && party.otherPersons.length > 0 ? (
                             <div className="space-y-4">
                                {party.otherPersons.map((person, index) => (
                                    <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <DetailItem icon={<User className="w-4 h-4" />} label="Name" value={[person.salutation, person.firstName, person.lastName].filter(Boolean).join(' ')} />
                                        <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={person.emailAddress} />
                                        <DetailItem icon={<Phone className="w-4 h-4" />} label="Work Phone" value={person.workPhone} />
                                        <DetailItem icon={<Phone className="w-4 h-4" />} label="Mobile" value={person.mobile} />
                                        <DetailItem icon={<Briefcase className="w-4 h-4" />} label="Designation" value={person.designation} />
                                        <DetailItem icon={<Users className="w-4 h-4" />} label="Department" value={person.department} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No other person details found.</p>
                        )}
                    </ToggleSection>

                    <ToggleSection title="Custom & Social Fields" icon={<Share2 className="w-5 h-5" />}>
                        {party.customFields && party.customFields.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {party.customFields.map((field, index) => (
                                    <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{field.fieldName}</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{field.fieldValue}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 px-4 pt-4">No custom fields defined.</p>
                        )}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                           <DetailItem icon={<LinkIcon className="w-4 h-4" />} label="Facebook" value={party.facebook} />
                           <DetailItem icon={<LinkIcon className="w-4 h-4" />} label="Twitter" value={party.twitter} />
                           <div className="md:col-span-2"><DetailItem icon={<MessageSquare className="w-4 h-4" />} label="Remarks" value={party.remarks} /></div>
                        </div>
                    </ToggleSection>
                    </>}
                </main>
            </div>
        </div>
    );
};

const PartyType = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
    const [viewingParty, setViewingParty] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importErrors, setImportErrors] = useState([]);
    const [importSuccess, setImportSuccess] = useState('');
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [partyTypeFilter, setPartyTypeFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(0); // page index, starts at 0
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const fileInputRef = useRef(null);


    const navigate = useNavigate();
    const partyTypes = ['ALL', 'CUSTOMER', 'SUPPLIER'];

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const fetchParties = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage,
                size: pageSize,
            });
            if (partyTypeFilter !== 'ALL') {
                params.append('type', partyTypeFilter);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await axios.get(`${API_URL}/parties?${params.toString()}`, getAuthHeaders());
            setParties(response.data.content || []);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch parties. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParties();
    }, [currentPage, pageSize, partyTypeFilter, searchTerm]);

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(0);
    }, [partyTypeFilter, searchTerm]);

    const handleEdit = (party) => {
        navigate(`/company-settings/party-type/edit/${party.id}`);
    };
    
    const handleView = async (party) => {
        try {
            // Show modal immediately with basic data
            setViewingParty(party); 
            setIsLoadingDetails(true);
            
            // Fetch full details from the single party endpoint (e.g., /parties/{id})
            const response = await axios.get(`${API_URL}/parties/${party.id}`, getAuthHeaders());
            
            // Update the modal with the complete data
            setViewingParty(response.data);
        }catch (err) {
            setError('Failed to fetch party details. Please try again.');
            console.error(err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/parties/bulk-template`, {
                ...getAuthHeaders(),
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'party_bulk_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download template.');
            console.error(err);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${API_URL}/parties/export`, {
                ...getAuthHeaders(),
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'parties_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to export parties.');
            console.error(err);
        }
    };

    const handleImportFile = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImporting(true);
        setImportErrors([]);
        setImportSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/parties/bulk-import`, formData, getAuthHeaders());
            setImportSuccess('Parties imported successfully! The list will now refresh.');
            fetchParties(); // Refresh the list
        } catch (err) {
            setImportErrors(err.response?.data || ['An unknown error occurred during import.']);
        } finally {
            setIsImporting(false);
            fileInputRef.current.value = null; // Reset file input
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this party?')) {
            try {
                await axios.delete(`${API_URL}/parties/${id}`, getAuthHeaders());
                // Refetch data to ensure consistency
                setViewingParty(null); // Close modal if open
                fetchParties();
            } catch (err) {
                setError('Failed to delete party. Please try again.');
                console.error(err);
            }
        }
    };

    const handleDownloadSampleCsv = () => {
        const headers = "companyName,partyType,primaryContactPerson";
        const exampleRow = "Innovate Inc.,CUSTOMER,Jane Doe";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sample_customer_import.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Parties</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove customer and vendor information.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".xlsx, .xls" />
                        <button onClick={() => fileInputRef.current.click()} disabled={isImporting} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Import
                        </button>
                        <button onClick={handleDownloadTemplate} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Download className="mr-2 h-4 w-4" />
                            Template
                        </button>
                        <button onClick={handleExport} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export
                        </button>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}><List className="h-5 w-5" /></button>
                        <button onClick={() => setViewMode('card')} className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}><LayoutGrid className="h-5 w-5" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsImportGuideOpen(true)} className="p-2 text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <HelpCircle className="h-5 w-5" />
                            <span className="sr-only">Import Guide</span>
                        </button>
                        <button onClick={() => navigate('/company-settings/party-type/new')} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Add Party
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by company name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <select
                    value={partyTypeFilter}
                    onChange={(e) => setPartyTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                    {partyTypes.map(type => (
                        <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type}</option>
                    ))}
                </select>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">{error}</div>}

            {importSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">{importSuccess}</div>}
            {importErrors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                    <strong className="font-bold">Import Failed!</strong>
                    <ul className="mt-2 list-disc list-inside">
                        {importErrors.map((err, index) => (
                            <li key={index}>{err}</li>
                        ))}
                    </ul>
                    <button onClick={() => setImportErrors([])} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}


            <main className="flex-grow overflow-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : parties.length > 0 ? (
                    viewMode === 'card' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {parties.map(party => (
                                <PartyCard key={party.id} party={party} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">S.No.</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">Company Name</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">Code</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">Contact Person</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">Email</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">City</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">Type</th>
                                        <th scope="col" className="px-6 py-3 border-r dark:border-gray-600">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.map((party, index) => (
                                        <tr key={party.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 border-r dark:border-gray-600">{currentPage * pageSize + index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white border-r dark:border-gray-600">{party.companyName}</td>
                                            <td className="px-6 py-4 border-r dark:border-gray-600">{party.customerCode || party.vendorCustomerCode || 'N/A'}</td>
                                            <td className="px-6 py-4 border-r dark:border-gray-600">{party.primaryContactPerson || 'N/A'}</td>
                                            <td className="px-6 py-4 border-r dark:border-gray-600">{party.contactEmail || 'N/A'}</td>
                                            <td className="px-6 py-4 border-r dark:border-gray-600">{party.city || 'N/A'}</td>
                                            <td className="px-6 py-4 border-r dark:border-gray-600"><span className={`px-2 py-1 text-xs font-medium rounded-full ${party.partyType === 'CUSTOMER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{party.partyType}</span></td>
                                            <td className="px-6 py-4 border-r dark:border-gray-600">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${party.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {party.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleView(party)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" /></button>
                                                <button onClick={() => handleEdit(party)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" /></button>
                                                <button onClick={() => handleDelete(party.id)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="h-4 w-4 text-red-500" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-500 py-16 flex flex-col items-center">
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No Parties Found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new party.</p>
                    </div>
                )}
            </main>

            {!loading && parties.length > 0 && (
                <footer className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                        <span>Rows per page:</span>
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600">
                            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 rounded-md border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-2 rounded-md border dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </footer>
            )}

            {isImportGuideOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setIsImportGuideOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Import Guide</h3>
                            <button onClick={() => setIsImportGuideOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                To bulk import customers, prepare a CSV file with the following columns. The 'Field Name' should be the header in your file.
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Field Name</th>
                                            <th scope="col" className="px-6 py-3">Required</th>
                                            <th scope="col" className="px-6 py-3">Description</th>
                                            <th scope="col" className="px-6 py-3">Example</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-6 py-4 font-mono">companyName</td>
                                            <td className="px-6 py-4"><span className="text-red-500 font-semibold">Yes</span></td>
                                            <td className="px-6 py-4">The legal name of the company.</td>
                                            <td className="px-6 py-4">Innovate Inc.</td>
                                        </tr>
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-6 py-4 font-mono">partyType</td>
                                            <td className="px-6 py-4"><span className="text-red-500 font-semibold">Yes</span></td>
                                            <td className="px-6 py-4">Must be 'CUSTOMER' or 'VENDOR'.</td>
                                            <td className="px-6 py-4">CUSTOMER</td>
                                        </tr>
                                        <tr className="bg-white dark:bg-gray-800">
                                            <td className="px-6 py-4 font-mono">primaryContactPerson</td>
                                            <td className="px-6 py-4">No</td>
                                            <td className="px-6 py-4">Full name of the main contact person.</td>
                                            <td className="px-6 py-4">Jane Doe</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={handleDownloadSampleCsv} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75">
                                <Download className="mr-2 h-4 w-4" />
                                Download Sample CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingParty && (
                <PartyViewModal
                    party={viewingParty}
                    onClose={() => setViewingParty(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoadingDetails={isLoadingDetails}
                />
            )}
        </div>
    );
}

export default PartyType;
