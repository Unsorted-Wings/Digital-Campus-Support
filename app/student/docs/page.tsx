"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Download, Folder } from "lucide-react";
import { useState } from "react";

export default function DocRepoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>("Mathematics");

  // Mock data with subjects (replace with real data)
  const subjects = [
    {
      name: "Mathematics",
      documents: [
        {
          id: 1,
          title: "Lecture Notes - Calculus",
          type: "Lecture",
          uploadedBy: "Prof. Smith",
          date: "Apr 01, 2025",
          fileUrl: "/docs/math-lecture.pdf",
        },
        {
          id: 2,
          title: "Practice Problems",
          type: "Assignment",
          uploadedBy: "Prof. Smith",
          date: "Mar 30, 2025",
          fileUrl: "/docs/math-problems.pdf",
        },
      ],
    },
    {
      name: "Physics",
      documents: [
        {
          id: 3,
          title: "Lab Manual",
          type: "Lab",
          uploadedBy: "Prof. Jones",
          date: "Mar 28, 2025",
          fileUrl: "/docs/physics-lab.pdf",
        },
      ],
    },
    {
      name: "Computer Science",
      documents: [
        {
          id: 4,
          title: "Seminar Slides",
          type: "Seminar",
          uploadedBy: "Prof. Lee",
          date: "Apr 02, 2025",
          fileUrl: "/docs/cs-seminar.pdf",
        },
      ],
    },
    {
      name: "Admin",
      documents: [
        {
          id: 5,
          title: "Certification Guidelines",
          type: "Admin",
          uploadedBy: "Admin",
          date: "Apr 03, 2025",
          fileUrl: "/docs/cert-guidelines.pdf",
        },
      ],
    },
  ];

  const filteredSubjects = subjects.map((subject) => ({
    ...subject,
    documents: subject.documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const selectedSubjectData = filteredSubjects.find((s) => s.name === selectedSubject) || {
    name: "No Subject Selected",
    documents: [],
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-6">
      {/* Left Sidebar: Subject List */}
      <Card className="w-1/4 bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            Subjects
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.name}
              onClick={() => setSelectedSubject(subject.name)}
              className={cn(
                "p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden",
                selectedSubject === subject.name
                  ? "bg-gradient-to-r from-primary/30 to-secondary/20 shadow-md border-l-4 border-primary"
                  : "bg-card hover:bg-primary/10 hover:shadow-md"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-20" />
              <p className="text-foreground font-medium relative">{subject.name}</p>
              <p className="text-xs text-muted-foreground relative">
                {subject.documents.length} {subject.documents.length === 1 ? "file" : "files"}
              </p>
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Right: Document List */}
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col">
        <CardHeader className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {selectedSubjectData.documents.length > 0 ? (
              selectedSubjectData.documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="bg-card shadow-sm rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-30" />
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Type:</span> {doc.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Uploaded By:</span> {doc.uploadedBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Date:</span> {doc.date}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="border-border text-foreground hover:bg-primary/10 p-2 rounded-full"
                    >
                      <a href={doc.fileUrl} download>
                        <Download className="h-5 w-5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {selectedSubject
                  ? "No documents found for this subject."
                  : "Select a subject to view documents."}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}