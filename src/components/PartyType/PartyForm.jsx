import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Save, X, Building, User, Mail, Briefcase, Percent, Plus, Trash2, ChevronDown, FileText, Truck, Share2, TrendingUp } from 'lucide-react';

const TabButton = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

const ToggleSection = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-600">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-lg font-semibold text-gray-900 dark:text-white"
      >
        <span className="flex items-center">{icon} {title}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="pb-6 space-y-6">{children}</div>}
    </div>
  );
};

const emptyAddress = () => ({
  attention: '',
  addressLine: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
  fax: '',
});

const PartyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [party, setParty] = useState({
    partyType: 'CUSTOMER',
    companyName: '',
    primaryContactPerson: '',
    contactEmail: '',
    contactPhone: '',
    active: true,
    under: '',
    priceCategory: '',
    vendorCustomerCode: '',
    customerCode: '',
    primaryContactTitle: '',
    primaryFirstName: '',
    primaryLastName: '',
    mobile: '',
    workPhone: '',
    skypeNameOrNumber: '',
    designation: '',
    department: '',
    website: '',
    panNumber: '',
    city: '',
    region: '',
    currency: '',
    billingAddress: emptyAddress(),
    shippingAddress: emptyAddress(),
    vatTreatment: 'VAT_UNREGISTERED',
    vatNumber: '',
    tanNumber: '',
    cinNo: '',
    taxDeducted: false,
    openingBalance: 0,
    openingBalanceType: 'DR',
    creditLimitAllowed: 0,
    creditPeriodAllowed: 0,
    shippingSameAsBilling: false,
    ownerCeoName: '',
    ownerCeoContact: '',
    ownerCeoEmail: '',
    vatTrnNumber: '',
    termsAndConditionsInternal: '',
    termsAndConditionsDisplay: '',
    modeOfPayment: '',
    deliveryType: '',
    paymentTerms: '',
    transportDispatchThrough: '',
    freightTerms: '',
    splInstruction: '',
    salesValuePreviousYear: 0,
    facebook: '',
    twitter: '',
    remarks: '',
    otherPersons: [],
    customFields: [],
    bankDetails: [],
  });

  const [activeTab, setActiveTab] = useState('companyDetails');
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch existing party when editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchParty = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const partyResponse = await axios.get(`${API_URL}/parties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedParty = partyResponse.data || {};

        // Ensure nested address objects are not null
        fetchedParty.billingAddress = fetchedParty.billingAddress || emptyAddress();
        fetchedParty.shippingAddress = fetchedParty.shippingAddress || emptyAddress();

        // make sure numeric/boolean fields are typed correctly
        fetchedParty.openingBalance = Number(fetchedParty.openingBalance || 0);
        fetchedParty.creditLimitAllowed = Number(fetchedParty.creditLimitAllowed || 0);
        fetchedParty.creditPeriodAllowed = Number(fetchedParty.creditPeriodAllowed || 0);
        fetchedParty.active = typeof fetchedParty.active === 'boolean' ? fetchedParty.active : !!fetchedParty.active;
        fetchedParty.shippingSameAsBilling = !!fetchedParty.shippingSameAsBilling;

        setParty(prev => ({ ...prev, ...fetchedParty }));

      } catch (err) {
        console.error('Failed to fetch party:', err);
        setError('Failed to load party data.');
      } finally {
        setLoading(false);
      }
    };

    fetchParty();
  }, [id, isEditing, API_URL]);

  // If shippingSameAsBilling toggles to true, copy billing to shipping
  useEffect(() => {
    if (party.shippingSameAsBilling) {
      setParty(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress },
      }));
    }
    // only run when that particular flag changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party.shippingSameAsBilling]);

  const handleInputChange = (e) => {
    const { name, value: rawValue, type, checked, dataset } = e.target;
    let value;

    if (type === 'checkbox') {
      value = checked;
    } else if (type === 'number') {
      // convert numeric inputs to numbers (keep empty string as '')
      value = rawValue === '' ? '' : Number(rawValue);
    } else if (e.target.tagName === 'SELECT' && name === 'active') {
      // select returns strings, ensure boolean for active
      value = rawValue === 'true' || rawValue === true;
    } else {
      value = rawValue;
    }

    if (dataset.list && dataset.index) {
      const { list, index } = dataset;
      const updatedList = [...party[list]];
      updatedList[index] = { ...updatedList[index], [name]: value };
      setParty(prev => ({ ...prev, [list]: updatedList }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setParty(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setParty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePartyTypeChange = (e) => {
    setParty(prev => ({ ...prev, partyType: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare payload: ensure correct types and if shippingSameAsBilling true copy address
    const payload = {
      ...party,
      billingAddress: party.billingAddress || emptyAddress(),
      shippingAddress: party.shippingSameAsBilling ? party.billingAddress || emptyAddress() : party.shippingAddress || emptyAddress(),
      openingBalance: Number(party.openingBalance || 0),
      creditLimitAllowed: Number(party.creditLimitAllowed || 0),
      creditPeriodAllowed: Number(party.creditPeriodAllowed || 0),
      active: !!party.active,
      shippingSameAsBilling: !!party.shippingSameAsBilling,
    };

    const url = isEditing ? `${API_URL}/parties/${id}` : `${API_URL}/parties`;
    const method = isEditing ? 'put' : 'post';

    try {
      const token = localStorage.getItem('token');
      // axios[method] resolves to either axios.post or axios.put
      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      // after success navigate back
      navigate('/company-settings/party-type');
    } catch (err) {
      console.error('Failed to save party:', err);
      // try to show a helpful error message if available
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save party. Please check the details and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Generic List Handlers ---
  const addListItem = (listName, newItem) => {
    setParty(prev => ({
      ...prev,
      [listName]: [...(prev[listName] || []), newItem]
    }));
  };

  const removeListItem = (listName, index) => {
    setParty(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Party' : 'Create New Party'}</h1>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="partyType"
                value="CUSTOMER"
                checked={party.partyType === 'CUSTOMER'}
                onChange={handlePartyTypeChange}
                className="form-radio text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="partyType"
                value="SUPPLIER"
                checked={party.partyType === 'SUPPLIER'}
                onChange={handlePartyTypeChange}
                className="form-radio text-purple-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/company-settings/party-type')}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <X className="mr-2 h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <TabButton label="Company Details" isActive={activeTab === 'companyDetails'} onClick={() => setActiveTab('companyDetails')} />
        <TabButton label="Other Person" isActive={activeTab === 'otherPerson'} onClick={() => setActiveTab('otherPerson')} />
        <TabButton label="Custom Field" isActive={activeTab === 'customField'} onClick={() => setActiveTab('customField')} />
        <TabButton label="Bank Details" isActive={activeTab === 'bankDetails'} onClick={() => setActiveTab('bankDetails')} />
      </div>

      <main className="flex-grow overflow-auto">
        {activeTab === 'companyDetails' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
            
            <ToggleSection title="Company Info" icon={<Building className="w-5 h-5 mr-3 text-blue-500" />} defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={party.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="customerCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Code
                  </label>
                  <input id="customerCode" name="customerCode" value={party.customerCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="vendorCustomerCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vendor/Customer Code
                  </label>
                  <input id="vendorCustomerCode" name="vendorCustomerCode" value={party.vendorCustomerCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="lg:col-span-2">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input id="website" name="website" value={party.website} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PAN Number
                  </label>
                  <input id="panNumber" name="panNumber" value={party.panNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="active" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select id="active" name="active" value={String(party.active)} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input id="city" name="city" value={party.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <input id="region" name="region" value={party.region} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="ownerCeoName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner/CEO Name</label>
                  <input id="ownerCeoName" name="ownerCeoName" value={party.ownerCeoName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="ownerCeoContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner/CEO Contact</label>
                  <input id="ownerCeoContact" name="ownerCeoContact" value={party.ownerCeoContact} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="ownerCeoEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner/CEO Email</label>
                  <input id="ownerCeoEmail" name="ownerCeoEmail" type="email" value={party.ownerCeoEmail} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            </ToggleSection>

            
            <ToggleSection title="Primary Contact" icon={<User className="w-5 h-5 mr-3 text-blue-500" />} defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="primaryContactTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input id="primaryContactTitle" name="primaryContactTitle" value={party.primaryContactTitle} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Mr./Ms." />
                </div>
                <div>
                  <label htmlFor="primaryFirstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input id="primaryFirstName" name="primaryFirstName" value={party.primaryFirstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="primaryLastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input id="primaryLastName" name="primaryLastName" value={party.primaryLastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="lg:col-span-2">
                  <label htmlFor="primaryContactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input id="primaryContactPerson" name="primaryContactPerson" value={party.primaryContactPerson} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Designation
                  </label>
                  <input id="designation" name="designation" value={party.designation} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input id="department" name="department" value={party.department} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input id="contactEmail" name="contactEmail" type="email" value={party.contactEmail} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input id="contactPhone" name="contactPhone" value={party.contactPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile
                  </label>
                  <input id="mobile" name="mobile" value={party.mobile} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="workPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Phone
                  </label>
                  <input id="workPhone" name="workPhone" value={party.workPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
            </ToggleSection>

            <ToggleSection title="Tax & Financials" icon={<Percent className="w-5 h-5 mr-3 text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="vatTreatment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    VAT Treatment
                  </label>
                  <select id="vatTreatment" name="vatTreatment" value={party.vatTreatment} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="VAT_REGISTERED">VAT Registered</option>
                    <option value="VAT_UNREGISTERED">VAT Unregistered</option>
                    <option value="VAT_EXEMPT">VAT Exempt</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    VAT Number
                  </label>
                  <input id="vatNumber" name="vatNumber" value={party.vatNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="vatTrnNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    VAT TRN Number
                  </label>
                  <input id="vatTrnNumber" name="vatTrnNumber" value={party.vatTrnNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="tanNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    TAN Number
                  </label>
                  <input id="tanNumber" name="tanNumber" value={party.tanNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="cinNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CIN Number
                  </label>
                  <input id="cinNo" name="cinNo" value={party.cinNo} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opening Balance
                  </label>
                  <input id="openingBalance" name="openingBalance" type="number" value={party.openingBalance} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="openingBalanceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Balance Type
                  </label>
                  <select id="openingBalanceType" name="openingBalanceType" value={party.openingBalanceType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="DR">DR (Debit)</option>
                    <option value="CR">CR (Credit)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="creditLimitAllowed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Credit Limit
                  </label>
                  <input id="creditLimitAllowed" name="creditLimitAllowed" type="number" value={party.creditLimitAllowed} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="creditPeriodAllowed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Credit Period (Days)
                  </label>
                  <input id="creditPeriodAllowed" name="creditPeriodAllowed" type="number" value={party.creditPeriodAllowed} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
            </ToggleSection>

            <ToggleSection title="Address Details" icon={<Mail className="w-5 h-5 mr-3 text-blue-500" />}>
              <div className="space-y-4">
                <h4 className="font-semibold text-md text-gray-800 dark:text-gray-200">Billing Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2">
                    <label htmlFor="billingAddress.attention" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Attention
                    </label>
                    <input id="billingAddress.attention" name="billingAddress.attention" value={party.billingAddress.attention} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div className="lg:col-span-4">
                    <label htmlFor="billingAddress.addressLine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea id="billingAddress.addressLine" name="billingAddress.addressLine" value={party.billingAddress.addressLine} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2"></textarea>
                  </div>
                  <div>
                    <label htmlFor="billingAddress.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <input id="billingAddress.city" name="billingAddress.city" value={party.billingAddress.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="billingAddress.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State
                    </label>
                    <input id="billingAddress.state" name="billingAddress.state" value={party.billingAddress.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="billingAddress.zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zip Code
                    </label>
                    <input id="billingAddress.zipCode" name="billingAddress.zipCode" value={party.billingAddress.zipCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="billingAddress.country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country
                    </label>
                    <input id="billingAddress.country" name="billingAddress.country" value={party.billingAddress.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="shippingSameAsBilling" checked={party.shippingSameAsBilling} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping address is same as billing address</span>
                </label>
              </div>

              {!party.shippingSameAsBilling && (
                <div className="space-y-4 pt-4">
                  <h4 className="font-semibold text-md text-gray-800 dark:text-gray-200">Shipping Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                      <label htmlFor="shippingAddress.attention" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Attention
                      </label>
                      <input id="shippingAddress.attention" name="shippingAddress.attention" value={party.shippingAddress.attention} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="lg:col-span-4">
                      <label htmlFor="shippingAddress.addressLine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <textarea id="shippingAddress.addressLine" name="shippingAddress.addressLine" value={party.shippingAddress.addressLine} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2"></textarea>
                    </div>
                    <div>
                      <label htmlFor="shippingAddress.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input id="shippingAddress.city" name="shippingAddress.city" value={party.shippingAddress.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                      <label htmlFor="shippingAddress.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input id="shippingAddress.state" name="shippingAddress.state" value={party.shippingAddress.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                      <label htmlFor="shippingAddress.zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Zip Code
                      </label>
                      <input id="shippingAddress.zipCode" name="shippingAddress.zipCode" value={party.shippingAddress.zipCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                      <label htmlFor="shippingAddress.country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <input id="shippingAddress.country" name="shippingAddress.country" value={party.shippingAddress.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}
            </ToggleSection>

            <ToggleSection title="Additional Details" icon={<Briefcase className="w-5 h-5 mr-3 text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="under" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Under Account
                  </label>
                  <input id="under" name="under" value={party.under} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="priceCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price Category
                  </label>
                  <input id="priceCategory" name="priceCategory" value={party.priceCategory} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <input id="currency" name="currency" value={party.currency} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="lg:col-span-4">
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <textarea id="remarks" name="remarks" value={party.remarks} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"></textarea>
                </div>
              </div>
            </ToggleSection>

            <ToggleSection title="Terms & Delivery" icon={<Truck className="w-5 h-5 mr-3 text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <label htmlFor="termsAndConditionsInternal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions (Internal)</label>
                  <textarea id="termsAndConditionsInternal" name="termsAndConditionsInternal" value={party.termsAndConditionsInternal} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows="2"></textarea>
                </div>
                <div className="lg:col-span-3">
                  <label htmlFor="termsAndConditionsDisplay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions (Display)</label>
                  <textarea id="termsAndConditionsDisplay" name="termsAndConditionsDisplay" value={party.termsAndConditionsDisplay} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows="2"></textarea>
                </div>
                <div>
                  <label htmlFor="modeOfPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode of Payment</label>
                  <input id="modeOfPayment" name="modeOfPayment" value={party.modeOfPayment} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="deliveryType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Type</label>
                  <input id="deliveryType" name="deliveryType" value={party.deliveryType} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                  <input id="paymentTerms" name="paymentTerms" value={party.paymentTerms} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="transportDispatchThrough" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dispatch Through</label>
                  <input id="transportDispatchThrough" name="transportDispatchThrough" value={party.transportDispatchThrough} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="freightTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freight Terms</label>
                  <input id="freightTerms" name="freightTerms" value={party.freightTerms} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="lg:col-span-3">
                  <label htmlFor="splInstruction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</label>
                  <input id="splInstruction" name="splInstruction" value={party.splInstruction} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            </ToggleSection>

            <ToggleSection title="Social & Sales" icon={<Share2 className="w-5 h-5 mr-3 text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                  <input id="facebook" name="facebook" value={party.facebook} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter URL</label>
                  <input id="twitter" name="twitter" value={party.twitter} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="salesValuePreviousYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sales Value (Prev. Year)</label>
                  <input id="salesValuePreviousYear" name="salesValuePreviousYear" type="number" value={party.salesValuePreviousYear} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            </ToggleSection>

          </div>
        )}
        {activeTab === 'otherPerson' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Additional Contacts</h3>
            {(party.otherPersons || []).map((person, index) => (
              <div key={index} className="p-4 border rounded-md relative">
                <button type="button" onClick={() => removeListItem('otherPersons', index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Salutation</label><input data-list="otherPersons" data-index={index} name="salutation" value={person.salutation} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">First Name</label><input data-list="otherPersons" data-index={index} name="firstName" value={person.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Last Name</label><input data-list="otherPersons" data-index={index} name="lastName" value={person.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input data-list="otherPersons" data-index={index} name="emailAddress" type="email" value={person.emailAddress} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Work Phone</label><input data-list="otherPersons" data-index={index} name="workPhone" value={person.workPhone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Mobile</label><input data-list="otherPersons" data-index={index} name="mobile" value={person.mobile} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Skype</label><input data-list="otherPersons" data-index={index} name="skypeNameOrNumber" value={person.skypeNameOrNumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Designation</label><input data-list="otherPersons" data-index={index} name="designation" value={person.designation} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Department</label><input data-list="otherPersons" data-index={index} name="department" value={person.department} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('otherPersons', { salutation: '', firstName: '', lastName: '', emailAddress: '', workPhone: '', mobile: '', skypeNameOrNumber: '', designation: '', department: '' })} className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow-sm hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Contact
            </button>
          </div>
        )}
        {activeTab === 'customField' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Custom Fields</h3>
            {(party.customFields || []).map((field, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1"><label className="block text-sm font-medium mb-1">Field Name</label><input data-list="customFields" data-index={index} name="fieldName" value={field.fieldName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                <div className="flex-1"><label className="block text-sm font-medium mb-1">Field Value</label><input data-list="customFields" data-index={index} name="fieldValue" value={field.fieldValue} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                <button type="button" onClick={() => removeListItem('customFields', index)} className="p-2 text-red-500 hover:bg-red-100 rounded-md mb-1"><Trash2 className="h-5 w-5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('customFields', { fieldName: '', fieldValue: '' })} className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow-sm hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </button>
          </div>
        )}
        {activeTab === 'bankDetails' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Bank Details</h3>
            {(party.bankDetails || []).map((detail, index) => (
              <div key={index} className="p-4 border rounded-md relative">
                <button type="button" onClick={() => removeListItem('bankDetails', index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Bank Name</label><input data-list="bankDetails" data-index={index} name="bankName" value={detail.bankName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Account Number</label><input data-list="bankDetails" data-index={index} name="accountNumber" value={detail.accountNumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">IFSC Code</label><input data-list="bankDetails" data-index={index} name="ifsCode" value={detail.ifsCode} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">IBAN Code</label><input data-list="bankDetails" data-index={index} name="ibanCode" value={detail.ibanCode} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Corporate ID</label><input data-list="bankDetails" data-index={index} name="corporateId" value={detail.corporateId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Branch Location</label><input data-list="bankDetails" data-index={index} name="locationBranch" value={detail.locationBranch} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div className="lg:col-span-2"><label className="block text-sm font-medium mb-1">Branch Address</label><input data-list="bankDetails" data-index={index} name="branchAddress" value={detail.branchAddress} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                  <div className="lg:col-span-2"><label className="block text-sm font-medium mb-1">Beneficiary Email</label><input data-list="bankDetails" data-index={index} name="beneficiaryMailId" type="email" value={detail.beneficiaryMailId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" /></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('bankDetails', { bankName: '', accountNumber: '', ifsCode: '', ibanCode: '', corporateId: '', locationBranch: '', branchAddress: '', beneficiaryMailId: '' })} className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow-sm hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </button>
          </div>
        )}
      </main>
    </form>
  );
};

export default PartyForm;