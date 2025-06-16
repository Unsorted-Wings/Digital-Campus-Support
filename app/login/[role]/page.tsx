"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase/firebaseConfig";

export default function RoleLoginPage({
  params,
}: {
  params: { role: string };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before each login attempt

    try {
      // Step 1: NextAuth Authentication - Sign in the user
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");

        return;
      }

      // Step 2: Get user details from Firestore using their email

      const userRes = await fetch("/api/users/viewUser/viewUserInfo");
      const user = await userRes.json();

      // Step 3: Check if role matches
      if (params.role === "alumni" && user.isAlumni === true) {
        localStorage.setItem("user", JSON.stringify(user));
        router.push(`/${params.role}/home`);
      } else if (!user || user.role !== params.role) {
        setError("Access denied.");

        return;
      }

  

      // Step 4: Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      router.push(`/${params.role}/home`);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while logging in.");
    }
  };

  const role = params.role.charAt(0).toUpperCase() + params.role.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      {/* Login Card */}
      <Card
        className={cn(
          "relative z-10 w-full max-w-md bg-card/95 backdrop-blur-md shadow-xl rounded-xl border border-border/50",
          "bg-gradient-to-br from-primary/5 to-secondary/5 animate-in fade-in-50 zoom-in-95 duration-500"
        )}
      >
        <CardHeader className="space-y-4 p-8 border-b border-border/30 text-center">
          {/* Logo */}
          <svg
            className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <CardTitle className="text-4xl font-black tracking-tight text-foreground">
            {role} Login
          </CardTitle>
          <p className="text-base font-medium text-muted-foreground/80">
            Sign in to your {role.toLowerCase()} dashboard
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label={`${role} login form`}
          >
            {error && (
              <p className="text-destructive text-sm mb-4 bg-destructive/10 p-2 rounded shadow-sm">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "pl-10 bg-muted/50 border-border rounded-lg",
                    "hover:bg-muted/70 transition-all duration-300",
                    "focus:ring-2 focus:ring-primary focus:border-transparent focus-visible:ring-offset-2"
                  )}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "pl-10 bg-muted/50 border-border rounded-lg",
                    "hover:bg-muted/70 transition-all duration-300",
                    "focus:ring-2 focus:ring-primary focus:border-transparent focus-visible:ring-offset-2"
                  )}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                "rounded-lg shadow-md hover:shadow-lg hover:scale-105",
                "transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className={cn(
                "w-full bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg",
                "border-border shadow-sm hover:shadow-md transition-all duration-300",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Background Elements */}
      <style jsx>{`
        @keyframes gradient-bg {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradient-bg 8s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 opacity-50 animate-gradient-bg -z-10" />
      <div className="absolute top-10 left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-[pulse_4s_ease-in-out_infinite] -z-10" />
      <div className="absolute bottom-20 right-16 w-28 h-28 bg-secondary/20 rounded-full blur-2xl animate-[pulse_3s_ease-in-out_infinite] delay-1000 -z-10" />
      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-primary/15 rounded-full blur-xl animate-[pulse_5s_ease-in-out_infinite] delay-2000 -z-10" />
    </div>
  );
}
