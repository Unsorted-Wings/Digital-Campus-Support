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
import { Button } from "@/components/ui/button";
import {
  Folder,
  Upload,
  Trash2,
  Download,
  ChevronUp,
  ChevronDown,
  Loader2,
  File,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { set } from "date-fns";
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

interface Document {
  id: number;
  name: string;
  file: string;
  uploaded: string;
  subject: string;
}
interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  courseId: string;
  batchId: string;
  subjectId?: string;
  semesterId: string;
  createdBy: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  courseName?: string; // Optional, if you want to display course name
  subjectName?: string; // Optional, if you want to display subject name
  cloudinaryResourceType?: string; // Optional, if you want to display resource type
}
export default function FacultyDocRepoPage() {
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
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      setIsLoadingSubjects(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    if (user) {
      // Only fetch subjects if user is available
      fetchSubjects();
    }
  }, [user]);

  const courses = [
    {
      name: "Mathematics",
      subjects: [{ name: "Algebra" }, { name: "Calculus" }],
    },
    {
      name: "Physics",
      subjects: [{ name: "Mechanics" }, { name: "Thermodynamics" }],
    },
    {
      name: "Computer Science",
      subjects: [{ name: "Algorithms" }, { name: "Data Structures" }],
    },
  ];
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    subject: "",
    course: "",
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>(
    Object.fromEntries(courses.map((course) => [course.name, false]))
  );

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
  const getCourseInfoFromSubjectAndCourse = (
    subjectName: string,
    courseName: string
  ) => {
    if (!groupedCourses || groupedCourses.length === 0) {
      console.warn(
        "groupedCourses is not initialized or empty when calling getCourseInfoFromSubjectAndCourse."
      );
      return null;
    }

    const match = groupedCourses.find((course) => course.name === courseName);
    if (!match) {
      console.error(
        `Course not found in groupedCourses for name: ${courseName}`
      );
      return null;
    }

    const subject = match.subjects.find((s) => s.name === subjectName);
    if (!subject) {
      console.error(
        `Subject "${subjectName}" not found within course "${courseName}".`
      );
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
      ? courseBatch?.subjects.find((s) => s.id === subjectId)?.name ||
        "Unknown Subject"
      : "No Subject Specified"; // More specific

    return { courseName, subjectName };
  };
  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      const response = await fetch(
        `/api/DocRepo/viewResource?teacherId=${user?.id}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      const filtered = result.map((item: any) => {
        // Use the helper function to get names based on IDs
        const { courseName, subjectName } = getCourseAndSubjectNames(
          item.courseId,
          item.batchId,
          item.subjectId
        );

        return {
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description,
          courseId: item.courseId,
          batchId: item.batchId,
          subjectId: item.subjectId,
          semesterId: item.semesterId,
          createdBy: item.createdBy,
          fileUrl: item.fileUrl,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          courseName: courseName, // Assign the resolved course name
          subjectName: subjectName, // Assign the resolved subject name
          cloudinaryResourceType: item.cloudinaryResourceType, // Use the resource type if available
        };
      });

      setResources(filtered);

      console.log(filtered);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoadingResources(false); // Set loading to false after fetching
    }
  };
  useEffect(() => {
    if (user && subjectData && subjectData.length > 0) {
      fetchResources();
    } else if (user && (!subjectData || subjectData.length === 0)) {
      setResources([]); // Clear resources if data is not ready yet
    }
  }, [user, subjectData]);

  const fetchBatchStudents = async (courseId: string, batchId: string) => {
    try {
      const response = await fetch(
        `/api/students/viewStudent/viewBatchwiseStudents?courseId=${courseId}&batchId=${batchId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch batch students");
      }
      const data = await response.json();
      return data.students || [];
    } catch (error) {
      console.error("Error fetching batch students:", error);
      return [];
    }
  };

  const createAssignmentNotification = async (
    userIds: string[],
    title: string
  ) => {
    try {
      const notificationData = {
        userIds,
        title: `Uploaded Notes: ${title}`,
        description: `New notes have been uploaded for the subject. Please check the document repository for details.`,
        type: "notes",
        sentBy: user?.id,
        date: new Date().toISOString().split("T")[0], 
      };

      const response = await fetch(
        "/api/notifications/appNotifications/createNotification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create assignment notification");
      }

      const result = await response.json();
      console.log("Notification created successfully:", result);
    } catch (error) {
      console.error("Error creating assignment notification:", error);
    }
  };

  const filteredResources = selectedCourse
    ? selectedSubject
      ? resources.filter(
          (resource) =>
            resource.subjectName === selectedSubject &&
            resource.courseName === selectedCourse
        )
      : resources.filter((resource) => resource.courseName === selectedCourse)
    : selectedSubject
      ? resources.filter((resource) => resource.subjectName === selectedSubject)
      : resources;

  const handleUpload = async () => {
    if (
      newDocument.name &&
      newDocument.subject &&
      newDocument.file &&
      newDocument.course
    ) {
      const courseInfo = getCourseInfoFromSubjectAndCourse(
        newDocument.subject,
        newDocument.course
      );
      console.log(courseInfo);
      if (!courseInfo) {
        console.error("Subject or course not found in groupedCourses");
        return;
      }

      setIsUploading(true);
      try {
        const semesterResponse = await fetch(
          `/api/semesterDetail/getSemesterDetails?courseId=${courseInfo.courseId}&batchId=${courseInfo.batchId}`
        );
        if (!semesterResponse.ok) {
          // Handle cases where semester details are not found or API errors
          const errorData = await semesterResponse.json();
          console.error("Failed to fetch semester details:", errorData.error);
          throw new Error(
            errorData.error || "Failed to fetch semester details"
          );
        }
        const semesterData = await semesterResponse.json();
        const semesterId = semesterData.semesterId;

        const formData = new FormData();
        formData.append("file", newDocument.file);
        formData.append("name", newDocument.name);
        formData.append("courseId", courseInfo.courseId || "");
        formData.append("semesterId", semesterId || "");
        formData.append("batchId", courseInfo.batchId || "");
        formData.append("subjectId", courseInfo.subjectId || "");
        formData.append("description", "Sample Assignment");
        formData.append("type", "notes");

        const response = await fetch("/api/DocRepo/uploadAssignment", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload assignment");
        }
        const result = await response.json();

        await fetchResources();

        try {
          const fetchedStudents = await fetchBatchStudents(
            courseInfo.courseId,
            courseInfo.batchId
          );

          if (!fetchedStudents || fetchedStudents.length === 0) {
            console.warn("No students found for the given course and batch.");
            return;
          }

          const userIds: string[] = fetchedStudents.map(
            (student: any) => student.studentId
          );
          createAssignmentNotification(userIds, newDocument.name);
        } catch (error) {
          console.error("Error fetching batch students:", error);
          return;
        }
      } catch (error: any) {
        console.log("error: ", error);
      } finally {
        setIsUploading(false);
      }

      setNewDocument({ name: "", course: "", subject: "", file: null });
      setShowUploadForm(false);
    }
  };

  const handleRemoveDocument = async (doc: Resource) => {
    try {
      setDeletingId(doc.id);
      console.log(doc);
      const response = await fetch("/api/DocRepo/deleteResource/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: doc.id,
          cloudinaryResourceType: doc.cloudinaryResourceType, // Use the resource type if available
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to delete assignment:", result.error);
        return;
      }
      setResources((prev) => prev.filter((r) => r.id !== doc.id));
      console.log(`Removed resource ID: ${doc.id}`);
    } catch (err: any) {
      console.log(err);
    } finally {
      setDeletingId(null); // Reset after deletion attempt
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(
          `File size exceeds the 24MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
        );
        setNewDocument((prev) => ({ ...prev, file: null })); // Clear selected file if too large
        e.target.value = ""; // Clear the input field to allow re-selection
      } else {
        setNewDocument((prev) => ({ ...prev, file }));
        setUploadError(null); // Clear any previous error
      }
    } else {
      setNewDocument((prev) => ({ ...prev, file: null })); // Clear file if nothing selected
      setUploadError(null); // Clear error if no file is selected
    }
  };

  const handleToggleCourse = (name: string, open: boolean) => {
    setOpenCourses((prev) => ({ ...prev, [name]: open }));
  };
  const handleViewDocument = (url: string | null | undefined) => {
    if (url) {
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleDocsViewerUrl, "_blank");
    } else {
      alert("No document URL available");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Document Repository
          </CardTitle>
          <div className="flex items-center gap-2 p-2">
            <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
              <DialogTrigger asChild>
                <Button className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-md px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    Upload Document
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Document Name
                    </Label>
                    <Input
                      id="name"
                      value={newDocument.name}
                      onChange={(e) =>
                        setNewDocument((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter document name"
                      className="bg-muted/50 border-border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-foreground">
                      Subject
                    </Label>
                    <Select
                      value={newDocument.subject}
                      onValueChange={(value) =>
                        setNewDocument((prev) => ({ ...prev, subject: value }))
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
                    <Label htmlFor="course" className="text-foreground">
                      Course
                    </Label>
                    <Select
                      value={newDocument.course}
                      onValueChange={(value) =>
                        setNewDocument((prev) => ({ ...prev, course: value }))
                      }
                    >
                      <SelectTrigger className="bg-muted/50 border-border rounded-md">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupedCourses.map((course) => (
                          <SelectItem key={course.name} value={course.name}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file" className="text-foreground">
                      Document File
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="bg-muted/50 border-border rounded-md"
                    />
                    {newDocument.file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {newDocument.file.name}
                      </p>
                    )}

                    {uploadError && ( // Add this line to display the error
                      <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                    disabled={
                      !newDocument.name ||
                      !newDocument.subject ||
                      !newDocument.file ||
                      isUploading // <--- Disable if isUploading is true
                    }
                  >
                    {isUploading ? "Uploading..." : "Upload"}
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
                <span className="ml-2 text-muted-foreground">
                  Loading Courses and Subjects...
                </span>
              </div>
            ) : groupedCourses.length === 0 ? (
              <div className="p-4 text-muted-foreground text-center">
                No subjects found.
              </div>
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

        {/* Document Table */}
        <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden h-full min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full min-h-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">Name</TableHead>
                    <TableHead className="text-foreground">View</TableHead>
                    <TableHead className="text-foreground">Uploaded</TableHead>

                    <TableHead className="text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingResources ? ( // Conditional render for resource loading
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                          <span>Loading Documents...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredResources.length > 0 ? (
                    filteredResources.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-primary/5 transition-all duration-300"
                      >
                        <TableCell className="font-medium text-foreground">
                          {doc.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewDocument(doc.fileUrl ?? null)
                            }
                            className="border-border text-foreground hover:bg-primary/10"
                            disabled={!doc.fileUrl}
                          >
                            <File className="h-4 w-4 mr-2" />
                            View Document
                          </Button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="flex gap-2 ">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-primary/10"
                          >
                            <a href={doc.fileUrl} download>
                              <Download className="h-4 w-4 " />
                            </a>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(doc)}
                            className="text-destructive hover:bg-destructive/10"
                            disabled={deletingId === doc.id} // Disable if this doc is being deleted
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" /> // Show loader
                            ) : (
                              <Trash2 className="h-4 w-4" /> // Show trash icon
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No documents available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
