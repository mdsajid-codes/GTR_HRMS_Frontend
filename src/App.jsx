import {Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
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

function App() {
  return (
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
      </Routes>
    </Router>
  )
}

export default App
