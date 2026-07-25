"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  UserX,
  Save,
} from "lucide-react";

interface SalaryConfig {
  id: string;
  basicSalary: number;
  perDaySalary: number;
  workingDaysPerMonth: number;
  houseAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  providentFund: number;
  taxRate: number;
  otherDeductions: number;
  bonusPerDayPercent: number;
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  fatherName: string | null;
  cnic: string | null;
  designation: string;
  department: string;
  gender: string | null;
  mobile: string | null;
  email: string | null;
  joiningDate: string | null;
  bankName: string | null;
  bankAccount: string | null;
  isActive: boolean;
  salaryConfig: SalaryConfig | null;
}

const designations = [
  "Principal",
  "Vice Principal",
  "Teacher",
  "Assistant Teacher",
  "Librarian",
  "Lab Assistant",
  "Accountant",
  "Admin",
  "Peon",
  "Security Guard",
  "Driver",
  "Other",
];

const departments = [
  "Teaching Staff",
  "Administration",
  "Accounts",
  "IT",
  "Library",
  "Lab",
  "Transport",
  "Security",
  "Other",
];

const emptyForm = {
  fullName: "",
  fatherName: "",
  cnic: "",
  designation: "Teacher",
  department: "Teaching Staff",
  gender: "Male",
  mobile: "",
  email: "",
  joiningDate: "",
  bankName: "",
  bankAccount: "",
  basicSalary: "",
  workingDaysPerMonth: "26",
  houseAllowance: "",
  medicalAllowance: "",
  transportAllowance: "",
  otherAllowances: "",
  providentFund: "",
  taxRate: "",
  otherDeductions: "",
  bonusPerDayPercent: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/employees${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      const data = await res.json();
      setEmployees(data);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchEmployees(), 300);
    return () => clearTimeout(timeout);
  }, [fetchEmployees]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      fullName: emp.fullName,
      fatherName: emp.fatherName || "",
      cnic: emp.cnic || "",
      designation: emp.designation,
      department: emp.department,
      gender: emp.gender || "Male",
      mobile: emp.mobile || "",
      email: emp.email || "",
      joiningDate: emp.joiningDate
        ? new Date(emp.joiningDate).toISOString().split("T")[0]
        : "",
      bankName: emp.bankName || "",
      bankAccount: emp.bankAccount || "",
      basicSalary: emp.salaryConfig?.basicSalary?.toString() || "",
      workingDaysPerMonth: emp.salaryConfig?.workingDaysPerMonth?.toString() || "26",
      houseAllowance: emp.salaryConfig?.houseAllowance?.toString() || "",
      medicalAllowance: emp.salaryConfig?.medicalAllowance?.toString() || "",
      transportAllowance: emp.salaryConfig?.transportAllowance?.toString() || "",
      otherAllowances: emp.salaryConfig?.otherAllowances?.toString() || "",
      providentFund: emp.salaryConfig?.providentFund?.toString() || "",
      taxRate: emp.salaryConfig?.taxRate?.toString() || "",
      otherDeductions: emp.salaryConfig?.otherDeductions?.toString() || "",
      bonusPerDayPercent: emp.salaryConfig?.bonusPerDayPercent?.toString() || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        fullName: form.fullName,
        fatherName: form.fatherName || null,
        cnic: form.cnic || null,
        designation: form.designation,
        department: form.department,
        gender: form.gender,
        mobile: form.mobile || null,
        email: form.email || null,
        joiningDate: form.joiningDate ? new Date(form.joiningDate) : null,
        bankName: form.bankName || null,
        bankAccount: form.bankAccount || null,
        basicSalary: form.basicSalary ? Number(form.basicSalary) : null,
        workingDaysPerMonth: Number(form.workingDaysPerMonth) || 26,
        houseAllowance: Number(form.houseAllowance) || 0,
        medicalAllowance: Number(form.medicalAllowance) || 0,
        transportAllowance: Number(form.transportAllowance) || 0,
        otherAllowances: Number(form.otherAllowances) || 0,
        providentFund: Number(form.providentFund) || 0,
        taxRate: Number(form.taxRate) || 0,
        otherDeductions: Number(form.otherDeductions) || 0,
        bonusPerDayPercent: Number(form.bonusPerDayPercent) || 0,
      };

      const url = editingId ? `/api/employees/${editingId}` : "/api/employees";
      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setModalOpen(false);
      fetchEmployees();
    } catch {
      alert("Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch {
      alert("Failed to delete employee");
    } finally {
      setDeleting(null);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        role="admin"
        user={{ fullName: "Admin", role: "admin" }}
      />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Employee Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage all school employees and their information
                </p>
              </div>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <UserX className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium">No employees found</p>
                <p className="text-sm">Add your first employee to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3">Employee ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Designation</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Mobile</th>
                      <th className="px-4 py-3">Salary</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {emp.employeeId}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {emp.fullName}
                            </p>
                            {emp.fatherName && (
                              <p className="text-xs text-gray-500">
                                S/O {emp.fatherName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {emp.designation}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {emp.department}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {emp.mobile || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {emp.salaryConfig ? (
                            <span className="text-green-700 font-medium">
                              {formatCurrency(emp.salaryConfig.basicSalary)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Not configured
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              emp.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {emp.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(emp)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              disabled={deleting === emp.id}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === emp.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Employee" : "Add Employee"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => updateField("fatherName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNIC
                  </label>
                  <input
                    type="text"
                    value={form.cnic}
                    onChange={(e) => updateField("cnic", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="xxxxx-xxxxxxx-x"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation *
                  </label>
                  <select
                    value={form.designation}
                    onChange={(e) => updateField("designation", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {designations.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => updateField("joiningDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account
                  </label>
                  <input
                    type="text"
                    value={form.bankAccount}
                    onChange={(e) => updateField("bankAccount", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Salary Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Salary
                    </label>
                    <input
                      type="number"
                      value={form.basicSalary}
                      onChange={(e) => updateField("basicSalary", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Days/Month
                    </label>
                    <input
                      type="number"
                      value={form.workingDaysPerMonth}
                      onChange={(e) =>
                        updateField("workingDaysPerMonth", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Allowance
                    </label>
                    <input
                      type="number"
                      value={form.houseAllowance}
                      onChange={(e) =>
                        updateField("houseAllowance", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Allowance
                    </label>
                    <input
                      type="number"
                      value={form.medicalAllowance}
                      onChange={(e) =>
                        updateField("medicalAllowance", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Allowance
                    </label>
                    <input
                      type="number"
                      value={form.transportAllowance}
                      onChange={(e) =>
                        updateField("transportAllowance", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Allowances
                    </label>
                    <input
                      type="number"
                      value={form.otherAllowances}
                      onChange={(e) =>
                        updateField("otherAllowances", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provident Fund
                    </label>
                    <input
                      type="number"
                      value={form.providentFund}
                      onChange={(e) =>
                        updateField("providentFund", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={form.taxRate}
                      onChange={(e) => updateField("taxRate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      value={form.otherDeductions}
                      onChange={(e) =>
                        updateField("otherDeductions", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bonus (%)
                    </label>
                    <input
                      type="number"
                      value={form.bonusPerDayPercent}
                      onChange={(e) =>
                        updateField("bonusPerDayPercent", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.fullName}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
