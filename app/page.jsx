import Link from "next/link";
import { BriefcaseBusiness, Building2, CalendarClock, ClipboardList, FolderKanban, Layers3, TimerReset, Users } from "lucide-react";
import AppShell from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dbLib from "@/lib/db";

const { getDashboardData, getDb } = dbLib;

function getNotice(searchParams) {
  const type = searchParams.status === "error" ? "error" : "success";
  const message = typeof searchParams.message === "string" ? searchParams.message : "";
  return message ? { type, message } : null;
}

const statIcons = {
  departments: Building2,
  positions: BriefcaseBusiness,
  employees: Users,
  attendance: TimerReset,
  leaveRequests: CalendarClock,
  projects: FolderKanban,
  employeeProjects: Layers3
};

export default async function DashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const notice = getNotice(resolvedSearchParams);
  const db = await getDb();
  const { counts, recentAttendance, recentLeaveRequests } = await getDashboardData(db);

  const stats = [
    { key: "departments", label: "Departments", value: counts.departments, meta: "Business units and office groupings" },
    { key: "positions", label: "Positions", value: counts.positions, meta: "Job roles with salary basis" },
    { key: "employees", label: "Employees", value: counts.employees, meta: "Employee master records" },
    { key: "attendance", label: "Attendance", value: counts.attendance, meta: "Daily attendance transactions" },
    { key: "leaveRequests", label: "Leave Requests", value: counts.leaveRequests, meta: "Employee leave transactions" },
    { key: "projects", label: "Projects", value: counts.projects, meta: "Active company projects" },
    { key: "employeeProjects", label: "Assignments", value: counts.employeeProjects, meta: "Employee-project relationships" }
  ];

  return (
    <AppShell activePage="dashboard" notice={notice} title="Dashboard">
      <Card>
        <CardHeader className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">System Overview</p>
            <CardTitle className="text-3xl">Employee Management System</CardTitle>
            <CardDescription className="max-w-3xl">
              A database-driven platform for managing employee records, attendance, leave requests, and project assignments.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/employees">Manage Employees</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/attendance">Manage Attendance</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = statIcons[stat.key] || ClipboardList;

          return (
            <Card key={stat.key}>
              <CardContent className="flex items-start justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-2 max-w-[20ch] text-sm text-muted-foreground">{stat.meta}</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-foreground">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Latest attendance records stored in the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map((item) => (
                  <TableRow key={item.attendance_id}>
                    <TableCell>{item.attendance_id}</TableCell>
                    <TableCell>{item.employee_name}</TableCell>
                    <TableCell>{item.attendance_date}</TableCell>
                    <TableCell>{item.time_in}</TableCell>
                    <TableCell>{item.time_out || "--"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Latest leave transactions with request status.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeaveRequests.map((item) => (
                  <TableRow key={item.leave_request_id}>
                    <TableCell>{item.leave_request_id}</TableCell>
                    <TableCell>{item.employee_name}</TableCell>
                    <TableCell>{item.leave_name}</TableCell>
                    <TableCell>
                      {item.start_date} to {item.end_date}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Approved" ? "success" : item.status === "Pending" ? "warning" : "danger"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
