"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { formatCurrency, getMonthName } from "@/lib/utils";
import {
  Wallet,
  Loader2,
  Calculator,
  TrendingUp,
  TrendingDown,
  Banknote,
  Users,
  AlertCircle,
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  designation: string;
  isActive: boolean;
  salaryConfig: {
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
  } | null;
}

interface AttendanceEntry {
  presentDays: number;
  absentDays: number;
  allowedLeaves: number;
  lateDays: number;
}

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  allowedLeaves: number;
  lateDays: number;
  basicSalary: number;
  perDaySalary: number;
  grossSalary: number;
  leaveDeduction: number;
  lateDeduction: number;
  bonus: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  employee: {
    employeeId: string;
    fullName: string;
    designation: string;
  };
}

interface Payroll {
  id: string;
  month: number;
  year: number;
  status: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  records: SalaryRecord[];
}

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function GenerateSalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceEntry>
  >({});
  const [result, setResult] = useState<{
    payroll: Payroll;
    records: SalaryRecord[];
    summary: { employeeCount: number; totalGross: number; totalDeductions: number; totalNet: number };
  } | null>(null);
  const [viewMode, setViewMode] = useState<"attendance" | "results">(
    "attendance"
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.filter((e: Employee) => e.salaryConfig && e.isActive));
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const initial: Record<string, AttendanceEntry> = {};
    employees.forEach((emp) => {
      const workingDays = emp.salaryConfig?.workingDaysPerMonth || 26;
      initial[emp.employeeId] = {
        presentDays: workingDays,
        absentDays: 0,
        allowedLeaves: 0,
        lateDays: 0,
      };
    });
    setAttendance(initial);
  }, [employees]);

  const updateAttendance = (
    empId: string,
    field: keyof AttendanceEntry,
    value: number
  ) => {
    setAttendance((prev) => {
      const entry = { ...prev[empId] };
      const workingDays =
        employees.find((e) => e.employeeId === empId)?.salaryConfig
          ?.workingDaysPerMonth || 26;

      entry[field] = Math.max(0, value);

      if (field === "presentDays") {
        entry.absentDays = Math.max(0, workingDays - value - entry.allowedLeaves);
      }

      return { ...prev, [empId]: entry };
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/salary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, attendance }),
      });
      const data = await res.json();
      setResult(data);
      setViewMode("results");
    } catch {
      alert("Failed to generate salary");
    } finally {
      setGenerating(false);
    }
  };

  const totalGross = result?.records.reduce((s, r) => s + r.grossSalary, 0) || 0;
  const totalDeductions =
    result?.records.reduce((s, r) => s + r.totalDeductions, 0) || 0;
  const totalNet = result?.records.reduce((s, r) => s + r.netSalary, 0) || 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" user={{ fullName: "Admin", role: "admin" }} />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-emerald-600 p-2">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Generate Monthly Salary
              </h1>
              <p className="text-sm text-gray-500">
                Enter attendance and generate salary for the month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={currentYear - 2 + i} value={currentYear - 2 + i}>
                      {currentYear - 2 + i}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || employees.length === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                {generating ? "Generating..." : "Generate Salary"}
              </button>
              {result && (
                <button
                  onClick={() =>
                    setViewMode(viewMode === "attendance" ? "results" : "attendance")
                  }
                  className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  {viewMode === "attendance"
                    ? "View Results"
                    : "Edit Attendance"}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium">No employees with salary config</p>
              <p className="text-sm">
                Configure salary for employees first
              </p>
            </div>
          ) : viewMode === "attendance" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">
                  Attendance Entry - {getMonthName(month)} {year}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Absent days are auto-calculated: Working Days - Present - Leaves
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3 text-center">
                        Working Days
                      </th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Leaves</th>
                      <th className="px-4 py-3 text-center">Late</th>
                      <th className="px-4 py-3 text-center">Absent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((emp) => {
                      const att = attendance[emp.employeeId] || {
                        presentDays: 0,
                        absentDays: 0,
                        allowedLeaves: 0,
                        lateDays: 0,
                      };
                      const workingDays =
                        emp.salaryConfig?.workingDaysPerMonth || 26;
                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {emp.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {emp.employeeId} &middot; {emp.designation}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {workingDays}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max={workingDays}
                              value={att.presentDays}
                              onChange={(e) =>
                                updateAttendance(
                                  emp.employeeId,
                                  "presentDays",
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={att.allowedLeaves}
                              onChange={(e) =>
                                updateAttendance(
                                  emp.employeeId,
                                  "allowedLeaves",
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={att.lateDays}
                              onChange={(e) =>
                                updateAttendance(
                                  emp.employeeId,
                                  "lateDays",
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                att.absentDays > 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {att.absentDays}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : result ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Employees</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.records.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-100 p-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Gross</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(totalGross)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Deductions</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(totalDeductions)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Banknote className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Net Payable</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(totalNet)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Salary Results - {getMonthName(month)} {year}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="px-4 py-3">Emp ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-right">Basic</th>
                        <th className="px-4 py-3 text-right">Gross</th>
                        <th className="px-4 py-3 text-right">Bonus</th>
                        <th className="px-4 py-3 text-right">Leave Ded</th>
                        <th className="px-4 py-3 text-right">Late Ded</th>
                        <th className="px-4 py-3 text-right">Total Ded</th>
                        <th className="px-4 py-3 text-right">Net Salary</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.records.map((rec) => (
                        <tr
                          key={rec.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {rec.employee.employeeId}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {rec.employee.fullName}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {formatCurrency(rec.basicSalary)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {formatCurrency(rec.grossSalary)}
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            {rec.bonus > 0 ? `+${formatCurrency(rec.bonus)}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-red-600">
                            {rec.leaveDeduction > 0
                              ? formatCurrency(rec.leaveDeduction)
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-red-600">
                            {rec.lateDeduction > 0
                              ? formatCurrency(rec.lateDeduction)
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-red-600 font-medium">
                            {formatCurrency(rec.totalDeductions)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {formatCurrency(rec.netSalary)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                              {result.payroll.status || "draft"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
