"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { formatCurrency, getMonthName } from "@/lib/utils";
import {
  Receipt,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Printer,
  DollarSign,
} from "lucide-react";

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
  houseAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  providentFund: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  payStatus: string;
  employee: {
    id: string;
    employeeId: string;
    fullName: string;
    designation: string;
    department: string;
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
  createdAt: string;
}

function openPrintSlip(record: SalaryRecord, month: number, year: number) {
  const monthName = getMonthName(month);

  const earningsRows = [
    { label: "Basic Salary", amount: record.basicSalary },
    { label: "House Allowance", amount: record.houseAllowance },
    { label: "Medical Allowance", amount: record.medicalAllowance },
    { label: "Transport Allowance", amount: record.transportAllowance },
    { label: "Other Allowances", amount: record.otherAllowances },
    { label: "Bonus", amount: record.bonus },
  ].filter((r) => r.amount > 0);

  const deductionsRows = [
    { label: "Leave Deduction", amount: record.leaveDeduction },
    { label: "Late Deduction", amount: record.lateDeduction },
    { label: "Provident Fund", amount: record.providentFund },
    { label: "Tax Deduction", amount: record.taxDeduction },
    { label: "Other Deductions", amount: record.otherDeductions },
  ].filter((r) => r.amount > 0);

  const totalEarnings = earningsRows.reduce((s, r) => s + r.amount, 0);
  const totalDeductions = deductionsRows.reduce((s, r) => s + r.amount, 0);

  const slipHtml = `
<!DOCTYPE html>
<html>
<head>
<title>Salary Slip - ${record.employee.employeeId}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; }
  .slip { max-width: 700px; margin: 0 auto; border: 2px solid #333; }
  .header { text-align: center; padding: 20px; border-bottom: 2px solid #333; }
  .header h1 { font-size: 20px; letter-spacing: 1px; color: #1a1a1a; }
  .header p { font-size: 12px; color: #555; margin-top: 4px; }
  .info { display: grid; grid-template-columns: 1fr 1fr; padding: 15px 20px; border-bottom: 1px solid #ddd; gap: 8px; font-size: 13px; }
  .info div { display: flex; gap: 6px; }
  .info .label { font-weight: 600; min-width: 100px; }
  .tables { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .col { padding: 15px 20px; }
  .col:first-child { border-right: 1px solid #ddd; }
  .col h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #333; }
  table { width: 100%; font-size: 12px; }
  td { padding: 4px 0; }
  td:last-child { text-align: right; font-family: monospace; }
  .total-row { font-weight: 700; border-top: 1px solid #333; padding-top: 4px; margin-top: 4px; }
  .net { text-align: center; padding: 15px 20px; border-top: 2px solid #333; background: #f8f8f8; }
  .net .amount { font-size: 22px; font-weight: 700; color: #1a1a1a; }
  .net .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 30px 20px 20px; border-top: 1px solid #ddd; }
  .sig { text-align: center; }
  .sig .line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 11px; font-weight: 600; }
</style>
</head>
<body>
<div class="slip">
  <div class="header">
    <h1>ROYAL INTERNATIONAL SCHOOL SYSTEM</h1>
    <p>Monthly Salary Slip</p>
  </div>
  <div class="info">
    <div><span class="label">Employee ID:</span> ${record.employee.employeeId}</div>
    <div><span class="label">Month/Year:</span> ${monthName} ${year}</div>
    <div><span class="label">Name:</span> ${record.employee.fullName}</div>
    <div><span class="label">Designation:</span> ${record.employee.designation}</div>
    <div><span class="label">Department:</span> ${record.employee.department}</div>
    <div><span class="label">Working Days:</span> ${record.workingDays}</div>
    <div><span class="label">Present:</span> ${record.presentDays}</div>
    <div><span class="label">Absent:</span> ${record.absentDays}</div>
  </div>
  <div class="tables">
    <div class="col">
      <h3>Earnings</h3>
      <table>
        ${earningsRows
          .map(
            (r) =>
              `<tr><td>${r.label}</td><td>${formatCurrency(r.amount)}</td></tr>`
          )
          .join("")}
        <tr class="total-row">
          <td>Total Earnings</td>
          <td>${formatCurrency(totalEarnings)}</td>
        </tr>
      </table>
    </div>
    <div class="col">
      <h3>Deductions</h3>
      <table>
        ${deductionsRows
          .map(
            (r) =>
              `<tr><td>${r.label}</td><td>${formatCurrency(r.amount)}</td></tr>`
          )
          .join("")}
        <tr class="total-row">
          <td>Total Deductions</td>
          <td>${formatCurrency(totalDeductions)}</td>
        </tr>
      </table>
    </div>
  </div>
  <div class="net">
    <div class="label">Net Salary</div>
    <div class="amount">${formatCurrency(record.netSalary)}</div>
  </div>
  <div class="signatures">
    <div class="sig"><div class="line">Accountant</div></div>
    <div class="sig"><div class="line">V. Principal</div></div>
    <div class="sig"><div class="line">C.E.O</div></div>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=800,height=600");
  if (win) {
    win.document.write(slipHtml);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const fetchPayrolls = useCallback(async () => {
    try {
      const res = await fetch("/api/payroll");
      const data = await res.json();
      setPayrolls(data);
    } catch {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    try {
      await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid", id }),
      });
      fetchPayrolls();
    } catch {
      alert("Failed to mark as paid");
    } finally {
      setMarkingPaid(null);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    finalized: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" user={{ fullName: "Admin", role: "admin" }} />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-orange-600 p-2">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payroll History
              </h1>
              <p className="text-sm text-gray-500">
                View and manage monthly payrolls
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : payrolls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Receipt className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium">No payroll records yet</p>
              <p className="text-sm">
                Generate salary first to see payroll history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payrolls.map((payroll) => {
                const isExpanded = expanded === payroll.id;
                return (
                  <div
                    key={payroll.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpanded(isExpanded ? null : payroll.id)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getMonthName(payroll.month)} {payroll.year}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {payroll.employeeCount} employees &middot;{" "}
                            {formatCurrency(payroll.totalNet)} net payable
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            statusColors[payroll.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payroll.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 text-sm">
                          <div>
                            <span className="text-gray-500">Total Gross:</span>{" "}
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(payroll.totalGross)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Total Deductions:
                            </span>{" "}
                            <span className="font-medium text-red-600">
                              {formatCurrency(payroll.totalDeductions)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Total Net:
                            </span>{" "}
                            <span className="font-medium text-blue-600">
                              {formatCurrency(payroll.totalNet)}
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-4 py-3">Emp ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 text-right">Gross</th>
                                <th className="px-4 py-3 text-right">Deductions</th>
                                <th className="px-4 py-3 text-right">Net</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {payroll.records.map((rec) => (
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
                                    {formatCurrency(rec.grossSalary)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-red-600">
                                    {formatCurrency(rec.totalDeductions)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                                    {formatCurrency(rec.netSalary)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        rec.payStatus === "paid"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {rec.payStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() =>
                                        openPrintSlip(
                                          rec,
                                          payroll.month,
                                          payroll.year
                                        )
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                      <Printer className="h-3.5 w-3.5" />
                                      Print Slip
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {payroll.status !== "paid" && (
                          <div className="p-4 border-t border-gray-200">
                            <button
                              onClick={() => handleMarkPaid(payroll.id)}
                              disabled={markingPaid === payroll.id}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {markingPaid === payroll.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <DollarSign className="h-4 w-4" />
                              )}
                              Mark as Paid
                            </button>
                          </div>
                        )}
                        {payroll.status === "paid" && (
                          <div className="p-4 border-t border-gray-200 flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Payment completed
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
