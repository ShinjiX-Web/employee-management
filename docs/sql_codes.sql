-- =========================================================
-- EMPLOYEE MANAGEMENT SYSTEM SQL CODES
-- 3 SIMPLE, 4 MODERATE, 3 DIFFICULT
-- =========================================================

-- ====================
-- SIMPLE QUERIES
-- ====================

-- Simple 1: Employee directory
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

-- Simple 2: Department list
SELECT
  department_id,
  department_name,
  location
FROM departments
ORDER BY department_name;

-- Simple 3: Attendance log
SELECT
  attendance.attendance_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  attendance.attendance_date,
  attendance.time_in,
  attendance.time_out
FROM attendance
JOIN employees ON employees.employee_id = attendance.employee_id
ORDER BY attendance.attendance_date DESC, employees.last_name, employees.first_name;

-- ====================
-- MODERATE QUERIES
-- ====================

-- Moderate 1: Employee count per department
SELECT
  departments.department_name,
  COUNT(employees.employee_id) AS total_employees
FROM departments
LEFT JOIN employees ON employees.department_id = departments.department_id
GROUP BY departments.department_id, departments.department_name
ORDER BY total_employees DESC, departments.department_name;

-- Moderate 2: Employees with managers
SELECT
  employees.employee_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  COALESCE(managers.first_name || ' ' || managers.last_name, 'No Assigned Manager') AS manager_name
FROM employees
LEFT JOIN employees AS managers ON managers.employee_id = employees.manager_id
ORDER BY employees.last_name, employees.first_name;

-- Moderate 3: Leave request summary
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

-- Moderate 4: Employees without project assignments
SELECT
  employees.employee_id,
  employees.first_name || ' ' || employees.last_name AS employee_name,
  departments.department_name
FROM employees
JOIN departments ON departments.department_id = employees.department_id
LEFT JOIN employee_projects ON employee_projects.employee_id = employees.employee_id
WHERE employee_projects.id IS NULL
ORDER BY employees.last_name, employees.first_name;

-- ====================
-- DIFFICULT QUERIES
-- ====================

-- Difficult 1: Attendance hours per employee
SELECT
  employees.first_name || ' ' || employees.last_name AS employee_name,
  COUNT(attendance.attendance_id) AS total_days_present,
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

-- Difficult 2: Project staffing rank
WITH project_staffing AS (
  SELECT
    projects.project_name,
    COUNT(employee_projects.id) AS total_assigned
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

-- Difficult 3: Department payroll estimate
WITH department_payroll AS (
  SELECT
    departments.department_name,
    COUNT(employees.employee_id) AS total_employees,
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
