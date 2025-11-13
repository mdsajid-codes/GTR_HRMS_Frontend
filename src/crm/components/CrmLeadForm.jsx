import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader, Save, PlusCircle, X } from 'lucide-react';
import CrmLeadStage from './CrmLeadStage'; // To manage lead stages
import LeadSource from './LeadSource'; // To manage lead sources

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-foreground-muted">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const ManagementModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const forecastCategoryOptions = [
    { value: 'PIPELINE', label: 'Pipeline' },
    { value: 'BEST_CASE_FORECAST', label: 'Best Case Forecast' },
    { value: 'COMMIT_FORECAST', label: 'Commit Forecast' },
    { value: 'CLOSED_ONLY', label: 'Closed Only' },
    { value: 'QUOTA', label: 'Quota' },
    { value: 'OPEN_PIPELINE', label: 'Open Pipeline' },
];

const crmLeadStatusOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'DUPLICATE', label: 'Duplicate' },
    { value: 'TRANSFERRED', label: 'Transferred' },
    { value: 'NOT_RESPONDING', label: 'Not Responding' },
    { value: 'JUNK', label: 'Junk' },
    { value: 'LOST', label: 'Lost' },
    { value: 'UNASSIGNED', label: 'Unassigned' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
];



const CrmLeadForm = ({ item, onSave, onCancel, loading: isSubmitting }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', companyId: '', email: '', phone: '',
        leadNo: '', // Added leadNo
        industryId: '', designation: '', website: '', productIds: [], requirements: '',
        leadSourceId: '', // Changed to ID for dropdown
        notes: '', ownerId: '',
        currentStageId: '', locationId: '', forecastCategory: 'PIPELINE',
        expectedCloseDate: '', amount: '', status: 'NEW',
        address: { street: '', city: '', state: '', zip: '', country: '' }, // Added address object
    });

    const [selectData, setSelectData] = useState({
        companies: [], industries: [], products: [], employees: [], leadStages: [],
        locations: [], leadSources: [],
    });
    const [loading, setLoading] = useState(true);
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [companiesRes, industriesRes, productsRes, employeesRes, stagesRes, locationsRes, sourcesRes] = await Promise.all([
                axios.get(`${API_URL}/crm/companies`, { headers }),
                axios.get(`${API_URL}/settings/industries`, { headers }),
                axios.get(`${API_URL}/crm/products`, { headers }),
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/crm/lead-stages`, { headers }),
                axios.get(`${API_URL}/locations`, { headers }),
                axios.get(`${API_URL}/crm/lead-sources`, { headers }),
            ]);
            setSelectData({
                companies: companiesRes.data.content || companiesRes.data,
                industries: industriesRes.data,
                products: productsRes.data,
                employees: employeesRes.data,
                leadStages: stagesRes.data,
                locations: locationsRes.data,
                leadSources: sourcesRes.data,
            });
        } catch (error) {
            console.error("Failed to fetch form select data", error);
            alert("Failed to load required data for the form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                firstName: item.firstName || '',
                lastName: item.lastName || '',
                companyId: item.companyId || '',
                email: item.email || '',
                phone: item.phone || '',
                leadNo: item.leadNo || '', // Added leadNo
                industryId: item.industryId || '',
                designation: item.designation || '',
                website: item.website || '',
                productIds: item.products?.map(p => p.id) || [],
                requirements: item.requirements || '',
                leadSourceId: item.leadSourceId || '',
                notes: item.notes || '',
                ownerId: item.ownerId || '',
                currentStageId: item.currentStageId || '',
                locationId: item.locationId || '',
                forecastCategory: item.forecastCategory || 'PIPELINE',
                expectedCloseDate: item.expectedCloseDate ? item.expectedCloseDate.split('T')[0] : '',
                amount: item.amount || '',
                status: item.status || 'NEW',
                address: item.address || { street: '', city: '', state: '', zip: '', country: '' },
            });
        }
    }, [item, selectData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            amount: formData.amount ? parseFloat(formData.amount) : null,
            // Ensure companyId is an integer, or null if not provided
            companyId: formData.companyId ? parseInt(formData.companyId) : null,
            productIds: formData.productIds.map(id => parseInt(id)),
        };
        onSave(payload);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <h3 className="text-xl font-semibold text-foreground">{item ? 'Edit Lead' : 'Add New Lead'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="First Name" required>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} required className="input bg-background-muted border-border" />
                    </FormField>
                    <FormField label="Last Name" required>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} required className="input bg-background-muted border-border" />
                    </FormField>
                    <FormField label="Lead No." required>
                        <input name="leadNo" value={formData.leadNo} onChange={handleChange} required className="input bg-background-muted border-border" />
                    </FormField>
                    <FormField label="Email" required>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input bg-background-muted border-border" />
                    </FormField>
                    <FormField label="Phone">
                        <input name="phone" value={formData.phone} onChange={handleChange} className="input bg-background-muted border-border" />
                    </FormField>
                    <FormField label="Company" required>
                        <select name="companyId" value={formData.companyId} onChange={handleChange} className="input bg-background-muted border-border">
                            <option value="">Select Company</option>
                            {selectData.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Industry">
                        <select name="industryId" value={formData.industryId} onChange={handleChange} className="input bg-background-muted border-border">
                            <option value="">Select Industry</option>
                            {selectData.industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Lead Stage">
                        <div className="flex items-center gap-2">
                            <select name="currentStageId" value={formData.currentStageId} onChange={handleChange} className="input bg-background-muted border-border w-full" required>
                                <option value="">Select Stage</option>
                                {selectData.leadStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button type="button" onClick={() => setIsStageModalOpen(true)} className="btn-secondary p-2" title="Add New Stage">
                                <PlusCircle size={16} />
                            </button>
                        </div>
                    </FormField>
                    <FormField label="Lead Owner">
                        <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="input bg-background-muted border-border">
                            <option value="">Select Owner</option>
                            {selectData.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Status">
                        <select name="status" value={formData.status} onChange={handleChange} className="input bg-background-muted border-border">
                            {crmLeadStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Location">
                        <select name="locationId" value={formData.locationId} onChange={handleChange} className="input bg-background-muted border-border">
                            <option value="">Select Location</option>
                            {selectData.locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Amount">
                        <input name="amount" type="number" value={formData.amount} onChange={handleChange} className="input bg-background-muted border-border" placeholder="e.g., 5000.00" />
                    </FormField>
                    <FormField label="Expected Close Date">
                        <input name="expectedCloseDate" type="date" value={formData.expectedCloseDate} onChange={handleChange} className="input bg-background-muted border-border" />
                    </FormField>
                    <FormField label="Forecast Category">
                        <select name="forecastCategory" value={formData.forecastCategory} onChange={handleChange} className="input bg-background-muted border-border">
                            {forecastCategoryOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Lead Source">
                        <div className="flex items-center gap-2">
                            <select name="leadSourceId" value={formData.leadSourceId} onChange={handleChange} className="input bg-background-muted border-border w-full">
                                <option value="">Select Source</option>
                                {selectData.leadSources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button type="button" onClick={() => setIsSourceModalOpen(true)} className="btn-secondary p-2" title="Add New Source">
                                <PlusCircle size={16} />
                            </button>
                        </div>
                    </FormField>
                </div>
                <FormField label="Products">
                    <select name="productIds" value={formData.productIds} onChange={handleMultiSelectChange} multiple className="input h-32 bg-background-muted border-border">
                        {selectData.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </FormField>
                <h4 className="text-md font-semibold text-foreground pt-2 border-t border-border">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Street"><input name="address.street" value={formData.address.street} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                    <FormField label="City"><input name="address.city" value={formData.address.city} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                    <FormField label="State/Province"><input name="address.state" value={formData.address.state} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                    <FormField label="Zip/Postal Code"><input name="address.zip" value={formData.address.zip} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                    <FormField label="Country"><input name="address.country" value={formData.address.country} onChange={handleChange} className="input bg-background-muted border-border" /></FormField>
                </div>

                <FormField label="Requirements">
                    <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="3" className="input bg-background-muted border-border"></textarea>
                </FormField>
                <FormField label="Notes">
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="input bg-background-muted border-border"></textarea>
                </FormField>
            </div>
            <div className="p-4 bg-background-muted border-t border-border flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Lead
                </button>
            </div>
        </form>

            <ManagementModal isOpen={isStageModalOpen} onClose={() => { setIsStageModalOpen(false); fetchData(); }} title="Manage Lead Stages">
                <CrmLeadStage />
            </ManagementModal>

            <ManagementModal isOpen={isSourceModalOpen} onClose={() => { setIsSourceModalOpen(false); fetchData(); }} title="Manage Lead Sources">
                <LeadSource />
            </ManagementModal>
        </>
    );
};

export default CrmLeadForm;