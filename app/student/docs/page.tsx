"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, Download, Folder, Eye, FileText, FileCode, FileHeart, File, BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

type Subject = {
  id: string;
  name: string;
  documents: {
    id: string; // Changed from number to string
    title: string; // This will now be mapped from resource.name
    type: string;
    uploadedBy: string; // This will now be mapped from resource.createdBy
    date: string; // This will now be mapped from resource.createdAt
    fileUrl: string;
    facultyName: string;
  }[];
};
interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  batchId: string;
  subjectId?: string;
  semesterId: string;
  createdBy: string;
  facultyName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  courseName?: string; // Optional, if you want to display course name
  subjectName?: string; // Optional, if you want to display subject name
}
export default function DocRepoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>("Mathematics"); // Initial state set to "Mathematics"
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title-asc" | "title-desc">("recent");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [allData, setAllData] = useState<Subject[]>([]); // All fetched data
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch

  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: string;
    courseId?: string;
  } | null>(null);

  const documentTypes = ["Lecture", "Assignment", "Lab", "Seminar", "Admin"];
  const [resources, setResources] = useState<Resource[]>([]);// This state is not directly used for rendering but kept for reference if needed elsewhere.

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
          courseId: parsed.courseId || undefined,
        });
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const fetchData = async () => {
    if (!user?.id || !user?.courseId) {
      console.log("User data not available yet for fetching subjects and resources.");
      return;
    }

    setIsLoading(true); // Set loading to true before starting fetches
    try {
      // Fetch Subjects
      const subjectsResponse = await fetch(`/api/subjects/viewSubject/viewStudentSubjects?studentId=${user.id}`);
      if (!subjectsResponse.ok) {
        throw new Error(`Failed to fetch subjects: ${subjectsResponse.status}`);
      }
      const subjectsData = await subjectsResponse.json();
      const fetchedSubjects: { id: string; name: string }[] = subjectsData.simplifiedSubjects || [];
      console.log("Fetched Subjects:", fetchedSubjects);

      // Fetch Resources
      const resourcesResponse = await fetch(`/api/DocRepo/viewResource?courseId=${user.courseId}`);
      if (!resourcesResponse.ok) {
        throw new Error(`Failed to fetch resources: ${resourcesResponse.status}`);
      }
      const resourcesData = await resourcesResponse.json();
      console.log(resourcesData)
      const fetchedResources: Resource[] = resourcesData.map((item: any) => ({
        id: item.id,
        name: item.name, // This will be the document title
        type: item.type,
        description: item.description,
        batchId: item.batchId,
        subjectId: item.subjectId,
        semesterId: item.semesterId,
        createdBy: item.createdBy,
        facultyName: item.facultyName,
        fileUrl: item.fileUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setResources(fetchedResources); // Store raw resources

      console.log("Fetched Resources:", fetchedResources);

      // Combine subjects and resources
      const combinedSubjects: Subject[] = fetchedSubjects.map((subject) => ({
        ...subject,
        documents: fetchedResources
          .filter((resource) => resource.subjectId === subject.id)
          .map((resource) => ({ // <--- ADD THIS .map() TRANSFORMATION
            id: resource.id,
            title: resource.name, // Map resource.name to title
            type: resource.type,
            facultyName: resource.facultyName,
            uploadedBy: resource.createdBy, // Map resource.createdBy to uploadedBy
            date: new Date(resource.createdAt).toLocaleDateString("en-US", { // Map resource.createdAt to date and format
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            fileUrl: resource.fileUrl,
          })),
      }));
      console.log(combinedSubjects)
      setAllData(combinedSubjects);
      // Set the first subject as selected by default if available
      if (combinedSubjects.length > 0) {
        setSelectedSubject(combinedSubjects[0].name);
      }

    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetches complete or on error
    }
  };

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]); // Depend on 'user' state

  const handleViewDocument = (url: string | null | undefined) => {
    console.log(url)
    if (url) {
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleDocsViewerUrl, "_blank");
    } else {
      alert("No document URL available");
    }
  };
  const filteredSubjects = allData.map((subject) => ({
    ...subject,
    documents: (subject.documents || [])
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
    <div className="p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl">
        <CardHeader className="p-4 gap-4">
          <CardTitle className="text-3xl font-bold flex items-center gap-2 text-foreground">

            <BookOpen className="h-6 w-6 text-primary" />
            Document Repository
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="flex gap-6 py-6">
        {/* Left Sidebar: Subject List */}
        <Card className="w-1/4 bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Folder className="h-6 w-6 text-primary" />
              Subjects
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            {/* Loading state for Subjects */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading subjects...</p>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                No subjects found.
              </div>
            ) : (
              filteredSubjects.map((allData) => (
                <div
                  key={allData.id}
                  onClick={() => setSelectedSubject(allData.name)}
                  className={cn(
                    "p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden",
                    selectedSubject === allData.name
                      ? "bg-primary/20 shadow-lg border-l-4 border-primary"
                      : "bg-card hover:bg-primary/10 hover:shadow-md"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-20" />
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-foreground font-medium relative">{allData.name}</p>
                      <p className="text-xs text-muted-foreground relative">
                        {allData.documents.length} {allData.documents.length === 1 ? "file" : "files"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )} {/* End of conditional rendering for subjects */}
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
                disabled={isLoading} // Disable search while loading
                aria-label="Search documents"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={selectedType || "all"}
                onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
                disabled={isLoading} // Disable filter while loading
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
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}
                disabled={isLoading} // Disable sort while loading
              >
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
              {/* Loading state for Documents */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Loading documents...</p>
                </div>
              ) : selectedSubjectData.documents.length > 0 ? (
                selectedSubjectData.documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="bg-card shadow-sm rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-30 z-0" /> {/* Add z-0 here */}
                    <CardContent className="p-4 flex items-center justify-between gap-4 relative z-10"> {/* Add relative z-10 here */}
                      <div className="flex items-center gap-3 flex-1">
                        {getTypeIcon(doc.type)}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Type:</span> {doc.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Uploaded By:</span> {doc.facultyName}
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
                          onClick={() => handleViewDocument(doc.fileUrl ?? null)}
                          disabled={!doc.fileUrl}
                          aria-label={`View ${doc.fileUrl}`}
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
              ) : ( /* End of conditional rendering for documents */
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
                    <span className="font-medium">Uploaded By:</span> {selectedDoc.facultyName}
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
    </div>
  );
}