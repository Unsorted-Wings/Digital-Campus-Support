"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Student {
  id: number;
  name: string;
  sessional1?: number;
  sessional2?: number;
  attendance?: number;
  assignments?: number;
}

interface Subject {
  name: string;
  students: Student[];
}

interface Course {
  name: string;
  subjects: Subject[];
}

export default function FacultyGradebookPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      name: "Mathematics 101",
      subjects: [
        {
          name: "Algebra",
          students: [
            { id: 1, name: "John Doe", sessional1: undefined, sessional2: undefined, attendance: undefined, assignments: undefined },
            { id: 2, name: "Jane Smith", sessional1: 8, sessional2: 9, attendance: 4, assignments: 3 },
          ],
        },
        {
          name: "Calculus",
          students: [
            { id: 1, name: "John Doe", sessional1: 7, sessional2: 8, attendance: 5, assignments: 4 },
            { id: 2, name: "Jane Smith", sessional1: 9, sessional2: 7, attendance: 3, assignments: 5 },
          ],
        },
      ],
    },
    {
      name: "Physics 201",
      subjects: [
        {
          name: "Mechanics",
          students: [
            { id: 3, name: "Alice Brown", sessional1: 7, sessional2: 6, attendance: 5, assignments: 4 },
          ],
        },
        {
          name: "Thermodynamics",
          students: [
            { id: 3, name: "Alice Brown", sessional1: 8, sessional2: 8, attendance: 4, assignments: 3 },
          ],
        },
      ],
    },
    {
      name: "CS 301",
      subjects: [
        {
          name: "Algorithms",
          students: [
            { id: 4, name: "Bob Johnson", sessional1: 9, sessional2: 8, attendance: 3, assignments: 5 },
          ],
        },
        {
          name: "Data Structures",
          students: [
            { id: 4, name: "Bob Johnson", sessional1: 6, sessional2: 7, attendance: 4, assignments: 4 },
          ],
        },
      ],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState(courses[0].name);
  const [selectedSubject, setSelectedSubject] = useState(courses[0].subjects[0].name);
  const [openCourse, setOpenCourse] = useState(courses[0].name);

  const calculateFinalMarks = (student: Student): number => {
    const s1 = student.sessional1 ?? 0;
    const s2 = student.sessional2 ?? 0;
    const attendance = student.attendance ?? 0;
    const assignments = student.assignments ?? 0;
    const [higher, lower] = s1 > s2 ? [s1, s2] : [s2, s1];
    const sessionalMarks = 0.7 * higher + 0.3 * lower; // Out of 10
    return sessionalMarks + attendance + assignments; // Total out of 30
  };

  const updateMarks = (
    courseName: string,
    subjectName: string,
    studentId: number,
    field: keyof Student,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    let maxValue: number;
    if (field === "sessional1" || field === "sessional2") maxValue = 10;
    else if (field === "attendance" || field === "assignments") maxValue = 5;
    else return;

    if (numValue > maxValue) return;

    setCourses((prev: { name: string; subjects: any[]; }[]) =>
      prev.map((course: { name: string; subjects: any[]; }) =>
        course.name === courseName
          ? {
              ...course,
              subjects: course.subjects.map((subject) =>
                subject.name === subjectName
                  ? {
                      ...subject,
                      students: subject.students.map((student: { id: number; }) =>
                        student.id === studentId
                          ? { ...student, [field]: numValue }
                          : student
                      ),
                    }
                  : subject
              ),
            }
          : course
      )
    );
  };

  const handleSubjectChange = (courseName: string, subjectName: string) => {
    setSelectedCourse(courseName);
    setSelectedSubject(subjectName);
    setOpenCourse(courseName);
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
                onOpenChange={() => setOpenCourse(openCourse === course.name ? "" : course.name)}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-foreground font-semibold text-lg hover:bg-primary/10 rounded-md transition-all duration-300">
                  {course.name}
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
                        selectedCourse === course.name && selectedSubject === subject.name &&
                          "bg-primary/20 border-l-4 border-primary"
                      )}
                      onClick={() => handleSubjectChange(course.name, subject.name)}
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
                    <TableHead className="text-foreground">Sessional 1 (10)</TableHead>
                    <TableHead className="text-foreground">Sessional 2 (10)</TableHead>
                    <TableHead className="text-foreground">Attendance (5)</TableHead>
                    <TableHead className="text-foreground">Assignments (5)</TableHead>
                    <TableHead className="text-foreground">Final Internal (30)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses
                    .find((course) => course.name === selectedCourse)
                    ?.subjects.find((subject) => subject.name === selectedSubject)
                    ?.students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-primary/5 transition-all duration-300"
                      >
                        <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.sessional1 ?? ""}
                            onChange={(e) =>
                              updateMarks(
                                selectedCourse,
                                selectedSubject,
                                student.id,
                                "sessional1",
                                e.target.value
                              )
                            }
                            className="w-16 bg-muted/50 border-border rounded-md"
                            placeholder="0-10"
                            min="0"
                            max="10"
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
                                student.id,
                                "sessional2",
                                e.target.value
                              )
                            }
                            className="w-16 bg-muted/50 border-border rounded-md"
                            placeholder="0-10"
                            min="0"
                            max="10"
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
                                student.id,
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
                                student.id,
                                "assignments",
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
                        <TableCell className="text-foreground font-medium">
                          {calculateFinalMarks(student).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}