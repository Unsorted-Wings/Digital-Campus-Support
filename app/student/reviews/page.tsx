"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [facultyList] = useState<Faculty[]>([
    { id: 1, name: "Dr. John Smith" },
    { id: 2, name: "Prof. Jane Doe" },
    { id: 3, name: "Dr. Alan Brown" },
  ]);

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
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
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

  const handleRatingChange = (question: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = () => {
    if (!selectedFaculty || !selectedCourse || !selectedSubject || Object.values(ratings).some((r) => r === 0)) {
      setError("Please select a faculty, course, subject, and provide all ratings.");
      return;
    }

    // Mock student ID (replace with real user context, e.g., from next-auth)
    const studentId = 1;

    // Check for duplicate review (mock; implement via backend)
    const duplicate = reviews.some(
      (r) =>
        r.studentId === studentId &&
        r.facultyId === parseInt(selectedFaculty) &&
        r.course === selectedCourse &&
        r.subject === selectedSubject
    );
    if (duplicate) {
      setError("You have already submitted a review for this faculty, course, and subject.");
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
    console.log("Submitted review:", newReview);
    setSelectedFaculty("");
    setSelectedCourse("");
    setSelectedSubject("");
    setRatings({ teachingStyle: 0, cooperation: 0, clarity: 0, engagement: 0, supportiveness: 0 });
    setError("");
  };

  const handleClear = () => {
    setSelectedFaculty("");
    setSelectedCourse("");
    setSelectedSubject("");
    setRatings({ teachingStyle: 0, cooperation: 0, clarity: 0, engagement: 0, supportiveness: 0 });
    setError("");
  };

  const renderStars = (question: keyof typeof ratings, currentRating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-6 w-6 cursor-pointer transition-all duration-300",
              i < currentRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground",
              "hover:scale-110"
            )}
            onClick={() => handleRatingChange(question, i + 1)}
          />
        ))}
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
            Rate Faculty
          </CardTitle>
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-full shadow-sm">
            {/* Placeholder for future actions */}
          </div>
        </CardHeader>
      </Card>

      {/* Review Form */}
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10 flex items-center justify-center">
          <Card className="bg-muted/50 p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Submit Faculty Review</h3>
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Faculty</label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger className="w-full bg-muted/50 border-border rounded-lg">
                    <SelectValue placeholder="Select faculty" />
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
              <div>
                <label className="text-sm text-muted-foreground">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full bg-muted/50 border-border rounded-lg">
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
                <label className="text-sm text-muted-foreground">Subject</label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                  disabled={!selectedCourse}
                >
                  <SelectTrigger className="w-full bg-muted/50 border-border rounded-lg">
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
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Teaching Style</label>
                  {renderStars("teachingStyle", ratings.teachingStyle)}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Cooperation</label>
                  {renderStars("cooperation", ratings.cooperation)}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Clarity</label>
                  {renderStars("clarity", ratings.clarity)}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Engagement</label>
                  {renderStars("engagement", ratings.engagement)}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Supportiveness</label>
                  {renderStars("supportiveness", ratings.supportiveness)}
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Submit Review
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-primary/10 rounded-lg"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}