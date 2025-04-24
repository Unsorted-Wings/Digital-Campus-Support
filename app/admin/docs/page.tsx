"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Folder, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Faculty {
  id: number;
  name: string;
}

interface CourseFolder {
  id: number;
  name: string;
  mentorId: number | null;
}

export default function AdminDocumentsPage() {
  const [courseFolders, setCourseFolders] = useState<CourseFolder[]>([
    { id: 1, name: "Mathematics 101", mentorId: 1 },
    { id: 2, name: "Physics 201", mentorId: 2 },
    { id: 3, name: "CS 301", mentorId: 3 },
  ]);

  const [facultyList] = useState<Faculty[]>([
    { id: 1, name: "Dr. John Smith" },
    { id: 2, name: "Prof. Jane Doe" },
    { id: 3, name: "Dr. Alan Brown" },
  ]);

  const [folderForm, setFolderForm] = useState({ id: 0, name: "", mentorId: null as number | null });
  const [openDialog, setOpenDialog] = useState<"folder" | "delete" | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const handleAddOrUpdateFolder = () => {
    if (!folderForm.name || !folderForm.mentorId) {
      setError("Please provide a name and assign a mentor.");
      return;
    }
    if (folderForm.id) {
      setCourseFolders((prev) =>
        prev.map((f) => (f.id === folderForm.id ? { ...f, name: folderForm.name, mentorId: folderForm.mentorId } : f))
      );
      console.log("Updated folder:", folderForm);
    } else {
      const newId = courseFolders.length + 1;
      setCourseFolders((prev) => [
        ...prev,
        { id: newId, name: folderForm.name, mentorId: folderForm.mentorId },
      ]);
      console.log("Added folder:", folderForm);
    }
    setFolderForm({ id: 0, name: "", mentorId: null });
    setOpenDialog(null);
    setError("");
  };

  const handleEditFolder = (folder: CourseFolder) => {
    setFolderForm({ id: folder.id, name: folder.name, mentorId: folder.mentorId });
    setOpenDialog("folder");
  };

  const handleDeleteFolder = (id: number) => {
    setCourseFolders((prev) => prev.filter((f) => f.id !== id));
    console.log(`Deleted folder ID: ${id}`);
    setOpenDialog(null);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Course Folders
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOpenDialog("folder")}
              className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseFolders.map((folder) => (
          <Link key={folder.id} href={`/admin/docs/${folder.id}`}>
            <Card className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <Folder className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">{folder.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Mentor: {facultyList.find((f) => f.id === folder.mentorId)?.name || "None"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditFolder(folder);
                    }}
                    className="border-border text-foreground hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteId(folder.id);
                      setOpenDialog("delete");
                    }}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Folder Dialog */}
      <Dialog open={openDialog === "folder"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{folderForm.id ? "Edit Course Folder" : "Create Course Folder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div>
              <Label htmlFor="name" className="text-foreground">Folder Name</Label>
              <Input
                id="name"
                value={folderForm.name}
                onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mathematics 101"
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label htmlFor="mentor" className="text-foreground">Assign Mentor</Label>
              <Select
                value={folderForm.mentorId?.toString() || ""}
                onValueChange={(value) => setFolderForm((prev) => ({ ...prev, mentorId: parseInt(value) }))}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select mentor" />
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
              onClick={handleAddOrUpdateFolder}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {folderForm.id ? "Update Folder" : "Create Folder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog === "delete"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-foreground">Are you sure you want to delete this course folder? This action cannot be undone.</p>
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
              onClick={() => deleteId && handleDeleteFolder(deleteId)}
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