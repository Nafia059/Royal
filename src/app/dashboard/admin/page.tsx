"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  Users, GraduationCap, Heart, School, BookOpen, ClipboardList,
  Plus, Pencil, Trash2, X,
} from "lucide-react";

interface Student {
  id: string;
  user: { id: string; username: string; email: string };
  classId: string;
  studentClass?: { id: string; name: string; section: string };
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  admissionNumber: string | null;
  guardianName?: string | null;
}

interface Teacher {
  id: string;
  user: { id: string; username: string; email: string };
  phone: string | null;
  address: string | null;
  assignments?: { subject: { name: string }; assignedClass: { name: string } }[];
}

interface Parent {
  id: string;
  user: { id: string; username: string; email: string };
  phone: string | null;
  students?: { id: string }[];
}

interface ClassItem {
  id: string;
  name: string;
  section: string;
  students?: { id: string }[];
  classTeacher?: { user: { username: string } } | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Assignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  teacher: { user: { username: string } };
  subject: { name: string };
  assignedClass: { name: string; section: string };
}

type Tab = "overview" | "students" | "teachers" | "parents" | "classes" | "subjects" | "assignments";

const validTabs: Tab[] = ["overview", "students", "teachers", "parents", "classes", "subjects", "assignments"];

const emptyStudentForm = { name: "", email: "", password: "", schoolId: "", classId: "", dateOfBirth: "", gender: "", phone: "", address: "", admissionNumber: "", guardianName: "" };
const emptyTeacherForm = { name: "", email: "", password: "", schoolId: "", phone: "", address: "" };
const emptyParentForm = { name: "", email: "", password: "", schoolId: "", phone: "" };
const emptyClassForm = { name: "", section: "", schoolId: "", teacherId: "" };
const emptySubjectForm = { name: "", code: "", schoolId: "" };
const emptyAssignmentForm = { teacherId: "", subjectId: "", classId: "" };

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [modal, setModal] = useState<{ type: string; mode: "add" | "edit"; data?: Record<string, string> } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);

  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [parentForm, setParentForm] = useState(emptyParentForm);
  const [classForm, setClassForm] = useState(emptyClassForm);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm);

  const readTab = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as Tab;
    if (tab && validTabs.includes(tab)) setActiveTab(tab);
    else setActiveTab("overview");
  }, []);

  useEffect(() => {
    readTab();
    const onPop = () => readTab();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [readTab]);

  const fetchData = useCallback(async () => {
    try {
      const [sRes, tRes, pRes, cRes, subRes, aRes] = await Promise.all([
        fetch("/api/students"), fetch("/api/teachers"), fetch("/api/parents"),
        fetch("/api/classes"), fetch("/api/subjects"), fetch("/api/assignments"),
      ]);
      const [s, t, p, c, sub, a] = await Promise.all([
        sRes.json(), tRes.json(), pRes.json(), cRes.json(), subRes.json(), aRes.json(),
      ]);
      setStudents(s);
      setTeachers(t);
      setParents(p);
      setClasses(c);
      setSubjects(sub);
      setAssignments(a);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navigateTab = (tab: Tab) => {
    router.push(`/dashboard/admin?tab=${tab}`);
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const openAddModal = (type: string) => {
    if (type === "student") setStudentForm(emptyStudentForm);
    if (type === "teacher") setTeacherForm(emptyTeacherForm);
    if (type === "parent") setParentForm(emptyParentForm);
    if (type === "class") setClassForm(emptyClassForm);
    if (type === "subject") setSubjectForm(emptySubjectForm);
    if (type === "assignment") setAssignmentForm(emptyAssignmentForm);
    setModal({ type, mode: "add" });
  };

  const openEditModal = (type: string, record: Student | Teacher | Parent | ClassItem | Subject) => {
    const r = record as unknown as Record<string, unknown>;
    const user = r.user as { username: string; email: string } | undefined;
    if (type === "student") {
      setStudentForm({
        name: user?.username || "", email: user?.email || "", password: "",
        schoolId: "", classId: (r.classId as string) || "",
        admissionNumber: (r.admissionNumber as string) || "", gender: (r.gender as string) || "",
        phone: (r.phone as string) || "", address: (r.address as string) || "",
        dateOfBirth: r.dateOfBirth ? String(r.dateOfBirth).split("T")[0] : "", guardianName: (r.guardianName as string) || "",
      });
    } else if (type === "teacher") {
      setTeacherForm({
        name: user?.username || "", email: user?.email || "", password: "",
        schoolId: "", phone: (r.phone as string) || "", address: (r.address as string) || "",
      });
    } else if (type === "parent") {
      setParentForm({
        name: user?.username || "", email: user?.email || "", password: "",
        schoolId: "", phone: (r.phone as string) || "",
      });
    } else if (type === "class") {
      setClassForm({
        name: (r.name as string) || "", section: (r.section as string) || "",
        schoolId: "", teacherId: (r.classTeacher as { id: string })?.id || "",
      });
    } else if (type === "subject") {
      setSubjectForm({ name: (r.name as string) || "", code: (r.code as string) || "", schoolId: "" });
    } else if (type === "assignment") {
      setAssignmentForm({
        teacherId: (r.teacherId as string) || "", subjectId: (r.subjectId as string) || "",
        classId: (r.classId as string) || "",
      });
    }
    setModal({ type, mode: "edit", data: { id: (r.id as string) || "" } });
  };

  const handleSubmit = async (e: React.FormEvent, type: string, form: Record<string, string>) => {
    e.preventDefault();
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== "" && v !== undefined) cleaned[k] = v;
    }
    const method = modal?.mode === "edit" ? "PUT" : "POST";
    const url = modal?.mode === "edit" ? `/api/${type}s/${modal.data?.id}` : `/api/${type}s`;
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleaned) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to save");
        return;
      }
      setModal(null);
      fetchData();
    } catch (err) {
      alert("Network error");
    }
  };

  const handleDelete = async (type: string, id: string) => {
    await fetch(`/api/${type}s/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" user={{ fullName: "Admin", role: "admin" }} />

      <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your school system</p>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Students", value: students.length, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Teachers", value: teachers.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Total Parents", value: parents.length, icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
              { label: "Total Classes", value: classes.length, icon: School, color: "text-green-600", bg: "bg-green-50" },
              { label: "Total Subjects", value: subjects.length, icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}><Icon className={stat.color} size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "students" && (
          <Section title="Students" onAdd={() => openAddModal("student")}>
            <TableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission #</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.studentClass ? `${s.studentClass.name} - ${s.studentClass.section}` : "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.admissionNumber || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal("student", s)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm({ type: "student", id: s.id })} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <EmptyRow colSpan={4} />}
            </TableBody>
          </Section>
        )}

        {activeTab === "teachers" && (
          <Section title="Teachers" onAdd={() => openAddModal("teacher")}>
            <TableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.assignments?.map((a) => a.subject.name).join(", ") || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal("teacher", t)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm({ type: "teacher", id: t.id })} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && <EmptyRow colSpan={4} />}
            </TableBody>
          </Section>
        )}

        {activeTab === "parents" && (
          <Section title="Parents" onAdd={() => openAddModal("parent")}>
            <TableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </TableHeader>
            <TableBody>
              {parents.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.students?.length || 0}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal("parent", p)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm({ type: "parent", id: p.id })} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {parents.length === 0 && <EmptyRow colSpan={4} />}
            </TableBody>
          </Section>
        )}

        {activeTab === "classes" && (
          <Section title="Classes" onAdd={() => openAddModal("class")}>
            <TableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </TableHeader>
            <TableBody>
              {classes.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.section}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.classTeacher?.user?.username || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.students?.length || 0}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal("class", c)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm({ type: "class", id: c.id })} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && <EmptyRow colSpan={5} />}
            </TableBody>
          </Section>
        )}

        {activeTab === "subjects" && (
          <Section title="Subjects" onAdd={() => openAddModal("subject")}>
            <TableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </TableHeader>
            <TableBody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.code}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button onClick={() => openEditModal("subject", s)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm({ type: "subject", id: s.id })} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <EmptyRow colSpan={3} />}
            </TableBody>
          </Section>
        )}

        {activeTab === "assignments" && (
          <Section title="Teacher-Subject Assignments" onAdd={() => openAddModal("assignment")}>
            <TableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.teacher.user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.subject.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.assignedClass.name} - {a.assignedClass.section}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button onClick={() => setDeleteConfirm({ type: "assignment", id: a.id })} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && <EmptyRow colSpan={4} />}
            </TableBody>
          </Section>
        )}

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  {modal.mode === "add" ? "Add" : "Edit"} {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}
                </h3>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-5">
                {modal.type === "student" && (
                  <form onSubmit={(e) => handleSubmit(e, "student", studentForm)} className="space-y-4">
                    <Input label="Full Name" value={studentForm.name} onChange={(v) => setStudentForm({ ...studentForm, name: v })} required />
                    <Input label="Email" type="email" value={studentForm.email} onChange={(v) => setStudentForm({ ...studentForm, email: v })} required />
                    {modal.mode === "add" && <Input label="Password" type="password" value={studentForm.password} onChange={(v) => setStudentForm({ ...studentForm, password: v })} required />}
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Class" value={studentForm.classId} onChange={(v) => setStudentForm({ ...studentForm, classId: v })} options={classes.map((c) => ({ value: c.id, label: `${c.name} - ${c.section}` }))} required />
                      <Select label="Gender" value={studentForm.gender} onChange={(v) => setStudentForm({ ...studentForm, gender: v })} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
                    </div>
                    <Input label="Admission Number" value={studentForm.admissionNumber} onChange={(v) => setStudentForm({ ...studentForm, admissionNumber: v })} />
                    <Input label="Phone" value={studentForm.phone} onChange={(v) => setStudentForm({ ...studentForm, phone: v })} />
                    <Input label="Date of Birth" type="date" value={studentForm.dateOfBirth} onChange={(v) => setStudentForm({ ...studentForm, dateOfBirth: v })} />
                    <Input label="Address" value={studentForm.address} onChange={(v) => setStudentForm({ ...studentForm, address: v })} />
                    <Input label="Guardian Name" value={studentForm.guardianName} onChange={(v) => setStudentForm({ ...studentForm, guardianName: v })} />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Save</button>
                  </form>
                )}
                {modal.type === "teacher" && (
                  <form onSubmit={(e) => handleSubmit(e, "teacher", teacherForm)} className="space-y-4">
                    <Input label="Full Name" value={teacherForm.name} onChange={(v) => setTeacherForm({ ...teacherForm, name: v })} required />
                    <Input label="Email" type="email" value={teacherForm.email} onChange={(v) => setTeacherForm({ ...teacherForm, email: v })} required />
                    {modal.mode === "add" && <Input label="Password" type="password" value={teacherForm.password} onChange={(v) => setTeacherForm({ ...teacherForm, password: v })} required />}
                    <Input label="Phone" value={teacherForm.phone} onChange={(v) => setTeacherForm({ ...teacherForm, phone: v })} />
                    <Input label="Address" value={teacherForm.address} onChange={(v) => setTeacherForm({ ...teacherForm, address: v })} />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Save</button>
                  </form>
                )}
                {modal.type === "parent" && (
                  <form onSubmit={(e) => handleSubmit(e, "parent", parentForm)} className="space-y-4">
                    <Input label="Full Name" value={parentForm.name} onChange={(v) => setParentForm({ ...parentForm, name: v })} required />
                    <Input label="Email" type="email" value={parentForm.email} onChange={(v) => setParentForm({ ...parentForm, email: v })} required />
                    {modal.mode === "add" && <Input label="Password" type="password" value={parentForm.password} onChange={(v) => setParentForm({ ...parentForm, password: v })} required />}
                    <Input label="Phone" value={parentForm.phone} onChange={(v) => setParentForm({ ...parentForm, phone: v })} />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Save</button>
                  </form>
                )}
                {modal.type === "class" && (
                  <form onSubmit={(e) => handleSubmit(e, "class", classForm)} className="space-y-4">
                    <Input label="Class Name" value={classForm.name} onChange={(v) => setClassForm({ ...classForm, name: v })} required />
                    <Input label="Section" value={classForm.section} onChange={(v) => setClassForm({ ...classForm, section: v })} required />
                    <Select label="Class Teacher" value={classForm.teacherId} onChange={(v) => setClassForm({ ...classForm, teacherId: v })} options={teachers.map((t) => ({ value: t.id, label: t.user.username }))} />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Save</button>
                  </form>
                )}
                {modal.type === "subject" && (
                  <form onSubmit={(e) => handleSubmit(e, "subject", subjectForm)} className="space-y-4">
                    <Input label="Subject Name" value={subjectForm.name} onChange={(v) => setSubjectForm({ ...subjectForm, name: v })} required />
                    <Input label="Subject Code" value={subjectForm.code} onChange={(v) => setSubjectForm({ ...subjectForm, code: v })} required />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Save</button>
                  </form>
                )}
                {modal.type === "assignment" && (
                  <form onSubmit={(e) => handleSubmit(e, "assignment", assignmentForm)} className="space-y-4">
                    <Select label="Teacher" value={assignmentForm.teacherId} onChange={(v) => setAssignmentForm({ ...assignmentForm, teacherId: v })} options={teachers.map((t) => ({ value: t.id, label: t.user.username }))} required />
                    <Select label="Subject" value={assignmentForm.subjectId} onChange={(v) => setAssignmentForm({ ...assignmentForm, subjectId: v })} options={subjects.map((s) => ({ value: s.id, label: s.name }))} required />
                    <Select label="Class" value={assignmentForm.classId} onChange={(v) => setAssignmentForm({ ...assignmentForm, classId: v })} options={classes.map((c) => ({ value: c.id, label: `${c.name} - ${c.section}` }))} required />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Save</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add {title.includes("Assignments") ? "Assignment" : title.slice(0, -1)}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50"><tr>{children}</tr></thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr><td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-500">No records found</td></tr>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
    </div>
  );
}

function Select({ label, value, onChange, options, required }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
        <option value="">Select {label}</option>
        {options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </select>
    </div>
  );
}
