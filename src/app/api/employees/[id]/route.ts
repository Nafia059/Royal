import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { salaryConfig: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(employee);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const body = await request.json();
  const { basicSalary, ...employeeData } = body;

  await prisma.employee.update({ where: { id }, data: employeeData });

  if (basicSalary !== undefined && basicSalary !== null) {
    const workingDaysPerMonth = body.workingDaysPerMonth || 26;
    const perDaySalary = Number(basicSalary) / workingDaysPerMonth;

    await prisma.salaryConfig.upsert({
      where: { employeeId: id },
      create: {
        employeeId: id,
        basicSalary: Number(basicSalary),
        perDaySalary,
        workingDaysPerMonth,
        houseAllowance: body.houseAllowance || 0,
        medicalAllowance: body.medicalAllowance || 0,
        transportAllowance: body.transportAllowance || 0,
        otherAllowances: body.otherAllowances || 0,
        providentFund: body.providentFund || 0,
        taxRate: body.taxRate || 0,
        otherDeductions: body.otherDeductions || 0,
        bonusPerDayPercent: body.bonusPerDayPercent || 0,
      },
      update: {
        basicSalary: Number(basicSalary),
        perDaySalary,
        workingDaysPerMonth,
        houseAllowance: body.houseAllowance ?? undefined,
        medicalAllowance: body.medicalAllowance ?? undefined,
        transportAllowance: body.transportAllowance ?? undefined,
        otherAllowances: body.otherAllowances ?? undefined,
        providentFund: body.providentFund ?? undefined,
        taxRate: body.taxRate ?? undefined,
        otherDeductions: body.otherDeductions ?? undefined,
        bonusPerDayPercent: body.bonusPerDayPercent ?? undefined,
      },
    });
  }

  const result = await prisma.employee.findUnique({
    where: { id },
    include: { salaryConfig: true },
  });

  return NextResponse.json(result);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ message: "Employee deleted" });
}
