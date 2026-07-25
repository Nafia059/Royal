"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Upload,
  Plus,
} from "lucide-react";

interface Student {
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
}

interface Exam {
  _id: string;
  name: string;
  subject: string;
  class: string;
  date: string;
  totalMarks: number;
  passingMarks: number;
}

interface Result {
  _id: string;
  exam: string;
  student: string;
  marks: number;
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

interface Teacher {
  _id: string;
  name: string;
  subjects: string[];
  classes: string[];
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);

  // Attendance form state
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, "present" | "absent" | "leave">
  >({});

  // Exam form state
  const [examForm, setExamForm] = useState({
    name: "",
    subject: "",
    class: "",
    date: "",
    totalMarks: "",
    passingMarks: "",
  });

  // Homework form state
  const [homeworkForm, setHomeworkForm] = useState({
    title: "",
    description: "",
    class: "",
    subject: "",
    dueDate: "",
  });

  // Marks upload state
  const [selectedExam, setSelectedExam] = useState("");
  const [marksData, setMarksData] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherRes, studentsRes, attendanceRes, examsRes, resultsRes, homeworkRes, timetableRes] =
          await Promise.all([
            fetch("/api/teachers"),
            fetch("/api/students"),
            fetch("/api/attendance"),
            fetch("/api/exams"),
            fetch("/api/results"),
            fetch("/api/hometasks"),
            fetch("/api/timetable"),
          ]);

        const [teacherData, studentsData, attendanceData, examsData, resultsData, homeworkData, timetableData] =
          await Promise.all([
            teacherRes.json(),
            studentsRes.json(),
            attendanceRes.json(),
            examsRes.json(),
            resultsRes.json(),
            homeworkRes.json(),
            timetableRes.json(),
          ]);

        setTeacher(teacherData);
        setStudents(studentsData);
        setAttendance(attendanceData);
        setExams(examsData);
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

  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendance.filter((a) => a.date === today);
    return {
      present: todayAttendance.filter((a) => a.status === "present").length,
      absent: todayAttendance.filter((a) => a.status === "absent").length,
      leave: todayAttendance.filter((a) => a.status === "leave").length,
    };
  };

  const handleAttendanceChange = (
    studentId: string,
    status: "present" | "absent" | "leave"
  ) => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          class: selectedClass,
          subject: selectedSubject,
          records: attendanceRecords,
        }),
      });
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...examForm,
          totalMarks: Number(examForm.totalMarks),
          passingMarks: Number(examForm.passingMarks),
        }),
      });
      setExamForm({ name: "", subject: "", class: "", date: "", totalMarks: "", passingMarks: "" });
      alert("Exam created successfully!");
    } catch (error) {
      console.error("Error creating exam:", error);
    }
  };

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/hometasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homeworkForm),
      });
      setHomeworkForm({ title: "", description: "", class: "", subject: "", dueDate: "" });
      alert("Homework added successfully!");
    } catch (error) {
      console.error("Error adding homework:", error);
    }
  };

  const uploadMarks = async (examId: string) => {
    try {
      await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam: examId, marks: marksData }),
      });
      alert("Marks uploaded successfully!");
    } catch (error) {
      console.error("Error uploading marks:", error);
    }
  };

  const filteredStudents = students.filter((s) => s.class === selectedClass);
  const stats = getTodayStats();
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
      <Sidebar role="teacher" />
      <main className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <Users className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">My Students</p>
              <p className="text-xl font-bold">{students.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <BookOpen className="text-purple-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">My Subjects</p>
              <p className="text-xl font-bold">{teacher?.subjects?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Today Present</p>
              <p className="text-xl font-bold">{stats.present}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <XCircle className="text-red-500" size={24} />
            <div>
              <p className="text-sm text-gray-500">Today Absent/Leave</p>
              <p className="text-xl font-bold">{stats.absent + stats.leave}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b pb-2">
          {["overview", "attendance", "exams", "homework", "timetable"].map((tab) => (
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
              <h3 className="text-lg font-semibold mb-4">Recent Homework</h3>
              {homework.length === 0 ? (
                <p className="text-gray-500">No homework assigned yet</p>
              ) : (
                homework.slice(0, 5).map((hw) => (
                  <div key={hw._id} className="border-b py-2 last:border-0">
                    <p className="font-medium">{hw.title}</p>
                    <p className="text-sm text-gray-500">Due: {hw.dueDate}</p>
                  </div>
                ))
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Exams</h3>
              {exams.length === 0 ? (
                <p className="text-gray-500">No exams scheduled</p>
              ) : (
                exams.slice(0, 5).map((exam) => (
                  <div key={exam._id} className="border-b py-2 last:border-0">
                    <p className="font-medium">{exam.name}</p>
                    <p className="text-sm text-gray-500">{exam.subject} - {exam.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Class</option>
                {[...new Set(students.map((s) => s.class))].map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Subject</option>
                {teacher?.subjects?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500">No students found for selected class</p>
            ) : (
              <>
                <table className="w-full mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Roll No</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-center py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="border-b">
                        <td className="py-2">{student.rollNo}</td>
                        <td className="py-2">{student.name}</td>
                        <td className="py-2">
                          <div className="flex justify-center gap-4">
                            {(["present", "absent", "leave"] as const).map((status) => (
                              <label key={status} className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`attendance-${student._id}`}
                                  checked={attendanceRecords[student._id] === status}
                                  onChange={() => handleAttendanceChange(student._id, status)}
                                />
                                <span className="capitalize">{status}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={saveAttendance}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Attendance
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Create Exam</h3>
              <form onSubmit={handleExamSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Exam Name"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <select
                  value={examForm.subject}
                  onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Subject</option>
                  {teacher?.subjects?.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <select
                  value={examForm.class}
                  onChange={(e) => setExamForm({ ...examForm, class: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Class</option>
                  {teacher?.classes?.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={examForm.totalMarks}
                  onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Passing Marks"
                  value={examForm.passingMarks}
                  onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} /> Create Exam
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">My Exams</h3>
              {exams.length === 0 ? (
                <p className="text-gray-500">No exams created yet</p>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{exam.name}</h4>
                          <p className="text-sm text-gray-500">
                            {exam.subject} | {exam.class} | {exam.date}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: {exam.totalMarks} | Passing: {exam.passingMarks}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedExam(exam._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Upload size={18} />
                        </button>
                      </div>
                      {selectedExam === exam._id && (
                        <div className="mt-4 border-t pt-4">
                          <h5 className="font-medium mb-2">Upload Marks</h5>
                          {filteredStudents.map((student) => (
                            <div key={student._id} className="flex items-center gap-4 mb-2">
                              <span className="w-40">{student.name}</span>
                              <input
                                type="number"
                                placeholder="Marks"
                                value={marksData[student._id] || ""}
                                onChange={(e) =>
                                  setMarksData({ ...marksData, [student._id]: Number(e.target.value) })
                                }
                                className="border rounded px-2 py-1 w-24"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => uploadMarks(exam._id)}
                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Save Marks
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "homework" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Add Homework</h3>
              <form onSubmit={handleHomeworkSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={homeworkForm.title}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="date"
                  value={homeworkForm.dueDate}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={homeworkForm.description}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                  className="border rounded-lg px-3 py-2 md:col-span-2"
                  rows={3}
                  required
                />
                <select
                  value={homeworkForm.class}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, class: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Class</option>
                  {teacher?.classes?.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <select
                  value={homeworkForm.subject}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, subject: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Subject</option>
                  {teacher?.subjects?.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Homework
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">My Assigned Homework</h3>
              {homework.length === 0 ? (
                <p className="text-gray-500">No homework assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {homework.map((hw) => (
                    <div key={hw._id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{hw.title}</h4>
                      <p className="text-sm text-gray-500">{hw.description}</p>
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
          </div>
        )}

        {activeTab === "timetable" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Timetable</h3>
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
                                    <p className="text-gray-500">{slot.class}</p>
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
