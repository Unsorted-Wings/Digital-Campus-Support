"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Faculty {
  id: number;
  name: string;
}

interface SubjectFolder {
  id: number;
  name: string;
  facultyId: number | null;
  documents: { id: number; name: string; file: string; uploaded: string }[];
}

interface CourseFolder {
  id: number;
  name: string;
  mentorId: number | null;
  subjects: SubjectFolder[];
}

export default function AdminDocumentsPage() {
  const router = useRouter();

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Manage Courses
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <h3 className="text-lg font-semibold text-foreground mb-4">Course Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseFolders.map((course) => (
              <Card
                key={course.id}
                className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/admin/assignments/${course.id}`)}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <Folder className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{course.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Mentor: {facultyList.find((f) => f.id === course.mentorId)?.name || "None"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}