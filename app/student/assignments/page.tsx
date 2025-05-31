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
} from "lucide-react";
import { useState, useEffect } from "react";

// Define the type for your assignment data
interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
}

export default function AssignmentSubmissionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(
    null
  );
  const [uploading, setUploading] = useState(false); // State to track upload status
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]); // State to store assignments
  const [loadingAssignments, setLoadingAssignments] = useState(false); // State for loading assignments
  const [filterSubject, setFilterSubject] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchAssignments = async () => {
    const courseId = user?.courseId;
    setLoadingAssignments(true);
    try {
      console.log("course id : ", courseId);
      if (!courseId) throw new Error("Course ID not found in local storage");

      const response = await fetch(
        `/api/assignment/viewAssignment?courseId=${courseId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }

      const data = await response.json();
      const uid = user.uid; // assuming `user.id` is the Firebase Auth UID

      // Enhance assignment data with status
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
      setLoadingAssignments(false);
    }
  };

  // Fetch assignments on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  const subjects = [
    "All",
    ...Array.from(new Set(assignments.map((a) => a.subject))),
  ];
  const statuses = ["All", "Pending", "Submitted"];

  const filteredAndSortedAssignments = assignments
    .filter((a) => filterSubject === "All" || a.subject === filterSubject)
    .filter((a) => filterStatus === "All" || a.status === filterStatus)
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];
      if (sortField === "dueDate") {
        return sortOrder === "asc"
          ? new Date(fieldA).getTime() - new Date(fieldB).getTime()
          : new Date(fieldB).getTime() - new Date(fieldA).getTime();
      }
      return sortOrder === "asc"
        ? String(fieldA).localeCompare(String(fieldB))
        : String(fieldB).localeCompare(String(fieldA));
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (assignmentId: number) => {
    console.log(assignmentId);
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
    formData.append("assignmentId", assignmentId.toString()); // You might want to send the assignment ID

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
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const uid = parsedUser?.uid || "unknown";

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
                  >
                    <Filter className="h-5 w-5" />
                    Subject: {filterSubject}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card/95 backdrop-blur-md border-border">
                  {subjects.map((subject) => (
                    <DropdownMenuItem
                      key={subject}
                      onClick={() => setFilterSubject(subject)}
                      className="hover:bg-primary/10"
                    >
                      {subject}
                    </DropdownMenuItem>
                  ))}
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
            {loadingAssignments ? (
              <p className="text-muted-foreground text-center">
                Loading assignments...
              </p> // Simple loading indicator
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
                    <TableHead className="text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAssignments.map((assignment) => (
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
                        {assignment.subject} {/* Display the subject here */}
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
                      <TableCell>
                        {assignment.status !== "Submitted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAssignment(assignment.id)}
                            className="border-border text-foreground hover:bg-primary/10"
                          >
                            Submit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
