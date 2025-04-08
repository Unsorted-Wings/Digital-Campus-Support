"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Folder, Upload } from "lucide-react";
import { useState } from "react";

export default function FacultyDocRepoPage() {
  const [documents, setDocuments] = useState([
    { id: 1, name: "Math Lecture Notes", file: "/docs/math-lecture.pdf", uploaded: "2025-04-01" },
    { id: 2, name: "Physics Lab Guide", file: "/docs/physics-lab.pdf", uploaded: "2025-04-02" },
  ]);

  const handleUpload = () => {
    // Simulate file upload
    const newDoc = { id: documents.length + 1, name: "New Document", file: `/docs/new-doc-${documents.length + 1}.pdf`, uploaded: "2025-04-08" };
    setDocuments([...documents, newDoc]);
    console.log("Uploaded:", newDoc);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeader className="p-4 flex items-center justify-between">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            Document Repository
          </CardTitle>
          <Button onClick={handleUpload} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </Button>
        </CardHeader>
      </Card>
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">File Path</TableHead>
                  <TableHead className="text-foreground">Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-primary/5 transition-all duration-300">
                    <TableCell className="font-medium text-foreground">{doc.name}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.file}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.uploaded}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}