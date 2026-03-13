INSERT INTO departments (department_name, location) VALUES
  ('Human Resources', 'Manila Office'),
  ('Information Technology', 'Quezon City Office'),
  ('Finance', 'Makati Office'),
  ('Operations', 'Pasig Office');

INSERT INTO positions (position_title, base_salary) VALUES
  ('HR Officer', 28000.00),
  ('Software Developer', 42000.00),
  ('Accountant', 35000.00),
  ('Operations Supervisor', 38000.00),
  ('IT Manager', 55000.00);

INSERT INTO leave_types (leave_name, description) VALUES
  ('Sick Leave', 'Leave used for sickness or medical recovery'),
  ('Vacation Leave', 'Planned personal vacation leave'),
  ('Emergency Leave', 'Urgent leave for unforeseen situations'),
  ('Maternity Leave', 'Leave granted for maternity recovery');

INSERT INTO projects (project_name, start_date, end_date) VALUES
  ('Payroll Automation', '2026-01-10', '2026-06-30'),
  ('Website Redesign', '2026-02-01', '2026-07-15'),
  ('Inventory System Upgrade', '2026-01-20', '2026-08-20'),
  ('Employee Portal', '2026-03-01', '2026-09-30');

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
) VALUES
  ('Maria', 'Santos', 'maria.santos@company.com', '09171234567', '1990-05-18', '2020-08-03', 1, 1, NULL, 'Active'),
  ('John', 'Reyes', 'john.reyes@company.com', '09181234567', '1988-09-11', '2019-06-15', 2, 5, NULL, 'Active'),
  ('Alyssa', 'Mendoza', 'alyssa.mendoza@company.com', '09191234567', '1997-02-14', '2023-01-09', 2, 2, 2, 'Active'),
  ('Brian', 'Castillo', 'brian.castillo@company.com', '09201234567', '1995-07-21', '2022-11-14', 3, 3, NULL, 'Probationary'),
  ('Clarisse', 'Ramos', 'clarisse.ramos@company.com', '09211234567', '1996-11-03', '2021-04-05', 4, 4, NULL, 'On Leave'),
  ('Daniel', 'Navarro', 'daniel.navarro@company.com', '09221234567', '1998-12-09', '2024-02-19', 2, 2, 2, 'Active'),
  ('Erika', 'Flores', 'erika.flores@company.com', '09231234567', '1999-05-18', '2025-03-24', 1, 1, 1, 'Active');

INSERT INTO attendance (employee_id, attendance_date, time_in, time_out) VALUES
  (1, '2026-03-09', '08:00', '17:00'),
  (2, '2026-03-09', '08:15', '17:20'),
  (3, '2026-03-09', '08:05', '17:10'),
  (4, '2026-03-09', '08:30', '17:00'),
  (6, '2026-03-09', '08:10', '17:15'),
  (7, '2026-03-09', '08:00', '16:50');

INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, status, request_date) VALUES
  (3, 2, '2026-04-10', '2026-04-12', 'Approved', '2026-03-05'),
  (4, 1, '2026-03-14', '2026-03-14', 'Pending', '2026-03-12'),
  (5, 3, '2026-03-20', '2026-03-22', 'Approved', '2026-03-10'),
  (7, 1, '2026-03-18', '2026-03-18', 'Rejected', '2026-03-11');

INSERT INTO employee_projects (employee_id, project_id) VALUES
  (2, 1),
  (2, 4),
  (3, 2),
  (3, 4),
  (4, 1),
  (6, 3),
  (7, 4);
