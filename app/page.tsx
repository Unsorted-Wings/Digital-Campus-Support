"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "@/components/ThemeToggle"; // Adjust path as needed

export default function HomePage() {
  const features = [
    {
      title: "Chatting",
      description: "Connect with peers, faculty, and mentors in real-time.",
    },
    {
      title: "Document Repository",
      description: "Store and access all your college docs in one place.",
    },
    {
      title: "Assignment Submission",
      description: "Submit assignments easily and track deadlines.",
    },
    {
      title: "Schedules",
      description: "Stay on top of classes, events, and tasks.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-20 pb-16 px-4 w-full max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite] bg-[length:200%_200%]">
          Welcome to College Hub
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
          Your all-in-one solution for college life—chat, manage documents, submit assignments, and track schedules effortlessly.
        </p>
        <Link href="/login">
          <Button
            size="lg"
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-full px-8"
          >
            Get Started
          </Button>
        </Link>
        {/* Background Glow */}
        <div className="absolute -z-10 inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-[scalePulse_4s_ease-in-out_infinite] opacity-50" />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 w-full max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-semibold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Key Features
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={cn(
                "group relative overflow-hidden border bg-card",
                "hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500",
                "opacity-0 translate-y-5 animate-[slideUp_0.5s_ease-out_forwards]"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 dark:from-primary/0 dark:to-primary/20 group-hover:from-primary/20 group-hover:to-primary/40 dark:group-hover:from-primary/20 dark:group-hover:to-primary/40 transition-all duration-500" />
                <p className="relative text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {feature.description}
                </p>
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/0 group-hover:bg-primary/20 rounded-full blur-2xl transition-all duration-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground">
        <p>&copy; 2025 Digital Campus Support. All rights reserved.</p>
      </footer>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite] -z-10" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-[floatAlt_5s_ease-in-out_infinite] -z-10" />
    </div>
  );
}