import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");

  const where: Record<string, string> = {};
  if (schoolId) where.schoolId = schoolId;

  const parents = await prisma.parentProfile.findMany({
    where,
    include: { user: { select: { id: true, username: true, email: true } }, students: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(parents);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, email, password, schoolId, phone } = body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const parent = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username: name, email, passwordHash: hashedPassword, role: "PARENT", schoolId },
    });

    const profile = await tx.parentProfile.create({
      data: { userId: user.id, schoolId, fullName: name, phone },
    });

    return profile;
  });

  return NextResponse.json(parent, { status: 201 });
}
