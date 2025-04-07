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
import { cn } from "@/lib/utils";
import { UserCheck } from "lucide-react";

export default function AttendancePage() {
  // Mock data (replace with real data from backend)
  const attendanceData = {
    aggregate: {
      attended: 85,
      total: 100,
    },
    subjects: [
      { name: "Mathematics", attended: 28, total: 30 },
      { name: "Physics", attended: 25, total: 28 },
      { name: "Computer Science", attended: 32, total: 35 },
    ],
  };

  const calculatePercentage = (attended: number, total: number) => {
    return total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0";
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const aggregatePercentage = calculatePercentage(attendanceData.aggregate.attended, attendanceData.aggregate.total);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-4 flex items-center justify-between relative z-10">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Attendance
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Aggregate Attendance */}
        <Card className="lg:col-span-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-20 pointer-events-none" />
          <CardHeader className="p-4 border-b border-border relative z-10">
            <CardTitle className="text-xl font-semibold text-foreground">
              Aggregate Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-center relative z-10">
            <div className="text-center">
              <p className={cn("text-5xl font-bold", getAttendanceColor(parseFloat(aggregatePercentage)))}>
                {aggregatePercentage}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {attendanceData.aggregate.attended} / {attendanceData.aggregate.total} classes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Attendance */}
        <Card className="lg:col-span-2 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
          <CardHeader className="p-4 border-b border-border relative z-10">
            <CardTitle className="text-xl font-semibold text-foreground">
              Subject-wise Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">Subject</TableHead>
                    <TableHead className="text-foreground">Attended</TableHead>
                    <TableHead className="text-foreground">Total Classes</TableHead>
                    <TableHead className="text-foreground">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.subjects.map((subject, idx) => {
                    const percentage = calculatePercentage(subject.attended, subject.total);
                    return (
                      <TableRow
                        key={idx}
                        className="hover:bg-primary/5 transition-all duration-300"
                      >
                        <TableCell className="font-medium text-foreground">
                          {subject.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {subject.attended}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {subject.total}
                        </TableCell>
                        <TableCell className={cn("font-medium", getAttendanceColor(parseFloat(percentage)))}>
                          {percentage}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}