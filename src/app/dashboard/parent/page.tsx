"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
} from "lucide-react";

interface Child {
  _id: string;
  name: string;
  class: string;
  rollNo: string;
}

interface Attendance {
  _id: string;
  student: string;
  date: string;
  status: "present" | "absent" | "leave";
  subject: string;
}

interface Result {
  _id: string;
  student: string;
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
  class: string;
  subject: string;
  dueDate: string;
}

interface Timetable {
  _id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  class: string;
}

interface Parent {
  _id: string;
  name: string;
  children: Child[];
}

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<Parent | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentRes, attendanceRes, resultsRes, homeworkRes, timetableRes] = await Promise.all([
          fetch("/api/parents"),
          fetch("/api/attendance"),
          fetch("/api/results"),
          fetch("/api/hometasks"),
          fetch("/api/timetable"),
        ]);

        const [parentData, attendanceData, resultsData, homeworkData, timetableData] =
          await Promise.all([
            parentRes.json(),
            attendanceRes.json(),
            resultsRes.json(),
            homeworkRes.json(),
            timetableRes.json(),
          ]);

        setParent(parentData);
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

  const getOverallAttendance = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  };

  const getChildAttendance = (childId: string) => {
    const childAttendance = attendance.filter((a) => a.student === childId);
    if (childAttendance.length === 0) return 0;
    const present = childAttendance.filter((a) => a.status === "present").length;
    return Math.round((present / childAttendance.length) * 100);
  };

  const getChildResults = (childId: string) => {
    return results.filter((r) => r.student === childId);
  };

  const getChildClasses = () => {
    if (!parent?.children) return [];
    return [...new Set(parent.children.map((c) => c.class))];
  };

  const getChildHomework = () => {
    const childClasses = getChildClasses();
    return homework.filter((hw) => childClasses.includes(hw.class));
  };

  const getChildTimetable = () => {
    const childClasses = getChildClasses();
    return timetable.filter((t) => childClasses.includes(t.class));
  };

  const getPendingTasks = () => {
    const today = new Date().toISOString().split("T")[0];
    return getChildHomework().filter((hw) => hw.dueDate >= today).length;
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
      <Sidebar role="parent" />
      <main className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Parent Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <Users className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">My Children</p>
              <p className="text-xl font-bold">{parent?.children?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Overall Attendance</p>
              <p className="text-xl font-bold">{getOverallAttendance()}%</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <Clock className="text-orange-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Pending Tasks</p>
              <p className="text-xl font-bold">{getPendingTasks()}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
          {["overview", "children", "attendance", "results", "homework", "timetable"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium capitalize whitespace-nowrap ${
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
              <h3 className="text-lg font-semibold mb-4">Children Attendance</h3>
              {parent?.children?.length === 0 ? (
                <p className="text-gray-500">No children registered</p>
              ) : (
                parent?.children?.map((child) => (
                  <div key={child._id} className="flex justify-between items-center border-b py-2 last:border-0">
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-gray-500">{child.class}</p>
                    </div>
                    <span className="text-lg font-bold">{getChildAttendance(child._id)}%</span>
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
                    <div>
                      <p className="text-sm font-medium">{r.exam}</p>
                      <p className="text-xs text-gray-500">
                        {parent?.children?.find((c) => c._id === r.student)?.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.percentage}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "children" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">My Children</h3>
            {parent?.children?.length === 0 ? (
              <p className="text-gray-500">No children registered</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parent?.children?.map((child) => (
                  <div key={child._id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg">{child.name}</h4>
                    <p className="text-gray-500">Class: {child.class}</p>
                    <p className="text-gray-500">Roll No: {child.rollNo}</p>
                    <div className="mt-2">
                      <p className="text-sm">Attendance: {getChildAttendance(child._id)}%</p>
                      <p className="text-sm">Exams: {getChildResults(child._id).length}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Children Attendance</h3>
            {parent?.children?.length === 0 ? (
              <p className="text-gray-500">No children registered</p>
            ) : (
              parent?.children?.map((child) => {
                const childAttendance = attendance.filter((a) => a.student === child._id);
                return (
                  <div key={child._id} className="mb-6 last:mb-0">
                    <h4 className="font-medium mb-2">{child.name}</h4>
                    {childAttendance.length === 0 ? (
                      <p className="text-gray-500 text-sm">No attendance records</p>
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
                          {childAttendance.slice(-10).reverse().map((a) => (
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
                );
              })
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Children Results</h3>
            {parent?.children?.length === 0 ? (
              <p className="text-gray-500">No children registered</p>
            ) : (
              parent?.children?.map((child) => {
                const childResults = getChildResults(child._id);
                return (
                  <div key={child._id} className="mb-6 last:mb-0">
                    <h4 className="font-medium mb-2">{child.name}</h4>
                    {childResults.length === 0 ? (
                      <p className="text-gray-500 text-sm">No results available</p>
                    ) : (
                      <div className="space-y-2">
                        {childResults.map((r) => (
                          <div key={r._id} className="border rounded p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{r.exam}</p>
                              <p className="text-sm text-gray-500">
                                Marks: {r.marks}/{r.totalMarks}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{r.percentage}%</p>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {r.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "homework" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Homework</h3>
            {getChildHomework().length === 0 ? (
              <p className="text-gray-500">No homework available</p>
            ) : (
              <div className="space-y-3">
                {getChildHomework().map((hw) => (
                  <div key={hw._id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{hw.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{hw.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-blue-600">{hw.class}</span>
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
            <h3 className="text-lg font-semibold mb-4">Class Timetables</h3>
            {getChildTimetable().length === 0 ? (
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
                            const slots = getChildTimetable().filter(
                              (t) => t.day === day && t.startTime === time
                            );
                            return (
                              <td key={time} className="border p-2">
                                {slots.length > 0 ? (
                                  <div className="text-sm space-y-1">
                                    {slots.map((slot) => (
                                      <div key={slot._id}>
                                        <p className="font-medium">{slot.subject}</p>
                                        <p className="text-gray-500">{slot.class}</p>
                                      </div>
                                    ))}
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
