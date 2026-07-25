import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const date = searchParams.get("date");

  const where: Record<string, string> = {};
  if (schoolId) where.schoolId = schoolId;
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (date) where.date = date;

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      student: { include: { user: { select: { name: true } } } },
      class: true,
      subject: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(attendance);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { records, schoolId, classId, subjectId, date } = body;

  const attendance = await prisma.$transaction(async (tx) => {
    const created = await tx.attendance.createMany({
      data: records.map((r: { studentId: string; status: string; remarks?: string }) => ({
        studentId: r.studentId,
        classId,
        subjectId,
        schoolId,
        date,
        status: r.status,
        remarks: r.remarks,
      })),
    });

    return created;
  });

  return NextResponse.json(attendance, { status: 201 });
}
