import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");

  const where: Record<string, string> = {};
  if (schoolId) where.schoolId = schoolId;

  const subjects = await prisma.subject.findMany({
    where,
    include: { assignments: { include: { teacher: { include: { user: { select: { username: true } } } }, class: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(subjects);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, code, schoolId, description } = body;

  const subject = await prisma.subject.create({
    data: { name, code, schoolId, description },
  });

  return NextResponse.json(subject, { status: 201 });
}
