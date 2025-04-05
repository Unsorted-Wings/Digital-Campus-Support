import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "@/components/ThemeToggle";

export default function PreLoginPage() {
  const roles = [
    {
      name: "Student",
      href: "/login/student",
      description: "Access assignments, schedules, and chat with peers.",
    },
    {
      name: "Faculty",
      href: "/login/faculty",
      description: "Manage courses, submissions, and student queries.",
    },
    {
      name: "Mentor",
      href: "/login/mentor",
      description: "Guide students and track their progress.",
    },
    {
      name: "Admin",
      href: "/login/admin",
      description: "Oversee the platform and manage users.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
            <ModeToggle />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Column 1: Header + Role Cards */}
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite] bg-[length:200%_200%]">
            College Hub
          </h1>
          <div className="space-y-4">
            {roles.map((role, index) => (
              <Link href={role.href} key={role.name}>
                <Card
                  className={cn(
                    "group relative overflow-hidden border bg-card",
                    "hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500",
                    "opacity-0 translate-y-5 animate-[slideUp_0.5s_ease-out_forwards] mt-4"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
                      {role.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-500" />
                    <p className="relative text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {role.description}
                    </p>
                    <div className="mt-2 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300 ease-out" />
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/0 group-hover:bg-primary/20 rounded-full blur-2xl transition-all duration-500" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Decorative Card */}
        <div className="relative">
          <Card className="relative overflow-hidden border bg-card h-full min-h-[400px] flex items-center justify-center">
            <CardContent className="relative z-10 p-6 text-center">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite] bg-[length:200%_200%]">
                Your College, Simplified
              </h2>
              <p className="mt-2 text-muted-foreground">
                One platform for chatting, docs, assignments, and schedules.
              </p>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/20 to-transparent opacity-50 animate-[pulseSlow_3s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-[scalePulse_4s_ease-in-out_infinite]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-[floatAlt_5s_ease-in-out_infinite]" />
          </Card>
        </div>
      </div>
    </div>
  );
}