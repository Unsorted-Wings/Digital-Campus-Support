"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react"; // Import NextAuth signIn method
import { useSession } from "next-auth/react"; // Import useSession hook

export default function RoleLoginPage({ params }: { params: { role: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // State to store error message
  const router = useRouter();

  const { data: session, status } = useSession(); // Get session data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before each login attempt

    try {
      // Step 1: NextAuth Authentication - Sign in the user
      const result = await signIn("credentials", {
        redirect: false, // Prevent automatic redirect
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      console.log(`Logged in as ${params.role}:`, { email, password });

      // Step 2: Check if the user's role matches the requested role
      if (session?.user?.role === params.role) {
        // Redirect to the role-specific dashboard if roles match
        router.push(`/${params.role}/home`);
      } else {
        setError("Access denied.");
      }
    } catch (err: any) {
      // Handle any other errors
      setError("An error occurred while logging in.");
      console.error(err.message);
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
      <Card className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-md shadow-xl rounded-xl border-border">
        <CardHeader className="space-y-2 p-6 border-b border-border">
          <CardTitle className="text-3xl font-extrabold text-center text-foreground">
            {role} Login
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to your {role.toLowerCase()} dashboard
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-center mb-4">
                {error} {/* Show error message */}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 -z-10" />
      <div className="absolute top-10 left-10 w-24 h-24 bg-primary/15 rounded-full blur-2xl animate-[pulse_8s_ease-in-out_infinite] -z-10" />
      <div className="absolute bottom-20 right-16 w-28 h-28 bg-secondary/15 rounded-full blur-2xl animate-[pulse_6s_ease-in-out_infinite] delay-1000 -z-10" />
      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-[pulse_7s_ease-in-out_infinite] delay-2000 -z-10" />
    </div>
  );
}
