"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Folder, Upload, Trash2, Download, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Document {
  id: number;
  name: string;
  file: string;
  uploaded: string;
  subject: string;
}

export default function FacultyDocRepoPage() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: "Math Lecture Notes", file: "/docs/math-lecture.pdf", uploaded: "2025-04-01", subject: "Algebra" },
    { id: 2, name: "Physics Lab Guide", file: "/docs/physics-lab.pdf", uploaded: "2025-04-02", subject: "Mechanics" },
  ]);

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
  const [newDocument, setNewDocument] = useState({ name: "", subject: "", file: null as File | null });
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>(
    Object.fromEntries(courses.map((course) => [course.name, false]))
  );

  const subjects = [
    "Algebra",
    "Calculus",
    "Mechanics",
    "Thermodynamics",
    "Algorithms",
    "Data Structures",
  ];


  const filteredDocuments = selectedCourse
    ? selectedSubject
      ? documents.filter((doc) => doc.subject === selectedSubject)
      : documents.filter((doc) =>
          courses.find((c) => c.name === selectedCourse)!.subjects.map((s) => s.name).includes(doc.subject)
        )
    : selectedSubject
    ? documents.filter((doc) => doc.subject === selectedSubject)
    : documents;

  const handleUpload = () => {
    if (newDocument.name && newDocument.subject && newDocument.file) {
      const newDoc = {
        id: documents.length + 1,
        name: newDocument.name,
        file: `/docs/${newDocument.file.name}`,
        uploaded: new Date().toISOString().split("T")[0],
        subject: newDocument.subject,
      };
      setDocuments([...documents, newDoc]);
      console.log("Uploaded:", newDoc);
      setNewDocument({ name: "", subject: "", file: null });
      setShowUploadForm(false);
    }
  };

  const handleRemoveDocument = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    console.log(`Removed document ID: ${id}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument((prev) => ({ ...prev, file }));
    }
  };

  const handleToggleCourse = (name: string, open: boolean) => {
    setOpenCourses((prev) => ({ ...prev, [name]: open }));
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
                  <DialogTitle className="text-foreground">Upload Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Document Name</Label>
                    <Input
                      id="name"
                      value={newDocument.name}
                      onChange={(e) => setNewDocument((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter document name"
                      className="bg-muted/50 border-border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-foreground">Subject</Label>
                    <Select
                      value={newDocument.subject}
                      onValueChange={(value) => setNewDocument((prev) => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger className="bg-muted/50 border-border rounded-md">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file" className="text-foreground">Document File</Label>
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
                  </div>
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                    disabled={!newDocument.name || !newDocument.subject || !newDocument.file}
                  >
                    Upload
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
                !selectedCourse && !selectedSubject && "bg-primary/20 border-l-4 border-primary"
              )}
              onClick={() => { setSelectedCourse(null); setSelectedSubject(null); }}
            >
              All Courses
            </div>
            {courses.map((course) => (
              <Collapsible
                key={course.name}
                open={openCourses[course.name]}
                onOpenChange={(open) => handleToggleCourse(course.name, open)}
                className="mb-2"
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex items-center justify-between w-full p-2 text-foreground rounded-md hover:bg-primary/10 transition-all duration-300",
                    selectedCourse === course.name && !selectedSubject && "bg-primary/20 border-l-4 border-primary"
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
                        selectedCourse === course.name && selectedSubject === subject.name && "bg-primary/20 border-l-4 border-primary"
                      )}
                      onClick={() => { setSelectedCourse(course.name); setSelectedSubject(subject.name); }}
                    >
                      {subject.name}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
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
                    <TableHead className="text-foreground">File Path</TableHead>
                    <TableHead className="text-foreground">Uploaded</TableHead>
                    <TableHead className="text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-primary/5 transition-all duration-300">
                        <TableCell className="font-medium text-foreground">{doc.name}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.file}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.uploaded}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log(`Download ${doc.file}`)}
                            className="border-border text-foreground hover:bg-primary/10"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
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