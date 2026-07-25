"use client";

import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const portals = [
  {
    title: "Admin Login",
    description: "Full access to manage the institution",
    href: "/login/admin",
    icon: ShieldCheck,
    color: "bg-indigo-50 text-indigo-600 ring-indigo-500/10",
  },
  {
    title: "Teacher Login",
    description: "Manage classes, attendance & exams",
    href: "/login/teacher",
    icon: GraduationCap,
    color: "bg-emerald-50 text-emerald-600 ring-emerald-500/10",
  },
  {
    title: "Student Login",
    description: "View attendance, results & homework",
    href: "/login/student",
    icon: BookOpen,
    color: "bg-amber-50 text-amber-600 ring-amber-500/10",
  },
  {
    title: "Parent Login",
    description: "Monitor your child's progress",
    href: "/login/parent",
    icon: Users,
    color: "bg-sky-50 text-sky-600 ring-sky-500/10",
  },
  {
    title: "HR Portal",
    description: "Employee management & payroll",
    href: "/login/admin?tab=hr",
    icon: Building2,
    color: "bg-rose-50 text-rose-600 ring-rose-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SchoolMS
          </span>
          <span className="text-sm text-slate-500">
            Institution Management System
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Institution Management
            <span className="block text-indigo-600">System</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            A unified platform for managing students, teachers, parents, HR
            operations, payroll and more.
          </p>
        </div>

        <div className="mx-auto mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                href={portal.href}
                className={cn(
                  "group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset",
                    portal.color
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {portal.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {portal.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
                  Sign in <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} SchoolMS. All rights reserved.
      </footer>
    </div>
  );
}
