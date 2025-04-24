"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Folder, FileText, Plus, Upload, Edit, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Faculty {
  id: number;
  name: string;
}

interface Document {
  id: number;
  name: string;
  file: string;
  uploaded: string;
}

interface SubjectFolder {
  id: number;
  name: string;
  facultyId: number | null;
  documents: Document[];
}

interface CourseFolder {
  id: number;
  name: string;
  mentorId: number | null;
  subjects: SubjectFolder[];
}

export default function CourseSubfolderPage() {
  const { courseId } = useParams();
  const [courseFolders] = useState<CourseFolder[]>([
    {
      id: 1,
      name: "Mathematics 101",
      mentorId: 1,
      subjects: [
        { id: 1, name: "Algebra", facultyId: 1, documents: [{ id: 1, name: "Math Lecture Notes", file: "/docs/math-lecture.pdf", uploaded: "2025-04-01" }] },
        { id: 2, name: "Calculus", facultyId: 2, documents: [] },
      ],
    },
    {
      id: 2,
      name: "Physics 201",
      mentorId: 2,
      subjects: [
        { id: 3, name: "Mechanics", facultyId: 2, documents: [{ id: 2, name: "Physics Lab Guide", file: "/docs/physics-lab.pdf", uploaded: "2025-04-02" }] },
        { id: 4, name: "Thermodynamics", facultyId: 3, documents: [] },
      ],
    },
    {
      id: 3,
      name: "CS 301",
      mentorId: 3,
      subjects: [
        { id: 5, name: "Algorithms", facultyId: 1, documents: [] },
        { id: 6, name: "Data Structures", facultyId: 2, documents: [] },
      ],
    },
  ]);

  const [facultyList] = useState<Faculty[]>([
    { id: 1, name: "Dr. John Smith" },
    { id: 2, name: "Prof. Jane Doe" },
    { id: 3, name: "Dr. Alan Brown" },
  ]);

  // Parse courseId
  const parsedCourseId = courseId ? parseInt(courseId as string) : NaN;
  console.log("courseId:", courseId, "parsedCourseId:", parsedCourseId); // Debug log

  // Find course or default to first course
  let course = courseFolders.find((c) => c.id === parsedCourseId);
  if (!course) {
    course = courseFolders[0]; // Default to first course
  }

  const [subjects, setSubjects] = useState<SubjectFolder[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFolder | null>(null);

  // Sync subjects and selectedCourse on load or course change
  useEffect(() => {
    if (course) {
      setSubjects(course.subjects);
      setSelectedCourse(course.name);
      setSelectedSubject(course.subjects[0] || null);
    }
  }, [course]);

  const [subjectForm, setSubjectForm] = useState({ id: 0, name: "", facultyId: null as number | null });
  const [documentForm, setDocumentForm] = useState({ id: 0, name: "", file: null as File | null });
  const [openDialog, setOpenDialog] = useState<"subject" | "document" | "deleteSubject" | "deleteDocument" | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"subject" | "document" | null>(null);
  const [error, setError] = useState<string>("");

  const handleAddOrUpdateSubject = () => {
    if (!subjectForm.name || !subjectForm.facultyId) {
      setError("Please provide a name and assign a faculty.");
      return;
    }
    if (subjectForm.id) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === subjectForm.id ? { ...s, name: subjectForm.name, facultyId: subjectForm.facultyId } : s))
      );
      console.log("Updated subject:", subjectForm);
    } else {
      const newId = subjects.length + 1;
      setSubjects((prev) => [
        ...prev,
        { id: newId, name: subjectForm.name, facultyId: subjectForm.facultyId, documents: [] },
      ]);
      console.log("Added subject:", subjectForm);
    }
    setSubjectForm({ id: 0, name: "", facultyId: null });
    setOpenDialog(null);
    setError("");
  };

  const handleEditSubject = (subject: SubjectFolder) => {
    setSubjectForm({ id: subject.id, name: subject.name, facultyId: subject.facultyId });
    setOpenDialog("subject");
  };

  const handleDeleteSubject = (id: number) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    console.log(`Deleted subject ID: ${id}`);
    setOpenDialog(null);
    setDeleteId(null);
    setDeleteType(null);
    if (selectedSubject?.id === id) setSelectedSubject(null);
  };

  const handleAddOrUpdateDocument = () => {
    if (!documentForm.name || (!documentForm.id && !documentForm.file) || !selectedSubject) {
      setError("Please provide a name and file.");
      return;
    }
    if (documentForm.id) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === selectedSubject.id
            ? {
                ...s,
                documents: s.documents.map((d) =>
                  d.id === documentForm.id
                    ? {
                        ...d,
                        name: documentForm.name,
                        file: documentForm.file ? `/docs/${documentForm.file!.name}` : d.file,
                        uploaded: new Date().toISOString().split("T")[0],
                      }
                    : d
                ),
              }
            : s
        )
      );
      console.log("Updated document:", documentForm);
    } else {
      const newId = selectedSubject.documents.length + 1;
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === selectedSubject.id
            ? {
                ...s,
                documents: [
                  ...s.documents,
                  {
                    id: newId,
                    name: documentForm.name,
                    file: `/docs/${documentForm.file!.name}`,
                    uploaded: new Date().toISOString().split("T")[0],
                  },
                ],
              }
            : s
        )
      );
      console.log("Added document:", documentForm);
    }
    setDocumentForm({ id: 0, name: "", file: null });
    setOpenDialog(null);
    setError("");
  };

  const handleEditDocument = (doc: Document) => {
    setDocumentForm({ id: doc.id, name: doc.name, file: null });
    setOpenDialog("document");
  };

  const handleDeleteDocument = (id: number) => {
    if (selectedSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === selectedSubject.id ? { ...s, documents: s.documents.filter((d) => d.id !== id) } : s
        )
      );
      console.log(`Deleted document ID: ${id}`);
    }
    setOpenDialog(null);
    setDeleteId(null);
    setDeleteType(null);
  };

  // Show "No courses available" only if courseFolders is empty (edge case)
  if (!course) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
        <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
          <CardContent className="p-6 text-foreground">
            No courses available.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            {course.name} - Subject Folders
          </CardTitle>
          <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-full shadow-sm">
            <Select
              value={selectedCourse || ""}
              onValueChange={(value) => {
                setSelectedCourse(value || null);
                setSelectedSubject(null);
                const selectedCourseData = courseFolders.find((c) => c.name === value);
                setSubjects(selectedCourseData ? selectedCourseData.subjects : course.subjects);
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
              onClick={() => setOpenDialog("subject")}
              className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Subject Folder
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubject(subject);
                        }}
                        className="border-border text-foreground hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(subject.id);
                          setDeleteType("subject");
                          setOpenDialog("deleteSubject");
                        }}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          {selectedSubject && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Files in {selectedSubject.name}</h3>
                <Button
                  onClick={() => setOpenDialog("document")}
                  className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-foreground">Name</TableHead>
                      <TableHead className="text-foreground">File Path</TableHead>
                      <TableHead className="text-foreground">Uploaded</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubject.documents.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-primary/5 transition-all duration-300">
                        <TableCell className="font-medium text-foreground">{doc.name}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.file}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.uploaded}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDocument(doc)}
                            className="border-border text-foreground hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteId(doc.id);
                              setDeleteType("document");
                              setOpenDialog("deleteDocument");
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

      {/* Subject Folder Dialog */}
      <Dialog open={openDialog === "subject"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{subjectForm.id ? "Edit Subject Folder" : "Create Subject Folder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div>
              <Label htmlFor="name" className="text-foreground">Folder Name</Label>
              <Input
                id="name"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Algebra"
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label htmlFor="faculty" className="text-foreground">Assign Faculty</Label>
              <Select
                value={subjectForm.facultyId?.toString() || ""}
                onValueChange={(value) => setSubjectForm((prev) => ({ ...prev, facultyId: parseInt(value) }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {facultyList.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddOrUpdateSubject}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {subjectForm.id ? "Update Folder" : "Create Folder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Dialog */}
      <Dialog open={openDialog === "document"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{documentForm.id ? "Edit Document" : "Upload Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div>
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input
                id="name"
                value={documentForm.name}
                onChange={(e) => setDocumentForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Document name"
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label htmlFor="file" className="text-foreground">File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDocumentForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                className="bg-muted/50 border-border"
              />
            </div>
            <Button
              onClick={handleAddOrUpdateDocument}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {documentForm.id ? "Update Document" : "Upload Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Subject Confirmation Dialog */}
      <Dialog open={openDialog === "deleteSubject"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-foreground">Are you sure you want to delete this subject folder? This action cannot be undone.</p>
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
              onClick={() => deleteId && handleDeleteSubject(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      <Dialog open={openDialog === "deleteDocument"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-foreground">Are you sure you want to delete this document? This action cannot be undone.</p>
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
              onClick={() => deleteId && handleDeleteDocument(deleteId)}
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