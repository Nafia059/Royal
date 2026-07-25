import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!prisma) {
    return NextResponse.json([], { status: 503 });
  }

  const configs = await prisma.salaryConfig.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(configs);
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const {
    employeeId,
    basicSalary,
    workingDaysPerMonth = 26,
    houseAllowance = 0,
    medicalAllowance = 0,
    transportAllowance = 0,
    otherAllowances = 0,
    providentFund = 0,
    taxRate = 0,
    otherDeductions = 0,
    bonusPerDayPercent = 0,
  } = body;

  if (!employeeId || basicSalary === undefined) {
    return NextResponse.json(
      { error: "employeeId and basicSalary are required" },
      { status: 400 }
    );
  }

  const perDaySalary = Number(basicSalary) / workingDaysPerMonth;

  // Upsert: find existing config by employeeId (the unique field on SalaryConfig)
  const existing = await prisma.salaryConfig.findUnique({
    where: { employeeId },
  });

  let config;
  if (existing) {
    config = await prisma.salaryConfig.update({
      where: { employeeId },
      data: {
        basicSalary: Number(basicSalary),
        perDaySalary,
        workingDaysPerMonth,
        houseAllowance,
        medicalAllowance,
        transportAllowance,
        otherAllowances,
        providentFund,
        taxRate,
        otherDeductions,
        bonusPerDayPercent,
      },
    });
  } else {
    config = await prisma.salaryConfig.create({
      data: {
        employeeId,
        basicSalary: Number(basicSalary),
        perDaySalary,
        workingDaysPerMonth,
        houseAllowance,
        medicalAllowance,
        transportAllowance,
        otherAllowances,
        providentFund,
        taxRate,
        otherDeductions,
        bonusPerDayPercent,
      },
    });
  }

  return NextResponse.json(config, { status: existing ? 200 : 201 });
}

export async function PUT(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (data.basicSalary !== undefined && data.workingDaysPerMonth !== undefined) {
    data.perDaySalary = Number(data.basicSalary) / data.workingDaysPerMonth;
  } else if (data.basicSalary !== undefined) {
    const existing = await prisma.salaryConfig.findUnique({
      where: { id },
      select: { workingDaysPerMonth: true },
    });
    if (existing) {
      data.perDaySalary = Number(data.basicSalary) / existing.workingDaysPerMonth;
    }
  } else if (data.workingDaysPerMonth !== undefined) {
    const existing = await prisma.salaryConfig.findUnique({
      where: { id },
      select: { basicSalary: true },
    });
    if (existing) {
      data.perDaySalary = existing.basicSalary / data.workingDaysPerMonth;
    }
  }

  const config = await prisma.salaryConfig.update({
    where: { id },
    data,
  });

  return NextResponse.json(config);
}
