"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Home,
  Book,
  CheckSquare,
  MessageSquare,
  Calendar,
  Upload,
  Folder,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function FacultyNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/faculty/home", icon: Home },
    { name: "Gradebook", href: "/faculty/gradebook", icon: Book },
    { name: "Chat", href: "/faculty/chat", icon: MessageSquare },
    { name: "Schedule", href: "/faculty/schedule", icon: Calendar },
    { name: "Assignment Submission", href: "/faculty/assignments", icon: Upload },
    { name: "Doc Repo", href: "/faculty/docs", icon: Folder },
    { name: "Feedback", href: "/faculty/feedback", icon: CheckSquare },
  ];

  return (
    <nav className="bg-card/95 backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center gap-2",
                      isActive && "bg-primary/20 text-primary shadow-md border-primary"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-primary/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <span className="hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-screen mt-2 bg-card/95 backdrop-blur-md border-border shadow-lg rounded-b-xl"
                align="end"
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300",
                          isActive && "bg-primary/20 text-primary font-medium"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Gradient Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-secondary/50" />
    </nav>
  );
}