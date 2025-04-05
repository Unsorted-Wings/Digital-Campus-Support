import { ReactNode } from "react";
import Navbar from "@/components/navbar/StudentNavBar";
import { ModeToggle } from "@/components/ThemeToggle";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
    
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-[60]">
            <ModeToggle />
        </div>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-20 max-w-7xl mx-auto w-full">{children}</main>

      {/* Animated Background Particles */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 animate-[wave_8s_ease-in-out_infinite] -z-10"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
      >
        <path
          fill="url(#wave-gradient)"
          d="M0,160 C320,300,640,100,960,200 C1280,300,1440,160,1440,160 L1440,320 L0,320 Z"
        />
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--secondary))", stopOpacity: 0.5 }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute top-20 left-20 w-5 h-5 bg-primary/40 rounded-full animate-[float_4s_ease-in-out_infinite] -z-10" />
      <div className="absolute bottom-24 right-16 w-4 h-4 bg-secondary/40 rounded-full animate-[floatAlt_5s_ease-in-out_infinite] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-primary/30 rounded-full animate-[float_6s_ease-in-out_infinite] delay-200 -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-secondary/30 rounded-full animate-[floatAlt_4s_ease-in-out_infinite] delay-400 -z-10" />
    </div>
  );
}