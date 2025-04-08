"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Calendar, Bell, User } from "lucide-react";
import { format } from "date-fns";

export default function FacultyHomePage() {
  // Mock data
  const profile = {
    name: "Dr. Emily Carter",
    id: "FAC12345",
    email: "emily.carter@university.edu",
    department: "Mathematics",
    profilePic: "/faculty/emily-carter.jpg", // Placeholder image path
  };

  const schedule = [
    { id: 1, title: "Math 101 Lecture", course: "Mathematics 101", time: new Date(2025, 3, 8, 10, 0), duration: "1h 30m" },
    { id: 2, title: "Physics 201 Lab", course: "Physics 201", time: new Date(2025, 3, 8, 14, 0), duration: "2h" },
    { id: 3, title: "CS 301 Review", course: "CS 301", time: new Date(2025, 3, 9, 9, 0), duration: "1h" },
  ];

  const notifications = [
    { id: 1, message: "Grade Math Problem Set due by 2025-04-10", time: "2 hours ago" },
    { id: 2, message: "New submission received for Physics Lab Report", time: "Yesterday" },
    { id: 3, message: "Faculty meeting scheduled for 2025-04-12", time: "3 days ago" },
  ];

  return (
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr] gap-6 h-full">
        {/* Profile Section */}
        <Card className="lg:col-span-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-20 pointer-events-none" />
          <CardHeader className="p-4 border-b border-border relative z-10">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center relative z-10">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={profile.profilePic} alt={profile.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {profile.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">Faculty ID: {profile.id}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-sm text-muted-foreground">Department: {profile.department}</p>
          </CardContent>
        </Card>
          {/* Schedule Section */}
          <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
            <CardHeader className="p-4 border-b border-border relative z-10">
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <ScrollArea className="h-[250px]">
                {schedule.length > 0 ? (
                  schedule.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 mb-4 last:mb-0 bg-muted/50 rounded-lg hover:bg-primary/10 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.course}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(event.time, "MMMM d, h:mm a")} • {event.duration}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">No upcoming events</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
            <CardHeader className="p-4 border-b border-border relative z-10">
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <ScrollArea className="h-[250px]">
                {notifications.length > 0 ? (
                  notifications.map((noti) => (
                    <div
                      key={noti.id}
                      className="flex items-center gap-4 p-4 mb-4 last:mb-0 bg-muted/50 rounded-lg hover:bg-primary/10 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{noti.message}</p>
                        <p className="text-sm text-muted-foreground">{noti.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">No new notifications</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
      </div>
  );
}