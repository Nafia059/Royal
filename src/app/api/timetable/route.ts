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

  const timetable = await prisma.timetableSlot.findMany({
    where,
    include: {
      assignedClass: true,
      subject: true,
      teacher: { include: { user: { select: { username: true } } } },
    },
    orderBy: [{ day: "asc" }, { periodNumber: "asc" }],
  });

  return NextResponse.json(timetable);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { classId, entries } = body;

  const timetable = await prisma.$transaction(async (tx) => {
    await tx.timetableSlot.deleteMany({ where: { assignedClassId: classId } });

    const created = await tx.timetableSlot.createMany({
      data: entries.map((e: {
        day: string;
        periodNumber: number;
        startTime: string;
        endTime: string;
        subjectId: string;
        teacherId: string;
      }) => ({
        assignedClassId: classId,
        day: e.day,
        periodNumber: e.periodNumber,
        startTime: e.startTime,
        endTime: e.endTime,
        subjectId: e.subjectId,
        teacherId: e.teacherId,
      })),
    });

    return created;
  });

  return NextResponse.json(timetable, { status: 201 });
}
