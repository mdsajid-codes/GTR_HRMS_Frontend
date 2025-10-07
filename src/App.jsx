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
import Settings from './pages/Settings'
import Leave from './pages/Leave'
import Attendance from './pages/Attendance'
import PayrollManagement from './pages/PayrollManagement'
import PosDashboard from './pos/page/PosDashboard'
import CompanyDashboard from './pages/CompanyDashboard'

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
          <Route path="/settings" element={<Settings />} />
          <Route path='/leave' element={<Leave />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path='/payroll-management' element={<PayrollManagement />} />
          <Route path='/pos-dashboard' element={<PosDashboard />} />
          <Route path='company-dashboard' element={<CompanyDashboard />} />
        </Routes>
      </Router>
    </TenantProvider>
  )
}

export default App
