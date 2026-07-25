"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  Menu,
  X,
  LogOut,
  User,
  Building2,
  ChevronLeft,
  FileText,
  Home,
  School,
  Heart,
  BarChart3,
  Wallet,
  Calculator,
  Receipt,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: "admin" | "teacher" | "student" | "parent";
  user?: {
    fullName: string;
    role: string;
  };
}

const adminLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
  { label: "Teachers", href: "/dashboard/admin/teachers", icon: Users },
  { label: "Parents", href: "/dashboard/admin/parents", icon: Heart },
  { label: "Classes", href: "/dashboard/admin/classes", icon: School },
  { label: "Subjects", href: "/dashboard/admin/subjects", icon: BookOpen },
  { label: "Assignments", href: "/dashboard/admin/assignments", icon: ClipboardList },
  { label: "Employees", href: "/employees", icon: Building2 },
  { label: "Salary Config", href: "/salary-config", icon: Calculator },
  { label: "Generate Salary", href: "/salary/generate", icon: Wallet },
  { label: "Payroll History", href: "/payroll", icon: Receipt },
];

const teacherLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
  { label: "My Classes", href: "/dashboard/teacher/classes", icon: School },
  { label: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardList },
  { label: "Exams", href: "/dashboard/teacher/exams", icon: FileText },
  { label: "Homework", href: "/dashboard/teacher/homework", icon: BookOpen },
  { label: "Timetable", href: "/dashboard/teacher/timetable", icon: Calendar },
];

const studentLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "My Attendance", href: "/dashboard/student/attendance", icon: ClipboardList },
  { label: "My Results", href: "/dashboard/student/results", icon: BarChart3 },
  { label: "Homework", href: "/dashboard/student/homework", icon: BookOpen },
  { label: "Timetable", href: "/dashboard/student/timetable", icon: Calendar },
];

const parentLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
  { label: "Children", href: "/dashboard/parent/children", icon: Users },
  { label: "Attendance", href: "/dashboard/parent/attendance", icon: ClipboardList },
  { label: "Results", href: "/dashboard/parent/results", icon: BarChart3 },
  { label: "Timetable", href: "/dashboard/parent/timetable", icon: Calendar },
];

const roleLinks: Record<string, NavLink[]> = {
  admin: adminLinks,
  teacher: teacherLinks,
  student: studentLinks,
  parent: parentLinks,
};

export default function Sidebar({ role, user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const links = roleLinks[role] || [];
  const displayUser = user || { fullName: "User", role };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-slate-900 p-2 text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-white transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">SchoolMS</span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 hover:bg-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded p-1 hover:bg-slate-700 lg:block"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayUser.fullName}</p>
                <p className="truncate text-xs text-slate-400 capitalize">
                  {displayUser.role}
                </p>
              </div>
            )}
          </div>
          <Link
            href="/"
            className={cn(
              "mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
