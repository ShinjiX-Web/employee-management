const assert = require("node:assert/strict");
const test = require("node:test");

const dbLib = require("../lib/db");
const entityLib = require("../lib/entity-configs");

const { getReportDefinitions, openDatabase } = dbLib;
const { getEntityConfig } = entityLib;

test("database initializes with employee seed data", async (t) => {
  const db = await openDatabase({ mode: "memory" });

  t.after(async () => {
    await db.close();
  });

  const departmentCount = await db.prepare("SELECT COUNT(*)::int AS total FROM departments").get();
  const positionCount = await db.prepare("SELECT COUNT(*)::int AS total FROM positions").get();
  const employeeCount = await db.prepare("SELECT COUNT(*)::int AS total FROM employees").get();

  assert.equal(departmentCount.total, 4);
  assert.equal(positionCount.total, 5);
  assert.equal(employeeCount.total, 7);
});

test("reports collection contains the required SQL categories", async (t) => {
  const db = await openDatabase({ mode: "memory" });

  t.after(async () => {
    await db.close();
  });

  const reports = getReportDefinitions();
  const titles = reports.map((report) => report.title);

  assert.equal(reports.length, 10);
  assert.ok(titles.includes("Simple 1: Employee Directory"));
  assert.ok(titles.includes("Moderate 4: Employees Without Project Assignments"));
  assert.ok(titles.includes("Difficult 3: Department Payroll Estimate"));
});

test("department config can create a new record", async (t) => {
  const db = await openDatabase({ mode: "memory" });

  t.after(async () => {
    await db.close();
  });

  const config = getEntityConfig("departments");
  const message = await config.create(db, {
    department_name: "Legal",
    location: "Taguig Office"
  });
  const created = await db
    .prepare("SELECT department_name, location FROM departments WHERE department_name = ?")
    .get("Legal");

  assert.equal(message, "Department added successfully.");
  assert.equal(created.department_name, "Legal");
  assert.equal(created.location, "Taguig Office");
});
