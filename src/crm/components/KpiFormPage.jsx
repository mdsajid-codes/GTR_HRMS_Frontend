import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, PlusCircle, Trash2, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    {children}
  </div>
);

const KpiFormPage = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataType: 'NUMBER',   // VALID default
    type: 'DAILY',        // VALID default (matches select options)
    assignedEmployees: [],
    ranges: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employees for assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/employees/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // If editing, populate form
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        dataType: item.dataType || 'NUMBER',
        type: item.type || 'DAILY',
        assignedEmployees: item.assignedEmployees?.map(emp => ({
          employeeId: emp.employeeId,
          targetValue: emp.targetValue ?? ''
        })) || [],
        ranges: Array.isArray(item.ranges) ? item.ranges : []
      });
    } else {
      // reset to defaults when switching from edit to create
      setFormData(prev => ({
        ...prev,
        name: '',
        description: '',
        dataType: 'NUMBER',
        type: 'DAILY',
        assignedEmployees: [],
        ranges: []
      }));
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (index, field, value) => {
    setFormData(prev => {
      const next = [...prev.assignedEmployees];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, assignedEmployees: next };
    });
  };

  const addEmployeeAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignedEmployees: [...prev.assignedEmployees, { employeeId: '', targetValue: '' }]
    }));
  };

  const removeEmployeeAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      alert('Please enter a KPI name.');
      return;
    }
    if (!formData.dataType) {
      alert('Please choose a data type.');
      return;
    }
    if (!formData.type) {
      alert('Please choose a KPI type.');
      return;
    }

    // convert targetValue to numbers; prevent duplicate employees
    const seen = new Set();
    const cleanedAssignments = [];
    for (const a of formData.assignedEmployees) {
      const empId = String(a.employeeId || '').trim();
      if (!empId) continue;
      if (seen.has(empId)) {
        alert('Each employee can only be assigned once.');
        return;
      }
      seen.add(empId);

      const num = a.targetValue === '' ? null : Number(a.targetValue);
      if (num === null || Number.isNaN(num)) {
        alert('Please enter a numeric target value for all assigned employees.');
        return;
      }
      cleanedAssignments.push({ employeeId: empId, targetValue: num });
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      dataType: formData.dataType,        // NUMBER | PERCENTAGE | CURRENCY | BOOLEAN | TEXT
      type: formData.type,                // DAILY | WEEKLY | MONTHLY | QUARTERLY | YEARLY | CUSTOM
      assignedEmployees: cleanedAssignments,
      ranges: formData.ranges
    };

    onSave(payload);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">{item ? 'Edit KPI' : 'Create New KPI'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KPI Details */}
        <div className="p-4 border border-border rounded-lg">
          <h3 className="font-semibold text-foreground mb-4">KPI Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="KPI Name">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input bg-background-muted border-border"
              />
            </FormField>

            <FormField label="Description">
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input bg-background-muted border-border"
              />
            </FormField>

            <FormField label="Data Type">
              <select
                name="dataType"
                value={formData.dataType}
                onChange={handleChange}
                className="input bg-background-muted border-border"
              >
                <option value="NUMBER">Number</option>
                <option value="PERCENTAGE">Percentage</option> {/* fixed spelling */}
                <option value="CURRENCY">Currency</option>
                <option value="BOOLEAN">Boolean</option>
                <option value="TEXT">Text</option>
              </select>
            </FormField>

            <FormField label="KPI Type">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input bg-background-muted border-border"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Assign Employees */}
        <div className="p-4 border border-border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Assign Employees & Targets</h3>
            <button
              type="button"
              onClick={addEmployeeAssignment}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <PlusCircle size={16} /> Add Employee
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {formData.assignedEmployees.map((assignment, index) => {
              const assignedElsewhere = new Set(
                formData.assignedEmployees
                  .filter((_, i) => i !== index)
                  .map((e) => e.employeeId)
              );
              const availableEmployees = employees.filter(
                (emp) => !assignedElsewhere.has(emp.id)
              );

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <select
                      value={assignment.employeeId}
                      onChange={(e) => handleEmployeeChange(index, 'employeeId', e.target.value)}
                      className="input bg-background-muted border-border"
                      required
                    >
                      <option value="">Select Employee</option>
                      {availableEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-5">
                    <input
                      type="number"
                      placeholder="Target Value"
                      value={assignment.targetValue}
                      onChange={(e) => handleEmployeeChange(index, 'targetValue', e.target.value)}
                      className="input bg-background-muted border-border"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeEmployeeAssignment(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">Save KPI</button>
        </div>
      </form>
    </div>
  );
};

export default KpiFormPage;
