"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { formatCurrency } from "@/lib/utils";
import {
  Calculator,
  Plus,
  Pencil,
  X,
  Loader2,
  ClipboardList,
  Save,
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  designation: string;
}

interface SalaryConfigRecord {
  id: string;
  employeeId: string;
  employee: Employee;
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

const emptyForm = {
  employeeId: "",
  basicSalary: "",
  workingDaysPerMonth: "26",
  houseAllowance: "0",
  medicalAllowance: "0",
  transportAllowance: "0",
  otherAllowances: "0",
  providentFund: "0",
  taxRate: "0",
  otherDeductions: "0",
  bonusPerDayPercent: "0",
};

export default function SalaryConfigPage() {
  const [configs, setConfigs] = useState<SalaryConfigRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [configsRes, empRes] = await Promise.all([
        fetch("/api/salary-config"),
        fetch("/api/employees"),
      ]);
      const configsData = await configsRes.json();
      const empData = await empRes.json();
      setConfigs(configsData);
      setEmployees(empData);
    } catch {
      setConfigs([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (config: SalaryConfigRecord) => {
    setEditingId(config.id);
    setForm({
      employeeId: config.employeeId,
      basicSalary: config.basicSalary.toString(),
      workingDaysPerMonth: config.workingDaysPerMonth.toString(),
      houseAllowance: config.houseAllowance.toString(),
      medicalAllowance: config.medicalAllowance.toString(),
      transportAllowance: config.transportAllowance.toString(),
      otherAllowances: config.otherAllowances.toString(),
      providentFund: config.providentFund.toString(),
      taxRate: config.taxRate.toString(),
      otherDeductions: config.otherDeductions.toString(),
      bonusPerDayPercent: config.bonusPerDayPercent.toString(),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        employeeId: form.employeeId,
        basicSalary: Number(form.basicSalary),
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

      const method = editingId ? "PUT" : "POST";
      await fetch("/api/salary-config", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setModalOpen(false);
      fetchData();
    } catch {
      alert("Failed to save salary configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const calcTotalAllowances = (c: SalaryConfigRecord) =>
    c.houseAllowance + c.medicalAllowance + c.transportAllowance + c.otherAllowances;

  const calcTotalDeductions = (c: SalaryConfigRecord) =>
    c.providentFund + c.otherDeductions;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" user={{ fullName: "Admin", role: "admin" }} />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-600 p-2">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Salary Configuration
                </h1>
                <p className="text-sm text-gray-500">
                  Set up salary criteria for each employee
                </p>
              </div>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Configure Salary
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : configs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <ClipboardList className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium">No salary configs yet</p>
                <p className="text-sm">
                  Configure salary for your first employee
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3 text-right">Basic Salary</th>
                      <th className="px-4 py-3 text-right">Per Day Salary</th>
                      <th className="px-4 py-3 text-right">
                        Allowances Total
                      </th>
                      <th className="px-4 py-3 text-right">
                        Deductions Total
                      </th>
                      <th className="px-4 py-3 text-right">Bonus %</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {configs.map((config) => (
                      <tr
                        key={config.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {config.employee.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {config.employee.employeeId} &middot;{" "}
                              {config.employee.designation}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(config.basicSalary)}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-600 font-medium">
                          {formatCurrency(config.perDaySalary)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700">
                          {formatCurrency(calcTotalAllowances(config))}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatCurrency(calcTotalDeductions(config))}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {config.bonusPerDayPercent}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEdit(config)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
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
                {editingId ? "Edit Salary Config" : "Configure Salary"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  value={form.employeeId}
                  onChange={(e) => updateField("employeeId", e.target.value)}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Salary *
                  </label>
                  <input
                    type="number"
                    value={form.basicSalary}
                    onChange={(e) => updateField("basicSalary", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Allowances
                </h3>
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Deductions
                </h3>
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {form.basicSalary && form.workingDaysPerMonth && (
                <div className="bg-purple-50 rounded-lg p-3 mt-4">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">Per Day Salary:</span>{" "}
                    {formatCurrency(
                      Number(form.basicSalary) /
                        (Number(form.workingDaysPerMonth) || 26)
                    )}
                  </p>
                </div>
              )}
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
                disabled={saving || !form.employeeId || !form.basicSalary}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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
