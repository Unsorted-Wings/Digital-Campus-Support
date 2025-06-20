"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  Filter,
  ArrowUpDown,
  Loader2,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
// Define the type for your assignment data
interface Assignment {
  id: number;
  title: string;
  subject: string;
  subjectId: string;
  dueDate: string;
  status: string;
  semesterId: string;
  submittedBy?: Submission[];
  assignmentDocUrl?: string | null;
  courseId: string;
  batchId?: string;
  createdAt?: string;
  description?: string;
  teacherId?: string;
  updatedAt?: string;

}
interface Submission {
  userId: string;
  uploadedAt: string;
  assignmentDocUrl: string;
  grade?: number;
  resource_id?: string;
}
type Subject = {
  id: string;
  name: string;
};
export default function AssignmentSubmissionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(
    null
  );
  const [uploading, setUploading] = useState(false); // State to track upload status
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]); // State to store assignments
  const [filterSubject, setFilterSubject] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [allSubjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: string;
    courseId?: string;
  } | null>(null);

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
          courseId: parsed.courseId,
        });
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const fetchAssignments = async () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const uid = parsedUser?.uid || null;
    const courseId = parsedUser?.courseId || null;

    setIsLoadingAssignments(true);
    try {
      console.log("course id : ", courseId);
      if (!courseId || !uid) throw new Error("Course ID not found in local storage");

      const response = await fetch(`/api/assignment/viewAssignment?courseId=${courseId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }
      const data = await response.json();

      const enhancedAssignments = data.map((assignment: any) => {
        const submittedByArray = assignment.submittedBy || [];

        const isSubmitted = submittedByArray.some(
          (entry: any) => entry.userId === uid
        );

        return {
          ...assignment,
          status: isSubmitted ? "Submitted" : "Pending",
        };
      });

      setAssignments(enhancedAssignments);
      console.log(enhancedAssignments);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoadingAssignments(false);
    }
  };
  const fetchSubjects = async () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const uid = parsedUser?.uid || null;
    const courseId = parsedUser?.courseId || null;

    setIsLoadingAssignments(true);
    setIsLoadingSubjects(true);
    try {

      const response = await fetch(`/api/subjects/viewSubject/viewStudentSubjects?studentId=${uid}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      setSubjects(data.simplifiedSubjects);

    } catch (error: any) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoadingAssignments(false);
      setIsLoadingSubjects(false); // Set loading to false

    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAssignments();
  }, [user]);
  useEffect(() => {
    if (!user) return;
    fetchSubjects();
  }, [user]);

  const statuses = ["All", "Pending", "Submitted"];

  const filteredAndSortedAssignments = assignments
    .filter((a) => filterSubject === "All" || a.subject === filterSubject)
    .filter((a) => filterStatus === "All" || a.status === filterStatus)
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];
      if (sortField === "dueDate") {
        const dateA = fieldA ? new Date(fieldA as string).getTime() : 0;
        const dateB = fieldB ? new Date(fieldB as string).getTime() : 0;
        return sortOrder === "asc"
          ? dateA - dateB
          : dateB - dateA;
      }
      return sortOrder === "asc"
        ? String(fieldA).localeCompare(String(fieldB))
        : String(fieldB).localeCompare(String(fieldA));
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File size exceeds the 25MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setSelectedFile(null); // Clear selected file if too large
      e.target.value = ''; // Clear the input field to allow re-selection
    } else {
      setSelectedFile(file);
      setUploadError(null); // Clear any previous error
      setUploadSuccess(false); // Reset success message
    }
  } else {
    setSelectedFile(null);
    setUploadError(null); // Clear error if no file is selected
  }
  };

  const handleSubmit = async (assignmentId: number) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    console.log("assignment : ", assignment);
    if (!assignment) {
      setUploadError("Assignment not found.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const uid = parsedUser?.uid || "unknown";

    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    console.log("uploading...");
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", assignment?.title || "unknown")
    formData.append("courseId", user?.courseId || "unknown");
    formData.append("semesterId", assignment?.semesterId || "unknown");
    formData.append("batchId", assignment?.batchId || "unknown");
    formData.append("subjectId", assignment?.subjectId || "unknown");
    formData.append("description", assignment?.description || "unknown");
    formData.append("type", "assignment");

    try {
      const response = await fetch("/api/DocRepo/uploadAssignment", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Upload successful:", data);
        setUploading(false);
        setSelectedFile(null);
        setSelectedAssignment(null);
        setUploadSuccess(true);

        try {
          const createAssignmentResponse = await fetch(
            "/api/assignment/createAssignment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                assignmentId: assignmentId,
                userId: uid,
                resource_id: data.data.resource_id,
                assignmentDocUrl: data.data.secure_url,
                uploadedAt: new Date().toISOString(),
              }),
            }
          );

          if (createAssignmentResponse.ok) {
            console.log("assignment uploaded.");
            setUploading(false);
            setSelectedFile(null);
            setSelectedAssignment(null);
            setUploadSuccess(true);
          } else {
            console.log("error fetching data");
          }
        } catch (error: any) {
          console.log(error);
        }

        fetchAssignments(); // Re-fetch assignments to update status
      } else {
        const errorData = await response.json();
        console.error("Upload failed:", errorData);
        setUploadError(errorData?.error || "Failed to upload file.");
        setUploading(false);
      }
    } catch (error: any) {
      console.error("Error during upload:", error);
      setUploadError(error.message || "An unexpected error occurred.");
      setUploading(false);
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const handleViewDocument = (url: string | null | undefined) => {
    console.log(url)
    if (url) {
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleDocsViewerUrl, "_blank");
    } else {
      alert("No document URL available");
    }
  };
  // Find the current user's submission for this assignment

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header with Filters */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl">
        <CardHeader className="p-4 gap-4">
          <CardTitle className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <FileText className="h-6 w-6 text-primary" />
            Assignment Submission
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Assignment Table */}
        <Card className="lg:col-span-3 bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardHeader className="p-4 border-b border-border relative z-10">
            <CardTitle className="text-xl font-semibold text-foreground gap-2">
              Assignments
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-border"
                    disabled={isLoadingSubjects} // Disable dropdown while subjects are loading
                  >
                    <Filter className="h-5 w-5" />
                    Subject: {filterSubject}
                    {isLoadingSubjects && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card/95 backdrop-blur-md border-border">
                  {isLoadingSubjects ? (
                    <DropdownMenuItem className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading Subjects...
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        key="all"
                        onClick={() => setFilterSubject("All")}
                        className="hover:bg-primary/10"
                      >
                        All
                      </DropdownMenuItem>
                      {allSubjects.map((subject) => (
                        <DropdownMenuItem
                          key={subject.id}
                          onClick={() => setFilterSubject(subject.name)}
                          className="hover:bg-primary/10"
                        >
                          {subject.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-border"
                  >
                    <Filter className="h-5 w-5" />
                    Status: {filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card/95 backdrop-blur-md border-border">
                  {statuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className="hover:bg-primary/10"
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 relative z-10 p-4">
            {isLoadingAssignments ? ( // Conditional render for assignment loading
              <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading assignments...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("title")}
                        className="flex items-center gap-1 text-foreground hover:bg-primary/10"
                      >
                        Title
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-foreground">Subject</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("dueDate")}
                        className="flex items-center gap-1 text-foreground hover:bg-primary/10"
                      >
                        Due Date
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">View</TableHead>
                    <TableHead className="text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAssignments.length === 0 ? (

                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No assignments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedAssignments.map((assignment: Assignment) => {
                      const currentUserSubmission = assignment.submittedBy?.find(
                        (submission) => submission.userId === user?.id
                      );

                      return (
                        <TableRow
                          key={assignment.id}
                          className={cn(
                            "transition-all duration-300",
                            selectedAssignment === assignment.id
                              ? "bg-primary/10"
                              : "hover:bg-primary/5"
                          )}
                        >
                          <TableCell className="font-medium text-foreground">
                            {assignment.title}
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {assignment.subject}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "flex items-center gap-1 text-sm",
                                assignment.status === "Submitted"
                                  ? "text-green-500"
                                  : "text-yellow-500"
                              )}
                            >
                              {assignment.status === "Submitted" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              {assignment.status}
                            </span>
                          </TableCell>

                          {/* TableCell for "View Original Assignment Document" button */}
                          <TableCell>
                            <div className="flex gap-2 justify-center items-center">
                              <Button
                                variant="outline"
                                className=" text-foreground hover:bg-primary/20 p-2 rounded-lg"
                                onClick={() => handleViewDocument(assignment.assignmentDocUrl ?? null)}
                                disabled={!assignment.assignmentDocUrl}
                                aria-label={`View assignment document: ${assignment.title}`}
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>

                          {/* TableCell for "Action" (Submit or View Submission) */}
                          <TableCell>
                            {assignment.status === "Pending" ? (
                              // If status is "Pending", show Submit button
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAssignment(assignment.id)}
                                className="border-border text-foreground hover:bg-primary/10"
                              >
                                Submit
                              </Button>
                            ) : (
                              // If status is "Submitted", show View Submission button
                              <Button
                                variant="outline"
                                size="sm"
                                // Now currentUserSubmission is correctly defined within this scope
                                onClick={() => handleViewDocument(currentUserSubmission?.assignmentDocUrl ?? null)}
                                disabled={!currentUserSubmission?.assignmentDocUrl}
                                className="border-border text-foreground hover:bg-primary/10"
                              >
                                View 
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}

                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </Card>

        {/* Submission Form */}
        <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardHeader className="p-4 border-b border-border relative z-10">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Submit Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1 relative z-10">
            {selectedAssignment ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Selected:{" "}
                    {
                      assignments.find((a) => a.id === selectedAssignment)
                        ?.title
                    }
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                  />
                </div>
                <Button
                  onClick={() => handleSubmit(selectedAssignment)}
                  disabled={!selectedFile || uploading} // Disable during upload
                  className={cn(
                    "w-full rounded-lg transition-all duration-300 shadow-md",
                    uploading
                      ? "bg-primary/50 text-primary-foreground cursor-not-allowed" // Style for uploading state
                      : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
                  )}
                >
                  {uploading ? "Uploading..." : "Upload Submission"}{" "}
                  {/* Show "Uploading..." during upload */}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAssignment(null)}
                  className="w-full border-border text-foreground hover:bg-primary/10"
                >
                  Cancel
                </Button>
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p className="text-sm text-green-500">Upload successful!</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-center">
                Select an assignment to submit your work.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
