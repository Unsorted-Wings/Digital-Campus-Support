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
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function FacultyHomePage() {
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
    subjects?: string[];
  } | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const subjects = ["Algebra", "Calculus", "Mechanics"];
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/users/updateUser/changePassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: profile?.id, // Replace with actual logged-in user's ID
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password");
      } else {
        toast({
          title: "Password changes Submitted",
          description: "Your password has changed .",
        });
        setShowChangePassword(false);
      }
    } catch (error) {
      setPasswordError("An unexpected error occurred");
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const response = await fetch(
        `/api/schedule/viewSchedule/viewTodaysSchedule?userId=${profile?.id}`
      );
      const data = await response.json();
      console.log("Today's Schedule Data:", data);

      setFilteredEvents(data);
    } catch (error) {
      console.error("Error fetching student schedule:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `/api/notifications/appNotifications/viewNotification?userId=${profile?.id}`
      );
      const data = await response.json();
      console.log("Notifications Data:", data);

      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchTodaySchedule();
      fetchNotifications();
    }
  }, [profile]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile({
          id: parsed.uid,
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

  const schedule = filteredEvents.map((event) => ({
    time: format(parseISO(event.start), "hh:mm a"),
    event: event.title,
    location: event.location || "", // fallback to empty if not present
  }));

  // const notifications = [
  //   {
  //     title: "Grade Math Assignment",
  //     due: "Tomorrow, 11:59 PM",
  //     type: "urgent",
  //   },
  //   { title: "New Physics Lab Submissions", due: "Next Week", type: "info" },
  //   { title: "CS Project Review", due: "Apr 15, 2025", type: "warning" },
  // ];

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
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full bg-primary/10 border-border text-foreground hover:bg-primary/20 hover:shadow-lg rounded-lg transition-all duration-300"
              onClick={() => setShowChangePassword(true)}
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
        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Enter your current password and the new password you'd like to
                use.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-4">
              {passwordError && (
                <p className="text-destructive text-sm">{passwordError}</p>
              )}

              <div>
                <Label htmlFor="oldPassword" className="text-foreground">
                  Old Password
                </Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                />
              </div>

              <DialogFooter className="flex justify-center">
                <Button
                  onClick={handleChangePassword}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mx-auto"
                >
                  Update Password
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
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
          {notifications?.length > 0 ? (
            notifications?.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-lg bg-card shadow-sm hover:bg-card/90 transition-all duration-300 overflow-hidden",
                  item?.type === "assignment" &&
                    "border-l-4 border-destructive",
                  item?.type === "notes" && "border-l-4 border-yellow-500",
                  item?.type === "chat" && "border-l-4 border-primary"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-30 group-hover:opacity-40 transition-opacity duration-300",
                    item.type === "assignment" &&
                      "from-destructive/20 to-transparent",
                    item.type === "notes" &&
                      "from-yellow-500/20 to-secondary/15",
                    item.type === "chat" && "from-primary/20 to-secondary/15"
                  )}
                />
                <div className="relative flex-1">
                  <p className="text-foreground font-medium text-sm">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div
                  className={cn(
                    "relative w-2 h-2 rounded-full",
                    item.type === "assignment" && "bg-destructive",
                    item.type === "notes" && "bg-yellow-500",
                    item.type === "chat" && "bg-primary"
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
