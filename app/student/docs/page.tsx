"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, Download, Folder, Eye, FileText, FileCode, FileHeart, File, BookOpen } from "lucide-react";
import { useState } from "react";

export default function DocRepoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>("Mathematics");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title-asc" | "title-desc">("recent");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

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

  const documentTypes = ["Lecture", "Assignment", "Lab", "Seminar", "Admin"];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Lecture": return <FileText className="h-5 w-5 text-primary" />;
      case "Assignment": return <File className="h-5 w-5 text-primary" />;
      case "Lab": return <FileHeart className="h-5 w-5 text-primary" />;
      case "Seminar": return <FileCode className="h-5 w-5 text-primary" />;
      case "Admin": return <File className="h-5 w-5 text-primary" />;
      default: return <File className="h-5 w-5 text-primary" />;
    }
  };

  const filteredSubjects = subjects.map((subject) => ({
    ...subject,
    documents: subject.documents
      .filter((doc) =>
        (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedType || doc.type === selectedType)
      )
      .sort((a, b) =>
        sortBy === "recent" ? new Date(b.date).getTime() - new Date(a.date).getTime() :
        sortBy === "oldest" ? new Date(a.date).getTime() - new Date(b.date).getTime() :
        sortBy === "title-asc" ? a.title.localeCompare(b.title) :
        b.title.localeCompare(a.title)
      ),
  }));

  const selectedSubjectData = filteredSubjects.find((s) => s.name === selectedSubject) || {
    name: "No Subject Selected",
    documents: [],
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-6 p-6">
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
                  ? "bg-primary/20 shadow-lg border-l-4 border-primary"
                  : "bg-card hover:bg-primary/10 hover:shadow-md"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-20" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-foreground font-medium relative">{subject.name}</p>
                  <p className="text-xs text-muted-foreground relative">
                    {subject.documents.length} {subject.documents.length === 1 ? "file" : "files"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Right: Document List */}
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col">
        <CardHeader className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-primary/5 border-border focus:ring-primary focus:border-primary rounded-xl"
              aria-label="Search documents"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={selectedType || "all"}
              onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-40 bg-primary/5 border-border focus:ring-primary rounded-xl">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-40 bg-primary/5 border-border focus:ring-primary rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
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
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getTypeIcon(doc.type)}
                      <div className="space-y-2">
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
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="bg-primary/10 text-foreground hover:bg-primary/20 p-2 rounded-full"
                        onClick={() => setSelectedDoc(doc)}
                        aria-label={`View ${doc.title}`}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="bg-primary/10 text-foreground hover:bg-primary/20 p-2 rounded-full"
                        aria-label={`Download ${doc.title}`}
                      >
                        <a href={doc.fileUrl} download>
                          <Download className="h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                {selectedSubject
                  ? "No documents found for this subject."
                  : "Select a subject to view documents."}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Document Preview Dialog */}
      {selectedDoc && (
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">{selectedDoc.title}</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <iframe
                src={selectedDoc.fileUrl}
                className="w-full h-[60vh] border border-border rounded-lg"
                title={`${selectedDoc.title} preview`}
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Type:</span> {selectedDoc.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Uploaded By:</span> {selectedDoc.uploadedBy}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span> {selectedDoc.date}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedDoc(null)}
                className="border-border text-foreground hover:bg-primary/10"
              >
                Close
              </Button>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href={selectedDoc.fileUrl} download>
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}