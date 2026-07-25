import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
        adminManager: payload.role === "admin" || payload.role === "admin_manager"
          ? { select: { id: true, fullName: true, phone: true, employeeId: true, canManageStudents: true, canManageTeachers: true, canManageClasses: true } }
          : false,
        teacherProfile: payload.role === "teacher"
          ? { select: { id: true, fullName: true, phone: true, employeeId: true, email: true, gender: true, dateOfBirth: true, address: true } }
          : false,
        studentProfile: payload.role === "student"
          ? { select: { id: true, fullName: true, phone: true, admissionNumber: true, rollNumber: true, classId: true, gender: true, dateOfBirth: true, address: true, guardianName: true } }
          : false,
        parentProfile: payload.role === "parent"
          ? { select: { id: true, fullName: true, phone: true, relation: true, email: true } }
          : false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
