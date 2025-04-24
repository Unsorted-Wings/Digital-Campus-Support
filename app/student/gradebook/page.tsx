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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BookOpen, TrendingUp, BarChart } from "lucide-react";
import { useState } from "react";

export default function GradebookPage() {
  const [activeTab, setActiveTab] = useState("summary");

  // Mock data (replace with real data from backend)
  const grades = {
    summary: [
      {
        subject: "Mathematics",
        sessional1: 85,
        sessional2: 92,
        termEnd: 88,
        attendance: 4,
        assignments: 5,
      },
      {
        subject: "Physics",
        sessional1: 78,
        sessional2: 82,
        termEnd: 85,
        attendance: 5,
        assignments: 4,
      },
      {
        subject: "Computer Science",
        sessional1: 90,
        sessional2: 87,
        termEnd: 91,
        attendance: 5,
        assignments: 5,
      },
    ],
  };

  const calculateInternalMarks = (sessional1: number, sessional2: number, attendance: number, assignments: number) => {
    const [higher, lower] = sessional1 > sessional2 ? [sessional1, sessional2] : [sessional2, sessional1];
    const examComponent = ((0.7 * higher + 0.3 * lower) / 100) * 15; // 15 marks total for exams
    return examComponent + attendance + assignments; // Total internal: 30 marks
  };

  const calculateFinalMarks = (sessional1: number, sessional2: number, termEnd: number, attendance: number, assignments: number) => {
    const internalMarks = calculateInternalMarks(sessional1, sessional2, attendance, assignments);
    const termEndComponent = (termEnd / 100) * 70; // 70% of Term End Exam
    return internalMarks + termEndComponent; // Total: 100 marks
  };

  const getLetterGrade = (marks: number) => {
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

  const overallGPA = grades.summary.reduce((acc, curr) => {
    const finalMarks = calculateFinalMarks(curr.sessional1, curr.sessional2, curr.termEnd, curr.attendance, curr.assignments);
    return acc + (finalMarks / 100) * 4; // Assuming 4.0 scale
  }, 0) / grades.summary.length;

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
                  <p className="text-4xl font-bold text-foreground">{overallGPA.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Overall GPA (4.0 Scale)</p>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-foreground">Subject</TableHead>
                      <TableHead className="text-foreground">Internal Marks</TableHead>
                      <TableHead className="text-foreground">Term End</TableHead>
                      <TableHead className="text-foreground">Final Marks</TableHead>
                      <TableHead className="text-foreground">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.summary.map((subject, idx) => {
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
                          <TableCell className="text-muted-foreground">
                            {subject.termEnd}/100
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {finalMarks.toFixed(1)}/100
                          </TableCell>
                          <TableCell className={cn("font-medium", getGradeColor(letterGrade))}>
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
                {grades.summary.map((subject, idx) => {
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
                            <TableHead className="text-foreground">Component</TableHead>
                            <TableHead className="text-foreground">Score</TableHead>
                            <TableHead className="text-foreground">Max Score</TableHead>
                            <TableHead className="text-foreground">Contribution</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">Sessional 1</TableCell>
                            <TableCell className="text-muted-foreground">{subject.sessional1}</TableCell>
                            <TableCell className="text-muted-foreground">100</TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.sessional1 > subject.sessional2
                                ? "70% of Internal Exam (15)"
                                : "30% of Internal Exam (15)"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">Sessional 2</TableCell>
                            <TableCell className="text-muted-foreground">{subject.sessional2}</TableCell>
                            <TableCell className="text-muted-foreground">100</TableCell>
                            <TableCell className="text-muted-foreground">
                              {subject.sessional2 > subject.sessional1
                                ? "70% of Internal Exam (15)"
                                : "30% of Internal Exam (15)"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">Attendance</TableCell>
                            <TableCell className="text-muted-foreground">{subject.attendance}</TableCell>
                            <TableCell className="text-muted-foreground">5</TableCell>
                            <TableCell className="text-muted-foreground">5/30</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">Assignments</TableCell>
                            <TableCell className="text-muted-foreground">{subject.assignments}</TableCell>
                            <TableCell className="text-muted-foreground">5</TableCell>
                            <TableCell className="text-muted-foreground">5/30</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">Internal Total</TableCell>
                            <TableCell className="text-muted-foreground">{internalMarks.toFixed(1)}</TableCell>
                            <TableCell className="text-muted-foreground">30</TableCell>
                            <TableCell className="text-muted-foreground">30%</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300">
                            <TableCell className="font-medium text-foreground">Term End Exam</TableCell>
                            <TableCell className="text-muted-foreground">{subject.termEnd}</TableCell>
                            <TableCell className="text-muted-foreground">100</TableCell>
                            <TableCell className="text-muted-foreground">70%</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-primary/5 transition-all duration-300 font-semibold">
                            <TableCell className="text-foreground">Final Total</TableCell>
                            <TableCell className="text-foreground">{finalMarks.toFixed(1)}</TableCell>
                            <TableCell className="text-foreground">100</TableCell>
                            <TableCell className="text-foreground">-</TableCell>
                          </TableRow>
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