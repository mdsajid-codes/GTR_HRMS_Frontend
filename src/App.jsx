import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import { TenantProvider } from './context/TenantContext.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import HrDashboard from './pages/HrDashboard'
import Employee from './pages/Employee'
import MasterAdmin from './pages/MasterAdmin'
import EmployeeDashboard from './pages/EmployeeDashboard'
import UsersDetails from './pages/UsersDetails'
// import Settings from './pages/Settings'
import Settings from './company/Settings.jsx'
import HrmsSettings from './company/HrmsSettings.jsx';
import Attendance from './pages/Attendance'
import PayrollManagement from './pages/PayrollManagement'
import PosDashboard from './pos/page/PosDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import LeaveManagement from './pages/LeaveManagement.jsx'
import ProductionSettings from './production/settings/ProductionSettings.jsx'
import CrmSettings from './crm/settings/CrmSettings.jsx'
import Production from './production/pages/Production.jsx'
import CrmModule from './crm/pages/CrmModule.jsx'
import CrmLead from './crm/pages/CrmLead.jsx'
import CrmCompanies from './crm/pages/CrmCompanies.jsx'
import LeadInfo from './crm/pages/Leadinfo.jsx';
import PurchaseModule from './purchase/pages/PurchaseModule.jsx';
import SalesLayout from './sales/SalesLayout.jsx'
import SalesDashboard from './sales/SalesDashboard.jsx';
import Orders from './sales/pages/Orders.jsx';
import OrderForm from './sales/pages/OrderForm.jsx';
import QuotationForm from './sales/pages/QuotationForm.jsx';
import Quotation from './sales/pages/Quotation.jsx'
import ViewQuotation from './sales/pages/ViewQuotation.jsx';
import SalesSetting from './sales/pages/SalesSetting.jsx'
import PartyType from './components/PartyType/PartyType.jsx'
import PartyForm from './components/PartyType/PartyForm.jsx'
import CrmContacts from './crm/pages/CrmContacts.jsx'
import Account from './accounting/pages/Account.jsx'
import AccountSetting from './accounting/settings/AccountSetting.jsx'
import CrmSalesProduct from './crm/components/CrmSalesProduct.jsx'
import CrmSalesProductForm from './crm/components/CrmSalesProductForm.jsx'

// Placeholder for CRM child pages
const CrmPlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

// Placeholder for ACCOUNT child pages
const AccountPlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

// Placeholder for PRODUCTION child pages
const ProductionPlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

// Placeholder for PURCHASE child pages
const PurchasePlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <TenantProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/hrdashboard' element={<HrDashboard />} />
          <Route path='/employees' element={<Employee />} />
          <Route path='/master-admin' element={<MasterAdmin />} />
          <Route path='/employee-dashboard' element={<EmployeeDashboard />} />
          <Route path="/users-details" element={<UsersDetails />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path='/leave' element={<LeaveManagement />} />
          <Route path='/payroll-management' element={<PayrollManagement />} />
          <Route path='/pos-dashboard' element={<PosDashboard />} />
          <Route path='/company-dashboard' element={<CompanyDashboard />} />
          {/* Standalone HRMS Settings Route */}
          <Route path='/hrms-settings' element={<HrmsSettings />} />
          {/* Settings Hub Route */}
          <Route path='/company-settings' element={<Settings />} />
          {/* Standalone Module Settings Routes */}
          <Route path='/account-settings' element={<AccountSetting />} />
          <Route path='/production-settings' element={<ProductionSettings />} />
          <Route path='/crm-settings' element={<CrmSettings />} />
          {/* The PartyType setting is a CRUD interface, so it gets its own group of routes */}
          <Route path='/company-settings/party-type'>
            <Route index element={<PartyType />} />
            <Route path="new" element={<PartyForm />} />
            <Route path="edit/:id" element={<PartyForm />} />
          </Route>
          <Route path='/crm-dashboard' element={<CrmModule />}>
            <Route index element={<CrmPlaceholder pageName="CRM Dashboard" />} />
            <Route path="home" element={<CrmPlaceholder pageName="Home" />} />
            <Route path="calling-data" element={<CrmPlaceholder pageName="Calling Data" />} />
            <Route path="leads" element={<CrmLead pageName="Leads" />} />
            <Route path="leads/:leadId" element={<LeadInfo />} />
            <Route path="companies" element={<CrmCompanies pageName="Companies" />} />
            <Route path="contacts" element={<CrmContacts pageName="Contacts" />} />
            <Route path='products'>
              <Route index element={<CrmSalesProduct pageName="Products" />} />
              <Route path="new" element={<CrmSalesProductForm />} />
              <Route path="edit/:id" element={<CrmSalesProductForm />} />
            </Route>
            <Route path="deals" element={<CrmPlaceholder pageName="Deals" />} />
            <Route path="tasks" element={<CrmPlaceholder pageName="Tasks" />} />
            <Route path="operations" element={<CrmPlaceholder pageName="Operations" />} />
          </Route>
          {/* Sales Module Routes */}
          <Route path="/sales-dashboard" element={<SalesLayout />}>
            <Route index element={<SalesDashboard />} />
          </Route>
          <Route path="/sales" element={<SalesLayout />}>
            <Route path='quotations'>
              <Route index element={<Quotation />} />
              <Route path='new' element={<QuotationForm />} />
              <Route path='edit/:id' element={<QuotationForm />} />
              <Route path=':id' element={<ViewQuotation />} />
            </Route>
            <Route path="orders">
              <Route index element={<Orders />} />
              <Route path="new" element={<OrderForm />} />
              <Route path="edit/:id" element={<OrderForm />} />
            </Route>
            <Route path='settings' element={<SalesSetting />} />
          </Route>
          <Route path='/account-dashboard' element={<Account />}>
            <Route index element={<AccountPlaceholder pageName="Chart Of Accounts" />} />
            <Route path="chart-of-accounts" element={<AccountPlaceholder pageName="Chart Of Accounts" />} />
            <Route path="add-entry" element={<AccountPlaceholder pageName="Add Entry" />} />
            <Route path="manage-entry" element={<AccountPlaceholder pageName="Manage Entry" />} />
            <Route path="incoming-pdc" element={<AccountPlaceholder pageName="Manage Incoming PDC" />} />
            <Route path="outgoing-pdc" element={<AccountPlaceholder pageName="Manage Outgoing PDC" />} />
            <Route path="bank-reconciliation" element={<AccountPlaceholder pageName="Bank Reconciliation" />} />
          </Route>
          {/* Production Module Routes */}
          <Route path="/production-dashboard" element={<Production />}>
            <Route index element={<ProductionPlaceholder pageName="Manage Manufacturing Order" />} />
            <Route path="manage-manufacturing-order" element={<ProductionPlaceholder pageName="Manage Manufacturing Order" />} />
            <Route path="view-manufacturing-order" element={<ProductionPlaceholder pageName="View Manufacturing Order" />} />
            <Route path="production-schedule" element={<ProductionPlaceholder pageName="Production Schedule" />} />
            <Route path="production-operation" element={<ProductionPlaceholder pageName="Production Operation" />} />
            <Route path="my-production" element={<ProductionPlaceholder pageName="My Production" />} />
            <Route path="material-requisition" element={<ProductionPlaceholder pageName="Material Requisition" />} />
            <Route path="work-order-report" element={<ProductionPlaceholder pageName="Work Order Report" />} />
          </Route>
          {/* Purchase Module Routes */}
          <Route path="/purchase-dashboard" element={<PurchaseModule />}>
            <Route index element={<PurchasePlaceholder pageName="Purchase Dashboard" />} />
            <Route path="dashboard" element={<PurchasePlaceholder pageName="Purchase Dashboard" />} />
            <Route path="purchase-orders" element={<PurchasePlaceholder pageName="Purchase Orders" />} />
            <Route path="bills" element={<PurchasePlaceholder pageName="Bills" />} />
            <Route path="payments" element={<PurchasePlaceholder pageName="Payments" />} />
            <Route path="debit-notes" element={<PurchasePlaceholder pageName="Debit Notes" />} />
          </Route>
        </Routes>
      </Router>
    </TenantProvider>
  )
}

export default App
