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
  if (classId) where.assignedClassId = classId;

  const tasks = await prisma.homeTask.findMany({
    where,
    include: {
      assignedClass: true,
      subject: true,
      teacher: { include: { user: { select: { username: true } } } },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { title, description, dueDate, classId, subjectId, teacherId } = body;

  const task = await prisma.homeTask.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      assignedClassId: classId,
      subjectId,
      assignedById: teacherId,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
