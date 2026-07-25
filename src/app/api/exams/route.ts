import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");
  const classId = searchParams.get("classId");

  const where: Record<string, string> = {};
  if (schoolId) where.schoolId = schoolId;
  if (classId) where.classId = classId;

  const exams = await prisma.exam.findMany({
    where,
    include: { class: true, subject: true, results: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(exams);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, date, classId, subjectId, schoolId, totalMarks, passingMarks, type } = body;

  const exam = await prisma.exam.create({
    data: {
      name,
      date: new Date(date),
      classId,
      subjectId,
      schoolId,
      totalMarks,
      passingMarks,
      type,
    },
  });

  return NextResponse.json(exam, { status: 201 });
}
