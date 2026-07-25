import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AttendanceEntry {
  presentDays: number;
  absentDays: number;
  allowedLeaves: number;
  lateDays: number;
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { month, year, attendance } = body as {
    month: number;
    year: number;
    attendance: Record<string, AttendanceEntry>;
  };

  if (!month || !year || !attendance) {
    return NextResponse.json(
      { error: "month, year, and attendance are required" },
      { status: 400 }
    );
  }

  const activeEmployees = await prisma.employee.findMany({
    where: { isActive: true },
    include: { salaryConfig: true },
  });

  const salaryRecords = [];
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  for (const emp of activeEmployees) {
    const config = emp.salaryConfig;
    if (!config) continue;

    const att = attendance[emp.employeeId] || {
      presentDays: 0,
      absentDays: 0,
      allowedLeaves: 0,
      lateDays: 0,
    };

    const workingDays = config.workingDaysPerMonth;
    const perDaySalary = config.perDaySalary;

    const totalAllowances =
      config.houseAllowance +
      config.medicalAllowance +
      config.transportAllowance +
      config.otherAllowances;

    const grossSalary = perDaySalary * workingDays + totalAllowances;

    const leaveDeduction = att.absentDays * perDaySalary;
    const lateDeduction = att.lateDays * (perDaySalary * 0.5);

    // Bonus: if 0 absent days and bonusPerDayPercent > 0
    const bonus =
      att.absentDays === 0 && config.bonusPerDayPercent > 0
        ? grossSalary * (config.bonusPerDayPercent / 100)
        : 0;

    const taxDeduction = perDaySalary * workingDays * (config.taxRate / 100);

    const totalEmpDeductions =
      leaveDeduction +
      lateDeduction +
      taxDeduction +
      config.providentFund +
      config.otherDeductions;

    const netSalary = grossSalary + bonus - totalEmpDeductions;

    totalGross += grossSalary;
    totalDeductions += totalEmpDeductions;
    totalNet += netSalary;

    // Upsert SalaryRecord
    const record = await prisma.salaryRecord.upsert({
      where: {
        employeeId_month_year: {
          employeeId: emp.id,
          month,
          year,
        },
      },
      create: {
        employeeId: emp.id,
        month,
        year,
        workingDays,
        presentDays: att.presentDays,
        absentDays: att.absentDays,
        allowedLeaves: att.allowedLeaves,
        lateDays: att.lateDays,
        basicSalary: config.basicSalary,
        perDaySalary,
        grossSalary,
        leaveDeduction,
        lateDeduction,
        bonus,
        houseAllowance: config.houseAllowance,
        medicalAllowance: config.medicalAllowance,
        transportAllowance: config.transportAllowance,
        otherAllowances: config.otherAllowances,
        totalAllowances,
        providentFund: config.providentFund,
        taxDeduction,
        otherDeductions: config.otherDeductions,
        totalDeductions: totalEmpDeductions,
        netSalary,
      },
      update: {
        workingDays,
        presentDays: att.presentDays,
        absentDays: att.absentDays,
        allowedLeaves: att.allowedLeaves,
        lateDays: att.lateDays,
        basicSalary: config.basicSalary,
        perDaySalary,
        grossSalary,
        leaveDeduction,
        lateDeduction,
        bonus,
        houseAllowance: config.houseAllowance,
        medicalAllowance: config.medicalAllowance,
        transportAllowance: config.transportAllowance,
        otherAllowances: config.otherAllowances,
        totalAllowances,
        providentFund: config.providentFund,
        taxDeduction,
        otherDeductions: config.otherDeductions,
        totalDeductions: totalEmpDeductions,
        netSalary,
      },
    });

    salaryRecords.push(record);
  }

  // Upsert MonthlyPayroll summary
  const payroll = await prisma.monthlyPayroll.upsert({
    where: {
      month_year: { month, year },
    },
    create: {
      month,
      year,
      status: "draft",
      totalGross,
      totalDeductions,
      totalNet,
      employeeCount: salaryRecords.length,
    },
    update: {
      totalGross,
      totalDeductions,
      totalNet,
      employeeCount: salaryRecords.length,
    },
  });

  // Link salary records to payroll
  for (const record of salaryRecords) {
    await prisma.salaryRecord.update({
      where: { id: record.id },
      data: { payrollId: payroll.id },
    });
  }

  return NextResponse.json({
    payroll,
    records: salaryRecords,
    summary: {
      employeeCount: salaryRecords.length,
      totalGross,
      totalDeductions,
      totalNet,
    },
  }, { status: 201 });
}

export async function GET(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (month && year) {
    const payroll = await prisma.monthlyPayroll.findUnique({
      where: {
        month_year: { month: parseInt(month), year: parseInt(year) },
      },
      include: {
        records: {
          include: { employee: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(payroll || null);
  }

  const payrolls = await prisma.monthlyPayroll.findMany({
    include: {
      records: {
        include: { employee: true },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(payrolls);
}
