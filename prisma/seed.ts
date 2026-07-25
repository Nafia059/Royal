import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create school
  const school = await prisma.school.create({
    data: { name: "Royal International School System" },
  });
  console.log("School created");

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@royalschool.edu.pk",
      passwordHash: adminHash,
      role: "admin",
      schoolId: school.id,
    },
  });
  console.log("Admin user created (admin/admin123)");

  // Create teachers
  const teachers = [
    { name: "Ms. Noreen Fatima", gender: "F", phone: "03000743888", email: "noreen@royalschool.edu.pk" },
    { name: "Ms. Marvi Faisal", gender: "F", phone: "03257692607", email: "marvi@royalschool.edu.pk" },
    { name: "Ms. Saira Muzamil", gender: "F", phone: "03069885334", email: "saira@royalschool.edu.pk" },
    { name: "Ms. Zarmeena Zameer", gender: "F", phone: "03172666933", email: "zarmeena@royalschool.edu.pk" },
    { name: "Ms. Bushra Aslam", gender: "F", phone: "03334708553", email: "bushra@royalschool.edu.pk" },
    { name: "Ms. Humera Hameed", gender: "F", phone: "03317066647", email: "humera@royalschool.edu.pk" },
  ];

  const teacherProfiles = [];
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    const username = t.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const user = await prisma.user.create({
      data: {
        username,
        email: t.email,
        passwordHash: await bcrypt.hash("teacher123", 10),
        role: "teacher",
        schoolId: school.id,
      },
    });
    const profile = await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        fullName: t.name,
        gender: t.gender,
        employeeId: `TCH${(i + 1).toString().padStart(3, "0")}`,
        phone: t.phone,
        email: t.email,
      },
    });
    teacherProfiles.push(profile);
  }
  console.log(`${teachers.length} teachers created`);

  // Create subjects
  const subjects = [
    { name: "Mathematics", code: "MATH101" },
    { name: "English", code: "ENG101" },
    { name: "Urdu", code: "URD101" },
    { name: "Science", code: "SCI101" },
    { name: "Social Studies", code: "SST101" },
    { name: "Computer Science", code: "CS101" },
    { name: "Islamiat", code: "ISL101" },
  ];

  const subjectRecords = [];
  for (const s of subjects) {
    const record = await prisma.subject.create({
      data: { name: s.name, code: s.code, schoolId: school.id },
    });
    subjectRecords.push(record);
  }
  console.log(`${subjects.length} subjects created`);

  // Create classes
  const classData = [
    { name: "1", section: "A" },
    { name: "1", section: "B" },
    { name: "2", section: "A" },
    { name: "2", section: "B" },
    { name: "3", section: "A" },
    { name: "4", section: "A" },
    { name: "5", section: "A" },
  ];

  const classRecords = [];
  for (let i = 0; i < classData.length; i++) {
    const c = classData[i];
    const cls = await prisma.class.create({
      data: {
        name: c.name,
        section: c.section,
        schoolId: school.id,
        classTeacherId: teacherProfiles[i % teacherProfiles.length].id,
      },
    });
    classRecords.push(cls);
  }
  console.log(`${classData.length} classes created`);

  // Create teacher-subject assignments
  for (const cls of classRecords) {
    for (let i = 0; i < Math.min(3, subjectRecords.length); i++) {
      await prisma.teacherSubjectAssignment.create({
        data: {
          teacherId: teacherProfiles[parseInt(cls.name) % teacherProfiles.length].id,
          subjectId: subjectRecords[i].id,
          assignedClassId: cls.id,
        },
      });
    }
  }
  console.log("Teacher-subject assignments created");

  // Create students
  const studentNames = [
    "Ahmed Khan", "Sara Ali", "Usman Malik", "Fatima Noor", "Hassan Raza",
    "Ayesha Siddiqui", "Bilal Ahmed", "Zainab Bibi", "Omar Farooq", "Maryam Saleem",
    "Danish Khan", "Hira Shah", "Faisal Mehmood", "Nida Parveen", "Talha bin Amir",
    "Sana Gul", "Rizwan Abbas", "Mehwish Rafiq", "Kamran Tariq", "Rabia Tehseen",
  ];

  const studentProfiles = [];
  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i];
    const username = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@student.royalschool.edu.pk`,
        passwordHash: await bcrypt.hash("student123", 10),
        role: "student",
        schoolId: school.id,
      },
    });
    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        fullName: name,
        guardianName: `Parent of ${name}`,
        email: `${username}@student.royalschool.edu.pk`,
        dateOfBirth: new Date(2010 + (i % 5), (i * 3) % 12, (i * 7) % 28 + 1),
        gender: i % 2 === 0 ? "M" : "F",
        rollNumber: `R${(i + 1).toString().padStart(3, "0")}`,
        admissionNumber: `ADM${(i + 1).toString().padStart(4, "0")}`,
        classId: classRecords[i % classRecords.length].id,
        phone: `030${(10000000 + i * 1234567).toString().slice(0, 8)}`,
      },
    });
    studentProfiles.push(profile);
  }
  console.log(`${studentNames.length} students created`);

  // Create parents
  const parentData = [
    { name: "Muhammad Khan", relation: "father", childIdx: 0 },
    { name: "Rashid Ali", relation: "father", childIdx: 1 },
    { name: "Abdul Malik", relation: "father", childIdx: 2 },
    { name: "Siddiqui Sahab", relation: "father", childIdx: 3 },
    { name: "Farooq Ahmed", relation: "father", childIdx: 4 },
  ];

  for (const p of parentData) {
    const username = p.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@parent.royalschool.edu.pk`,
        passwordHash: await bcrypt.hash("parent123", 10),
        role: "parent",
        schoolId: school.id,
      },
    });
    const profile = await prisma.parentProfile.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        fullName: p.name,
        relation: p.relation,
        phone: `030${(20000000 + p.childIdx * 3456789).toString().slice(0, 8)}`,
        email: `${username}@parent.royalschool.edu.pk`,
        students: { connect: [{ id: studentProfiles[p.childIdx].id }] },
      },
    });
  }
  console.log(`${parentData.length} parents created`);

  // Create HR employees
  const employees = [
    { name: "Mrs. Lubna Azwar", designation: "Group Head", mobile: "3126664127" },
    { name: "Ms. Mehwish Rafiq", designation: "VP", mobile: "03310368356" },
    { name: "Ms. Sitwat Miqdad", designation: "Manager", mobile: "03248265653" },
    { name: "Ms. Hoor Ul Ain", designation: "Coordinator", mobile: "3150604284" },
    { name: "Ms. Habiba Gillani", designation: "Coordinator", mobile: "03138482403" },
    { name: "Ms. Najia Khan", designation: "Teacher", mobile: "03117115789" },
    { name: "Ms. Marvi Faisal", designation: "Teacher", mobile: "03257692607" },
    { name: "Ms. Bushra Aslam", designation: "Teacher", mobile: "03334708553" },
    { name: "Ms. Qaisra Sajjad", designation: "Teacher", mobile: "03106145172" },
    { name: "Ms. Saira Muzamil", designation: "Teacher", mobile: "03069885334" },
    { name: "Ms. Samman Khan", designation: "Teacher", mobile: "03047354007" },
    { name: "Ms. Uzma Gerdezi", designation: "Teacher", mobile: "032171291" },
    { name: "Ms. Zarmeena Zameer", designation: "Teacher", mobile: "03172666933" },
    { name: "Ms. Noreen Fatima", designation: "Teacher", mobile: "03000743888" },
    { name: "Ms. Naveera Sahar", designation: "Teacher", mobile: "03097247396" },
    { name: "Ms. Azra Sultana", designation: "Teacher", mobile: "03246314947" },
    { name: "Ms. Sana Khursheed", designation: "Teacher", mobile: "03002446905" },
    { name: "Ms. Humera Hameed", designation: "Teacher", mobile: "03317066647" },
    { name: "Ms. Shahana Madni", designation: "Teacher", mobile: "03336165208" },
    { name: "Ms. Rabia Tehseen", designation: "Teacher", mobile: "03097171675" },
  ];

  for (let i = 0; i < employees.length; i++) {
    const empData = employees[i];
    const emp = await prisma.employee.create({
      data: {
        employeeId: `EMP${(i + 1).toString().padStart(3, "0")}`,
        fullName: empData.name,
        designation: empData.designation,
        department: "Teaching Staff",
        employmentType: "permanent",
        gender: "Female",
        mobile: empData.mobile,
        isActive: true,
      },
    });

    const salary = 20000 + Math.floor(Math.random() * 30000);
    await prisma.salaryConfig.create({
      data: {
        employeeId: emp.id,
        basicSalary: salary,
        perDaySalary: Math.round(salary / 26),
        workingDaysPerMonth: 26,
        houseAllowance: Math.round(salary * 0.15),
        medicalAllowance: Math.round(salary * 0.1),
        transportAllowance: 2000,
        providentFund: Math.round(salary * 0.05),
        taxRate: 2,
        bonusPerDayPercent: 2,
      },
    });
  }
  console.log(`${employees.length} HR employees created`);

  console.log("\nSeeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:    admin / admin123");
  console.log("  Teacher:  noreenfatima / teacher123");
  console.log("  Student:  ahmedkhan / student123");
  console.log("  Parent:   muhammadkhan / parent123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
