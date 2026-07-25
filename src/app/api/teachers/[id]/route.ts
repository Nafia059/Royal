import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, email: true } },
      assignments: { include: { subject: true, assignedClass: true } },
    },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  return NextResponse.json(teacher);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const { username, email, phone, address } = body;

  const teacher = await prisma.$transaction(async (tx) => {
    const profile = await tx.teacherProfile.update({
      where: { id },
      data: { phone, address },
    });

    if ((username || email) && profile.userId) {
      await tx.user.update({
        where: { id: profile.userId },
        data: { ...(username && { username }), ...(email && { email }) },
      });
    }

    return profile;
  });

  return NextResponse.json(teacher);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const profile = await prisma.teacherProfile.findUnique({ where: { id } });

  if (!profile) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.teacherSubjectAssignment.deleteMany({ where: { teacherId: id } });
    await tx.exam.updateMany({ where: { createdById: id }, data: { createdById: null } });
    await tx.result.updateMany({ where: { uploadedById: id }, data: { uploadedById: null } });
    await tx.homeTask.updateMany({ where: { assignedById: id }, data: { assignedById: null } });
    await tx.attendance.updateMany({ where: { markedById: id }, data: { markedById: null } });
    await tx.timetableSlot.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
    await tx.class.updateMany({ where: { classTeacherId: id }, data: { classTeacherId: null } });
    if (profile.userId) {
      await tx.user.delete({ where: { id: profile.userId } });
    } else {
      await tx.teacherProfile.delete({ where: { id } });
    }
  });

  return NextResponse.json({ success: true });
}
