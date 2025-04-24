"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Star, Edit, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Faculty {
  id: number;
  name: string;
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

interface Subject {
  name: string;
  reviews: Review[];
}

interface Course {
  name: string;
  subjects: Subject[];
}

export default function AdminFacultyReviewsPage() {
  const [facultyList] = useState<Faculty[]>([
    { id: 1, name: "Dr. John Smith" },
    { id: 2, name: "Prof. Jane Doe" },
    { id: 3, name: "Dr. Alan Brown" },
  ]);

  const [courses, setCourses] = useState<Course[]>([
    {
      name: "Mathematics 101",
      subjects: [
        {
          name: "Algebra",
          reviews: [
            { id: 1, studentId: 1, facultyId: 1, course: "Mathematics 101", subject: "Algebra", teachingStyle: 4, cooperation: 5, clarity: 4, engagement: 3, supportiveness: 4, date: "2025-04-01" },
          ],
        },
        { name: "Calculus", reviews: [] },
      ],
    },
    {
      name: "Physics 201",
      subjects: [
        { name: "Mechanics", reviews: [] },
        { name: "Thermodynamics", reviews: [] },
      ],
    },
    {
      name: "CS 301",
      subjects: [
        { name: "Algorithms", reviews: [] },
        { name: "Data Structures", reviews: [] },
      ],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Default to first course and subject
  useEffect(() => {
    setSelectedCourse("Mathematics 101");
    setSelectedSubject("Algebra");
  }, []);

  const [reviewForm, setReviewForm] = useState<Review | null>(null);
  const [openDialog, setOpenDialog] = useState<"review" | "delete" | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const handleEditReview = (review: Review) => {
    setReviewForm(review);
    setOpenDialog("review");
  };

  const handleAddOrUpdateReview = () => {
    if (!reviewForm || Object.values(reviewForm).some((v, i) => i >= 4 && i <= 8 && (v < 1 || v > 5))) {
      setError("Please provide valid ratings (1–5) for all fields.");
      return;
    }
    const updatedReview = { ...reviewForm! };
    setCourses((prev) =>
      prev.map((course) => ({
        ...course,
        subjects: course.subjects.map((subject) => {
          if (course.name === reviewForm!.course && subject.name === reviewForm!.subject) {
            if (reviewForm!.id) {
              return { ...subject, reviews: subject.reviews.map((r) => (r.id === reviewForm!.id ? updatedReview : r)) };
            } else {
              updatedReview.id = subject.reviews.length + 1;
              return { ...subject, reviews: [...subject.reviews, updatedReview] };
            }
          }
          return subject;
        }),
      }))
    );
    console.log(reviewForm!.id ? "Updated review:" : "Added review:", updatedReview);
    setReviewForm(null);
    setOpenDialog(null);
    setError("");
  };

  const handleDeleteReview = (id: number) => {
    setCourses((prev) =>
      prev.map((course) => ({
        ...course,
        subjects: course.subjects.map((subject) => ({
          ...subject,
          reviews: subject.reviews.filter((r) => r.id !== id),
        })),
      }))
    );
    console.log(`Deleted review ID: ${id}`);
    setOpenDialog(null);
    setDeleteId(null);
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

  const calculateReviewAverage = (review: Review) => {
    return (
      (review.teachingStyle + review.cooperation + review.clarity + review.engagement + review.supportiveness) / 5
    ).toFixed(1);
  };

  // Filter reviews based on selected course and subject
  const filteredReviews = courses
    .flatMap((course) =>
      course.subjects.flatMap((subject) =>
        subject.reviews.map((review) => ({ ...review, courseName: course.name, subjectName: subject.name }))
      )
    )
    .filter((review) => {
      if (selectedCourse && selectedCourse !== "all" && review.courseName !== selectedCourse) return false;
      if (selectedSubject && selectedSubject !== "all" && review.subjectName !== selectedSubject) return false;
      return true;
    });

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Manage Faculty Reviews
          </CardTitle>
          <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-full shadow-sm">
            <Select
              value={selectedCourse || "all"}
              onValueChange={(value) => {
                setSelectedCourse(value === "all" ? null : value);
                setSelectedSubject(null);
              }}
            >
              <SelectTrigger className="bg-muted/50 border-border w-[200px]">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.name} value={course.name}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedSubject || "all"}
              onValueChange={(value) => {
                setSelectedSubject(value === "all" ? null : value);
              }}
            >
              <SelectTrigger className="bg-muted/50 border-border w-[200px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {selectedCourse && selectedCourse !== "all"
                  ? courses.find((c) => c.name === selectedCourse)?.subjects.map((subject) => (
                      <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                    ))
                  : courses.flatMap((course) => course.subjects).map((subject) => (
                      <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Faculty</TableHead>
                  <TableHead className="text-foreground">Teaching Style</TableHead>
                  <TableHead className="text-foreground">Cooperation</TableHead>
                  <TableHead className="text-foreground">Clarity</TableHead>
                  <TableHead className="text-foreground">Engagement</TableHead>
                  <TableHead className="text-foreground">Supportiveness</TableHead>
                  <TableHead className="text-foreground">Average</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-primary/5 transition-all duration-300">
                    <TableCell className="font-medium text-foreground">{facultyList.find((f) => f.id === review.facultyId)?.name || "Unknown"}</TableCell>
                    <TableCell className="text-foreground">{renderStars(review.teachingStyle)}</TableCell>
                    <TableCell className="text-foreground">{renderStars(review.cooperation)}</TableCell>
                    <TableCell className="text-foreground">{renderStars(review.clarity)}</TableCell>
                    <TableCell className="text-foreground">{renderStars(review.engagement)}</TableCell>
                    <TableCell className="text-foreground">{renderStars(review.supportiveness)}</TableCell>
                    <TableCell className="text-foreground font-medium">{calculateReviewAverage(review)}</TableCell>
                    <TableCell className="text-muted-foreground">{review.date}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditReview(review)}
                        className="border-border text-foreground hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteId(review.id);
                          setOpenDialog("delete");
                        }}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={openDialog === "review"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Review</DialogTitle>
          </DialogHeader>
          {reviewForm && (
            <div className="space-y-4 p-4">
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div>
                <Label htmlFor="faculty" className="text-foreground">Faculty</Label>
                <Select
                  value={reviewForm.facultyId.toString()}
                  onValueChange={(value) => setReviewForm((prev) => ({ ...prev!, facultyId: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>{faculty.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course" className="text-foreground">Course</Label>
                <Select
                  value={reviewForm.course}
                  onValueChange={(value) => setReviewForm((prev) => ({ ...prev!, course: value, subject: "" }))}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.name} value={course.name}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Select
                  value={reviewForm.subject}
                  onValueChange={(value) => setReviewForm((prev) => ({ ...prev!, subject: value }))}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.find((c) => c.name === reviewForm.course)?.subjects.map((subject) => (
                      <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teachingStyle" className="text-foreground">Teaching Style (1–5)</Label>
                <Input
                  id="teachingStyle"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.teachingStyle}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev!, teachingStyle: parseInt(e.target.value) }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="cooperation" className="text-foreground">Cooperation (1–5)</Label>
                <Input
                  id="cooperation"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.cooperation}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev!, cooperation: parseInt(e.target.value) }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="clarity" className="text-foreground">Clarity (1–5)</Label>
                <Input
                  id="clarity"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.clarity}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev!, clarity: parseInt(e.target.value) }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="engagement" className="text-foreground">Engagement (1–5)</Label>
                <Input
                  id="engagement"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.engagement}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev!, engagement: parseInt(e.target.value) }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="supportiveness" className="text-foreground">Supportiveness (1–5)</Label>
                <Input
                  id="supportiveness"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.supportiveness}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev!, supportiveness: parseInt(e.target.value) }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <Button
                onClick={handleAddOrUpdateReview}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Update Review
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog === "delete"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-foreground">Are you sure you want to delete this review? This action cannot be undone.</p>
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
              onClick={() => deleteId && handleDeleteReview(deleteId)}
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