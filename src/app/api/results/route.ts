import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (examId) where.examId = examId;
  if (studentId) where.studentId = studentId;
  if (classId) {
    const exams = await prisma.exam.findMany({ where: { assignedClassId: classId }, select: { id: true } });
    where.examId = { in: exams.map((e) => e.id) };
  }

  const results = await prisma.result.findMany({
    where,
    include: {
      student: { include: { user: { select: { username: true } } } },
      exam: { include: { subject: true, assignedClass: true } },
    },
  });

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { records, examId } = body;

  const results = await prisma.$transaction(async (tx) => {
    const created = await tx.result.createMany({
      data: records.map((r: { studentId: string; marksObtained: number }) => ({
        studentId: r.studentId,
        examId,
        marksObtained: r.marksObtained,
      })),
    });

    return created;
  });

  return NextResponse.json(results, { status: 201 });
}
