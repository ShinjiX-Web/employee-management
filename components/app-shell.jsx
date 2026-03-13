import Link from "next/link";
import { Database, FolderKanban, LayoutDashboard, PlaneTakeoff, TimerReset, UserCog, UsersRound, WalletCards, Waypoints } from "lucide-react";
import navLib from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import NoticeBanner from "@/components/notice-banner";
import ThemeToggle from "@/components/theme-toggle";
import utils from "@/lib/utils";

const { navigationItems } = navLib;
const { cn } = utils;

const iconMap = {
  dashboard: LayoutDashboard,
  departments: Database,
  positions: WalletCards,
  employees: UsersRound,
  attendance: TimerReset,
  "leave-types": PlaneTakeoff,
  "leave-requests": UserCog,
  projects: FolderKanban,
  "employee-projects": Waypoints,
  reports: Database
};

function AppShell({ activePage, children, notice, showReportsLink = true, title }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen w-full lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r bg-background px-4 py-6">
          <Card className="shadow-none">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Information Management</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Employee Management System</h1>
              <p className="mt-2 text-sm text-muted-foreground">Employee records, attendance, leave requests, and project assignments.</p>
            </div>
          </Card>

          <nav className="mt-6 grid gap-1.5">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.key] || Database;

              return (
                <Link
                  key={item.key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    activePage === item.key && "bg-accent text-accent-foreground"
                  )}
                  href={item.href}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <ThemeToggle />
              {showReportsLink ? (
                <Button asChild variant="outline">
                  <Link href="/reports">View SQL Codes</Link>
                </Button>
              ) : null}
            </div>
          </header>

          <div className="space-y-6">
            <NoticeBanner notice={notice} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
