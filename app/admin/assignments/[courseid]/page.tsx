"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Folder, FileText, Edit, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Faculty {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  title: string;
  subjectId: number;
  dueDate: string;
  document: File | null;
  submissions: number;
  totalStudents: number;
}

interface SubjectFolder {
  id: number;
  name: string;
  facultyId: number | null;
  assignments: Assignment[];
}

interface CourseFolder {
  id: number;
  name: string;
  mentorId: number | null;
  subjects: SubjectFolder[];
}

export default function AdminAssignmentsPage() {
  const [courseFolders] = useState<CourseFolder[]>([
    {
      id: 1,
      name: "Mathematics 101",
      mentorId: 1,
      subjects: [
        {
          id: 1,
          name: "Algebra",
          facultyId: 1,
          assignments: [
            { id: 1, title: "Math Problem Set", subjectId: 1, dueDate: "2025-04-10", document: null, submissions: 25, totalStudents: 30 },
          ],
        },
        {
          id: 2,
          name: "Calculus",
          facultyId: 2,
          assignments: [],
        },
      ],
    },
    {
      id: 2,
      name: "Physics 201",
      mentorId: 2,
      subjects: [
        {
          id: 3,
          name: "Mechanics",
          facultyId: 2,
          assignments: [
            { id: 2, title: "Physics Lab Report", subjectId: 3, dueDate: "2025-04-08", document: null, submissions: 20, totalStudents: 25 },
          ],
        },
        {
          id: 4,
          name: "Thermodynamics",
          facultyId: 3,
          assignments: [],
        },
      ],
    },
    {
      id: 3,
      name: "CS 301",
      mentorId: 3,
      subjects: [
        { id: 5, name: "Algorithms", facultyId: 1, assignments: [] },
        { id: 6, name: "Data Structures", facultyId: 2, assignments: [] },
      ],
    },
  ]);

  const [facultyList] = useState<Faculty[]>([
    { id: 1, name: "Dr. John Smith" },
    { id: 2, name: "Prof. Jane Doe" },
    { id: 3, name: "Dr. Alan Brown" },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<CourseFolder | null>(null);
  const [subjects, setSubjects] = useState<SubjectFolder[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFolder | null>(null);

  // Default to first course and subject
  useEffect(() => {
    const defaultCourse = courseFolders[0];
    setSelectedCourse(defaultCourse);
    setSubjects(defaultCourse.subjects);
    setSelectedSubject(defaultCourse.subjects[0] || null);
  }, [courseFolders]);

  const [assignmentForm, setAssignmentForm] = useState({
    id: 0,
    title: "",
    subjectId: 0,
    dueDate: "",
    document: null as File | null,
  });
  const [openDialog, setOpenDialog] = useState<"assignment" | "delete" | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const handleAddOrUpdateAssignment = () => {
    if (!assignmentForm.title || !assignmentForm.subjectId || !assignmentForm.dueDate) {
      setError("Please fill all required fields.");
      return;
    }
    if (assignmentForm.id) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === assignmentForm.subjectId
            ? {
                ...s,
                assignments: s.assignments.map((a) =>
                  a.id === assignmentForm.id
                    ? { ...a, title: assignmentForm.title, dueDate: assignmentForm.dueDate, document: assignmentForm.document }
                    : a
                ),
              }
            : s
        )
      );
      console.log("Updated assignment:", assignmentForm);
    } else {
      const newId = selectedSubject
        ? selectedSubject.assignments.length + 1
        : Math.max(...subjects.flatMap((s) => s.assignments.map((a) => a.id)), 0) + 1;
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === assignmentForm.subjectId
            ? {
                ...s,
                assignments: [
                  ...s.assignments,
                  {
                    id: newId,
                    title: assignmentForm.title,
                    subjectId: assignmentForm.subjectId,
                    dueDate: assignmentForm.dueDate,
                    document: assignmentForm.document,
                    submissions: 0,
                    totalStudents: s.name === "Algebra" ? 30 : s.name === "Mechanics" ? 25 : 35,
                  },
                ],
              }
            : s
        )
      );
      console.log("Added assignment:", assignmentForm);
    }
    setAssignmentForm({ id: 0, title: "", subjectId: 0, dueDate: "", document: null });
    setOpenDialog(null);
    setError("");
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setAssignmentForm({
      id: assignment.id,
      title: assignment.title,
      subjectId: assignment.subjectId,
      dueDate: assignment.dueDate,
      document: assignment.document,
    });
    setOpenDialog("assignment");
  };

  const handleDeleteAssignment = (id: number) => {
    if (selectedSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === selectedSubject.id ? { ...s, assignments: s.assignments.filter((a) => a.id !== id) } : s
        )
      );
      console.log(`Deleted assignment ID: ${id}`);
    }
    setOpenDialog(null);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Manage Assignments
          </CardTitle>
          <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-full shadow-sm">
            <Select
              value={selectedCourse?.name || ""}
              onValueChange={(value) => {
                const course = courseFolders.find((c) => c.name === value) || courseFolders[0];
                setSelectedCourse(course);
                setSubjects(course.subjects);
                setSelectedSubject(course.subjects[0] || null);
              }}
            >
              <SelectTrigger className="bg-muted/50 border-border w-[200px]">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courseFolders.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedSubject?.name || "all"}
              onValueChange={(value) => {
                const subject = value === "all" ? null : subjects.find((s) => s.name === value) || null;
                setSelectedSubject(subject);
              }}
            >
              <SelectTrigger className="bg-muted/50 border-border w-[200px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setOpenDialog("assignment")}
              className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </div>
        </CardHeader>
      </Card>
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <h3 className="text-lg font-semibold text-foreground mb-4">Subject Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {subjects
              .filter((subject) => !selectedSubject || subject.name === selectedSubject.name)
              .map((subject) => (
                <Card
                  key={subject.id}
                  className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <Folder className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-foreground">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Faculty: {facultyList.find((f) => f.id === subject.facultyId)?.name || "None"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          {selectedSubject && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Assignments in {selectedSubject.name}</h3>
                <Button
                  onClick={() => setOpenDialog("assignment")}
                  className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-20rem)]">
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
                    {selectedSubject.assignments.map((assignment) => (
                      <TableRow key={assignment.id} className="hover:bg-primary/5 transition-all duration-300">
                        <TableCell className="font-medium text-foreground">{assignment.title}</TableCell>
                        <TableCell className="text-muted-foreground">{assignment.dueDate}</TableCell>
                        <TableCell className="text-muted-foreground">{assignment.submissions}/{assignment.totalStudents}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAssignment(assignment)}
                            className="border-border text-foreground hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteId(assignment.id);
                              setOpenDialog("delete");
                            }}
                            className="border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={openDialog === "assignment"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{assignmentForm.id ? "Edit Assignment" : "Add Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div>
              <Label htmlFor="title" className="text-foreground">Title</Label>
              <Input
                id="title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Assignment title"
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-foreground">Subject</Label>
              <Select
                value={assignmentForm.subjectId.toString()}
                onValueChange={(value) => setAssignmentForm((prev) => ({ ...prev, subjectId: parseInt(value) }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate" className="text-foreground">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label htmlFor="document" className="text-foreground">Document</Label>
              <Input
                id="document"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, document: e.target.files?.[0] || null }))}
                className="bg-muted/50 border-border"
              />
            </div>
            <Button
              onClick={handleAddOrUpdateAssignment}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {assignmentForm.id ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog === "delete"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-foreground">Are you sure you want to delete this assignment? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(null)}
              className="border-border text-foreground hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDeleteAssignment(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}