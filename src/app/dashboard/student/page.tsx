"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FileText,
} from "lucide-react";

interface Student {
  _id: string;
  name: string;
  class: string;
  rollNo: string;
}

interface Attendance {
  _id: string;
  date: string;
  status: "present" | "absent" | "leave";
  subject: string;
}

interface Result {
  _id: string;
  exam: string;
  marks: number;
  totalMarks: number;
  passingMarks: number;
  percentage: number;
  passed: boolean;
}

interface Homework {
  _id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
}

interface Timetable {
  _id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, attendanceRes, resultsRes, homeworkRes, timetableRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/attendance"),
          fetch("/api/results"),
          fetch("/api/hometasks"),
          fetch("/api/timetable"),
        ]);

        const [studentData, attendanceData, resultsData, homeworkData, timetableData] =
          await Promise.all([
            studentRes.json(),
            attendanceRes.json(),
            resultsRes.json(),
            homeworkRes.json(),
            timetableRes.json(),
          ]);

        setStudent(studentData);
        setAttendance(attendanceData);
        setResults(resultsData);
        setHomework(homeworkData);
        setTimetable(timetableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  };

  const getPendingTasks = () => {
    const today = new Date().toISOString().split("T")[0];
    return homework.filter((hw) => hw.dueDate >= today).length;
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="student" />
      <main className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <GraduationCap className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">My Class</p>
              <p className="text-xl font-bold">{student?.class || "N/A"}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Attendance %</p>
              <p className="text-xl font-bold">{getAttendancePercentage()}%</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <Clock className="text-orange-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Pending Tasks</p>
              <p className="text-xl font-bold">{getPendingTasks()}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <FileText className="text-purple-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Total Exams</p>
              <p className="text-xl font-bold">{results.length}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b pb-2">
          {["overview", "attendance", "results", "homework", "timetable"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium capitalize ${
                activeTab === tab ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
              {attendance.length === 0 ? (
                <p className="text-gray-500">No attendance records yet</p>
              ) : (
                attendance.slice(-5).reverse().map((a) => (
                  <div key={a._id} className="flex justify-between items-center border-b py-2 last:border-0">
                    <span className="text-sm">{a.date}</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        a.status === "present"
                          ? "bg-green-100 text-green-700"
                          : a.status === "absent"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
              {results.length === 0 ? (
                <p className="text-gray-500">No results available</p>
              ) : (
                results.slice(-5).reverse().map((r) => (
                  <div key={r._id} className="flex justify-between items-center border-b py-2 last:border-0">
                    <span className="text-sm font-medium">{r.exam}</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.marks}/{r.totalMarks}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance Records</h3>
            {attendance.length === 0 ? (
              <p className="text-gray-500">No attendance records yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Subject</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a._id} className="border-b">
                      <td className="py-2">{a.date}</td>
                      <td className="py-2">{a.subject}</td>
                      <td className="py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            a.status === "present"
                              ? "bg-green-100 text-green-700"
                              : a.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
            {results.length === 0 ? (
              <p className="text-gray-500">No results available</p>
            ) : (
              <div className="space-y-4">
                {results.map((r) => (
                  <div key={r._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{r.exam}</h4>
                        <p className="text-sm text-gray-500">
                          Marks: {r.marks}/{r.totalMarks} | Passing: {r.passingMarks}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{r.percentage}%</p>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "homework" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Assigned Homework</h3>
            {homework.length === 0 ? (
              <p className="text-gray-500">No homework assigned</p>
            ) : (
              <div className="space-y-3">
                {homework.map((hw) => (
                  <div key={hw._id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{hw.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{hw.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-purple-600">{hw.subject}</span>
                      <span className="text-orange-600">Due: {hw.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "timetable" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Class Timetable</h3>
            {timetable.length === 0 ? (
              <p className="text-gray-500">No timetable available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50">Day</th>
                      {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"].map(
                        (time) => (
                          <th key={time} className="border p-2 bg-gray-50">
                            {time}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day}>
                        <td className="border p-2 font-medium bg-gray-50">{day}</td>
                        {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"].map(
                          (time) => {
                            const slot = timetable.find(
                              (t) => t.day === day && t.startTime === time
                            );
                            return (
                              <td key={time} className="border p-2">
                                {slot ? (
                                  <div className="text-sm">
                                    <p className="font-medium">{slot.subject}</p>
                                  </div>
                                ) : null}
                              </td>
                            );
                          }
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
