import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!prisma) {
    return NextResponse.json([], { status: 503 });
  }

  const payrolls = await prisma.monthlyPayroll.findMany({
    include: {
      records: {
        include: { employee: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(payrolls);
}

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { action, id, month, year } = body;

  if (action === "finalize") {
    const payrollId = id;
    if (!payrollId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const payroll = await prisma.monthlyPayroll.update({
      where: { id: payrollId },
      data: { status: "finalized" },
    });

    return NextResponse.json(payroll);
  }

  if (action === "mark_paid") {
    const payrollId = id;
    if (!payrollId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const payroll = await prisma.monthlyPayroll.update({
      where: { id: payrollId },
      data: { status: "paid" },
    });

    // Mark all related salary records as paid
    await prisma.salaryRecord.updateMany({
      where: { payrollId },
      data: { payStatus: "paid", payDate: new Date() },
    });

    return NextResponse.json(payroll);
  }

  // Default: finalize by month/year
  if (month && year) {
    const payroll = await prisma.monthlyPayroll.findUnique({
      where: {
        month_year: { month: parseInt(month), year: parseInt(year) },
      },
    });

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }

    const updated = await prisma.monthlyPayroll.update({
      where: { id: payroll.id },
      data: { status: body.status || "finalized" },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json(
    { error: "action (finalize|mark_paid) with id, or month+year with status is required" },
    { status: 400 }
  );
}
