import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const schoolId = searchParams.get("schoolId");

  const where: Record<string, string> = {};
  if (classId) where.classId = classId;
  if (schoolId) where.schoolId = schoolId;

  const timetable = await prisma.timetable.findMany({
    where,
    include: {
      class: true,
      subject: true,
      teacher: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(timetable);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { classId, schoolId, entries } = body;

  const timetable = await prisma.$transaction(async (tx) => {
    await tx.timetable.deleteMany({ where: { classId, schoolId } });

    const created = await tx.timetable.createMany({
      data: entries.map((e: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        subjectId: string;
        teacherId: string;
      }) => ({
        classId,
        schoolId,
        dayOfWeek: e.dayOfWeek,
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
