import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, section, teacherId } = body;

  const cls = await prisma.class.update({
    where: { id },
    data: { name, section, classTeacherId: teacherId || null },
  });

  return NextResponse.json(cls);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;

  const otherClass = await prisma.class.findFirst({ where: { id: { not: id } } });
  const fallbackId = otherClass?.id || null;

  await prisma.$transaction(async (tx) => {
    await tx.attendance.deleteMany({ where: { classId: id } });
    await tx.teacherSubjectAssignment.deleteMany({ where: { assignedClassId: id } });
    if (fallbackId) {
      await tx.exam.updateMany({ where: { assignedClassId: id }, data: { assignedClassId: fallbackId } });
      await tx.homeTask.updateMany({ where: { assignedClassId: id }, data: { assignedClassId: fallbackId } });
    } else {
      await tx.exam.deleteMany({ where: { assignedClassId: id } });
      await tx.homeTask.deleteMany({ where: { assignedClassId: id } });
    }
    await tx.timetableSlot.deleteMany({ where: { assignedClassId: id } });
    await tx.studentProfile.updateMany({ where: { classId: id }, data: { classId: null } });
    await tx.class.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
