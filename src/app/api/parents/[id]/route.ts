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
    include: { user: { select: { id: true, name: true, email: true } }, children: true },
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
  const { name, email, phone, address, occupation } = body;

  const parent = await prisma.$transaction(async (tx) => {
    const profile = await tx.parentProfile.update({
      where: { id },
      data: { phone, address, occupation },
    });

    if (name || email) {
      await tx.user.update({
        where: { id: profile.userId },
        data: { ...(name && { name }), ...(email && { email }) },
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

  if (profile) {
    await prisma.user.delete({ where: { id: profile.userId } });
  }

  return NextResponse.json({ success: true });
}
