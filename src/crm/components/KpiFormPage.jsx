import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, Trash2, Loader as LoaderIcon } from "lucide-react";
// If this import path differs in your project, adjust it accordingly
import SearchableSelect from "../../production/settings/SearchableSelect";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    {children}
  </div>
);

/**
 * KpiFormPage
 * - Create / Edit KPI
 * - Robust against empty API responses and re-renders
 * - Safer validation and controlled inputs
 */
const KpiFormPage = ({ item = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "NUMBER", // NUMBER | PERCENTAGE | CURRENCY | BOOLEAN | TEXT
    type: "DAILY", // DAILY | WEEKLY | MONTHLY | QUARTERLY | YEARLY | CUSTOM
    locationId: "",
    assignedEmployees: [], // [{ employeeId, targetValue:number }]
    ranges: [],
  });

  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load employees & locations
  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const [empRes, locRes] = await Promise.allSettled([
          axios.get(`${API_URL}/employees/all`, config),
          axios.get(`${API_URL}/locations`, config),
        ]);

        if (!isActive) return;

        const empData =
          empRes.status === "fulfilled" && Array.isArray(empRes.value?.data)
            ? empRes.value.data
            : [];
        const locData =
          locRes.status === "fulfilled" && Array.isArray(locRes.value?.data)
            ? locRes.value.data
            : [];

        setEmployees(empData);
        setLocations(locData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, []);

  // When editing, hydrate from `item`
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name ?? "",
        description: item.description ?? "",
        dataType: item.dataType ?? "NUMBER",
        type: item.type ?? "DAILY",
        locationId: item.locationId ?? "",
        assignedEmployees: // FIX: Correctly map employee ID from nested object
          Array.isArray(item.assignedEmployees)
            ? item.assignedEmployees.map((emp) => ({
                employeeId: emp.employee?.id,
                targetValue:
                  emp.targetValue === 0 || emp.targetValue
                    ? String(emp.targetValue)
                    : "",
              }))
            : [],
        ranges: Array.isArray(item.ranges) ? item.ranges : [],
      });
    } else {
      // reset to clean defaults
      setFormData({
        name: "",
        description: "",
        dataType: "NUMBER",
        type: "DAILY",
        locationId: item?.locationId || "", // FIX: Initialize locationId for new items
        assignedEmployees: [],
        ranges: [],
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelection = (selectedOption) => {
    const employeeId = selectedOption?.value ?? selectedOption; // support plain value too
    if (employeeId == null) return;

    setFormData((prev) => {
      const exists = prev.assignedEmployees.some(
        (a) => String(a.employeeId) === String(employeeId)
      );
      const nextAssignments = exists
        ? prev.assignedEmployees.filter(
            (a) => String(a.employeeId) !== String(employeeId)
          )
        : [...prev.assignedEmployees, { employeeId, targetValue: "" }];
      return { ...prev, assignedEmployees: nextAssignments };
    });
  };

  const handleTargetValueChange = (employeeId, value) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.map((a) =>
        String(a.employeeId) === String(employeeId)
          ? { ...a, targetValue: value }
          : a
      ),
    }));
  };

  const removeEmployeeAssignment = (employeeIdToRemove) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.filter(
        (a) => String(a.employeeId) !== String(employeeIdToRemove)
      ),
    }));
  };

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => ({
        value: emp.id,
        label: `${emp.firstName ?? ""} ${emp.lastName ?? ""}$${emp.employeeCode ? ` (${emp.employeeCode})` : ""}`.replace("$", ""),
      })),
    [employees]
  );

  const selectedEmployeeIds = useMemo(
    () => formData.assignedEmployees.map((a) => a.employeeId),
    [formData.assignedEmployees]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      alert("Please enter a KPI name.");
      return;
    }
    if (!formData.dataType) {
      alert("Please choose a data type.");
      return;
    }
    if (!formData.type) {
      alert("Please choose a KPI type.");
      return;
    }

    // Validate and clean assignments
    const seen = new Set();
    const cleanedAssignments = [];
    for (const a of formData.assignedEmployees) {
      const empId = String(a.employeeId ?? "").trim();
      if (!empId) continue;
      if (seen.has(empId)) {
        alert("Each employee can only be assigned once.");
        return;
      }
      seen.add(empId);

      // Treat empty string as invalid (must provide a number)
      if (a.targetValue === "") {
        alert(`Please enter a numeric target value for employee ID ${empId}.`);
        return;
      }
      const num = Number(a.targetValue);
      if (Number.isNaN(num)) {
        alert(`Please enter a numeric target value for employee ID ${empId}.`);
        return;
      }

      cleanedAssignments.push({ employeeId: empId, targetValue: num });
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      dataType: formData.dataType, // NUMBER | PERCENTAGE | CURRENCY | BOOLEAN | TEXT
      type: formData.type, // DAILY | WEEKLY | MONTHLY | QUARTERLY | YEARLY | CUSTOM
      locationId: formData.locationId || null,
      assignedEmployees: cleanedAssignments,
      ranges: Array.isArray(formData.ranges) ? formData.ranges : [],
    };

    try {
      setSubmitting(true);
      await Promise.resolve(onSave?.(payload));
    } catch (err) {
      console.error("onSave failed:", err);
      alert("Something went wrong while saving. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <LoaderIcon className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-4 p-6 border-b border-border flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-background-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          {item ? "Edit KPI" : "Create New KPI"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
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
                  <option value="PERCENTAGE">Percentage</option>
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

              <FormField label="Location (Optional)">
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="input bg-background-muted border-border"
                >
                  <option value="">Select Location</option>
                  {(locations || []).map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          {/* Assign Employees */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">
                Assign Employees & Targets
              </h3>
            </div>

            <div className="mb-4">
              <SearchableSelect
                options={employeeOptions}
                selected={selectedEmployeeIds}
                onSelect={handleEmployeeSelection}
                placeholder="Search and select employees..."
              />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border-t pt-4">
              {formData.assignedEmployees.length === 0 ? (
                <p className="text-foreground-muted text-sm">
                  No employees assigned yet.
                </p>
              ) : (
                formData.assignedEmployees.map((assignment) => {
                  const employee = (employees || []).find(
                    (emp) => String(emp.id) === String(assignment.employeeId)
                  );
                  return (
                    <div
                      key={assignment.employeeId}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-6 text-sm font-medium text-foreground truncate">
                        {employee
                          ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
                            `Employee ID: ${assignment.employeeId}`
                          : `Employee ID: ${assignment.employeeId}`}
                      </div>
                      <div className="col-span-5">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          placeholder="Target Value"
                          value={assignment.targetValue}
                          onChange={(e) =>
                            handleTargetValueChange(
                              assignment.employeeId,
                              e.target.value
                            )
                          }
                          className="input bg-background-muted border-border"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() =>
                            removeEmployeeAssignment(assignment.employeeId)
                          }
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                          title="Remove Employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-6 border-t border-border flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <LoaderIcon className="animate-spin" size={16} /> Saving...
              </span>
            ) : (
              "Save KPI"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KpiFormPage;
