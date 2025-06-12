"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, X, Trash2, Edit, File, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


interface Assignment {
  id: string;
  title: string;
  courseId: string; // Changed to array of course IDs
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
  resource_id?: string;
  teacherId?: string;
  updatedAt?: string;
  courseName?: string; // Optional, if you want to display course name
  cloudinaryResourceType?: string;
}

interface Student {
  id: number;
  name: string;
  sessional1?: number;
  sessional2?: number;
  attendance?: number;
  assignments?: number;
}


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
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({ title: "", subject: "", course: "", dueDate: "", document: null as File | null });
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
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>(
    Object.fromEntries(courses.map((course) => [course.name, false]))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("Parsed user from localStorage:", parsed);
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
  const fetchAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const response = await fetch(`/api/assignment/viewAssignment`);

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }
      const data = await response.json();

      // Enhance assignment data with status and names
      const enhancedAssignments = data.map((assignment: Assignment) => {
        const { courseName, subjectName } = getCourseAndSubjectNames(
          assignment.courseId,
          assignment.batchId ?? "", // Ensure batchId is a string
          assignment.subjectId
        );
        console.log(courseName, subjectName, assignment)
        return {
          ...assignment,
          courseName: courseName,   // Add course name
          subjectName: subjectName, // Add subject name
          totalStudents: 120, // This seems to be a placeholder, adjust as needed
          submissions: assignment.submittedBy?.length || 0,
        };
      });

      setAssignments(enhancedAssignments);
      console.log(enhancedAssignments);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
    }
    finally {
      setIsLoadingAssignments(false); 
    }
  };
  useEffect(() => {
    if (user && subjectData && subjectData.length > 0) {
      fetchAssignments();
    } else if (user && (!subjectData || subjectData.length === 0)) {
      fetchAssignments(); // Clear resources if data is not ready yet
    }
  }, [user, subjectData]);

  const fetchSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      console.log(user);
      const response = await fetch(
        `/api/subjects/viewSubject/viewCourseWiseSubjects?teacherId=${user?.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjectData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setIsLoadingSubjects(false); // Set loading to false after fetching subjects
    }
  };
  useEffect(() => {
    if (!user) return;
    fetchSubjects();
  }, [user]);
  const groupedCourses = subjectData?.reduce(
    (
      acc: {
        name: string;
        courseId: string;
        batchId: string;
        subjects: { id: string; name: string }[];
      }[],
      item
    ) => {
      const combinedName = `${item.courseName} - ${item.batchName}`;
      const key = `${item.courseId}-${item.batchId}`; // Unique key for course+batch

      const existing = acc.find(
        (entry) =>
          entry.courseId === item.courseId && entry.batchId === item.batchId
      );

      const subject = {
        id: item.subjectId,
        name: item.subjectName,
      };

      if (existing) {
        const alreadyExists = existing.subjects.some(
          (s) => s.id === subject.id
        );
        if (!alreadyExists) {
          existing.subjects.push(subject);
        }
      } else {
        acc.push({
          name: combinedName,
          courseId: item.courseId,
          batchId: item.batchId,
          subjects: [subject],
        });
      }

      return acc;
    },
    []
  );
  console.log(groupedCourses)
  const handleToggleCourse = (name: string, open: boolean) => {
    setOpenCourses((prev) => ({ ...prev, [name]: open }));
  };

  const filteredAssignments = assignments.filter((assignment) => {
    // If a course is selected AND a subject is selected within that course
    if (selectedCourse && selectedSubject) {
      const courseBatchInfo = groupedCourses.find(
        (gc) => gc.name === selectedCourse
      );

      const subjectInfo = courseBatchInfo?.subjects.find(
        (s) => s.name === selectedSubject
      );

      return (
        assignment.courseId === courseBatchInfo?.courseId &&
        assignment.batchId === courseBatchInfo?.batchId && // Assuming batchId is also part of the filter
        assignment.subjectId === subjectInfo?.id
      );
    }
 
    else if (selectedCourse) {
      const courseBatchInfo = groupedCourses.find(
        (gc) => gc.name === selectedCourse
      );
      // Filter by courseId and batchId
      return (
        assignment.courseId === courseBatchInfo?.courseId &&
        assignment.batchId === courseBatchInfo?.batchId
      );
    }
    // If neither a course nor a subject is selected, show all assignments
    return true;
  });

  const getCourseInfoFromSubjectAndCourse = (subjectName: string, courseName: string) => {
    if (!groupedCourses || groupedCourses.length === 0) {
      console.warn("groupedCourses is not initialized or empty when calling getCourseInfoFromSubjectAndCourse.");
      return null;
    }

    const match = groupedCourses.find((course) => course.name === courseName);
    if (!match) {
      console.error(`Course not found in groupedCourses for name: ${courseName}`);
      return null;
    }

    const subject = match.subjects.find((s) => s.name === subjectName);
    if (!subject) {
      console.error(`Subject "${subjectName}" not found within course "${courseName}".`);
      return null;
    }

    return {
      courseId: match.courseId,
      batchId: match.batchId,
      subjectId: subject.id,
    };
  };
  const getCourseAndSubjectNames = (
    courseId: string,
    batchId: string,
    subjectId: string | undefined
  ) => {
    // Add a check to ensure groupedCourses is populated
    if (!groupedCourses || groupedCourses.length === 0) {
      // Provide a temporary loading state or default if data isn't ready
      return { courseName: "Loading...", subjectName: "Loading..." };
    }

    const courseBatch = groupedCourses.find(
      (gc) => gc.courseId === courseId && gc.batchId === batchId
    );

    const courseName = courseBatch ? courseBatch.name : "Unknown Course/Batch"; // More specific
    const subjectName = subjectId
      ? courseBatch?.subjects.find((s) => s.id === subjectId)?.name || "Unknown Subject"
      : "No Subject Specified"; // More specific

    return { courseName, subjectName };
  };
  const handleAddOrUpdateAssignment = async () => {
    if (newAssignment.title && newAssignment.course && newAssignment.dueDate && newAssignment.document && newAssignment.subject) {
      try {
        setIsUploading(true);

        const courseInfo = getCourseInfoFromSubjectAndCourse(newAssignment.subject, newAssignment.course);
        if (!courseInfo) {
          console.error("Subject or course not found in groupedCourses");
          return;
        }
        const semesterResponse = await fetch(
          `/api/semesterDetail/getSemesterDetails?courseId=${courseInfo.courseId}&batchId=${courseInfo.batchId}`
        );
        if (!semesterResponse.ok) {
          // Handle cases where semester details are not found or API errors
          const errorData = await semesterResponse.json();
          console.error("Failed to fetch semester details:", errorData.error);
          throw new Error(errorData.error || "Failed to fetch semester details");
        }
        const semesterData = await semesterResponse.json();
        const semesterId = semesterData.semesterId;

        if (editAssignment && editAssignment.resource_id && editAssignment.id) {
          console.log(editAssignment)
          console.log(newAssignment)
          try {

            const formData = new FormData();
            formData.append("file", newAssignment.document);
            formData.append("name", newAssignment.title);
            formData.append("courseId", courseInfo.courseId || "");
            formData.append("semesterId", semesterId);
            formData.append("batchId", courseInfo.batchId);
            formData.append("subjectId", courseInfo.subjectId);
            formData.append("description", "Sample Assignment");
            formData.append("resource_id", editAssignment.resource_id);
            formData.append("id", editAssignment.id);
            formData.append("cloudinaryResourceType", editAssignment.cloudinaryResourceType ?? "");

            const response = await fetch("/api/DocRepo/updateResource/", {
              method: "POST",
              body: formData, // or JSON.stringify(newAssignment)
            });
            const cloudiData = await response.json();
            console.log("Cloudinary response:", cloudiData);
            if (response.ok) {
              console.log('sent')
              const updateAssignmentResponse = await fetch("/api/assignment/updateAssignment", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: editAssignment.id,
                  title: newAssignment.title,
                  description: "Sample Assignment",
                  courseId: courseInfo.courseId,
                  batchId: courseInfo.batchId,
                  semesterId: semesterId,
                  subjectId: courseInfo.subjectId,
                  dueDate: newAssignment.dueDate,
                  assignmentDocUrl: cloudiData.data.secure_url,
                  resource_id: cloudiData.data.resource_id,
                }),
              });
              console.log(await updateAssignmentResponse.json())
            }
          } catch (error: any) {
            console.log(error)
          }
          // Updating an existing assignment (not sending to API in this example)
          await fetchAssignments();
          setNewAssignment({ title: "", subject: "", course: "", dueDate: "", document: null });
          console.log("Updated assignment:", newAssignment);
        }
        else {
          try {

            const formData = new FormData();
            formData.append("file", newAssignment.document);
            formData.append("name", newAssignment.title);
            formData.append("courseId", courseInfo.courseId || "");
            formData.append("semesterId", semesterId);
            formData.append("batchId", courseInfo.batchId || "");
            formData.append("subjectId", courseInfo.subjectId || "");
            formData.append("description", "Sample Assignment");
            formData.append("type", "assignment");


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
                  courseId: courseInfo.courseId,
                  batchId: courseInfo.batchId,
                  semesterId: semesterId,
                  subjectId: courseInfo.subjectId,
                  teacherId: user?.id,
                  dueDate: newAssignment.dueDate,
                  assignmentDocUrl: cloudiData.data.secure_url,
                  resource_id: cloudiData.data.resource_id
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


            console.log("Added assignment:", newAssignment);
          } catch (error: any) {
            console.error("Error uploading assignment:", error);
          }
        }
      } catch (err: any) {

      } finally {
        setNewAssignment({ title: "", subject: "", course: "", dueDate: "", document: null });
        setEditAssignment(null);
        setShowAddForm(false);
        setIsUploading(false);
      }

    }
  };
  const handleRemoveAssignment = async (assignment: Assignment) => {
    try {
      setIsDeleting(assignment.id);
      const response = await fetch("/api/assignment/deleteAssignment/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: assignment.id, // any frontend request ID (if needed)
          resource_id: assignment.resource_id, // this is the actual Firestore doc ID
          cloudinaryResourceType: assignment.cloudinaryResourceType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to delete assignment:", result.error);
        return;
      }
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
      if (selectedAssignment?.id === assignment.id) {
        setSelectedAssignment(null);
      }

      console.log("Deleted successfully:", result.message);
    } catch (err) {
      console.error("Error deleting assignment:", err);
    } finally {
      setIsDeleting(null); 
    }
  };


  const handleEditAssignment = (assignment: Assignment) => {
    setEditAssignment(assignment);
    console.log("Editing assignment:", assignment);
    setShowAddForm(true);
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
            <Dialog
              open={showAddForm}
              onOpenChange={(open) => { // This 'open' parameter is true when opening, false when closing
                setShowAddForm(open); // This keeps your dialog's visibility state synchronized
                if (!open) { // This condition checks if the dialog is *being closed*
                  setEditAssignment(null); // Set editAssignment to null when the form closes
                  setNewAssignment({ title: "", subject: "", course: "", dueDate: "", document: null }); // Also clear the form fields
                }
              }}
            >
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
                    <Label htmlFor="subject" className="text-foreground">
                      Subject
                    </Label>
                    <Select
                      value={newAssignment.subject}
                      onValueChange={(value) =>
                        setNewAssignment((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger className="bg-muted/50 border-border rounded-md">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupedCourses.map((course) =>
                          course.subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>

                    </Select>
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
                        {groupedCourses.map((course) => (
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
                    disabled={!newAssignment.title ||
                      !newAssignment.subject ||
                      !newAssignment.course ||
                      !newAssignment.dueDate ||
                      !newAssignment.document ||
                      isUploading} // Disable the button while uploading to prevent double clicks
                  >
                    {isUploading
                      ? "Uploading..."
                      : (editAssignment ? "Update Assignment" : "Create Assignment")}
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
            <div
              className={cn(
                "p-2 text-foreground rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-300 mb-2",
                !selectedCourse &&
                !selectedSubject &&
                "bg-primary/20 border-l-4 border-primary"
              )}
              onClick={() => {
                setSelectedCourse(null);
                setSelectedSubject(null);
              }}
            >
              All Courses
            </div>
            {isLoadingSubjects ? ( // Conditional render for subject loading
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading Courses and Subjects...</span>
              </div>
            ) : groupedCourses.length === 0 ? (
              <div className="p-4 text-muted-foreground text-center">No subjects found.</div>
            ) : (
              groupedCourses.map((course) => (
                <Collapsible
                  key={course.name}
                  open={openCourses[course.name]}
                  onOpenChange={(open) => handleToggleCourse(course.name, open)}
                  className="mb-2"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex items-center justify-between w-full p-2 text-foreground rounded-md hover:bg-primary/10 transition-all duration-300",
                      selectedCourse === course.name &&
                      !selectedSubject &&
                      "bg-primary/20 border-l-4 border-primary"
                    )}
                  >
                    <span>{course.name}</span>
                    {openCourses[course.name] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="transition-all duration-300">
                    {course.subjects.map((subject) => (
                      <div
                        key={subject.name}
                        className={cn(
                          "p-2 pl-6 text-foreground rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-300",
                          selectedCourse === course.name &&
                          selectedSubject === subject.name &&
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
              ))
            )}
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
                    {isLoadingAssignments ? ( // Conditional render for assignment loading
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                            <span>Loading Assignments...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAssignments.length > 0 ? (
                      filteredAssignments.map((assignment) => (
                        <TableRow
                          key={assignment.id}
                          className="hover:bg-primary/5 transition-all duration-300"
                        >
                          <TableCell className="font-medium text-foreground">{assignment.title}</TableCell>
                          <TableCell className="text-muted-foreground">{assignment.dueDate}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {assignment.submissions}/{assignment.totalStudents}
                          </TableCell>

                          <TableCell className="flex justify-between gap-4 ">
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
                                onClick={() => handleRemoveAssignment(assignment)}
                                className="text-destructive hover:bg-destructive/10"

                                disabled={isDeleting === assignment.id} // Disable if this assignment is being deleted
                              >
                                {isDeleting === assignment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5} // Adjusted colSpan to 5 for consistency with TableHead
                          className="text-center text-muted-foreground"
                        >
                          No assignments available.
                        </TableCell>
                      </TableRow>
                    )}
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