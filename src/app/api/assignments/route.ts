import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");
  const teacherId = searchParams.get("teacherId");
  const subjectId = searchParams.get("subjectId");
  const classId = searchParams.get("classId");

  const where: Record<string, string> = {};
  if (schoolId) where.schoolId = schoolId;
  if (teacherId) where.teacherId = teacherId;
  if (subjectId) where.subjectId = subjectId;
  if (classId) where.classId = classId;

  const assignments = await prisma.teacherSubjectAssignment.findMany({
    where,
    include: {
      teacher: { include: { user: { select: { name: true, email: true } } } },
      subject: true,
      class: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { teacherId, subjectId, classId, schoolId } = body;

  const assignment = await prisma.teacherSubjectAssignment.create({
    data: { teacherId, subjectId, classId, schoolId },
    include: { teacher: { include: { user: { select: { name: true } } } }, subject: true, class: true },
  });

  return NextResponse.json(assignment, { status: 201 });
}
