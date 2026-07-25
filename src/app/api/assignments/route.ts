import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const subjectId = searchParams.get("subjectId");
  const classId = searchParams.get("classId");

  const where: Record<string, string> = {};
  if (teacherId) where.teacherId = teacherId;
  if (subjectId) where.subjectId = subjectId;
  if (classId) where.assignedClassId = classId;

  const assignments = await prisma.teacherSubjectAssignment.findMany({
    where,
    include: {
      teacher: { include: { user: { select: { username: true, email: true } } } },
      subject: true,
      assignedClass: true,
    },
  });

  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { teacherId, subjectId, classId } = body;

  const assignment = await prisma.teacherSubjectAssignment.create({
    data: { teacherId, subjectId, assignedClassId: classId },
    include: { teacher: { include: { user: { select: { username: true } } } }, subject: true, assignedClass: true },
  });

  return NextResponse.json(assignment, { status: 201 });
}
