import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const employees = await prisma.employee.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { employeeId: { contains: search, mode: "insensitive" } },
            { designation: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
            { cnic: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { salaryConfig: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { basicSalary, ...employeeData } = body;

  // Auto-generate employeeId
  const lastEmployee = await prisma.employee.findFirst({
    orderBy: { createdAt: "desc" },
    select: { employeeId: true },
  });

  let nextNumber = 1;
  if (lastEmployee) {
    const match = lastEmployee.employeeId.match(/EMP(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  const employeeId = `EMP${String(nextNumber).padStart(3, "0")}`;

  const employee = await prisma.employee.create({
    data: {
      ...employeeData,
      employeeId,
    },
  });

  // If basicSalary is provided, create SalaryConfig
  if (basicSalary !== undefined && basicSalary !== null) {
    const workingDaysPerMonth = body.workingDaysPerMonth || 26;
    const perDaySalary = Number(basicSalary) / workingDaysPerMonth;

    await prisma.salaryConfig.create({
      data: {
        employeeId: employee.id,
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
    });
  }

  const result = await prisma.employee.findUnique({
    where: { id: employee.id },
    include: { salaryConfig: true },
  });

  return NextResponse.json(result, { status: 201 });
}
