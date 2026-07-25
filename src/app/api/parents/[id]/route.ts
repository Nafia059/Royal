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
  const parent = await prisma.parentProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true, email: true } }, students: true },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  return NextResponse.json(parent);
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
  const { username, email, phone } = body;

  const parent = await prisma.$transaction(async (tx) => {
    const profile = await tx.parentProfile.update({
      where: { id },
      data: { phone },
    });

    if ((username || email) && profile.userId) {
      await tx.user.update({
        where: { id: profile.userId },
        data: { ...(username && { username }), ...(email && { email }) },
      });
    }

    return profile;
  });

  return NextResponse.json(parent);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const profile = await prisma.parentProfile.findUnique({ where: { id } });

  if (profile && profile.userId) {
    await prisma.user.delete({ where: { id: profile.userId } });
  }

  return NextResponse.json({ success: true });
}
