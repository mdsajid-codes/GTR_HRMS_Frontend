import {Route, BrowserRouter as Router, Routes } from 'react-router-dom'
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
import CrmModule from './crm/pages/CrmModule.jsx'
import CrmLead from './crm/pages/CrmLead.jsx'
import CrmCompanies from './crm/pages/CrmCompanies.jsx'
import LeadInfo from './crm/pages/Leadinfo.jsx';
import SalesLayout from './sales/SalesLayout.jsx'
import SalesDashboard from './sales/SalesDashboard.jsx';
import Orders from './sales/pages/Orders.jsx';
 
// Placeholder for CRM child pages
const CrmPlaceholder = ({ pageName }) => (
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
          <Route path='/leave' element={<LeaveManagement /> } />
          <Route path='/payroll-management' element={<PayrollManagement />} />
          <Route path='/pos-dashboard' element={<PosDashboard />} />
          <Route path='/company-dashboard' element={<CompanyDashboard />} />
          <Route path='/company-settings' element={<Settings />}>
            <Route path="hrms" element={<HrmsSettings />} />
            <Route path='production' element={<ProductionSettings /> } />
            <Route path='crm' element={<CrmSettings /> } />
          </Route>
          <Route path='/crm-dashboard' element={<CrmModule />}>
            <Route index element={<CrmPlaceholder pageName="CRM Dashboard" />} />
            <Route path="home" element={<CrmPlaceholder pageName="Home" />} />
            <Route path="calling-data" element={<CrmPlaceholder pageName="Calling Data" />} />
            <Route path="leads" element={<CrmLead pageName="Leads" />} />
            <Route path="leads/:leadId" element={<LeadInfo />} />
            <Route path="companies" element={<CrmCompanies pageName="Companies" />} />
            <Route path="contacts" element={<CrmPlaceholder pageName="Contacts" />} />
            <Route path="deals" element={<CrmPlaceholder pageName="Deals" />} />
            <Route path="tasks" element={<CrmPlaceholder pageName="Tasks" />} />
            <Route path="operations" element={<CrmPlaceholder pageName="Operations" />} />
          </Route>
          {/* Sales Module Routes */}
          <Route path="/sales-dashboard" element={<SalesLayout />}>
            <Route index element={<SalesDashboard />} />
          </Route>
          <Route path="/sales" element={<SalesLayout />}>
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </Router>
    </TenantProvider>
  )
}

export default App
