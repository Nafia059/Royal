import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const record = await prisma.salaryRecord.findUnique({
    where: { id: params.id },
    include: {
      employee: true,
      payroll: true,
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
