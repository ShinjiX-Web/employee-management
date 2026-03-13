const fs = require("node:fs");
const path = require("node:path");
const { Pool, types } = require("pg");
const { DataType, newDb } = require("pg-mem");

types.setTypeParser(1082, (value) => value);
types.setTypeParser(1083, (value) => value);
types.setTypeParser(1114, (value) => value);
types.setTypeParser(1184, (value) => value);

const DEFAULT_DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || "";
const SCHEMA_SQL = fs.readFileSync(path.join(process.cwd(), "database", "schema.sql"), "utf8");
const SEED_SQL = fs.readFileSync(path.join(process.cwd(), "database", "seed.sql"), "utf8");

function convertPlaceholders(queryText) {
  let index = 0;
  return queryText.replace(/\?/g, () => `$${++index}`);
}

function createPreparedStatement(adapter, queryText) {
  return {
    all(...params) {
      return adapter.all(queryText, params);
    },
    get(...params) {
      return adapter.get(queryText, params);
    },
    run(...params) {
      return adapter.run(queryText, params);
    }
  };
}

function normalizeValue(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" && /^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  return value;
}

function normalizeRow(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normalizeValue(value)]));
}

function createAdapter(queryable, closeHandler = async () => {}) {
  const adapter = {
    prepare(queryText) {
      return createPreparedStatement(adapter, queryText);
    },
    async all(queryText, params = []) {
      const result = await queryable.query(convertPlaceholders(queryText), params);
      return result.rows.map(normalizeRow);
    },
    async get(queryText, params = []) {
      const rows = await adapter.all(queryText, params);
      return rows[0] || null;
    },
    async run(queryText, params = []) {
      const result = await queryable.query(convertPlaceholders(queryText), params);
      return {
        rowCount: result.rowCount,
        rows: result.rows
      };
    },
    async exec(queryText) {
      await queryable.query(queryText);
    },
    async withTransaction(callback) {
      if (typeof queryable.connect !== "function") {
        return callback(adapter);
      }

      const client = await queryable.connect();
      const transactionAdapter = createAdapter(client);

      try {
        await client.query("BEGIN");
        const result = await callback(transactionAdapter);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await closeHandler();
    }
  };

  return adapter;
}

function getPoolConfig(connectionString) {
  const isLocalConnection = /localhost|127\.0\.0\.1/i.test(connectionString);

  return {
    connectionString,
    max: process.env.NODE_ENV === "production" ? 3 : 10,
    ssl: isLocalConnection ? false : { rejectUnauthorized: false }
  };
}

async function initializeDatabase(db) {
  await db.withTransaction(async (tx) => {
    await tx.exec(SCHEMA_SQL);

    const seedMarker = await tx.run(
      `
        INSERT INTO app_metadata (metadata_key, metadata_value)
        VALUES (?, ?)
        ON CONFLICT (metadata_key) DO NOTHING
        RETURNING metadata_key
      `,
      ["seed_version", "1"]
    );

    const existingDepartments = await tx.get("SELECT EXISTS (SELECT 1 FROM departments) AS has_rows");

    if (seedMarker.rowCount > 0 && !existingDepartments?.has_rows) {
      await tx.exec(SEED_SQL);
    }
  });
}

async function openDatabase(options = {}) {
  if (options.mode === "memory" || !options.connectionString) {
    const memoryDb = newDb({
      autoCreateForeignKeyIndices: true
    });

    memoryDb.public.registerFunction({
      name: "to_char",
      args: [DataType.date, DataType.text],
      returns: DataType.text,
      implementation(value, format) {
        if (value == null) {
          return null;
        }

        if (format === "YYYY-MM-DD") {
          return new Date(value).toISOString().slice(0, 10);
        }

        if (format === "HH24:MI") {
          return String(value).slice(0, 5);
        }

        return String(value);
      }
    });

    memoryDb.public.registerFunction({
      name: "to_char",
      args: [DataType.time, DataType.text],
      returns: DataType.text,
      implementation(value) {
        if (value == null) {
          return null;
        }

        return String(value).slice(0, 5);
      }
    });

    memoryDb.public.registerFunction({
      name: "split_part",
      args: [DataType.text, DataType.text, DataType.integer],
      returns: DataType.text,
      implementation(value, separator, position) {
        return String(value).split(String(separator))[position - 1] || "";
      }
    });

    memoryDb.public.registerFunction({
      name: "round",
      args: [DataType.float, DataType.integer],
      returns: DataType.float,
      implementation(value, precision) {
        return Number(Number(value).toFixed(precision));
      }
    });

    memoryDb.public.registerFunction({
      name: "round",
      args: [DataType.decimal, DataType.integer],
      returns: DataType.float,
      implementation(value, precision) {
        return Number(Number(value).toFixed(precision));
      }
    });

    const MemoryPool = memoryDb.adapters.createPg().Pool;
    const pool = new MemoryPool();
    const adapter = createAdapter(pool, async () => {
      await pool.end();
    });

    await initializeDatabase(adapter);
    return adapter;
  }

  const pool = new Pool(getPoolConfig(options.connectionString));
  const adapter = createAdapter(pool, async () => {
    await pool.end();
  });

  await initializeDatabase(adapter);
  return adapter;
}

function getDb() {
  if (!globalThis.__employeeManagementDbPromise) {
    if (!DEFAULT_DATABASE_URL) {
      globalThis.__employeeManagementDbPromise = Promise.reject(
        new Error("DATABASE_URL is not configured. Add your Supabase Postgres connection string to continue.")
      );
    } else {
      globalThis.__employeeManagementDbPromise = openDatabase({
        connectionString: DEFAULT_DATABASE_URL
      });
    }
  }

  return globalThis.__employeeManagementDbPromise;
}

async function getDashboardData(db) {
  const [departments, positions, employees, attendance, leaveRequests, projects, employeeProjects, recentAttendance, recentLeaveRequests] =
    await Promise.all([
      db.get("SELECT COUNT(*)::int AS total FROM departments"),
      db.get("SELECT COUNT(*)::int AS total FROM positions"),
      db.get("SELECT COUNT(*)::int AS total FROM employees"),
      db.get("SELECT COUNT(*)::int AS total FROM attendance"),
      db.get("SELECT COUNT(*)::int AS total FROM leave_requests"),
      db.get("SELECT COUNT(*)::int AS total FROM projects"),
      db.get("SELECT COUNT(*)::int AS total FROM employee_projects"),
      db.all(`
        SELECT
          attendance.attendance_id,
          employees.first_name || ' ' || employees.last_name AS employee_name,
          attendance.attendance_date,
          attendance.time_in,
          attendance.time_out
        FROM attendance
        JOIN employees ON employees.employee_id = attendance.employee_id
        ORDER BY attendance.attendance_date DESC, attendance.time_in DESC, attendance.attendance_id DESC
        LIMIT 6
      `),
      db.all(`
        SELECT
          leave_requests.leave_request_id,
          employees.first_name || ' ' || employees.last_name AS employee_name,
          leave_types.leave_name,
          leave_requests.start_date,
          leave_requests.end_date,
          leave_requests.status
        FROM leave_requests
        JOIN employees ON employees.employee_id = leave_requests.employee_id
        JOIN leave_types ON leave_types.leave_type_id = leave_requests.leave_type_id
        ORDER BY leave_requests.request_date DESC, leave_requests.leave_request_id DESC
        LIMIT 6
      `)
    ]);

  return {
    counts: {
      departments: departments.total,
      positions: positions.total,
      employees: employees.total,
      attendance: attendance.total,
      leaveRequests: leaveRequests.total,
      projects: projects.total,
      employeeProjects: employeeProjects.total
    },
    recentAttendance,
    recentLeaveRequests
  };
}

function getDepartmentOptions(db) {
  return db.prepare("SELECT department_id, department_name, location FROM departments ORDER BY department_name").all();
}

function getPositionOptions(db) {
  return db.prepare("SELECT position_id, position_title, base_salary FROM positions ORDER BY position_title").all();
}

function getLeaveTypeOptions(db) {
  return db.prepare("SELECT leave_type_id, leave_name FROM leave_types ORDER BY leave_name").all();
}

function getProjectOptions(db) {
  return db.prepare("SELECT project_id, project_name FROM projects ORDER BY project_name").all();
}

function getEmployeeOptions(db) {
  return db.prepare(`
    SELECT
      employee_id,
      first_name || ' ' || last_name AS employee_name
    FROM employees
    ORDER BY last_name, first_name
  `).all();
}

const REPORT_DEFINITIONS = [
  {
    title: "Simple 1: Employee Directory",
    level: "Simple",
    description: "Lists all employees with their department, position, and employment status.",
    sql: `
SELECT
  employees.employee_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  departments.department_name,
  positions.position_title,
  employees.employment_status
FROM employees
JOIN departments ON departments.department_id = employees.department_id
JOIN positions ON positions.position_id = employees.position_id
ORDER BY employees.last_name, employees.first_name;
    `
  },
  {
    title: "Simple 2: Department List",
    level: "Simple",
    description: "Displays all departments and their office locations.",
    sql: `
SELECT
  department_id,
  department_name,
  location
FROM departments
ORDER BY department_name;
    `
  },
  {
    title: "Simple 3: Attendance Log",
    level: "Simple",
    description: "Shows the attendance records ordered by date and employee.",
    sql: `
SELECT
  attendance.attendance_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  attendance.attendance_date,
  attendance.time_in,
  attendance.time_out
FROM attendance
JOIN employees ON employees.employee_id = attendance.employee_id
ORDER BY attendance.attendance_date DESC, employees.last_name, employees.first_name;
    `
  },
  {
    title: "Moderate 1: Employee Count Per Department",
    level: "Moderate",
    description: "Uses GROUP BY and LEFT JOIN to count employees in each department.",
    sql: `
SELECT
  departments.department_name,
  COUNT(employees.employee_id)::int AS total_employees
FROM departments
LEFT JOIN employees ON employees.department_id = departments.department_id
GROUP BY departments.department_id, departments.department_name
ORDER BY total_employees DESC, departments.department_name;
    `
  },
  {
    title: "Moderate 2: Employees With Managers",
    level: "Moderate",
    description: "Uses a self join to show each employee together with their manager.",
    sql: `
SELECT
  employees.employee_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  COALESCE(managers.first_name || ' ' || managers.last_name, 'No Assigned Manager') AS manager_name
FROM employees
LEFT JOIN employees AS managers ON managers.employee_id = employees.manager_id
ORDER BY employees.last_name, employees.first_name;
    `
  },
  {
    title: "Moderate 3: Leave Request Summary",
    level: "Moderate",
    description: "Shows employee leave requests with leave type and current status.",
    sql: `
SELECT
  leave_requests.leave_request_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  leave_types.leave_name,
  leave_requests.start_date,
  leave_requests.end_date,
  leave_requests.status
FROM leave_requests
JOIN employees ON employees.employee_id = leave_requests.employee_id
JOIN leave_types ON leave_types.leave_type_id = leave_requests.leave_type_id
ORDER BY leave_requests.request_date DESC, employee_name;
    `
  },
  {
    title: "Moderate 4: Employees Without Project Assignments",
    level: "Moderate",
    description: "Returns employees that do not yet have an assigned project.",
    sql: `
SELECT
  employees.employee_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  departments.department_name
FROM employees
JOIN departments ON departments.department_id = employees.department_id
LEFT JOIN employee_projects ON employee_projects.employee_id = employees.employee_id
WHERE employee_projects.id IS NULL
ORDER BY employees.last_name, employees.first_name;
    `
  },
  {
    title: "Difficult 1: Attendance Hours Per Employee",
    level: "Difficult",
    description: "Computes total attendance days and total rendered hours using aggregate calculations.",
    sql: `
SELECT
  employees.first_name || ' ' || employees.last_name AS employee_name,
  COUNT(attendance.attendance_id)::int AS total_days_present,
  ROUND(
    (
      COALESCE(
        SUM(
          (
            split_part(to_char(attendance.time_out, 'HH24:MI'), ':', 1)::int * 60
            + split_part(to_char(attendance.time_out, 'HH24:MI'), ':', 2)::int
          ) - (
            split_part(to_char(attendance.time_in, 'HH24:MI'), ':', 1)::int * 60
            + split_part(to_char(attendance.time_in, 'HH24:MI'), ':', 2)::int
          )
        ),
        0
      ) / 60.0
    )::numeric,
    2
  ) AS total_hours_rendered
FROM employees
LEFT JOIN attendance ON attendance.employee_id = employees.employee_id AND attendance.time_out IS NOT NULL
GROUP BY employees.employee_id, employees.first_name, employees.last_name
ORDER BY total_hours_rendered DESC, employee_name;
    `
  },
  {
    title: "Difficult 2: Project Staffing Rank",
    level: "Difficult",
    description: "Uses a CTE and DENSE_RANK to rank projects by number of assigned employees.",
    sql: `
WITH project_staffing AS (
  SELECT
    projects.project_name,
    COUNT(employee_projects.id)::int AS total_assigned
  FROM projects
  LEFT JOIN employee_projects ON employee_projects.project_id = projects.project_id
  GROUP BY projects.project_id, projects.project_name
)
SELECT
  project_name,
  total_assigned,
  DENSE_RANK() OVER (ORDER BY total_assigned DESC, project_name) AS staffing_rank
FROM project_staffing
ORDER BY staffing_rank, project_name;
    `
  },
  {
    title: "Difficult 3: Department Payroll Estimate",
    level: "Difficult",
    description: "Uses a CTE, aggregates, and ranking to estimate payroll cost per department.",
    sql: `
WITH department_payroll AS (
  SELECT
    departments.department_name,
    COUNT(employees.employee_id)::int AS total_employees,
    ROUND(COALESCE(SUM(positions.base_salary), 0), 2) AS total_monthly_payroll,
    ROUND(COALESCE(AVG(positions.base_salary), 0), 2) AS average_salary
  FROM departments
  LEFT JOIN employees ON employees.department_id = departments.department_id
  LEFT JOIN positions ON positions.position_id = employees.position_id
  GROUP BY departments.department_id, departments.department_name
)
SELECT
  department_name,
  total_employees,
  total_monthly_payroll,
  average_salary,
  DENSE_RANK() OVER (ORDER BY total_monthly_payroll DESC, department_name) AS payroll_rank
FROM department_payroll
ORDER BY payroll_rank, department_name;
    `
  }
];

function getReportDefinitions() {
  return REPORT_DEFINITIONS.map((definition) => ({
    ...definition
  }));
}

async function getReports(db) {
  return Promise.all(
    REPORT_DEFINITIONS.map(async (definition) => ({
      ...definition,
      rows: await db.prepare(definition.sql).all()
    }))
  );
}

function getDbErrorMessage(error) {
  if (!error || !error.message) {
    return "An unexpected database error occurred.";
  }

  if (error.code === "23505" || error.message.includes("duplicate key value violates unique constraint")) {
    return "That record already exists. Please use a different value for fields that must be unique.";
  }

  if (error.code === "23503" || error.message.includes("violates foreign key constraint")) {
    return "This record is still connected to other employee data, so it cannot be deleted yet.";
  }

  if (error.code === "23514" || error.message.includes("violates check constraint")) {
    return "One of the values does not match the required format. Please review the form fields.";
  }

  if (error.code === "23502" || error.message.includes("null value in column")) {
    return "One of the required fields is missing. Please review the form fields.";
  }

  return error.message;
}

module.exports = {
  DEFAULT_DATABASE_URL,
  getDashboardData,
  getDb,
  getDbErrorMessage,
  getDepartmentOptions,
  getEmployeeOptions,
  getLeaveTypeOptions,
  getPositionOptions,
  getProjectOptions,
  getReportDefinitions,
  getReports,
  initializeDatabase,
  openDatabase
};
