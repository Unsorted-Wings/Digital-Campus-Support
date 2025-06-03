"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, Calendar, Clock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function FacultyHomePage() {
  const [profile, setProfile] = useState<{
    name: string;
    role: string;
    email: string;
    avatar?: string;
    subjects?: string[];
  } | null>(null);
  const subjects = ["Algebra", "Calculus", "Mechanics"];
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile({
          name: parsed.name,
          role: parsed.role,
          email: parsed.email,
          avatar: `/faculty/${parsed.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.jpg`,
          subjects: parsed.subjects || [],
        });
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const schedule = [
    {
      time: "09:00 AM",
      event: "Mathematics 101 Lecture",
      location: "Room 101",
    },
    { time: "11:00 AM", event: "Physics 201 Lab", location: "Lab B" },
    { time: "02:00 PM", event: "CS 301 Office Hours", location: "Office 305" },
    { time: "04:00 PM", event: "Faculty Meeting", location: "Conference Room" },
  ];

  const notifications = [
    {
      title: "Grade Math Assignment",
      due: "Tomorrow, 11:59 PM",
      type: "urgent",
    },
    { title: "New Physics Lab Submissions", due: "Next Week", type: "info" },
    { title: "CS Project Review", due: "Apr 15, 2025", type: "warning" },
  ];

  const logOutClickHandler = async () => {
    try {
      localStorage.removeItem("user");
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr] gap-6">
      {/* Column 1: Profile Card */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl flex flex-col h-[calc(100vh-5rem)] relative overflow-hidden">
        <CardHeader className="text-center border-b border-border">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={profile?.avatar} alt={profile?.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {profile?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-bold text-foreground">
            {profile?.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{profile?.role}</p>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email:</span>{" "}
              {profile?.email}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Subjects:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.subjects?.map((subject) => (
                  <Badge
                    key={subject}
                    variant="outline"
                    className="text-primary border-primary"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Button
              variant="outline"
              className="w-full bg-primary/10 border-border text-foreground hover:bg-primary/20 hover:shadow-lg rounded-lg transition-all duration-300"
              onClick={() =>
                alert("Change Password functionality to be implemented")
              }
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full bg-primary/10 border-border text-foreground hover:bg-primary/20 hover:shadow-lg rounded-lg transition-all duration-300"
              onClick={logOutClickHandler}
            >
              Log Out
            </Button>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-20 pointer-events-none" />
      </Card>

      {/* Column 2: Schedule */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl h-[calc(100vh-5rem)] overflow-y-auto">
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
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/15 opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <Badge
                      variant="outline"
                      className="text-primary border-primary px-2 py-1"
                    >
                      {item.time}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-lg">
                      {item.event}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.location}
                    </p>
                  </div>
                </div>
                <Clock className="relative h-5 w-5 text-muted-foreground" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No events scheduled for today
            </p>
          )}
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
      </Card>

      {/* Column 3: Notifications */}
      <Card className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl h-[calc(100vh-5rem)] overflow-y-auto">
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
                    "absolute inset-0 bg-gradient-to-r opacity-30 group-hover:opacity-40 transition-opacity duration-300",
                    item.type === "urgent" &&
                      "from-destructive/20 to-transparent",
                    item.type === "warning" &&
                      "from-yellow-500/20 to-secondary/15",
                    item.type === "info" && "from-primary/20 to-secondary/15"
                  )}
                />
                <div className="relative flex-1">
                  <p className="text-foreground font-medium text-sm">
                    {item.title}
                  </p>
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
            <p className="text-muted-foreground text-center py-8 text-sm">
              No new notifications
            </p>
          )}
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 pointer-events-none" />
      </Card>
    </div>
  );
}
