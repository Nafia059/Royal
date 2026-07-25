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

  const classes = await prisma.class.findMany({
    where,
    include: { students: true, teacher: { include: { user: { select: { name: true } } } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(classes);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { name, section, schoolId, teacherId, capacity } = body;

  const cls = await prisma.class.create({
    data: { name, section, schoolId, teacherId, capacity },
  });

  return NextResponse.json(cls, { status: 201 });
}
