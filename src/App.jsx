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
          </Route>
        </Routes>
      </Router>
    </TenantProvider>
  )
}

export default App
