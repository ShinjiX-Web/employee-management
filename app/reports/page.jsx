import AppShell from "@/components/app-shell";
import CopyCodeButton from "@/components/copy-code-button";
import SqlCodeBlock from "@/components/sql-code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dbLib from "@/lib/db";

const { getDb, getReports } = dbLib;

function getNotice(searchParams) {
  const type = searchParams.status === "error" ? "error" : "success";
  const message = typeof searchParams.message === "string" ? searchParams.message : "";
  return message ? { type, message } : null;
}

export default async function ReportsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const notice = getNotice(resolvedSearchParams);
  const db = await getDb();
  const reports = await getReports(db);

  return (
    <AppShell activePage="reports" notice={notice} showReportsLink={false} title="SQL Reports">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Reports Library</p>
          <CardTitle className="text-3xl">SQL Reports and Query Outputs</CardTitle>
          <CardDescription className="max-w-3xl">
            This page contains the 3 simple, 4 moderate, and 3 difficult SQL queries for the employee management system.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="space-y-6">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>
                {report.level} SQL query. {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <CopyCodeButton text={report.sql.trim()} />
                </div>
                <SqlCodeBlock sql={report.sql} />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {report.rows.length
                      ? Object.keys(report.rows[0]).map((key) => (
                          <TableHead key={key}>{key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())}</TableHead>
                        ))
                      : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.length ? (
                    report.rows.map((row, index) => (
                      <TableRow key={`${report.title}-${index}`}>
                        {Object.keys(row).map((key) => (
                          <TableCell key={key}>{String(row[key] ?? "")}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="py-8 text-center text-muted-foreground">The query returned no rows.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
