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
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: { studentClass: true, user: { select: { id: true, username: true, email: true } } },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
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
  const { username, email, classId, dateOfBirth, gender, phone, address } = body;

  const student = await prisma.$transaction(async (tx) => {
    const profile = await tx.studentProfile.update({
      where: { id },
      data: {
        classId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        phone,
        address,
      },
    });

    if ((username || email) && profile.userId) {
      await tx.user.update({
        where: { id: profile.userId },
        data: { ...(username && { username }), ...(email && { email }) },
      });
    }

    return profile;
  });

  return NextResponse.json(student);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const profile = await prisma.studentProfile.findUnique({ where: { id } });

  if (profile) {
    await prisma.user.delete({ where: { id: profile.userId } });
  }

  return NextResponse.json({ success: true });
}
