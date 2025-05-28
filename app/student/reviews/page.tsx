"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Star,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Toast } from "@/components/ui/toast"; // Mock toast import
import { toast } from "@/hooks/use-toast";

interface Faculty {
  id: number;
  name: string;
}

interface Subject {
  name: string;
}

interface Course {
  name: string;
  subjects: Subject[];
}

interface Review {
  id: number;
  studentId: number;
  facultyId: number;
  course: string;
  subject: string;
  teachingStyle: number;
  cooperation: number;
  clarity: number;
  engagement: number;
  supportiveness: number;
  date: string;
}

export default function StudentFacultyReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [studentCourseData, setStudentCourseData] = useState<any>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [studentSubjectData, setStudentSubjectData] = useState<any[]>([]);

  const fetchStudentCourseDetails = async () => {
    try {
      const response = await fetch(
        `/api/batch/viewBatch/viewStudentBatchDetail?studentId=${user.uid}`
      );
      const data = await response.json();
      setStudentCourseData(data);
    } catch (error) {
      console.error("Error fetching student course details:", error);
    }
  };

  const fetchSubjectDetails = async () => {
    try {
      const response = await fetch(
        `/api/semesterSubjects/viewSemesterSubject/viewCourseSubjects?studentId=${user.uid}`
      );
      const data = await response.json();
      setStudentSubjectData(data);
    } catch (error) {
      console.error("Error fetching subject details:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentCourseDetails();
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      fetchSubjectDetails();
    }
  }, [studentCourseData, user]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const facultyList: Faculty[] = Array.from(
    new Map(
      studentSubjectData.map((s) => [
        s.teacherId,
        { id: s.teacherId, name: s.teacherName },
      ])
    ).values()
  );

  console.log(studentSubjectData);

  const filteredSubjects = studentSubjectData.filter(
    (s) => s.teacherId === selectedFaculty
  );

  const [courses] = useState<Course[]>([
    {
      name: "Mathematics 101",
      subjects: [{ name: "Algebra" }, { name: "Calculus" }],
    },
    {
      name: "Physics 201",
      subjects: [{ name: "Mechanics" }, { name: "Thermodynamics" }],
    },
    {
      name: "CS 301",
      subjects: [{ name: "Algorithms" }, { name: "Data Structures" }],
    },
  ]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [ratings, setRatings] = useState({
    teachingStyle: 0,
    cooperation: 0,
    clarity: 0,
    engagement: 0,
    supportiveness: 0,
  });
  const [error, setError] = useState<string>("");
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleRatingChange = (
    question: keyof typeof ratings,
    value: number
  ) => {
    setRatings((prev) => ({ ...prev, [question]: value }));
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSelectedSubject("");
  };

  const handleSubmit = () => {
    if (
      !selectedFaculty ||
      !selectedCourse ||
      !selectedSubject ||
      Object.values(ratings).some((r) => r === 0)
    ) {
      setError(
        "Please select a faculty, course, subject, and provide all ratings."
      );
      return;
    }

    const studentId = 1; // Mock; use auth context
    const duplicate = reviews.some(
      (r) =>
        r.studentId === studentId &&
        r.facultyId === parseInt(selectedFaculty) &&
        r.course === selectedCourse &&
        r.subject === selectedSubject
    );
    if (duplicate) {
      setError(
        "You have already submitted a review for this faculty, course, and subject."
      );
      return;
    }

    const newReview: Review = {
      id: reviews.length + 1,
      studentId,
      facultyId: parseInt(selectedFaculty),
      course: selectedCourse,
      subject: selectedSubject,
      teachingStyle: ratings.teachingStyle,
      cooperation: ratings.cooperation,
      clarity: ratings.clarity,
      engagement: ratings.engagement,
      supportiveness: ratings.supportiveness,
      date: new Date().toISOString().split("T")[0],
    };

    setReviews((prev) => [...prev, newReview]);
    toast({
      title: "Review Submitted",
      description: "Your faculty review has been recorded.",
    });
    setSelectedFaculty("");
    setSelectedCourse("");
    setSelectedSubject("");
    setRatings({
      teachingStyle: 0,
      cooperation: 0,
      clarity: 0,
      engagement: 0,
      supportiveness: 0,
    });
    setError("");
  };

  const handleClear = () => {
    setSelectedFaculty("");
    setSelectedCourse("");
    setSelectedSubject("");
    setRatings({
      teachingStyle: 0,
      cooperation: 0,
      clarity: 0,
      engagement: 0,
      supportiveness: 0,
    });
    setError("");
  };

  const renderStars = (
    question: keyof typeof ratings,
    currentRating: number
  ) => {
    return (
      <div className="flex gap-2">
        <div
          role="radiogroup"
          aria-label={`Rate ${question}, ${currentRating} stars`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && currentRating < 5)
              handleRatingChange(question, currentRating + 1);
            if (e.key === "ArrowLeft" && currentRating > 0)
              handleRatingChange(question, currentRating - 1);
          }}
          className="flex items-center gap-2"
          tabIndex={0}
        >
          {[...Array(5)].map((_, i) => (
            <span key={i} title={ratingLabels[i]}>
              <Star
                className={cn(
                  "h-6 w-6 cursor-pointer transition-all duration-300",
                  i < currentRating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground",
                  "hover:scale-110"
                )}
                onClick={() => handleRatingChange(question, i + 1)}
              />
            </span>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {currentRating > 0
            ? `${currentRating}/5 (${ratingLabels[currentRating - 1]})`
            : ""}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            {selectedFaculty && selectedCourse
              ? `Rate ${
                  facultyList.find((f) => f.id === parseInt(selectedFaculty))
                    ?.name
                } for ${selectedCourse}`
              : "Rate Faculty"}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Review Form */}
        <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden h-full min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardContent className="p-4 flex flex-col h-full min-h-0">
            <ScrollArea className="h-full w-full">
              <Card className="bg-muted/50 p-6 rounded-lg w-full max-w-lg mx-auto min-h-fit">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Submit Faculty Review
                </h3>
                {error && (
                  <p className="text-destructive text-sm mb-4 bg-destructive/10 p-2 rounded shadow-sm">
                    {error}
                  </p>
                )}
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="faculty"
                      className="text-sm text-foreground font-medium"
                    >
                      Faculty
                    </Label>
                    <Select
                      value={selectedFaculty}
                      onValueChange={setSelectedFaculty}
                      aria-label="Select faculty"
                    >
                      <SelectTrigger
                        id="faculty"
                        className="w-full bg-primary/5 border-border rounded-xl focus:ring-primary"
                      >
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyList.map((faculty) => (
                          <SelectItem
                            key={faculty.id}
                            value={faculty.id.toString()}
                          >
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="course"
                      className="text-sm text-foreground font-medium"
                    >
                      Course
                    </Label>
                    <Select
                      value={selectedCourse}
                      onValueChange={handleCourseChange}
                      aria-label="Select course"
                    >
                      <SelectTrigger
                        id="course"
                        className="w-full bg-primary/5 border-border rounded-xl focus:ring-primary"
                      >
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.name} value={course.name}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="subject"
                      className="text-sm text-foreground font-medium"
                    >
                      Subject
                    </Label>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                      disabled={!selectedCourse}
                      aria-label="Select subject"
                    >
                      <SelectTrigger
                        id="subject"
                        className="w-full bg-primary/5 border-border rounded-xl focus:ring-primary"
                      >
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .find((course) => course.name === selectedCourse)
                          ?.subjects.map((subject) => (
                            <SelectItem key={subject.name} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-foreground font-medium">
                        Teaching Style
                      </Label>
                      {renderStars("teachingStyle", ratings.teachingStyle)}
                    </div>
                    <div>
                      <Label className="text-sm text-foreground font-medium">
                        Cooperation
                      </Label>
                      {renderStars("cooperation", ratings.cooperation)}
                    </div>
                    <div>
                      <Label className="text-sm text-foreground font-medium">
                        Clarity
                      </Label>
                      {renderStars("clarity", ratings.clarity)}
                    </div>
                    <div>
                      <Label className="text-sm text-foreground font-medium">
                        Engagement
                      </Label>
                      {renderStars("engagement", ratings.engagement)}
                    </div>
                    <div>
                      <Label className="text-sm text-foreground font-medium">
                        Supportiveness
                      </Label>
                      {renderStars("supportiveness", ratings.supportiveness)}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                      aria-label="Submit review"
                    >
                      Submit Review
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="flex-1 bg-primary/10 border-border text-foreground hover:bg-primary/20 rounded-full"
                      aria-label="Clear form"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Past Reviews */}
        <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardContent className="p-4">
            <Collapsible
              open={isReviewsOpen}
              onOpenChange={setIsReviewsOpen}
              className="w-full max-w-lg mx-auto"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg flex items-center justify-between"
                >
                  <span>Past Reviews ({reviews.length})</span>
                  {isReviewsOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card
                      key={review.id}
                      className="bg-card shadow-sm rounded-lg transition-all duration-300 hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-foreground">
                          {
                            facultyList.find((f) => f.id === review.facultyId)
                              ?.name
                          }{" "}
                          - {review.course} ({review.subject})
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Teaching Style:</span>{" "}
                            {review.teachingStyle}/5
                            <span className="flex">
                              {[...Array(review.teachingStyle)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Cooperation:</span>{" "}
                            {review.cooperation}/5
                            <span className="flex">
                              {[...Array(review.cooperation)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Clarity:</span>{" "}
                            {review.clarity}/5
                            <span className="flex">
                              {[...Array(review.clarity)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Engagement:</span>{" "}
                            {review.engagement}/5
                            <span className="flex">
                              {[...Array(review.engagement)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Supportiveness:</span>{" "}
                            {review.supportiveness}/5
                            <span className="flex">
                              {[...Array(review.supportiveness)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Date:</span>{" "}
                          {review.date}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No reviews submitted yet.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
