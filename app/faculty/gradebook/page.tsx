"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";
import { useState } from "react";

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

  const [selectedSubjects, setSelectedSubjects] = useState<{ [courseName: string]: string }>(
    courses.reduce((acc, course) => ({ ...acc, [course.name]: course.subjects[0].name }), {})
  );

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
    courseIdx: number,
    subjectIdx: number,
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

    setCourses((prev) =>
      prev.map((course, cIdx) =>
        cIdx === courseIdx
          ? {
              ...course,
              subjects: course.subjects.map((subject, sIdx) =>
                sIdx === subjectIdx
                  ? {
                      ...subject,
                      students: subject.students.map((student) =>
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
    setSelectedSubjects((prev) => ({ ...prev, [courseName]: subjectName }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            Gradebook
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <Tabs defaultValue={courses[0].name} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted/50 rounded-lg p-1 mb-4">
              {courses.map((course) => (
                <TabsTrigger
                  key={course.name}
                  value={course.name}
                  className="rounded-md py-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  {course.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {courses.map((course, courseIdx) => (
              <TabsContent key={course.name} value={course.name}>
                <div className="mb-4">
                  <Select
                    value={selectedSubjects[course.name]}
                    onValueChange={(value) => handleSubjectChange(course.name, value)}
                  >
                    <SelectTrigger className="w-[200px] bg-muted/50 border-border rounded-lg">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {course.subjects.map((subject) => (
                        <SelectItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="h-[calc(100vh-16rem)]">
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
                      {course.subjects
                        .find((subject) => subject.name === selectedSubjects[course.name])
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
                                    courseIdx,
                                    course.subjects.findIndex((s) => s.name === selectedSubjects[course.name]),
                                    student.id,
                                    "sessional1",
                                    e.target.value
                                  )
                                }
                                className="w-16 bg-muted/50 border-border"
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
                                    courseIdx,
                                    course.subjects.findIndex((s) => s.name === selectedSubjects[course.name]),
                                    student.id,
                                    "sessional2",
                                    e.target.value
                                  )
                                }
                                className="w-16 bg-muted/50 border-border"
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
                                    courseIdx,
                                    course.subjects.findIndex((s) => s.name === selectedSubjects[course.name]),
                                    student.id,
                                    "attendance",
                                    e.target.value
                                  )
                                }
                                className="w-16 bg-muted/50 border-border"
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
                                    courseIdx,
                                    course.subjects.findIndex((s) => s.name === selectedSubjects[course.name]),
                                    student.id,
                                    "assignments",
                                    e.target.value
                                  )
                                }
                                className="w-16 bg-muted/50 border-border"
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
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}