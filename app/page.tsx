"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "@/components/ThemeToggle";

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
      <section className="flex flex-col items-center justify-center text-center pt-24 pb-20 px-4 w-full max-w-6xl relative">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight z-10">
          Digital Campus Support
          <span className="block mt-2 text-primary">Your College Companion</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl z-10">
          Seamlessly chat, manage documents, submit assignments, and track schedules—all in one sleek platform.
        </p>
        <Link href="/login">
          <Button
            size="lg"
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-xl px-8 shadow-md hover:shadow-lg"
          >
            Get Started
          </Button>
        </Link>
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 w-full max-w-5xl relative">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-foreground">
          Key Features
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={cn(
                "group relative overflow-hidden bg-card/95 backdrop-blur-md border-border",
                "transition-all duration-500 hover:shadow-xl hover:shadow-primary/20",
                "opacity-0 translate-y-10 animate-[fadeUp_0.6s_ease-out_forwards] z-[10]"
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Subtle Section Accent */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full -z-10" />
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground bg-card/95 w-full">
        <p>© 2025 Digital Campus Support. All rights reserved.</p>
      </footer>

      {/* Background Circles */}
      <div className="absolute top-[12rem] left-[12rem] w-80 h-80 blur-3xl bg-primary rounded-full opacity-30 z-0" />
      {/* <div className="absolute top-10 right-[12rem] w-80 h-80 blur-3xl bg-primary rounded-full opacity-20 z-0" /> */}
      <div className="absolute top-1/2 right-20 w-64 h-64 blur-3xl bg-primary rounded-full opacity-30 z-[0]" />
      {/* <div className="absolute bottom-20 left-10 w-72 h-72 blur-3xl bg-primary rounded-full opacity-20 z-0" /> */}

    </div>
  );
}