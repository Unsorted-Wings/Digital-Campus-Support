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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BookOpen, TrendingUp, BarChart } from "lucide-react";
import { use, useEffect, useState } from "react";

export default function GradebookPage() {
  const [activeTab, setActiveTab] = useState("summary");
  const [user, setUser] = useState<any>(null);
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(
    null
  );
  const [studentCourseData, setStudentCourseData] = useState<any>(null);
  const [fetchedGrades, setFetchedGrades] = useState<any>(null);
  const [structuredGrades, setStructuredGrades] = useState<any>(null);
  const [areTermEndMarkFetched, setAreTermEndMarksFetched] =
    useState<boolean>(false);
  const [overallGPA, setOverallGPA] = useState<number>(0);

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

  const fetchStudentCurrentSemester = async () => {
    try {
      const res = await fetch(
        `/api/semesterDetail/viewSemesterDetail/viewStudentCurrentSemester/?courseId=${studentCourseData?.courseId}&batchId=${studentCourseData?.batchId}`,
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

  const fetchStudentGrades = async () => {
    if (!currentSemesterId || !studentCourseData) return;

    try {
      const res = await fetch(
        `/api/grades/viewGrades/viewStudentGrades?semesterId=${currentSemesterId}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch grades");
      }

      setFetchedGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentCourseDetails();
    }
  }, [user]);

  useEffect(() => {
    if (user && studentCourseData) {
      fetchStudentCurrentSemester();
    }
  }, [user, studentCourseData]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user && currentSemesterId && studentCourseData) {
      fetchStudentGrades();
    }
  }, [user, currentSemesterId, studentCourseData]);

  useEffect(() => {
    if (!fetchedGrades) return;
    const gradesMap = new Map();

    for (const grade of fetchedGrades) {
      const key = grade.subjectId;

      if (!gradesMap.has(key)) {
        gradesMap.set(key, {
          subject: grade.subjectName,
          sessional1: 0,
          sessional2: 0,
          // termEnd: 0,
          attendance: 0,
          assignments: 0,
        });
      }

      const current = gradesMap.get(key);

      if (grade.category === "internal") {
        current.sessional1 = grade.sessional1;
        current.sessional2 = grade.sessional2;
        current.attendance = grade.attendance;
        current.assignments = grade.assignments;
      } else if (grade.category === "external") {
        current.termEnd = grade.termEnd; // or `grade.termEnd` if stored under a different key
        setAreTermEndMarksFetched(true);
      }

      gradesMap.set(key, current);
    }

    const grades = {
      summary: Array.from(gradesMap.values()),
    };
    setStructuredGrades(grades);
  }, [fetchedGrades]);

  const calculateInternalMarks = (
    sessional1: number,
    sessional2: number,
    attendance: number,
    assignments: number
  ) => {
    const [higher, lower] =
      sessional1 > sessional2
        ? [sessional1, sessional2]
        : [sessional2, sessional1];
    const examComponent = ((0.7 * higher + 0.3 * lower) / 30) * 15; // 15 marks total for exams
    return examComponent + attendance + assignments; // Total internal: 30 marks
  };

  const calculateFinalMarks = (
    sessional1: number,
    sessional2: number,
    termEnd: number,
    attendance: number,
    assignments: number,
    areTermEndMarkFetched?: boolean
  ) => {
    const internalMarks = calculateInternalMarks(
      sessional1,
      sessional2,
      attendance,
      assignments
    );

    if (!areTermEndMarkFetched) {
      return internalMarks; // Out of 30
    }

    const termEndComponent = (termEnd / 100) * 70; // 70% of Term End
    return internalMarks + termEndComponent; // Out of 100
  };

  const getLetterGrade = (marks: number) => {
    if (!areTermEndMarkFetched) {
      // Internal marks only (out of 30)
      if (marks >= 27) return "A+";
      if (marks >= 25.5) return "A";
      if (marks >= 24) return "A-";
      if (marks >= 22.5) return "B+";
      if (marks >= 21) return "B";
      if (marks >= 18) return "C";
      return "D";
    }

    // Full marks (out of 100)
    if (marks >= 90) return "A+";
    if (marks >= 85) return "A";
    if (marks >= 80) return "A-";
    if (marks >= 75) return "B+";
    if (marks >= 70) return "B";
    if (marks >= 60) return "C";
    return "D";
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
      case "A-":
        return "text-green-500";
      case "B+":
      case "B":
        return "text-yellow-500";
      default:
        return "text-red-500";
    }
  };

  const calculateOverallGPA = () => {
    try {
      const summary = structuredGrades?.summary || [];

      if (summary.length === 0) return 0;

      const totalGPA = summary.reduce((acc: number, curr: any) => {
        const finalMarks = calculateFinalMarks(
          curr.sessional1,
          curr.sessional2,
          curr.termEnd ?? 0,
          curr.attendance,
          curr.assignments,
          areTermEndMarkFetched
        );

        const gpa = areTermEndMarkFetched
          ? (finalMarks / 100) * 10
          : (finalMarks / 30) * 10;

        return acc + gpa;
      }, 0);

      const overallGPA = totalGPA / summary.length;
      return overallGPA;
    } catch (error) {
      console.error("Error calculating GPA:", error);
      return 0;
    }
  };

  useEffect(() => {
    if (structuredGrades?.summary?.length > 0) {
      const gpa = calculateOverallGPA();
      setOverallGPA(gpa);
    }
  }, [structuredGrades, areTermEndMarkFetched]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl">
        <CardHeader className="p-4 flex justify-between">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Gradebook
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-muted/50 rounded-xl p-1">
          <TabsTrigger
            value="summary"
            className="flex items-center gap-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <TrendingUp className="h-5 w-5" />
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="flex items-center gap-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <BarChart className="h-5 w-5" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
            <CardHeader className="p-4 border-b border-border relative z-10">
              <CardTitle className="text-xl font-semibold text-foreground">
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">
                    {overallGPA.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Overall GPA (4.0 Scale)
                  </p>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-foreground">Subject</TableHead>
                      <TableHead className="text-foreground">
                        Internal Marks
                      </TableHead>
                      {areTermEndMarkFetched && (
                        <TableHead className="text-foreground">
                          Term End
                        </TableHead>
                      )}
                      <TableHead className="text-foreground">
                        Final Marks
                      </TableHead>
                      <TableHead className="text-foreground">Grade</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {structuredGrades?.summary.map((subject: any, idx: any) => {
                      const internalMarks = calculateInternalMarks(
                        subject.sessional1,
                        subject.sessional2,
                        subject.attendance,
                        subject.assignments
                      );
                      const finalMarks = calculateFinalMarks(
                        subject.sessional1,
                        subject.sessional2,
                        subject.termEnd,
                        subject.attendance,
                        subject.assignments
                      );
                      const letterGrade = getLetterGrade(finalMarks);
                      return (
                        <TableRow
                          key={idx}
                          className="hover:bg-primary/5 transition-all duration-300"
                        >
                          <TableCell className="font-medium text-foreground">
                            {subject.subject}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {internalMarks.toFixed(1)}/30
                          </TableCell>
                          {areTermEndMarkFetched && (
                            <TableCell className="text-muted-foreground">
                              {subject.termEnd}/100
                            </TableCell>
                          )}
                          <TableCell className="text-muted-foreground">
                            {finalMarks.toFixed(1)}/
                            {areTermEndMarkFetched ? "100" : "30"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "font-medium",
                              getGradeColor(letterGrade)
                            )}
                          >
                            {letterGrade}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
            <CardHeader className="p-4 border-b border-border relative z-10">
              <CardTitle className="text-xl font-semibold text-foreground">
                Detailed Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <ScrollArea className="h-[400px]">
                {structuredGrades?.summary?.map((subject: any, idx: any) => {
                  const internalMarks = calculateInternalMarks(
                    subject.sessional1,
                    subject.sessional2,
                    subject.attendance,
                    subject.assignments
                  );
                  const finalMarks = calculateFinalMarks(
                    subject.sessional1,
                    subject.sessional2,
                    subject.termEnd,
                    subject.attendance,
                    subject.assignments
                  );
                  return (
                    <div key={idx} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {subject.subject}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-foreground">
                              Component
                            </TableHead>
                            <TableHead className="text-foreground">
                              Score
                            </TableHead>
                            <TableHead className="text-foreground">
                              Max Score
                            </TableHead>
                            <TableHead className="text-foreground">
                              Contribution
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">
                              Sessional 1
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.sessional1}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              30
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.sessional1 > subject.sessional2
                                ? "70% of Internal Exam (15)"
                                : "30% of Internal Exam (15)"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">
                              Sessional 2
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.sessional2}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              30
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.sessional2 > subject.sessional1
                                ? "70% of Internal Exam (15)"
                                : "30% of Internal Exam (15)"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">
                              Attendance
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.attendance}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              5
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              5/30
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">
                              Assignments
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.assignments}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              10
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              10/30
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">
                              Internal Total
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {internalMarks.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              30
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              30%
                            </TableCell>
                          </TableRow>

                          {areTermEndMarkFetched && (
                            <>
                              <TableRow className="hover:bg-primary/5 transition-all duration-300">
                                <TableCell className="font-medium text-foreground">
                                  Term End Exam
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {subject.termEnd}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  100
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  70%
                                </TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-primary/5 transition-all duration-300 font-semibold">
                                <TableCell className="text-foreground">
                                  Final Total
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {finalMarks.toFixed(1)}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  100
                                </TableCell>
                                <TableCell className="text-foreground">
                                  -
                                </TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
