"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";

interface Student {
  studentId: string;
  name?: string;
  sessional1?: number;
  sessional2?: number;
  attendance?: number;
  assignments?: number;
}

interface Subject {
  name: string;
  students: Student[];
  subjectId?: string;
  batchId?: string;
  batchName?: string;
}

interface Course {
  courseId?: string;
  batchId?: string;
  name: string;
  subjects: Subject[];
  batchName?: string;
}

interface gradesData {
  courseId: string;
  batchId: string;
  subjectId: string;
  semesterId: string;
  students: Student[];
}

export default function FacultyGradebookPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [subjectData, setSubjectData] = useState<
    {
      courseId: string;
      courseName: string;
      batchId: string;
      batchName: string;
      subjectId: string;
      subjectName: string;
    }[]
  >([]);
  const [marksChanged, setMarksChanged] = useState(false);
  const [areGradesFetched, setAreGradesFetched] = useState(false);

  useEffect(() => {
    const map = new Map<
      string,
      {
        name: string; // Course Name + Batch Name
        courseId: string;
        batchId: string;
        batchName: string;
        subjects: Subject[];
      }
    >();

    subjectData.forEach((item) => {
      const key = `${item.courseName}___${item.batchName}`; // Unique per course + batch

      if (!map.has(key)) {
        map.set(key, {
          name: item.courseName,
          courseId: item.courseId,
          batchId: item.batchId,
          batchName: item.batchName,
          subjects: [],
        });
      }

      map.get(key)!.subjects.push({
        name: item.subjectName,
        subjectId: item.subjectId,
        batchId: item.batchId,
        batchName: item.batchName,
        students: [], // Add this line to satisfy the Subject interface
      });
    });

    setCourses(Array.from(map.values()));
  }, [subjectData]);

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.name);
  const [selectedSubject, setSelectedSubject] = useState(
    courses[0]?.subjects[0]?.name
  );
  const [openCourse, setOpenCourse] = useState(courses[0]?.name);
  const [semesterId, setCurrentSemesterId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [fetchedGradeId, setFetchedGradeId] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<number>(10);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
      
        setUser({
          id: parsed.uid,
          name: parsed.name,
          role: parsed.role,
        });
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        `/api/subjects/viewSubject/viewCourseWiseSubjects?teacherId=${user?.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjectData(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchStudentCurrentSemester = async () => {
    try {
      const res = await fetch(
        `/api/semesterDetail/viewSemesterDetail/viewStudentCurrentSemester/?courseId=${selectedCourseId}&batchId=${selectedBatchId}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch semester detail");
      }
      setCurrentSemesterId(data.semesterDetailId);
    } catch (error) {
      console.error("Error fetching semester detail:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `/api/students/viewStudent/viewBatchwiseStudents/?courseId=${selectedCourseId}&batchId=${selectedBatchId}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch grades detail");
      }
      const fetchedStudents = data.students.map((student: Student) => ({
        studentId: student.studentId,
        name: student.name,
        sessional1: 0,
        sessional2: 0,
        attendance: 0,
        assignments: 0,
      }));
      const updatedCourses = courses.map((course) => {
        // Match the course
        if (
          course.courseId === selectedCourseId &&
          course.batchId === selectedBatchId
        ) {
          return {
            ...course,
            subjects: course.subjects.map((subject) => {
              // Match the subject
              if (subject.subjectId === selectedSubjectId) {
                return {
                  ...subject,
                  students: fetchedStudents, // 💥 Add the students here
                };
              }
              return subject;
            }),
          };
        }
        return course;
      });

      // Optionally update your state if courses is managed via useState
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error fetching grades detail:", error);
    }
  };

  const fetchStudentGrades = async () => {
    try {
      const res = await fetch(
        `/api/grades/viewGrades/viewSubjectwiseGrades/?subjectId=${selectedSubjectId}&batchId=${selectedBatchId}&semesterId=${semesterId}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch grades detail");
      }
      if (!data || data?.grades?.length === 0) {
        fetchStudents();
        return;
      }
      setAreGradesFetched(true);
      setFetchedGradeId(data.gradeId);
      const updatedCourses = courses.map((course) => {
        // Match the course
        if (
          course.courseId === selectedCourseId &&
          course.batchId === selectedBatchId
        ) {
          return {
            ...course,
            subjects: course.subjects.map((subject) => {
              // Match the subject
              if (subject.subjectId === selectedSubjectId) {
                return {
                  ...subject,
                  students: data.students, // 💥 Add the students here
                };
              }
              return subject;
            }),
          };
        }
        return course;
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error fetching grades detail:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchSubjects();
  
  }, [user]);

  useEffect(() => {
    if (selectedCourseId && selectedBatchId) {
      fetchStudentCurrentSemester();
     
    }
  }, [selectedCourseId, selectedBatchId]);

  useEffect(() => {
    if (semesterId && selectedSubjectId && selectedBatchId) {
      fetchStudentGrades();
    }
  }, [semesterId]);

  const calculateFinalMarks = (student: Student): number => {
    const s1 = student.sessional1 ?? 0;
    const s2 = student.sessional2 ?? 0;
    const attendance = student.attendance ?? 0;
    const assignments = student.assignments ?? 0;

    const [higher, lower] = s1 > s2 ? [s1, s2] : [s2, s1];

    // Calculate weighted sessional score and scale to 15
    const weightedSessional = 0.7 * higher + 0.3 * lower;
    const sessionalMarks = (weightedSessional / 30) * 15;

    return sessionalMarks + attendance + assignments; // Total out of 30
  };

  const updateMarks = (
    courseName: string,
    subjectName: string,
    studentId: string,
    field: keyof Student,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    let maxValue: number;
    if (field === "sessional1" || field === "sessional2") maxValue = 30;
    else if (field === "attendance") maxValue = 5;
    else if (field === "assignments") maxValue = 10;
    else return;

    if (numValue > maxValue) return;

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.name !== courseName) return course;

        return {
          ...course,
          subjects: course.subjects.map((subject) => {
            if (subject.name !== subjectName) return subject;

            return {
              ...subject,
              students: subject.students.map((student) => {
                if (String(student.studentId) !== studentId) return student;

                return {
                  ...student,
                  [field]: numValue,
                };
              }),
            };
          }),
        };
      })
    );

    setMarksChanged(true);
  };

  const handleSubjectChange = (
    courseName: string,
    subjectName: string,
    courseId: string,
    subjectId: string,
    batchId: string
  ) => {
    setSelectedCourse(courseName);
    setSelectedSubject(subjectName);
    setOpenCourse(courseName);
    setSelectedCourseId(courseId);
    setSelectedSubjectId(subjectId);
    setSelectedBatchId(batchId);
  };

  const submitMarksToDB = async (
    courseId: string,
    batchId: string,
    subjectId: string,
    semesterId: string,
    students: Student[]
  ) => {
    try {
      const response = await fetch(`/api/grades/assignGrades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          batchId,
          subjectId,
          semesterId,
          students,
          category: "internal",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit marks");
      }
      const data = await response.json();
      fetchStudentGrades(); // Refresh grades after submission
      setMarksChanged(false);
    } catch (error) {
      console.error("Error submitting marks:", error);
    }
  };

  const updateGrades = async (studentsData: Student[]) => {
    try {
      const response = await fetch("/api/grades/updateGrades", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gradeId: fetchedGradeId,
          students: studentsData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update grades");
      }
      setMarksChanged(false);
    } catch (error) {
      console.error("Error updating grades:", error);
    }
  };

  const handleSubmitMarks = () => {
    const data = courses
      .find((course) => course.name === selectedCourse)
      ?.subjects.find((subject) => subject.name === selectedSubject);

    const dataToSubmit = {
      courseId: selectedCourseId,
      batchId: selectedBatchId,
      subjectId: selectedSubjectId,
      semesterId: semesterId,
      students: data?.students.map((student) => ({
        studentId: student.studentId,
        sessional1: student.sessional1 ?? 0,
        sessional2: student.sessional2 ?? 0,
        attendance: student.attendance ?? 0,
        assignments: student.assignments ?? 0,
      })),
    };
    if (!dataToSubmit.students || dataToSubmit.students.length === 0) {
      console.error("No students found to submit marks");
      return;
    }

    if (areGradesFetched) {
      updateGrades(dataToSubmit.students);
    } else {
      submitMarksToDB(
        dataToSubmit.courseId,
        dataToSubmit.batchId,
        dataToSubmit.subjectId,
        dataToSubmit.semesterId,
        dataToSubmit.students
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeader className="p-6">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            Gradebook
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Content with Sidebar */}
      <div className="grid grid-cols-[250px_1fr] gap-6 flex-1">
        {/* Sidebar */}
        <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl border-r border-border h-full overflow-y-auto">
          <CardContent className="p-4">
            {courses.map((course) => (
              <Collapsible
                key={course.name}
                open={openCourse === course.name}
                onOpenChange={() =>
                  setOpenCourse(openCourse === course.name ? "" : course.name)
                }
                className="mb-2"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-foreground font-semibold text-lg hover:bg-primary/10 rounded-md transition-all duration-300">
                  {course.name} {course.batchName && `(${course.batchName})`}
                  {openCourse === course.name ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {course.subjects.map((subject) => (
                    <div
                      key={subject.name}
                      className={cn(
                        "p-2 text-foreground rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-300",
                        selectedCourse === course.name &&
                          selectedSubject === subject.name &&
                          "bg-primary/20 border-l-4 border-primary"
                      )}
                      onClick={() =>
                        handleSubjectChange(
                          course.name,
                          subject.name,
                          course.courseId ?? "",
                          subject.subjectId ?? "",
                          subject.batchId ?? ""
                        )
                      }
                    >
                      {subject.name}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* Grade Table */}
        <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden h-full min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full min-h-0">
            <ScrollArea className="h-full w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">Student</TableHead>
                    <TableHead className="text-foreground">
                      Sessional 1 (30)
                    </TableHead>
                    <TableHead className="text-foreground">
                      Sessional 2 (30)
                    </TableHead>
                    <TableHead className="text-foreground">
                      Attendance (5)
                    </TableHead>
                    <TableHead className="text-foreground">
                      Assignments (10)
                    </TableHead>
                    <TableHead className="text-foreground">
                      Final Internal (30)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses
                    .find((course) => course.name === selectedCourse)
                    ?.subjects.find(
                      (subject) => subject.name === selectedSubject
                    )
                    ?.students?.map((student) => (
                      <TableRow
                        key={student.studentId}
                        className="hover:bg-primary/5 transition-all duration-300"
                      >
                        <TableCell className="font-medium text-foreground">
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.sessional1 ?? ""}
                            onChange={(e) =>
                              updateMarks(
                                selectedCourse,
                                selectedSubject,
                                String(student.studentId),
                                "sessional1",
                                e.target.value
                              )
                            }
                            className="w-16 bg-muted/50 border-border rounded-md"
                            placeholder="0-10"
                            min="0"
                            max="30"
                            step="0.1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.sessional2 ?? ""}
                            onChange={(e) =>
                              updateMarks(
                                selectedCourse,
                                selectedSubject,
                                student.studentId,
                                "sessional2",
                                e.target.value
                              )
                            }
                            className="w-16 bg-muted/50 border-border rounded-md"
                            placeholder="0-10"
                            min="0"
                            max="30"
                            step="0.1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.attendance ?? ""}
                            onChange={(e) =>
                              updateMarks(
                                selectedCourse,
                                selectedSubject,
                                student.studentId,
                                "attendance",
                                e.target.value
                              )
                            }
                            className="w-16 bg-muted/50 border-border rounded-md"
                            placeholder="0-5"
                            min="0"
                            max="5"
                            step="0.1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.assignments ?? ""}
                            onChange={(e) =>
                              updateMarks(
                                selectedCourse,
                                selectedSubject,
                                student.studentId,
                                "assignments",
                                e.target.value
                              )
                            }
                            className="w-16 bg-muted/50 border-border rounded-md"
                            placeholder="0-5"
                            min="0"
                            max="10"
                            step="0.1"
                          />
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {calculateFinalMarks(student).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {marksChanged && (
              <div className="mt-4 mx-auto flex justify-center">
                <Button
                  onClick={handleSubmitMarks}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-md hover:shadow-lg transition-all duration-300 "
                  aria-label="Submit Marks"
                >
                  Submit Marks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
