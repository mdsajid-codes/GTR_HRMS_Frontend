import {Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import HrDashboard from './pages/HrDashboard'
import Employee from './pages/Employee'
import MasterAdmin from './pages/MasterAdmin'
import Department from './pages/Department'
import Designation from './pages/Designation'
import EmployeeDashboard from './pages/EmployeeDashboard'
import UsersDetails from './pages/UsersDetails'

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
        <Route path='/department' element={<Department />} />
        <Route path='/designation' element={<Designation />} />
        <Route path='/employee-dashboard' element={<EmployeeDashboard />} />
        <Route path='/users-details' element={<UsersDetails />} />
      </Routes>
    </Router>
  )
}

export default App
