import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

  const students = await prisma.studentProfile.findMany({
    where,
    include: { class: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, email, password, schoolId, classId, dateOfBirth, gender, phone, address, admissionNumber } = body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password: hashedPassword, role: "STUDENT", schoolId },
    });

    const profile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        schoolId,
        classId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        phone,
        address,
        admissionNumber,
      },
    });

    return profile;
  });

  return NextResponse.json(student, { status: 201 });
}
