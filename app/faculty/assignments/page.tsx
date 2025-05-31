"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, X, Trash2, Edit, File, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { doc } from "firebase/firestore";

interface Assignment {
  id: string;
  title: string;
  course: string; // Changed to array of course IDs
  dueDate: string;
  assignmentDocUrl?: string | null;
  subjectId: string;
  subjectName: string; // Added subjectName to interface
  submissions: number;
  totalStudents: number;
  submittedBy?: Submission[];
  batchId?: string;
  createdat?: string;
  description?: string;
  semesterId?: string;
  // If your backend sends a 'subject' object, you might need this:
  // subject?: { subjectName: string; subjectId: string };
  teacherId?: string;
  updatedAt?: string;
}

interface Student {
  id: number;
  name: string;
  sessional1?: number;
  sessional2?: number;
  attendance?: number;
  assignments?: number;
}

// interface Subject {
//   name: string;
//   students: Student[];
// }

interface Subjects {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  subjects: Subjects[];
}
interface Submission {
  userId: number;
  userName: string;
  uploadedAt: string;
  assignmentDocUrl: string;
  grade?: number;
}

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  // const [courses, setCourses] = useState<Course[]>([
  //   {
  //     name: "Mathematics 101",
  //     subjects: [
  //       {
  //         name: "Algebra",
  //         students: [
  //           { id: 1, name: "John Doe", sessional1: undefined, sessional2: undefined, attendance: undefined, assignments: undefined },
  //           { id: 2, name: "Jane Smith", sessional1: 8, sessional2: 9, attendance: 4, assignments: 3 },
  //         ],
  //       },
  //       {
  //         name: "Calculus",
  //         students: [
  //           { id: 1, name: "John Doe", sessional1: 7, sessional2: 8, attendance: 5, assignments: 4 },
  //           { id: 2, name: "Jane Smith", sessional1: 9, sessional2: 7, attendance: 3, assignments: 5 },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Physics 201",
  //     subjects: [
  //       {
  //         name: "Mechanics",
  //         students: [
  //           { id: 3, name: "Alice Brown", sessional1: 7, sessional2: 6, attendance: 5, assignments: 4 },
  //         ],
  //       },
  //       {
  //         name: "Thermodynamics",
  //         students: [
  //           { id: 3, name: "Alice Brown", sessional1: 8, sessional2: 8, attendance: 4, assignments: 3 },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "CS 301",
  //     subjects: [
  //       {
  //         name: "Algorithms",
  //         students: [
  //           { id: 4, name: "Bob Johnson", sessional1: 9, sessional2: 8, attendance: 3, assignments: 5 },
  //         ],
  //       },
  //       {
  //         name: "Data Structures",
  //         students: [
  //           { id: 4, name: "Bob Johnson", sessional1: 6, sessional2: 7, attendance: 4, assignments: 4 },
  //         ],
  //       },
  //     ],
  //   },
  // ]);

  const [courses, setCourses] = useState<Course[]>([]);

  const [submissions, setSubmissions] = useState<{ [key: string]: Submission[] }>({
    "1": [
      { userId: 1, userName: "John Doe", uploadedAt: "2025-04-09", assignmentDocUrl: "/docs/math-set-john.pdf", grade: undefined },
      { userId: 2, userName: "Jane Smith", uploadedAt: "2025-04-08", assignmentDocUrl: "/docs/math-set-jane.pdf", grade: 85 },
    ],
    "2": [
      { userId: 3, userName: "Alice Brown", uploadedAt: "2025-04-07", assignmentDocUrl: "/docs/physics-lab-alice.pdf", grade: 90 },
    ],
  });

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const [openCourse, setOpenCourse] = useState<string>(""); // Added state for openCourse
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({ title: "", course: "", dueDate: "", document: null as File | null });

  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const uidFromStorage = parsedUser?.uid || null;
    setUid(uidFromStorage);
  }, []);
  const fetchAssignments = async () => {
    try {

      const response = await fetch(`/api/assignment/viewAssignment`);

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }

      const data = await response.json();

      // Enhance assignment data with status

      const enhancedAssignments = data.map((assignment: Assignment) => ({
        ...assignment,
        totalStudents: 120,
        submissions: assignment.submittedBy?.length || 0,
      }));

      setAssignments(enhancedAssignments);
      console.log(enhancedAssignments);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchCourseWiseSubjects = async () => {
    try {

      const response = await fetch(`/api/subjects/viewSubject/viewCourseWiseSubjects?teacherId=CsZ00htYppoqATY6uxAQ`);

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      // Map data to Course[] structure
      const courseMap: Record<string, Course> = {};

      data.forEach((item: any) => {
        if (!courseMap[item.courseId]) {
          courseMap[item.courseId] = {
            id: item.courseId,
            name: item.courseName,
            subjects: [],
          };
        }

        // Avoid duplicate subjects
        const subjectExists = courseMap[item.courseId].subjects.some(
          (s) => s.id === item.subjectId
        );

        if (!subjectExists) {
          courseMap[item.courseId].subjects.push({
            id: item.subjectId,
            name: item.subjectName,
          });
        }
      });

      const courseList = Object.values(courseMap);
      setCourses(courseList);
      console.log("Transformed course list:", courseList);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch assignments on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);
  useEffect(() => {
    fetchCourseWiseSubjects();
  }, []);

  const filteredAssignments = selectedCourse
    ? assignments.filter((a) => a.course === selectedCourse)
    : assignments;

  // useEffect(() => {
  //   fetchCourses();
  // }, []);

  const handleAddOrUpdateAssignment = async () => {
    if (newAssignment.title && newAssignment.course && newAssignment.dueDate) {
      if (editAssignment) {
        // Updating an existing assignment (not sending to API in this example)
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === editAssignment.id
              ? {
                ...a,
                title: newAssignment.title,
                course: newAssignment.course,
                dueDate: newAssignment.dueDate,
                document: newAssignment.document,
              }
              : a
          )
        );
        console.log("Updated assignment:", newAssignment);
      } else {
        try {
          const formData = new FormData();
          formData.append("title", newAssignment.title);
          formData.append("course", newAssignment.course);
          formData.append("dueDate", newAssignment.dueDate);
          if (newAssignment.document) {
            formData.append("file", newAssignment.document);
          }

          const response = await fetch("/api/DocRepo/uploadAssignment", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to upload assignment");
          }
          const cloudiData = await response.json();
          console.log(cloudiData)
          try {
            const createAssignmentResponse = await fetch("/api/assignment/createAssignment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: newAssignment.title,
                description: "Sample Assignment",
                courseId: "g8XqpmNeBFcD0ef8vn9V",
                batchId: "batch_2025spring",
                semesterId: "2TEj1rRwbjuluB1jGMQx",
                subjectId: "b2YEKfSN0nvtG1DJEDuY",
                teacherId: uid,
                dueDate: newAssignment.dueDate,
                assignmentDocUrl: cloudiData.data.secure_url
              }),
            });

            if (createAssignmentResponse.ok) {
              console.log("assignment uploaded.")
              fetchAssignments()



            } else {
              console.log("error fetching data")
            }
          } catch (error: any) {
            console.log(error)
          }
          const newId = assignments.length + 1;


          console.log("Added assignment:", newAssignment);
        } catch (error: any) {
          console.error("Error uploading assignment:", error);
        }
      }

      // Reset form and close dialog
      setNewAssignment({ title: "", course: "", dueDate: "", document: null });
      setEditAssignment(null);
      setShowAddForm(false);
    }
  };


  const handleRemoveAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (selectedAssignment && selectedAssignment.id === id) setSelectedAssignment(null);
    console.log(`Removed assignment ID: ${id}`);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditAssignment(assignment);
    // setNewAssignment({
    //   title: assignment.title,
    //   course: assignment.course,
    //   dueDate: assignment.dueDate,
    //   document: assignment.assignmentDocUrl ?? null,
    // });
    // setShowAddForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAssignment((prev) => ({ ...prev, document: file }));
    }
  };

  const handleGrade = (assignment: Assignment) => {

    setSelectedAssignment(assignment);
    console.log(assignment)

  };

  const handleViewDocument = (url: string | null | undefined) => {
    if (url) {
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleDocsViewerUrl, "_blank");
    } else {
      alert("No document URL available");
    }
  };;

  const handleSubmitGrade = (assignmentId: string, studentId: number, grade: number) => {
    setSubmissions((prev) => ({
      ...prev,
      [assignmentId]: prev[assignmentId].map((sub) =>
        sub.userId === studentId ? { ...sub, grade } : sub
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
                              onClick={() => handleGrade(assignment)}
                              className="border-border text-foreground hover:bg-primary/10"
                            >
                              View Submissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(assignment.assignmentDocUrl ?? null)}
                              className="border-border text-foreground hover:bg-primary/10"
                              disabled={!assignment.assignmentDocUrl}
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
                    Submissions for {selectedAssignment.title}
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
                      {selectedAssignment?.submittedBy?.map((submission: any, index: number) => (
                        <TableRow
                          key={submission.userId || index}
                          className="hover:bg-primary/5 transition-all duration-300"
                        >
                          <TableCell className="font-medium text-foreground">{submission.userName}</TableCell>
                          <TableCell className="text-muted-foreground">{submission.uploadedAt}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.assignmentDocUrl)}`}
                              target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              View File
                            </a>
                          </TableCell>
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
                                  handleSubmitGrade(selectedAssignment.id, submission.userId, grade);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(submission.assignmentDocUrl, "_blank")}
                              disabled={!submission.assignmentDocUrl}
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