const {
  assertDateRange,
  assertTimeRange,
  nullable,
  readOptionalDate,
  readOptionalEmail,
  readOptionalIntegerField,
  readOptionalText,
  readOptionalTime,
  readRequiredChoice,
  readRequiredDate,
  readRequiredInteger,
  readRequiredNumber,
  readRequiredText,
  readRequiredTime
} = require("./form-helpers");
const {
  getDepartmentOptions,
  getEmployeeOptions,
  getLeaveTypeOptions,
  getPositionOptions,
  getProjectOptions
} = require("./db");

const EMPLOYMENT_STATUSES = ["Active", "Probationary", "On Leave", "Resigned"];
const LEAVE_REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];

const ENTITY_CONFIGS = [
  {
    slug: "departments",
    route: "/departments",
    activePage: "departments",
    pageTitle: "Department Management",
    heroTitle: "Departments",
    heroDescription: "Manage department names and office locations.",
    searchPlaceholder: "Search department or location",
    addTitle: "Add Department",
    editTitle: "Edit Department",
    addHelper: "Departments organize employees by function or office.",
    idField: "department_id",
    columns: [
      { key: "department_id", label: "ID" },
      { key: "department_name", label: "Department Name" },
      { key: "location", label: "Location" }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT department_id, department_name, COALESCE(location, '') AS location
              FROM departments
              WHERE department_name ILIKE ? OR COALESCE(location, '') ILIKE ?
              ORDER BY department_name
            `)
            .all(`%${query}%`, `%${query}%`)
        : db
            .prepare(`
              SELECT department_id, department_name, COALESCE(location, '') AS location
              FROM departments
              ORDER BY department_name
            `)
            .all();
    },
    getEditRecord(db, id) {
      return db
        .prepare(
          "SELECT department_id, department_name, COALESCE(location, '') AS location FROM departments WHERE department_id = ?"
        )
        .get(id);
    },
    getFields(_db, record) {
      return [
        ...(record ? [{ type: "hidden", name: "department_id", value: record.department_id }] : []),
        {
          name: "department_name",
          label: "Department Name",
          value: record?.department_name || "",
          required: true,
          placeholder: "Human Resources"
        },
        {
          name: "location",
          label: "Location",
          value: record?.location || "",
          placeholder: "Manila Office"
        }
      ];
    },
    async create(db, form) {
      const departmentName = readRequiredText(form, "department_name", "Department name");
      const location = nullable(readOptionalText(form, "location"));
      await db.prepare("INSERT INTO departments (department_name, location) VALUES (?, ?)").run(
        departmentName,
        location
      );
      return "Department added successfully.";
    },
    async update(db, form) {
      const departmentId = readRequiredInteger(form, "department_id", "Department");
      const departmentName = readRequiredText(form, "department_name", "Department name");
      const location = nullable(readOptionalText(form, "location"));
      await db.prepare("UPDATE departments SET department_name = ?, location = ? WHERE department_id = ?").run(
        departmentName,
        location,
        departmentId
      );
      return "Department updated successfully.";
    },
    async remove(db, form) {
      const departmentId = readRequiredInteger(form, "department_id", "Department");
      await db.prepare("DELETE FROM departments WHERE department_id = ?").run(departmentId);
      return "Department deleted successfully.";
    }
  },
  {
    slug: "positions",
    route: "/positions",
    activePage: "positions",
    pageTitle: "Position Management",
    heroTitle: "Positions",
    heroDescription: "Maintain job positions and base salary information.",
    searchPlaceholder: "Search position title",
    addTitle: "Add Position",
    editTitle: "Edit Position",
    addHelper: "Base salary is used for payroll estimates in the reports page.",
    idField: "position_id",
    columns: [
      { key: "position_id", label: "ID" },
      { key: "position_title", label: "Position Title" },
      {
        key: "base_salary",
        label: "Base Salary",
        render: (row) => `PHP ${Number(row.base_salary).toFixed(2)}`
      }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT position_id, position_title, base_salary
              FROM positions
              WHERE position_title ILIKE ?
              ORDER BY position_title
            `)
            .all(`%${query}%`)
        : db.prepare("SELECT position_id, position_title, base_salary FROM positions ORDER BY position_title").all();
    },
    getEditRecord(db, id) {
      return db
        .prepare("SELECT position_id, position_title, base_salary FROM positions WHERE position_id = ?")
        .get(id);
    },
    getFields(_db, record) {
      return [
        ...(record ? [{ type: "hidden", name: "position_id", value: record.position_id }] : []),
        {
          name: "position_title",
          label: "Position Title",
          value: record?.position_title || "",
          required: true,
          placeholder: "Software Developer"
        },
        {
          type: "number",
          name: "base_salary",
          label: "Base Salary",
          value: record?.base_salary || "",
          min: "0",
          step: "0.01",
          required: true
        }
      ];
    },
    async create(db, form) {
      const positionTitle = readRequiredText(form, "position_title", "Position title");
      const baseSalary = readRequiredNumber(form, "base_salary", "Base salary");
      await db.prepare("INSERT INTO positions (position_title, base_salary) VALUES (?, ?)").run(positionTitle, baseSalary);
      return "Position added successfully.";
    },
    async update(db, form) {
      const positionId = readRequiredInteger(form, "position_id", "Position");
      const positionTitle = readRequiredText(form, "position_title", "Position title");
      const baseSalary = readRequiredNumber(form, "base_salary", "Base salary");
      await db.prepare("UPDATE positions SET position_title = ?, base_salary = ? WHERE position_id = ?").run(
        positionTitle,
        baseSalary,
        positionId
      );
      return "Position updated successfully.";
    },
    async remove(db, form) {
      const positionId = readRequiredInteger(form, "position_id", "Position");
      await db.prepare("DELETE FROM positions WHERE position_id = ?").run(positionId);
      return "Position deleted successfully.";
    }
  },
  {
    slug: "leave-types",
    route: "/leave-types",
    activePage: "leave-types",
    pageTitle: "Leave Type Management",
    heroTitle: "Leave Types",
    heroDescription: "Manage categories of employee leave and their descriptions.",
    searchPlaceholder: "Search leave type",
    addTitle: "Add Leave Type",
    editTitle: "Edit Leave Type",
    addHelper: "Leave types are referenced by employee leave requests.",
    idField: "leave_type_id",
    columns: [
      { key: "leave_type_id", label: "ID" },
      { key: "leave_name", label: "Leave Name" },
      { key: "description", label: "Description" }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT leave_type_id, leave_name, COALESCE(description, '') AS description
              FROM leave_types
              WHERE leave_name ILIKE ? OR COALESCE(description, '') ILIKE ?
              ORDER BY leave_name
            `)
            .all(`%${query}%`, `%${query}%`)
        : db
            .prepare(`
              SELECT leave_type_id, leave_name, COALESCE(description, '') AS description
              FROM leave_types
              ORDER BY leave_name
            `)
            .all();
    },
    getEditRecord(db, id) {
      return db
        .prepare(
          "SELECT leave_type_id, leave_name, COALESCE(description, '') AS description FROM leave_types WHERE leave_type_id = ?"
        )
        .get(id);
    },
    getFields(_db, record) {
      return [
        ...(record ? [{ type: "hidden", name: "leave_type_id", value: record.leave_type_id }] : []),
        {
          name: "leave_name",
          label: "Leave Name",
          value: record?.leave_name || "",
          required: true,
          placeholder: "Sick Leave"
        },
        {
          name: "description",
          label: "Description",
          value: record?.description || "",
          placeholder: "Short explanation of the leave type"
        }
      ];
    },
    async create(db, form) {
      const leaveName = readRequiredText(form, "leave_name", "Leave name");
      const description = nullable(readOptionalText(form, "description"));
      await db.prepare("INSERT INTO leave_types (leave_name, description) VALUES (?, ?)").run(leaveName, description);
      return "Leave type added successfully.";
    },
    async update(db, form) {
      const leaveTypeId = readRequiredInteger(form, "leave_type_id", "Leave type");
      const leaveName = readRequiredText(form, "leave_name", "Leave name");
      const description = nullable(readOptionalText(form, "description"));
      await db.prepare("UPDATE leave_types SET leave_name = ?, description = ? WHERE leave_type_id = ?").run(
        leaveName,
        description,
        leaveTypeId
      );
      return "Leave type updated successfully.";
    },
    async remove(db, form) {
      const leaveTypeId = readRequiredInteger(form, "leave_type_id", "Leave type");
      await db.prepare("DELETE FROM leave_types WHERE leave_type_id = ?").run(leaveTypeId);
      return "Leave type deleted successfully.";
    }
  },
  {
    slug: "projects",
    route: "/projects",
    activePage: "projects",
    pageTitle: "Project Management",
    heroTitle: "Projects",
    heroDescription: "Track company projects and their start and end dates.",
    searchPlaceholder: "Search project name",
    addTitle: "Add Project",
    editTitle: "Edit Project",
    addHelper: "Projects can later be assigned to employees.",
    idField: "project_id",
    columns: [
      { key: "project_id", label: "ID" },
      { key: "project_name", label: "Project Name" },
      { key: "start_date", label: "Start Date" },
      { key: "end_date", label: "End Date" }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT
                project_id,
                project_name,
                start_date,
                end_date
              FROM projects
              WHERE project_name ILIKE ?
              ORDER BY project_name
            `)
            .all(`%${query}%`)
        : db
            .prepare(`
              SELECT
                project_id,
                project_name,
                start_date,
                end_date
              FROM projects
              ORDER BY project_name
            `)
            .all();
    },
    getEditRecord(db, id) {
      return db
        .prepare(`
          SELECT
            project_id,
            project_name,
            start_date,
            end_date
          FROM projects
          WHERE project_id = ?
        `)
        .get(id);
    },
    getFields(_db, record) {
      return [
        ...(record ? [{ type: "hidden", name: "project_id", value: record.project_id }] : []),
        {
          name: "project_name",
          label: "Project Name",
          value: record?.project_name || "",
          required: true,
          placeholder: "Employee Portal"
        },
        {
          type: "date",
          name: "start_date",
          label: "Start Date",
          value: record?.start_date || ""
        },
        {
          type: "date",
          name: "end_date",
          label: "End Date",
          value: record?.end_date || ""
        }
      ];
    },
    async create(db, form) {
      const projectName = readRequiredText(form, "project_name", "Project name");
      const startDate = readOptionalDate(form, "start_date", "Start date");
      const endDate = readOptionalDate(form, "end_date", "End date");
      assertDateRange(startDate, endDate, "Project end date");
      await db.prepare("INSERT INTO projects (project_name, start_date, end_date) VALUES (?, ?, ?)").run(
        projectName,
        startDate,
        endDate
      );
      return "Project added successfully.";
    },
    async update(db, form) {
      const projectId = readRequiredInteger(form, "project_id", "Project");
      const projectName = readRequiredText(form, "project_name", "Project name");
      const startDate = readOptionalDate(form, "start_date", "Start date");
      const endDate = readOptionalDate(form, "end_date", "End date");
      assertDateRange(startDate, endDate, "Project end date");
      await db.prepare("UPDATE projects SET project_name = ?, start_date = ?, end_date = ? WHERE project_id = ?").run(
        projectName,
        startDate,
        endDate,
        projectId
      );
      return "Project updated successfully.";
    },
    async remove(db, form) {
      const projectId = readRequiredInteger(form, "project_id", "Project");
      await db.prepare("DELETE FROM projects WHERE project_id = ?").run(projectId);
      return "Project deleted successfully.";
    }
  },
  {
    slug: "employees",
    route: "/employees",
    activePage: "employees",
    pageTitle: "Employee Management",
    heroTitle: "Employees",
    heroDescription: "Manage employee profiles, department assignment, position, manager, and status.",
    searchPlaceholder: "Search employee, department, position, or status",
    addTitle: "Add Employee",
    editTitle: "Edit Employee",
    addHelper: "Employees are linked to departments, positions, and optionally a manager.",
    idField: "employee_id",
    columns: [
      { key: "employee_id", label: "ID" },
      {
        label: "Employee Name",
        render: (row) => `${row.first_name} ${row.last_name}`
      },
      { key: "email", label: "Email" },
      { key: "department_name", label: "Department" },
      { key: "position_title", label: "Position" },
      { key: "manager_name", label: "Manager" },
      { key: "employment_status", label: "Status" }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT
                employees.employee_id,
                employees.first_name,
                employees.last_name,
                COALESCE(employees.email, '') AS email,
                departments.department_name,
                positions.position_title,
                COALESCE(managers.first_name || ' ' || managers.last_name, 'No Assigned Manager') AS manager_name,
                employees.employment_status
              FROM employees
              JOIN departments ON departments.department_id = employees.department_id
              JOIN positions ON positions.position_id = employees.position_id
              LEFT JOIN employees AS managers ON managers.employee_id = employees.manager_id
              WHERE
                employees.first_name ILIKE ?
                OR employees.last_name ILIKE ?
                OR departments.department_name ILIKE ?
                OR positions.position_title ILIKE ?
                OR employees.employment_status ILIKE ?
              ORDER BY employees.last_name, employees.first_name
            `)
            .all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`)
        : db
            .prepare(`
              SELECT
                employees.employee_id,
                employees.first_name,
                employees.last_name,
                COALESCE(employees.email, '') AS email,
                departments.department_name,
                positions.position_title,
                COALESCE(managers.first_name || ' ' || managers.last_name, 'No Assigned Manager') AS manager_name,
                employees.employment_status
              FROM employees
              JOIN departments ON departments.department_id = employees.department_id
              JOIN positions ON positions.position_id = employees.position_id
              LEFT JOIN employees AS managers ON managers.employee_id = employees.manager_id
              ORDER BY employees.last_name, employees.first_name
            `)
            .all();
    },
    getEditRecord(db, id) {
      return db
        .prepare(`
          SELECT
            employee_id,
            first_name,
            last_name,
            COALESCE(email, '') AS email,
            COALESCE(contact_number, '') AS contact_number,
            birthdate,
            hire_date,
            department_id,
            position_id,
            manager_id,
            employment_status
          FROM employees
          WHERE employee_id = ?
        `)
        .get(id);
    },
    async getFields(db, record) {
      const [departmentOptions, positionOptions, employeeOptions] = await Promise.all([
        getDepartmentOptions(db),
        getPositionOptions(db),
        getEmployeeOptions(db)
      ]);
      const departments = departmentOptions.map((item) => ({
        value: item.department_id,
        label: `${item.department_name}${item.location ? ` - ${item.location}` : ""}`
      }));
      const positions = positionOptions.map((item) => ({
        value: item.position_id,
        label: `${item.position_title} - PHP ${Number(item.base_salary).toFixed(2)}`
      }));
      const managers = employeeOptions
        .filter((item) => !record || item.employee_id !== record.employee_id)
        .map((item) => ({ value: item.employee_id, label: item.employee_name }));
      const statuses = EMPLOYMENT_STATUSES.map((item) => ({ value: item, label: item }));

      return [
        ...(record ? [{ type: "hidden", name: "employee_id", value: record.employee_id }] : []),
        { name: "first_name", label: "First Name", value: record?.first_name || "", required: true },
        { name: "last_name", label: "Last Name", value: record?.last_name || "", required: true },
        { type: "email", name: "email", label: "Email", value: record?.email || "", placeholder: "name@company.com" },
        {
          name: "contact_number",
          label: "Contact Number",
          value: record?.contact_number || "",
          placeholder: "09171234567"
        },
        { type: "date", name: "birthdate", label: "Birthdate", value: record?.birthdate || "" },
        { type: "date", name: "hire_date", label: "Hire Date", value: record?.hire_date || "" },
        {
          type: "select",
          name: "department_id",
          label: "Department",
          value: record?.department_id || "",
          required: true,
          options: departments
        },
        {
          type: "select",
          name: "position_id",
          label: "Position",
          value: record?.position_id || "",
          required: true,
          options: positions
        },
        {
          type: "select",
          name: "manager_id",
          label: "Manager",
          value: record?.manager_id || "",
          options: managers
        },
        {
          type: "select",
          name: "employment_status",
          label: "Employment Status",
          value: record?.employment_status || "Active",
          required: true,
          options: statuses
        }
      ];
    },
    async create(db, form) {
      const firstName = readRequiredText(form, "first_name", "First name");
      const lastName = readRequiredText(form, "last_name", "Last name");
      const email = readOptionalEmail(form, "email", "Email");
      const contactNumber = nullable(readOptionalText(form, "contact_number"));
      const birthdate = readOptionalDate(form, "birthdate", "Birthdate");
      const hireDate = readOptionalDate(form, "hire_date", "Hire date");
      const departmentId = readRequiredInteger(form, "department_id", "Department");
      const positionId = readRequiredInteger(form, "position_id", "Position");
      const managerId = readOptionalIntegerField(form, "manager_id");
      const employmentStatus = readRequiredChoice(
        form,
        "employment_status",
        "Employment status",
        EMPLOYMENT_STATUSES
      );

      await db.prepare(`
        INSERT INTO employees (
          first_name,
          last_name,
          email,
          contact_number,
          birthdate,
          hire_date,
          department_id,
          position_id,
          manager_id,
          employment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        firstName,
        lastName,
        email,
        contactNumber,
        birthdate,
        hireDate,
        departmentId,
        positionId,
        managerId,
        employmentStatus
      );

      return "Employee added successfully.";
    },
    async update(db, form) {
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const firstName = readRequiredText(form, "first_name", "First name");
      const lastName = readRequiredText(form, "last_name", "Last name");
      const email = readOptionalEmail(form, "email", "Email");
      const contactNumber = nullable(readOptionalText(form, "contact_number"));
      const birthdate = readOptionalDate(form, "birthdate", "Birthdate");
      const hireDate = readOptionalDate(form, "hire_date", "Hire date");
      const departmentId = readRequiredInteger(form, "department_id", "Department");
      const positionId = readRequiredInteger(form, "position_id", "Position");
      const managerId = readOptionalIntegerField(form, "manager_id");
      const employmentStatus = readRequiredChoice(
        form,
        "employment_status",
        "Employment status",
        EMPLOYMENT_STATUSES
      );

      if (managerId && managerId === employeeId) {
        throw new Error("An employee cannot be their own manager.");
      }

      await db.prepare(`
        UPDATE employees
        SET
          first_name = ?,
          last_name = ?,
          email = ?,
          contact_number = ?,
          birthdate = ?,
          hire_date = ?,
          department_id = ?,
          position_id = ?,
          manager_id = ?,
          employment_status = ?
        WHERE employee_id = ?
      `).run(
        firstName,
        lastName,
        email,
        contactNumber,
        birthdate,
        hireDate,
        departmentId,
        positionId,
        managerId,
        employmentStatus,
        employeeId
      );

      return "Employee updated successfully.";
    },
    async remove(db, form) {
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      await db.prepare("DELETE FROM employees WHERE employee_id = ?").run(employeeId);
      return "Employee deleted successfully.";
    }
  },
  {
    slug: "attendance",
    route: "/attendance",
    activePage: "attendance",
    pageTitle: "Attendance Management",
    heroTitle: "Attendance",
    heroDescription: "Record daily time in and time out entries for employees.",
    searchPlaceholder: "Search employee or attendance date",
    addTitle: "Add Attendance",
    editTitle: "Edit Attendance",
    addHelper: "Time out can be left blank if the employee is still on shift.",
    idField: "attendance_id",
    columns: [
      { key: "attendance_id", label: "ID" },
      { key: "employee_name", label: "Employee" },
      { key: "attendance_date", label: "Attendance Date" },
      { key: "time_in", label: "Time In" },
      { key: "time_out", label: "Time Out" }
    ],
    getRows(db, query) {
      const isDateSearch = /^\d{4}-\d{2}-\d{2}$/.test(query);

      if (!query) {
        return db
          .prepare(`
            SELECT
              attendance.attendance_id,
              employees.first_name || ' ' || employees.last_name AS employee_name,
              attendance.attendance_date,
              attendance.time_in,
              attendance.time_out
            FROM attendance
            JOIN employees ON employees.employee_id = attendance.employee_id
            ORDER BY attendance.attendance_date DESC, employee_name
          `)
          .all();
      }

      return isDateSearch
        ? db
            .prepare(`
              SELECT
                attendance.attendance_id,
                employees.first_name || ' ' || employees.last_name AS employee_name,
                attendance.attendance_date,
                attendance.time_in,
                attendance.time_out
              FROM attendance
              JOIN employees ON employees.employee_id = attendance.employee_id
              WHERE
                employees.first_name ILIKE ?
                OR employees.last_name ILIKE ?
                OR attendance.attendance_date = ?
              ORDER BY attendance.attendance_date DESC, employee_name
            `)
            .all(`%${query}%`, `%${query}%`, query)
        : db
            .prepare(`
              SELECT
                attendance.attendance_id,
                employees.first_name || ' ' || employees.last_name AS employee_name,
                attendance.attendance_date,
                attendance.time_in,
                attendance.time_out
              FROM attendance
              JOIN employees ON employees.employee_id = attendance.employee_id
              WHERE
                employees.first_name ILIKE ?
                OR employees.last_name ILIKE ?
              ORDER BY attendance.attendance_date DESC, employee_name
            `)
            .all(`%${query}%`, `%${query}%`);
    },
    getEditRecord(db, id) {
      return db
        .prepare(`
          SELECT
            attendance_id,
            employee_id,
            attendance_date,
            time_in,
            time_out
          FROM attendance
          WHERE attendance_id = ?
        `)
        .get(id);
    },
    async getFields(db, record) {
      const employees = (await getEmployeeOptions(db)).map((item) => ({ value: item.employee_id, label: item.employee_name }));

      return [
        ...(record ? [{ type: "hidden", name: "attendance_id", value: record.attendance_id }] : []),
        {
          type: "select",
          name: "employee_id",
          label: "Employee",
          value: record?.employee_id || "",
          required: true,
          options: employees
        },
        {
          type: "date",
          name: "attendance_date",
          label: "Attendance Date",
          value: record?.attendance_date || "",
          required: true
        },
        { type: "time", name: "time_in", label: "Time In", value: record?.time_in || "", required: true },
        { type: "time", name: "time_out", label: "Time Out", value: record?.time_out || "" }
      ];
    },
    async create(db, form) {
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const attendanceDate = readRequiredDate(form, "attendance_date", "Attendance date");
      const timeIn = readRequiredTime(form, "time_in", "Time in");
      const timeOut = readOptionalTime(form, "time_out", "Time out");
      assertTimeRange(timeIn, timeOut);
      await db.prepare(
        "INSERT INTO attendance (employee_id, attendance_date, time_in, time_out) VALUES (?, ?, ?, ?)"
      ).run(employeeId, attendanceDate, timeIn, timeOut);
      return "Attendance record added successfully.";
    },
    async update(db, form) {
      const attendanceId = readRequiredInteger(form, "attendance_id", "Attendance");
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const attendanceDate = readRequiredDate(form, "attendance_date", "Attendance date");
      const timeIn = readRequiredTime(form, "time_in", "Time in");
      const timeOut = readOptionalTime(form, "time_out", "Time out");
      assertTimeRange(timeIn, timeOut);
      await db.prepare(`
        UPDATE attendance
        SET employee_id = ?, attendance_date = ?, time_in = ?, time_out = ?
        WHERE attendance_id = ?
      `).run(employeeId, attendanceDate, timeIn, timeOut, attendanceId);
      return "Attendance record updated successfully.";
    },
    async remove(db, form) {
      const attendanceId = readRequiredInteger(form, "attendance_id", "Attendance");
      await db.prepare("DELETE FROM attendance WHERE attendance_id = ?").run(attendanceId);
      return "Attendance record deleted successfully.";
    }
  },
  {
    slug: "leave-requests",
    route: "/leave-requests",
    activePage: "leave-requests",
    pageTitle: "Leave Request Management",
    heroTitle: "Leave Requests",
    heroDescription: "Track employee leave requests, date ranges, request dates, and approval status.",
    searchPlaceholder: "Search employee, leave type, or status",
    addTitle: "Add Leave Request",
    editTitle: "Edit Leave Request",
    addHelper: "This page captures the leave transaction data from the ERD.",
    idField: "leave_request_id",
    columns: [
      { key: "leave_request_id", label: "ID" },
      { key: "employee_name", label: "Employee" },
      { key: "leave_name", label: "Leave Type" },
      { key: "start_date", label: "Start Date" },
      { key: "end_date", label: "End Date" },
      { key: "status", label: "Status" },
      { key: "request_date", label: "Request Date" }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT
                leave_requests.leave_request_id,
                employees.first_name || ' ' || employees.last_name AS employee_name,
                leave_types.leave_name,
                leave_requests.start_date,
                leave_requests.end_date,
                leave_requests.status,
                leave_requests.request_date
              FROM leave_requests
              JOIN employees ON employees.employee_id = leave_requests.employee_id
              JOIN leave_types ON leave_types.leave_type_id = leave_requests.leave_type_id
              WHERE
                employees.first_name ILIKE ?
                OR employees.last_name ILIKE ?
                OR leave_types.leave_name ILIKE ?
                OR leave_requests.status ILIKE ?
              ORDER BY leave_requests.request_date DESC, employee_name
            `)
            .all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`)
        : db
            .prepare(`
              SELECT
                leave_requests.leave_request_id,
                employees.first_name || ' ' || employees.last_name AS employee_name,
                leave_types.leave_name,
                leave_requests.start_date,
                leave_requests.end_date,
                leave_requests.status,
                leave_requests.request_date
              FROM leave_requests
              JOIN employees ON employees.employee_id = leave_requests.employee_id
              JOIN leave_types ON leave_types.leave_type_id = leave_requests.leave_type_id
              ORDER BY leave_requests.request_date DESC, employee_name
            `)
            .all();
    },
    getEditRecord(db, id) {
      return db
        .prepare(`
          SELECT
            leave_request_id,
            employee_id,
            leave_type_id,
            start_date,
            end_date,
            status,
            request_date
          FROM leave_requests
          WHERE leave_request_id = ?
        `)
        .get(id);
    },
    async getFields(db, record) {
      const [employeeOptions, leaveTypeOptions] = await Promise.all([getEmployeeOptions(db), getLeaveTypeOptions(db)]);
      const employees = employeeOptions.map((item) => ({ value: item.employee_id, label: item.employee_name }));
      const leaveTypes = leaveTypeOptions.map((item) => ({ value: item.leave_type_id, label: item.leave_name }));
      const statuses = LEAVE_REQUEST_STATUSES.map((item) => ({ value: item, label: item }));

      return [
        ...(record ? [{ type: "hidden", name: "leave_request_id", value: record.leave_request_id }] : []),
        {
          type: "select",
          name: "employee_id",
          label: "Employee",
          value: record?.employee_id || "",
          required: true,
          options: employees
        },
        {
          type: "select",
          name: "leave_type_id",
          label: "Leave Type",
          value: record?.leave_type_id || "",
          required: true,
          options: leaveTypes
        },
        { type: "date", name: "start_date", label: "Start Date", value: record?.start_date || "", required: true },
        { type: "date", name: "end_date", label: "End Date", value: record?.end_date || "", required: true },
        {
          type: "select",
          name: "status",
          label: "Status",
          value: record?.status || "Pending",
          required: true,
          options: statuses
        },
        {
          type: "date",
          name: "request_date",
          label: "Request Date",
          value: record?.request_date || "",
          required: true
        }
      ];
    },
    async create(db, form) {
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const leaveTypeId = readRequiredInteger(form, "leave_type_id", "Leave type");
      const startDate = readRequiredDate(form, "start_date", "Start date");
      const endDate = readRequiredDate(form, "end_date", "End date");
      const status = readRequiredChoice(form, "status", "Status", LEAVE_REQUEST_STATUSES);
      const requestDate = readRequiredDate(form, "request_date", "Request date");
      assertDateRange(startDate, endDate, "Leave end date");
      await db.prepare(`
        INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, status, request_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(employeeId, leaveTypeId, startDate, endDate, status, requestDate);
      return "Leave request added successfully.";
    },
    async update(db, form) {
      const leaveRequestId = readRequiredInteger(form, "leave_request_id", "Leave request");
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const leaveTypeId = readRequiredInteger(form, "leave_type_id", "Leave type");
      const startDate = readRequiredDate(form, "start_date", "Start date");
      const endDate = readRequiredDate(form, "end_date", "End date");
      const status = readRequiredChoice(form, "status", "Status", LEAVE_REQUEST_STATUSES);
      const requestDate = readRequiredDate(form, "request_date", "Request date");
      assertDateRange(startDate, endDate, "Leave end date");
      await db.prepare(`
        UPDATE leave_requests
        SET employee_id = ?, leave_type_id = ?, start_date = ?, end_date = ?, status = ?, request_date = ?
        WHERE leave_request_id = ?
      `).run(employeeId, leaveTypeId, startDate, endDate, status, requestDate, leaveRequestId);
      return "Leave request updated successfully.";
    },
    async remove(db, form) {
      const leaveRequestId = readRequiredInteger(form, "leave_request_id", "Leave request");
      await db.prepare("DELETE FROM leave_requests WHERE leave_request_id = ?").run(leaveRequestId);
      return "Leave request deleted successfully.";
    }
  },
  {
    slug: "employee-projects",
    route: "/employee-projects",
    activePage: "employee-projects",
    pageTitle: "Project Assignment Management",
    heroTitle: "Assignments",
    heroDescription: "Assign employees to projects using the junction table from the ERD.",
    searchPlaceholder: "Search employee or project",
    addTitle: "Add Assignment",
    editTitle: "Edit Assignment",
    addHelper: "This page handles the many-to-many relationship between employees and projects.",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "employee_name", label: "Employee" },
      { key: "project_name", label: "Project" }
    ],
    getRows(db, query) {
      return query
        ? db
            .prepare(`
              SELECT
                employee_projects.id,
                employees.first_name || ' ' || employees.last_name AS employee_name,
                projects.project_name
              FROM employee_projects
              JOIN employees ON employees.employee_id = employee_projects.employee_id
              JOIN projects ON projects.project_id = employee_projects.project_id
              WHERE
                employees.first_name ILIKE ?
                OR employees.last_name ILIKE ?
                OR projects.project_name ILIKE ?
              ORDER BY employee_name, projects.project_name
            `)
            .all(`%${query}%`, `%${query}%`, `%${query}%`)
        : db
            .prepare(`
              SELECT
                employee_projects.id,
                employees.first_name || ' ' || employees.last_name AS employee_name,
                projects.project_name
              FROM employee_projects
              JOIN employees ON employees.employee_id = employee_projects.employee_id
              JOIN projects ON projects.project_id = employee_projects.project_id
              ORDER BY employee_name, projects.project_name
            `)
            .all();
    },
    getEditRecord(db, id) {
      return db.prepare("SELECT id, employee_id, project_id FROM employee_projects WHERE id = ?").get(id);
    },
    async getFields(db, record) {
      const [employeeOptions, projectOptions] = await Promise.all([getEmployeeOptions(db), getProjectOptions(db)]);
      const employees = employeeOptions.map((item) => ({ value: item.employee_id, label: item.employee_name }));
      const projects = projectOptions.map((item) => ({ value: item.project_id, label: item.project_name }));

      return [
        ...(record ? [{ type: "hidden", name: "id", value: record.id }] : []),
        {
          type: "select",
          name: "employee_id",
          label: "Employee",
          value: record?.employee_id || "",
          required: true,
          options: employees
        },
        {
          type: "select",
          name: "project_id",
          label: "Project",
          value: record?.project_id || "",
          required: true,
          options: projects
        }
      ];
    },
    async create(db, form) {
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const projectId = readRequiredInteger(form, "project_id", "Project");
      await db.prepare("INSERT INTO employee_projects (employee_id, project_id) VALUES (?, ?)").run(
        employeeId,
        projectId
      );
      return "Project assignment added successfully.";
    },
    async update(db, form) {
      const id = readRequiredInteger(form, "id", "Assignment");
      const employeeId = readRequiredInteger(form, "employee_id", "Employee");
      const projectId = readRequiredInteger(form, "project_id", "Project");
      await db.prepare("UPDATE employee_projects SET employee_id = ?, project_id = ? WHERE id = ?").run(
        employeeId,
        projectId,
        id
      );
      return "Project assignment updated successfully.";
    },
    async remove(db, form) {
      const id = readRequiredInteger(form, "id", "Assignment");
      await db.prepare("DELETE FROM employee_projects WHERE id = ?").run(id);
      return "Project assignment deleted successfully.";
    }
  }
];

function getEntityConfig(slug) {
  return ENTITY_CONFIGS.find((config) => config.slug === slug) || null;
}

module.exports = {
  ENTITY_CONFIGS,
  getEntityConfig
};
