"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const roles = [
    {
      name: "Student",
      description: "Access assignments, schedules, and chat with peers.",
    },
    {
      name: "Alumni",
      description: "Connect with current students and share experiences.",
    },
    {
      name: "Faculty",
      description: "Manage courses, submissions, and student queries.",
    },
    {
      name: "Mentor",
      description: "Guide students and track their progress.",
    },
    {
      name: "Admin",
      description: "Oversee the platform and manage users.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Column 1: Header + Role Cards */}
        <div className="space-y-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground animate-[fadeIn_1s_ease-out_forwards]">
            Digital Campus Support
          </h1>
          <div className="space-y-6">
            {roles.map((role, index) => (
              <Link href={`/login/${role.name.toLowerCase()}`} key={role.name}>
                <Card
                  className={cn(
                    "group relative overflow-hidden border bg-card",
                    "hover:bg-card/95 transition-all duration-300",
                    "opacity-0 translate-y-5 animate-[slideUp_0.5s_ease-out_forwards] rounded-lg shadow-lg mt-4"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                        {role.name}
                      </h2>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        {role.description}
                      </p>
                    </div>
                    <ArrowRight
                      className={cn(
                        "h-5 w-5 text-primary transform group-hover:translate-x-2 transition-transform duration-300 ease-out"
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Decorative Card with Meteor Shower Effect */}
        <div className="relative">
          <Card
            className={cn(
              "relative overflow-hidden border-0 bg-card/95 backdrop-blur-md h-full min-h-[400px]",
              "shadow-xl rounded-xl flex items-center justify-center"
            )}
          >
            <CardContent className="relative z-10 p-8 text-center space-y-6">
              <h2 className="text-4xl font-extrabold text-foreground animate-[pulseText_2s_ease-in-out_infinite]">
                Explore Your Campus
                <span className="block text-primary mt-2">Digitally</span>
              </h2>
              <p className="text-base text-muted-foreground max-w-sm mx-auto">
                A platform that lights up your academic journey with ease and connection.
              </p>
            </CardContent>

            {/* Meteor Shower Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10 opacity-50" />
            <div className="absolute inset-0 overflow-hidden">
              {/* Meteors */}
              <div className="absolute w-1 h-4 bg-primary/80 rounded-full animate-[meteor_2s_linear_infinite] top-[-10%] left-[-60%] delay-0" />
              <div className="absolute w-1 h-4 bg-primary/80 rounded-full animate-[meteor_1.8s_linear_infinite] top-[-10%] left-[-50%] delay-500" />
              <div className="absolute w-1 h-4 bg-secondary/80 rounded-full animate-[meteor_1.4s_linear_infinite] top-[-10%] left-[-40%] delay-1000" />
              <div className="absolute w-1 h-4 bg-primary/80 rounded-full animate-[meteor_2.3s_linear_infinite] top-[-10%] left-[-30%] delay-1500" />
              <div className="absolute w-1 h-4 bg-secondary/80 rounded-full animate-[meteor_1.1s_linear_infinite] top-[-10%] left-[-20%] delay-2000" />
              <div className="absolute w-1 h-4 bg-primary/80 rounded-full animate-[meteor_1.4s_linear_infinite] top-[-10%] left-[-10%] delay-2500" />
              <div className="absolute w-1 h-4 bg-secondary/80 rounded-full animate-[meteor_2.4s_linear_infinite] top-[-10%] left-[0%] delay-3000" />
              <div className="absolute w-1 h-4 bg-primary/80 rounded-full animate-[meteor_1s_linear_infinite] top-[-10%] left-[10%] delay-3500" />
              <div className="absolute w-1 h-3 bg-secondary/80 rounded-full animate-[meteor_1.5s_linear_infinite] top-[-10%] left-[20%] delay-4000" />
              <div className="absolute w-1 h-5 bg-primary/60 rounded-full animate-[meteor_2.2s_linear_infinite] top-[-10%] left-[30%] delay-4500" />
              <div className="absolute w-1 h-4 bg-secondary/60 rounded-full animate-[meteor_1.8s_linear_infinite] top-[-10%] left-[40%] delay-5000" />
              <div className="absolute w-1 h-3 bg-primary/70 rounded-full animate-[meteor_2s_linear_infinite] top-[-10%] left-[50%] delay-5500" />
              <div className="absolute w-1 h-5 bg-secondary/70 rounded-full animate-[meteor_2.5s_linear_infinite] top-[-10%] left-[60%] delay-6000" />
              <div className="absolute w-1 h-4 bg-primary/50 rounded-full animate-[meteor_2.3s_linear_infinite] top-[-10%] left-[70%] delay-6500" />
              <div className="absolute w-1 h-3 bg-secondary/50 rounded-full animate-[meteor_1.7s_linear_infinite] top-[-10%] left-[80%] delay-7000" />
              <div className="absolute w-1 h-5 bg-primary/40 rounded-full animate-[meteor_2.1s_linear_infinite] top-[-10%] left-[90%] delay-7500" />
              <div className="absolute w-1 h-4 bg-secondary/40 rounded-full animate-[meteor_1.9s_linear_infinite] top-[-10%] left-[100%] delay-8000" />
            </div>
          </Card>
        </div>
      </div>

      {/* Background Blur Elements */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-primary/15 rounded-full blur-2xl animate-[pulse_8s_ease-in-out_infinite] -z-10" />
      <div className="absolute bottom-20 right-16 w-32 h-32 bg-secondary/15 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite] delay-1000 -z-10" />
    </div>
  );
}