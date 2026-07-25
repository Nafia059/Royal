import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");

  const where: Record<string, string> = {};
  if (classId) where.assignedClassId = classId;

  const exams = await prisma.exam.findMany({
    where,
    include: { assignedClass: true, subject: true, results: true },
    orderBy: { examDate: "desc" },
  });

  return NextResponse.json(exams);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, examDate, classId, subjectId, totalMarks, passingMarks } = body;

  const exam = await prisma.exam.create({
    data: {
      name,
      examDate: new Date(examDate),
      assignedClassId: classId,
      subjectId,
      totalMarks,
      passingMarks,
    },
  });

  return NextResponse.json(exam, { status: 201 });
}
