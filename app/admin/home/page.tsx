"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Folder, MessageSquare } from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data for summary (replace with API calls)
  const summary = {
    assignments: 2,
    documents: 2,
    facultyReviews: 1,
    studentReviews: 1,
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            Admin Dashboard
          </CardTitle>
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-full shadow-sm">
            {/* Placeholder for future actions */}
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.assignments}</p>
                <p className="text-muted-foreground">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Folder className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.documents}</p>
                <p className="text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.facultyReviews}</p>
                <p className="text-muted-foreground">Faculty Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 rounded-lg hover:bg-primary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.studentReviews}</p>
                <p className="text-muted-foreground">Student Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}