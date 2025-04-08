"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

export default function FacultyCoursesPage() {
  const courses = [
    { id: 1, name: "Mathematics 101", code: "MATH101", students: 30, credits: 3 },
    { id: 2, name: "Physics 201", code: "PHY201", students: 25, credits: 4 },
    { id: 3, name: "CS 301", code: "CS301", students: 35, credits: 3 },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            My Courses
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-4 mb-4 last:mb-0 bg-muted/50 rounded-lg hover:bg-primary/10 transition-all duration-300"
              >
                <p className="text-foreground font-medium text-lg">{course.name}</p>
                <p className="text-sm text-muted-foreground">Code: {course.code}</p>
                <p className="text-sm text-muted-foreground">{course.students} students, {course.credits} credits</p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}