"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
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
    { id: 1, title: "Math Problem Set", course: "Mathematics 101", dueDate: "2025-04-10", submissions: 25, totalStudents: 30 },
    { id: 2, title: "Physics Lab Report", course: "Physics 201", dueDate: "2025-04-08", submissions: 20, totalStudents: 25 },
    { id: 3, title: "CS Project", course: "CS 301", dueDate: "2025-04-15", submissions: 30, totalStudents: 35 },
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", course: "", dueDate: "" });

  const courses = ["Mathematics 101", "Physics 201", "CS 301"]; // Mock course list

  const handleAddAssignment = () => {
    if (newAssignment.title && newAssignment.course && newAssignment.dueDate) {
      const newId = assignments.length + 1;
      setAssignments([...assignments, { 
        id: newId, 
        title: newAssignment.title, 
        course: newAssignment.course, 
        dueDate: newAssignment.dueDate, 
        submissions: 0, 
        totalStudents: courses.find(c => c === newAssignment.course) === "Mathematics 101" ? 30 : newAssignment.course === "Physics 201" ? 25 : 35 
      }]);
      setNewAssignment({ title: "", course: "", dueDate: "" });
      setShowAddForm(false);
      console.log("Added assignment:", newAssignment);
    }
  };

  const handleGrade = (assignmentId: number) => {
    setSelectedAssignment(assignmentId);
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

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeader className="p-4 flex items-center justify-between">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Assignments
          </CardTitle>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-2" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="Assignment title"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="course" className="text-foreground">Course</Label>
                  <Select
                    value={newAssignment.course}
                    onValueChange={(value) => setNewAssignment({ ...newAssignment, course: value })}
                  >
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
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
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <Button onClick={handleAddAssignment} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          {selectedAssignment === null ? (
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">Title</TableHead>
                    <TableHead className="text-foreground">Course</TableHead>
                    <TableHead className="text-foreground">Due Date</TableHead>
                    <TableHead className="text-foreground">Submissions</TableHead>
                    <TableHead className="text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow
                      key={assignment.id}
                      className="hover:bg-primary/5 transition-all duration-300"
                    >
                      <TableCell className="font-medium text-foreground">{assignment.title}</TableCell>
                      <TableCell className="text-muted-foreground">{assignment.course}</TableCell>
                      <TableCell className="text-muted-foreground">{assignment.dueDate}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {assignment.submissions}/{assignment.totalStudents}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrade(assignment.id)}
                          className="border-border text-foreground hover:bg-primary/10"
                        >
                          View Submissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="h-[calc(100vh-12rem)] flex flex-col">
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
                            className="w-20 inline-block mr-2 bg-muted/50 border-border"
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
  );
}