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
  const { name, code } = body;

  const subject = await prisma.subject.update({
    where: { id },
    data: { name, code },
  });

  return NextResponse.json(subject);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;

  await prisma.$transaction(async (tx) => {
    await tx.attendance.deleteMany({ where: { subjectId: id } });
    await tx.teacherSubjectAssignment.deleteMany({ where: { subjectId: id } });
    await tx.result.deleteMany({ where: { exam: { subjectId: id } } });
    await tx.exam.deleteMany({ where: { subjectId: id } });
    await tx.homeTask.deleteMany({ where: { subjectId: id } });
    await tx.timetableSlot.deleteMany({ where: { subjectId: id } });
    await tx.subject.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
