import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!prisma) {
    return NextResponse.json({
      students: 0, teachers: 0, parents: 0, classes: 0, subjects: 0,
      employees: 0, presentToday: 0, absentToday: 0,
    });
  }
  try {
    const [students, teachers, parents, classes, subjects, employees] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.teacherProfile.count(),
      prisma.parentProfile.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.employee.count(),
    ]);

    return NextResponse.json({ students, teachers, parents, classes, subjects, employees });
  } catch {
    return NextResponse.json({
      students: 0, teachers: 0, parents: 0, classes: 0, subjects: 0,
      employees: 0, presentToday: 0, absentToday: 0,
    });
  }
}
