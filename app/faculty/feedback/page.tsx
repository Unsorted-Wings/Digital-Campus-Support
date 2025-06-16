"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  studentId: string; // Anonymized in UI
  teachingStyle: number; // 1–5
  cooperation: number; // 1–5
  clarity: number; // 1–5
  engagement: number; // 1–5
  supportiveness: number; // 1–5
  createdAt: string;
  facultyId?: string;
  semesterId?: string; // Optional, if needed for filtering
  courseId?: string; // Optional, if needed for filtering
  subjectId?: string; // Optional, if needed for filtering
}

interface Subject {
  name: string;
  reviews: Review[];
}

interface Course {
  name: string;
  subjects: Subject[];
}

export default function FacultyFeedbackPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [openCourses, setOpenCourses] = useState<{
    [courseName: string]: boolean;
  }>({});

  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  const [subjectData, setSubjectData] = useState<
    {
      courseId: string;
      courseName: string;
      batchId: string;
      batchName: string;
      subjectId: string;
      subjectName: string;
    }[]
  >([]);

  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(
    null
  );
  const [reviews, setReviews] = useState<Review[]>([]);

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
        });
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const fetchSubjects = async () => {
    try {
      console.log(user);
      const response = await fetch(
        `/api/subjects/viewSubject/viewCourseWiseSubjects?teacherId=${user?.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjectData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchSubjects();
  }, [user]);

  const course = courses.find((c) => c.name === selectedCourse);

  const filteredReviews =
    selectedCourseId && selectedSubjectId
      ? reviews.filter(
          (review) =>
            review.courseId === selectedCourseId &&
            review.subjectId === selectedSubjectId
        )
      : [];

  const fetchStudentCurrentSemester = async () => {
    const selectedBatchId = subjectData.find(
      (item) => item.courseId === selectedCourseId
    )?.batchId;
    try {
      const res = await fetch(
        `/api/semesterDetail/viewSemesterDetail/viewStudentCurrentSemester/?courseId=${selectedCourseId}&batchId=${selectedBatchId}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch semester detail");
      }
      setCurrentSemesterId(data.semesterDetailId);
    } catch (error) {
      console.error("Error fetching semester detail:", error);
    }
  };
  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `/api/review/viewReview/viewReviewFacultySide?semesterId=${currentSemesterId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch feedbacks");
      }
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchStudentCurrentSemester();
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId && currentSemesterId) {
      fetchReviews();
    }
  }, [selectedCourseId, currentSemesterId]);

  const calculateAggregate = (reviews: Review[]) => {
    if (reviews.length === 0)
      return {
        teachingStyle: 0,
        cooperation: 0,
        clarity: 0,
        engagement: 0,
        supportiveness: 0,
        overall: 0,
      };
    const totals = reviews.reduce(
      (acc, review) => ({
        teachingStyle: acc.teachingStyle + review.teachingStyle,
        cooperation: acc.cooperation + review.cooperation,
        clarity: acc.clarity + review.clarity,
        engagement: acc.engagement + review.engagement,
        supportiveness: acc.supportiveness + review.supportiveness,
      }),
      {
        teachingStyle: 0,
        cooperation: 0,
        clarity: 0,
        engagement: 0,
        supportiveness: 0,
      }
    );
    const count = reviews.length;
    return {
      teachingStyle: totals.teachingStyle / count,
      cooperation: totals.cooperation / count,
      clarity: totals.clarity / count,
      engagement: totals.engagement / count,
      supportiveness: totals.supportiveness / count,
      overall:
        (totals.teachingStyle +
          totals.cooperation +
          totals.clarity +
          totals.engagement +
          totals.supportiveness) /
        (5 * count),
    };
  };

  const calculateReviewAverage = (review: Review) => {
    return (
      (review.teachingStyle +
        review.cooperation +
        review.clarity +
        review.engagement +
        review.supportiveness) /
      5
    ).toFixed(1);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className="h-4 w-4 text-yellow-500 fill-yellow-500"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
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

  const groupedCourses = subjectData?.reduce(
    (
      acc: {
        name: string;
        courseId: string;
        batchId: string;
        subjects: { id: string; name: string }[];
      }[],
      item
    ) => {
      const combinedName = `${item.courseName} - ${item.batchName}`;
      const key = `${item.courseId}-${item.batchId}`; // Unique key for course+batch

      const existing = acc.find(
        (entry) =>
          entry.courseId === item.courseId && entry.batchId === item.batchId
      );

      const subject = {
        id: item.subjectId,
        name: item.subjectName,
      };

      if (existing) {
        const alreadyExists = existing.subjects.some(
          (s) => s.id === subject.id
        );
        if (!alreadyExists) {
          existing.subjects.push(subject);
        }
      } else {
        acc.push({
          name: combinedName,
          courseId: item.courseId,
          batchId: item.batchId,
          subjects: [subject],
        });
      }

      return acc;
    },
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Faculty's Feedback
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
                !selectedCourse &&
                  !selectedSubject &&
                  "bg-primary/20 border-l-4 border-primary"
              )}
              onClick={() => {
                setSelectedCourse(null);
                setSelectedSubject(null);
              }}
            >
              All Courses
            </div>
            {groupedCourses.map((course) => (
              <Collapsible
                key={course.name}
                open={openCourses[course.name]}
                onOpenChange={(open) => handleToggleCourse(course.name, open)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex items-center justify-between w-full p-2 text-foreground font-semibold text-lg hover:bg-primary/10 rounded-md transition-all duration-300",
                    selectedCourse === course.name &&
                      !selectedSubject &&
                      "bg-primary/20 border-l-4 border-primary"
                  )}
                  onClick={() => {
                    setSelectedCourse(course.name);
                    setSelectedCourseId(course.courseId);
                    setSelectedSubject(null);
                  }}
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
                        selectedCourse === course.name &&
                          selectedSubject === subject.name &&
                          "bg-primary/20 border-l-4 border-primary"
                      )}
                      onClick={() => {
                        setSelectedCourse(course.name);
                        setSelectedCourseId(course.courseId);
                        setSelectedSubject(subject.name);
                        setSelectedSubjectId(subject.id);
                      }}
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
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Aggregate Feedback Data
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">
                    Teaching Style
                  </p>
                  {renderStars(
                    calculateAggregate(filteredReviews).teachingStyle
                  )}
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
                  <p className="text-sm text-muted-foreground">
                    Supportiveness
                  </p>
                  {renderStars(
                    calculateAggregate(filteredReviews).supportiveness
                  )}
                </div>
                <div className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-primary/10 transition-all duration-300">
                  <p className="text-sm text-muted-foreground">
                    Overall Average
                  </p>
                  {renderStars(calculateAggregate(filteredReviews).overall)}
                </div>
              </div>
            </Card>
            {/* Reviews Table */}
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">
                      Teaching Style
                    </TableHead>
                    <TableHead className="text-foreground">
                      Cooperation
                    </TableHead>
                    <TableHead className="text-foreground">Clarity</TableHead>
                    <TableHead className="text-foreground">
                      Engagement
                    </TableHead>
                    <TableHead className="text-foreground">
                      Supportiveness
                    </TableHead>
                    <TableHead className="text-foreground">Average</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <TableRow
                        key={review.id}
                        className="hover:bg-primary/5 transition-all duration-300"
                      >
                        <TableCell className="text-foreground">
                          {review.teachingStyle} / 5
                        </TableCell>
                        <TableCell className="text-foreground">
                          {review.cooperation} / 5
                        </TableCell>
                        <TableCell className="text-foreground">
                          {review.clarity} / 5
                        </TableCell>
                        <TableCell className="text-foreground">
                          {review.engagement} / 5
                        </TableCell>
                        <TableCell className="text-foreground">
                          {review.supportiveness} / 5
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {calculateReviewAverage(review)} / 5
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {review.createdAt.split("T")[0].trim()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No feedbacks available.
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
