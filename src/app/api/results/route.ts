import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");
  const examId = searchParams.get("examId");
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");

  const where: Record<string, string> = {};
  if (schoolId) where.schoolId = schoolId;
  if (examId) where.examId = examId;
  if (studentId) where.studentId = studentId;
  if (classId) where.classId = classId;

  const results = await prisma.result.findMany({
    where,
    include: {
      student: { include: { user: { select: { username: true } } } },
      exam: true,
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { records, examId, schoolId, classId, subjectId } = body;

  const results = await prisma.$transaction(async (tx) => {
    const created = await tx.result.createMany({
      data: records.map((r: { studentId: string; marksObtained: number; remarks?: string }) => ({
        studentId: r.studentId,
        examId,
        subjectId,
        classId,
        schoolId,
        marksObtained: r.marksObtained,
        remarks: r.remarks,
      })),
    });

    return created;
  });

  return NextResponse.json(results, { status: 201 });
}
