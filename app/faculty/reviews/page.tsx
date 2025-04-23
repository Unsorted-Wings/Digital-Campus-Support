"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [openCourses, setOpenCourses] = useState<{ [courseName: string]: boolean }>({});

  const filteredReviews = selectedCourse
    ? selectedSubject
      ? courses
          .find((c) => c.name === selectedCourse)!
          .subjects.find((s) => s.name === selectedSubject)!
          .reviews
      : courses
          .find((c) => c.name === selectedCourse)!
          .subjects.flatMap((s) => s.reviews)
    : courses.flatMap((c) => c.subjects).flatMap((s) => s.reviews);

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

  const handleToggleCourse = (courseName: string, open: boolean) => {
    setOpenCourses((prev) => ({ ...prev, [courseName]: open }));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
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
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex items-center justify-between w-full p-2 text-foreground font-semibold text-lg hover:bg-primary/10 rounded-md transition-all duration-300",
                    selectedCourse === course.name && !selectedSubject && "bg-primary/20 border-l-4 border-primary"
                  )}
                  onClick={() => { setSelectedCourse(course.name); setSelectedSubject(null); }}
                >
                  {course.name}
                  {openCourses[course.name] ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
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

        {/* Reviews Content */}
        <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden h-full min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardContent className="p-6 relative z-10 flex flex-col h-full min-h-0">
            {/* Aggregate Data */}
            <Card className="bg-muted/50 p-4 mb-6 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Aggregate Review Data</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">Teaching Style</p>
                  {renderStars(calculateAggregate(filteredReviews).teachingStyle)}
                </div>
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">Cooperation</p>
                  {renderStars(calculateAggregate(filteredReviews).cooperation)}
                </div>
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">Clarity</p>
                  {renderStars(calculateAggregate(filteredReviews).clarity)}
                </div>
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  {renderStars(calculateAggregate(filteredReviews).engagement)}
                </div>
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">Supportiveness</p>
                  {renderStars(calculateAggregate(filteredReviews).supportiveness)}
                </div>
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  {renderStars(calculateAggregate(filteredReviews).overall)}
                </div>
              </div>
            </Card>
            {/* Reviews Table */}
            <ScrollArea className="h-full">
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
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <TableRow key={review.id} className="hover:bg-primary/5 transition-all duration-300">
                        <TableCell className="text-foreground">{review.teachingStyle} / 5</TableCell>
                        <TableCell className="text-foreground">{review.cooperation} / 5</TableCell>
                        <TableCell className="text-foreground">{review.clarity} / 5</TableCell>
                        <TableCell className="text-foreground">{review.engagement} / 5</TableCell>
                        <TableCell className="text-foreground">{review.supportiveness} / 5</TableCell>
                        <TableCell className="text-foreground font-medium">{calculateReviewAverage(review)} / 5</TableCell>
                        <TableCell className="text-muted-foreground">{review.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No reviews available.
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