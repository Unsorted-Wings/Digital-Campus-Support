"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";

interface Review {
  id: number;
  studentId: number; // Anonymized in UI
  teachingStyle: number; // 1–5
  cooperation: number; // 1–5
  clarity: number; // 1–5
  engagement: number; // 1–5
  supportiveness: number; // 1–5
  date: string;
}

interface Subject {
  name: string;
  reviews: Review[];
}

interface Course {
  name: string;
  subjects: Subject[];
}

export default function FacultyReviewsPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      name: "Mathematics 101",
      subjects: [
        {
          name: "Algebra",
          reviews: [
            { id: 1, studentId: 1, teachingStyle: 4, cooperation: 5, clarity: 4, engagement: 3, supportiveness: 4, date: "2025-04-01" },
            { id: 2, studentId: 2, teachingStyle: 5, cooperation: 4, clarity: 5, engagement: 4, supportiveness: 5, date: "2025-04-03" },
          ],
        },
        {
          name: "Calculus",
          reviews: [
            { id: 3, studentId: 1, teachingStyle: 3, cooperation: 4, clarity: 3, engagement: 4, supportiveness: 3, date: "2025-04-02" },
          ],
        },
      ],
    },
    {
      name: "Physics 201",
      subjects: [
        {
          name: "Mechanics",
          reviews: [
            { id: 4, studentId: 3, teachingStyle: 4, cooperation: 3, clarity: 4, engagement: 5, supportiveness: 4, date: "2025-04-05" },
          ],
        },
        {
          name: "Thermodynamics",
          reviews: [
            { id: 5, studentId: 3, teachingStyle: 5, cooperation: 5, clarity: 4, engagement: 4, supportiveness: 5, date: "2025-04-06" },
          ],
        },
      ],
    },
    {
      name: "CS 301",
      subjects: [
        {
          name: "Algorithms",
          reviews: [
            { id: 6, studentId: 4, teachingStyle: 3, cooperation: 4, clarity: 3, engagement: 3, supportiveness: 4, date: "2025-04-07" },
          ],
        },
        {
          name: "Data Structures",
          reviews: [
            { id: 7, studentId: 4, teachingStyle: 4, cooperation: 4, clarity: 5, engagement: 4, supportiveness: 4, date: "2025-04-08" },
          ],
        },
      ],
    },
  ]);

  const [selectedSubjects, setSelectedSubjects] = useState<{ [courseName: string]: string }>(
    courses.reduce((acc, course) => ({ ...acc, [course.name]: course.subjects[0].name }), {})
  );

  const handleSubjectChange = (courseName: string, subjectName: string) => {
    setSelectedSubjects((prev) => ({ ...prev, [courseName]: subjectName }));
  };

  const calculateAggregate = (reviews: Review[]) => {
    if (reviews.length === 0) return { teachingStyle: 0, cooperation: 0, clarity: 0, engagement: 0, supportiveness: 0, overall: 0 };
    const totals = reviews.reduce(
      (acc, review) => ({
        teachingStyle: acc.teachingStyle + review.teachingStyle,
        cooperation: acc.cooperation + review.cooperation,
        clarity: acc.clarity + review.clarity,
        engagement: acc.engagement + review.engagement,
        supportiveness: acc.supportiveness + review.supportiveness,
      }),
      { teachingStyle: 0, cooperation: 0, clarity: 0, engagement: 0, supportiveness: 0 }
    );
    const count = reviews.length;
    return {
      teachingStyle: totals.teachingStyle / count,
      cooperation: totals.cooperation / count,
      clarity: totals.clarity / count,
      engagement: totals.engagement / count,
      supportiveness: totals.supportiveness / count,
      overall: (totals.teachingStyle + totals.cooperation + totals.clarity + totals.engagement + totals.supportiveness) / (5 * count),
    };
  };

  const calculateReviewAverage = (review: Review) => {
    return (
      (review.teachingStyle + review.cooperation + review.clarity + review.engagement + review.supportiveness) / 5
    ).toFixed(1);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            );
          } else {
            return <Star key={i} className="h-4 w-4 text-muted-foreground" />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Student Reviews
          </CardTitle>
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-full shadow-sm">
            {/* Placeholder for future actions */}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content with Tabs */}
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <Tabs defaultValue={courses[0].name} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted/50 rounded-lg p-1 mb-4">
              {courses.map((course) => (
                <TabsTrigger
                  key={course.name}
                  value={course.name}
                  className="rounded-md py-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  {course.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {courses.map((course) => (
              <TabsContent key={course.name} value={course.name}>
                <div className="mb-4">
                  <Select
                    value={selectedSubjects[course.name]}
                    onValueChange={(value) => handleSubjectChange(course.name, value)}
                  >
                    <SelectTrigger className="w-[200px] bg-muted/50 border-border rounded-lg">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {course.subjects.map((subject) => (
                        <SelectItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Aggregate Data */}
                {(() => {
                  const reviews = course.subjects.find((subject) => subject.name === selectedSubjects[course.name])?.reviews || [];
                  const aggregate = calculateAggregate(reviews);
                  return (
                    <Card className="bg-muted/50 p-4 mb-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Aggregate Review Data</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                          <p className="text-sm text-muted-foreground">Teaching Style</p>
                          {renderStars(aggregate.teachingStyle)}
                        </div>
                        <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                          <p className="text-sm text-muted-foreground">Cooperation</p>
                          {renderStars(aggregate.cooperation)}
                        </div>
                        <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                          <p className="text-sm text-muted-foreground">Clarity</p>
                          {renderStars(aggregate.clarity)}
                        </div>
                        <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                          <p className="text-sm text-muted-foreground">Engagement</p>
                          {renderStars(aggregate.engagement)}
                        </div>
                        <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                          <p className="text-sm text-muted-foreground">Supportiveness</p>
                          {renderStars(aggregate.supportiveness)}
                        </div>
                        <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                          <p className="text-sm text-muted-foreground">Overall Average</p>
                          {renderStars(aggregate.overall)}
                        </div>
                      </div>
                    </Card>
                  );
                })()}
                {/* Reviews Table */}
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-foreground">Teaching Style</TableHead>
                        <TableHead className="text-foreground">Cooperation</TableHead>
                        <TableHead className="text-foreground">Clarity</TableHead>
                        <TableHead className="text-foreground">Engagement</TableHead>
                        <TableHead className="text-foreground">Supportiveness</TableHead>
                        <TableHead className="text-foreground">Average</TableHead>
                        <TableHead className="text-foreground">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.subjects
                        .find((subject) => subject.name === selectedSubjects[course.name])
                        ?.reviews.map((review) => (
                          <TableRow key={review.id} className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="text-foreground">{review.teachingStyle} / 5</TableCell>
                            <TableCell className="text-foreground">{review.cooperation} / 5</TableCell>
                            <TableCell className="text-foreground">{review.clarity} / 5</TableCell>
                            <TableCell className="text-foreground">{review.engagement} / 5</TableCell>
                            <TableCell className="text-foreground">{review.supportiveness} / 5</TableCell>
                            <TableCell className="text-foreground font-medium">{calculateReviewAverage(review)} / 5</TableCell>
                            <TableCell className="text-muted-foreground">{review.date}</TableCell>
                          </TableRow>
                        )) || (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No reviews available for this subject.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}