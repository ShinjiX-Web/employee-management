import Link from "next/link";
import AppShell from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <AppShell activePage="" title="Page Not Found">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-4xl">Page Not Found</CardTitle>
          <CardDescription>The page you requested does not exist in this employee management system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
