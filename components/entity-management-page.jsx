import Link from "next/link";
import { Pencil, Search, Trash2 } from "lucide-react";
import { createRecordAction, deleteRecordAction, updateRecordAction } from "@/app/actions";
import AppShell from "@/components/app-shell";
import EntityForm from "@/components/entity-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dbLib from "@/lib/db";

const { getDb } = dbLib;

function getNotice(searchParams) {
  const type = searchParams.status === "error" ? "error" : "success";
  const message = typeof searchParams.message === "string" ? searchParams.message : "";

  return message ? { type, message } : null;
}

function getStatusBadgeVariant(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("active") || normalized.includes("approved")) {
    return "success";
  }

  if (normalized.includes("pending") || normalized.includes("probationary")) {
    return "warning";
  }

  if (normalized.includes("rejected") || normalized.includes("resigned")) {
    return "danger";
  }

  return "outline";
}

function renderCell(column, row) {
  const value = typeof column.render === "function" ? column.render(row) : row[column.key];

  if (column.key === "employment_status" || column.key === "status") {
    return <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>;
  }

  return value || "--";
}

async function EntityManagementPage({ config, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
  const editId = Number.parseInt(String(resolvedSearchParams.edit || ""), 10);
  const notice = getNotice(resolvedSearchParams);
  const db = await getDb();
  const rows = await config.getRows(db, query);
  const editing = Number.isInteger(editId) && editId > 0 ? await config.getEditRecord(db, editId) : null;
  const createFields = await config.getFields(db, null);
  const editFields = editing ? await config.getFields(db, editing) : null;
  const singularLabel = config.heroTitle.endsWith("s") ? config.heroTitle.slice(0, -1) : config.heroTitle;

  return (
    <AppShell activePage={config.activePage} notice={notice} title={config.pageTitle}>
      <Card>
        <CardHeader className="gap-3">
          <p className="text-sm font-medium text-muted-foreground">Module Overview</p>
          <CardTitle className="text-3xl">{config.heroTitle}</CardTitle>
          <CardDescription className="max-w-3xl">{config.heroDescription}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <EntityForm
          action={createRecordAction}
          fields={[
            { type: "hidden", name: "entityKey", value: config.slug },
            { type: "hidden", name: "redirectPath", value: config.route },
            ...createFields
          ]}
          helperText={config.addHelper}
          submitLabel={`Save ${singularLabel}`}
          title={config.addTitle}
        />
        {editing ? (
          <EntityForm
            action={updateRecordAction}
            fields={[
              { type: "hidden", name: "entityKey", value: config.slug },
              { type: "hidden", name: "redirectPath", value: config.route },
              ...editFields
            ]}
            helperText={`Editing record ID ${editing[config.idField]}.`}
            submitLabel={`Update ${singularLabel}`}
            title={config.editTitle}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{config.editTitle}</CardTitle>
              <CardDescription>Choose a record from the table to load it into the update form.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">The selected record will appear here for editing.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.heroTitle} Records</CardTitle>
          <CardDescription>Search, edit, and delete records from this table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={config.route} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" defaultValue={query} name="q" placeholder={config.searchPlaceholder} type="search" />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {query ? (
              <Button asChild variant="outline">
                <Link href={config.route}>Clear</Link>
              </Button>
            ) : null}
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((column) => (
                  <TableHead key={column.label}>{column.label}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row[config.idField]}>
                    {config.columns.map((column) => (
                      <TableCell key={`${row[config.idField]}-${column.label}`}>{renderCell(column, row)}</TableCell>
                    ))}
                    <TableCell className="min-w-[190px]">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`${config.route}?edit=${row[config.idField]}`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </Button>
                        <form action={deleteRecordAction} className="inline-flex">
                          <input name="entityKey" type="hidden" value={config.slug} />
                          <input name="redirectPath" type="hidden" value={config.route} />
                          <input name={config.idField} type="hidden" value={row[config.idField]} />
                          <Button size="sm" type="submit" variant="destructive">
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-8 text-center text-muted-foreground" colSpan={config.columns.length + 1}>
                    No records match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default EntityManagementPage;
