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
    include: { studentClass: true, user: { select: { id: true, username: true, email: true } } },
  });

  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, email, password, schoolId, classId, dateOfBirth, gender, phone, address, admissionNumber, guardianName } = body;

  const hashedPassword = await bcrypt.hash(password || "password123", 10);

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username: name, email, passwordHash: hashedPassword, role: "STUDENT", schoolId },
    });

    const profile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        schoolId,
        fullName: name,
        guardianName: guardianName || "",
        classId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
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
