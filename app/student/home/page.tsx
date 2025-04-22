"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, Calendar, Clock, LogOut, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const profile = {
    name: "Jane Doe",
    role: "Student",
    email: "jane.doe@example.com",
    avatar: "/avatar-placeholder.jpg",
    rollNo: "CS2023001",
    courseName: "Computer Science",
  };

  const schedule = [
    { time: "09:00 AM", event: "Mathematics Lecture", location: "Room 101" },
    { time: "11:00 AM", event: "Physics Lab", location: "Lab B" },
    { time: "02:00 PM", event: "Group Study", location: "Library" },
    { time: "04:00 PM", event: "CS Seminar", location: "Auditorium" },
  ];

  const notifications = [
    { title: "Assignment Due", due: "Tomorrow, 11:59 PM", type: "urgent" },
    { title: "Exam Schedule Released", due: "Next Week", type: "info" },
    { title: "Project Submission", due: "Apr 10, 2025", type: "warning" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr] gap-6">
      {/* Column 1: Profile Card */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col h-[calc(100vh-5rem)] relative overflow-hidden">
        <CardHeader className="text-center border-b border-border">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-bold text-foreground">
            {profile.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email:</span> {profile.email}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Roll No:</span> {profile.rollNo}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Course:</span> {profile.courseName}
            </div>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full mt-4 border-border text-foreground hover:bg-primary/10"
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full mt-4 border-border text-foreground hover:bg-primary/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-20 pointer-events-none" />
      </Card>

      {/* Column 2: Schedule */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl h-[calc(100vh-5rem)] overflow-y-auto relative overflow-hidden">
        <CardHeader className="border-b border-border sticky top-0 bg-card/95 z-10">
          <CardTitle className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <div
                key={index}
                className="relative flex items-center justify-between p-4 bg-card rounded-lg shadow-md hover:shadow-xl hover:bg-card/90 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/15 opacity-30 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <Badge variant="outline" className="text-primary border-primary px-2 py-1">
                      {item.time}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-lg">{item.event}</p>
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                  </div>
                </div>
                <Clock className="relative h-5 w-5 text-muted-foreground" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No events scheduled for today</p>
          )}
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
      </Card>

      {/* Column 3: Notifications */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl h-[calc(100vh-5rem)] overflow-y-auto relative overflow-hidden">
        <CardHeader className="border-b border-border sticky top-0 bg-card/95 z-10">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-lg bg-card shadow-sm hover:bg-card/90 transition-all duration-300 overflow-hidden",
                  item.type === "urgent" && "border-l-4 border-destructive",
                  item.type === "warning" && "border-l-4 border-yellow-500",
                  item.type === "info" && "border-l-4 border-primary"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-30 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none",
                    item.type === "urgent" && "from-destructive/20 to-transparent",
                    item.type === "warning" && "from-yellow-500/20 to-secondary/15",
                    item.type === "info" && "from-primary/20 to-secondary/15"
                  )}
                />
                <div className="relative flex-1">
                  <p className="text-foreground font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.due}</p>
                </div>
                <div
                  className={cn(
                    "relative w-2 h-2 rounded-full",
                    item.type === "urgent" && "bg-destructive",
                    item.type === "warning" && "bg-yellow-500",
                    item.type === "info" && "bg-primary"
                  )}
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8 text-sm">No new notifications</p>
          )}
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 pointer-events-none" />
      </Card>
    </div>
  );
}