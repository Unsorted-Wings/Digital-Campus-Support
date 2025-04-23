"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, X, Trash2, Edit, File, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  document?: File | null;
  submissions: number;
  totalStudents: number;
}

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

interface Submission {
  studentId: number;
  studentName: string;
  submittedAt: string;
  file: string;
  grade?: number;
}

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, title: "Math Problem Set", course: "Mathematics 101", dueDate: "2025-04-10", document: null, submissions: 25, totalStudents: 30 },
    { id: 2, title: "Physics Lab Report", course: "Physics 201", dueDate: "2025-04-08", document: null, submissions: 20, totalStudents: 25 },
    { id: 3, title: "CS Project", course: "CS 301", dueDate: "2025-04-15", document: null, submissions: 30, totalStudents: 35 },
  ]);
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
  

  const [submissions, setSubmissions] = useState<{ [key: number]: Submission[] }>({
    1: [
      { studentId: 1, studentName: "John Doe", submittedAt: "2025-04-09", file: "/docs/math-set-john.pdf", grade: undefined },
      { studentId: 2, studentName: "Jane Smith", submittedAt: "2025-04-08", file: "/docs/math-set-jane.pdf", grade: 85 },
    ],
    2: [
      { studentId: 3, studentName: "Alice Brown", submittedAt: "2025-04-07", file: "/docs/physics-lab-alice.pdf", grade: 90 },
    ],
  });

  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [openCourse, setOpenCourse] = useState<string>(""); // Added state for openCourse
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({ title: "", course: "", dueDate: "", document: null as File | null });

  const filteredAssignments = selectedCourse
    ? assignments.filter((a) => a.course === selectedCourse)
    : assignments;

  const handleAddOrUpdateAssignment = () => {
    if (newAssignment.title && newAssignment.course && newAssignment.dueDate) {
      if (editAssignment) {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === editAssignment.id
              ? { ...a, title: newAssignment.title, course: newAssignment.course, dueDate: newAssignment.dueDate, document: newAssignment.document }
              : a
          )
        );
        console.log("Updated assignment:", newAssignment);
      } else {
        const newId = assignments.length + 1;
        setAssignments((prev) => [
          ...prev,
          {
            id: newId,
            title: newAssignment.title,
            course: newAssignment.course,
            dueDate: newAssignment.dueDate,
            document: newAssignment.document,
            submissions: 0,
            totalStudents: newAssignment.course === "Mathematics 101" ? 30 : newAssignment.course === "Physics 201" ? 25 : 35,
          },
        ]);
        console.log("Added assignment:", newAssignment);
      }
      setNewAssignment({ title: "", course: "", dueDate: "", document: null });
      setEditAssignment(null);
      setShowAddForm(false);
    }
  };

  const handleRemoveAssignment = (id: number) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (selectedAssignment === id) setSelectedAssignment(null);
    console.log(`Removed assignment ID: ${id}`);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      course: assignment.course,
      dueDate: assignment.dueDate,
      document: assignment.document ?? null,
    });
    setShowAddForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAssignment((prev) => ({ ...prev, document: file }));
    }
  };

  const handleGrade = (assignmentId: number) => {
    setSelectedAssignment(assignmentId);
  };

  const handleViewDocument = (document: File | null) => {
    if (document) {
      alert(`Viewing document: ${document.name}`);
      // Replace with Dialog or new tab
      // Example: window.open(URL.createObjectURL(document), "_blank");
    } else {
      alert("No document attached");
    }
  };

  const handleSubmitGrade = (assignmentId: number, studentId: number, grade: number) => {
    setSubmissions((prev) => ({
      ...prev,
      [assignmentId]: prev[assignmentId].map((sub) =>
        sub.studentId === studentId ? { ...sub, grade } : sub
      ),
    }));
    console.log(`Graded ${studentId} for assignment ${assignmentId}: ${grade}`);
  };

  function handleSubjectChange(courseName: string, subjectName: string) {
    setSelectedCourse(courseName);
    setSelectedSubject(subjectName);
    console.log(`Selected Course: ${courseName}, Selected Subject: ${subjectName}`);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Assignments
          </CardTitle>
          <div className="flex items-center gap-2 p-2">
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">{editAssignment ? "Edit Assignment" : "Add New Assignment"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="title" className="text-foreground">Title</Label>
                    <Input
                      id="title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Assignment title"
                      className="bg-muted/50 border-border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course" className="text-foreground">Course</Label>
                    <Select
                      value={newAssignment.course}
                      onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, course: value }))}
                    >
                      <SelectTrigger className="bg-muted/50 border-border rounded-md">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.name} value={course.name}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="text-foreground">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="bg-muted/50 border-border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="document" className="text-foreground">Assignment Document</Label>
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="bg-muted/50 border-border rounded-md"
                    />
                    {newAssignment.document && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {newAssignment.document.name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleAddOrUpdateAssignment}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                  >
                    {editAssignment ? "Update Assignment" : "Create Assignment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                      onClick={() => {
                        setSelectedCourse(course.name);
                        setSelectedSubject(subject.name);
                      }}
                    >
                      {subject.name}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* Assignments/Submissions */}
        <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden h-full min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full min-h-0">
            {selectedAssignment === null ? (
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-foreground">Title</TableHead>
                      <TableHead className="text-foreground">Due Date</TableHead>
                      <TableHead className="text-foreground">Submissions</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow
                        key={assignment.id}
                        className="hover:bg-primary/5 transition-all duration-300"
                      >
                        <TableCell className="font-medium text-foreground">{assignment.title}</TableCell>
                        <TableCell className="text-muted-foreground">{assignment.dueDate}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {assignment.submissions}/{assignment.totalStudents}
                        </TableCell>
                        <TableCell className="flex justify-between gap-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGrade(assignment.id)}
                              className="border-border text-foreground hover:bg-primary/10"
                            >
                              View Submissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(assignment.document ?? null)}
                              className="border-border text-foreground hover:bg-primary/10"
                              disabled={!assignment.document}
                            >
                              <File className="h-4 w-4 mr-2" />
                              View Assignment
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAssignment(assignment)}
                              className="text-foreground hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Submissions for {assignments.find((a) => a.id === selectedAssignment)?.title}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedAssignment(null)}
                    className="text-foreground hover:bg-primary/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-foreground">Student</TableHead>
                        <TableHead className="text-foreground">Submitted At</TableHead>
                        <TableHead className="text-foreground">File</TableHead>
                        <TableHead className="text-foreground">Grade</TableHead>
                        <TableHead className="text-foreground">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions[selectedAssignment]?.map((submission) => (
                        <TableRow
                          key={submission.studentId}
                          className="hover:bg-primary/5 transition-all duration-300"
                        >
                          <TableCell className="font-medium text-foreground">{submission.studentName}</TableCell>
                          <TableCell className="text-muted-foreground">{submission.submittedAt}</TableCell>
                          <TableCell className="text-muted-foreground">{submission.file}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {submission.grade !== undefined ? `${submission.grade}/100` : "Not Graded"}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Grade"
                              className="w-20 inline-block mr-2 bg-muted/50 border-border rounded-md"
                              onChange={(e) => {
                                const grade = parseInt(e.target.value);
                                if (grade >= 0 && grade <= 100) {
                                  handleSubmitGrade(selectedAssignment, submission.studentId, grade);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => console.log(`Download ${submission.file}`)}
                              className="border-border text-foreground hover:bg-primary/10"
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}