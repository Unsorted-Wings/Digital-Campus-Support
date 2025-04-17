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
    </div>
  );
}