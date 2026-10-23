// Part A - queries
//
// One thing to know before you start: this database stores grades on the
// American letter scale (A, A-, B+, ...), because that is the scale it came
// with. We use the Danish 7-point scale everywhere else, so the conversion
// happens in the database, in the danish_grade function you wrote in Task 5
// of the database exercises. Every query below that returns a grade calls it.
//
// Three rules for every query here:
//   values go in as $1, $2, never joined into the SQL text
//   columns are renamed for TypeScript: tot_cred AS "totCred"
//   numeric columns are cast: tot_cred::int, count(*)::int
//
// The module structure of the lesson Building the data access layer comes
// later; for this assignment one file is enough.

import { pool } from './db.js';

export interface Student {
  id: string;
  name: string;
  deptName: string;
  totCred: number;
}

export interface CourseRow {
  courseId: string;
  title: string;
  grade: string | null;
}

export interface DeptCount {
  deptName: string;
  students: number;
}

// --- A1. Reading ----------------------------------------------------------

/** A page of students, ordered by id. */
export async function listStudents(limit: number, offset: number): Promise<Student[]> {
  const { rows } = await pool.query<Student>(
    `SELECT id, name, dept_name AS "deptName", tot_cred::int AS "totCred"
     FROM student
     ORDER BY id
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

/** One student, or undefined when there is no such id. */
export async function findStudent(id: string): Promise<Student | undefined> {
  const { rows } = await pool.query<Student>(
    `SELECT id, name, dept_name AS "deptName", tot_cred::int AS "totCred"
    FROM student
    WHERE id = $1`,
    [id]
  );
  return rows[0];
}

/** The students of one department, ordered by name. */
export async function studentsIn(deptName: string): Promise<Student[]> {
    const { rows } = await pool.query<Student>(
    `SELECT id,
            name,
            dept_name AS "deptName",
            tot_cred::int AS "totCred"
    FROM student
    WHERE dept_name = $1
    ORDER BY name;`, 
  [deptName]);
  return rows;
}

// --- A2. A join -----------------------------------------------------------

/**
 * The courses a student takes, with the grade, ordered by course id.
 * Two tables: takes and course. A student who takes nothing gives an empty
 * array, not an error.
 *
 * The grade must come back on the Danish scale, so call danish_grade from
 * the database exercises inside the query:
 *
 *     SELECT ..., danish_grade(t.grade) AS grade
 */
export async function coursesFor(studentId: string): Promise<CourseRow[]> {
  const { rows } = await pool.query<CourseRow>(`
    SELECT c.course_id as "courseId", c.title, danish_grade(t.grade) AS grade
    FROM student s
    JOIN takes t ON t.id = s.id
    JOIN course c ON c.course_id = t.course_id
    WHERE s.id = $1
    ORDER BY c.course_id`,
    [studentId]
  );

  return rows;
}

// --- A3. Aggregating ------------------------------------------------------

/**
 * How many students each department has, ordered by department name.
 * Without the cast, count(*) arrives as a string. Try it both ways and
 * look at the type of what you get.
 */
export async function studentsPerDepartment(): Promise<DeptCount[]> {
  const { rows } = await pool.query<DeptCount>(
    `SELECT dept_name AS "deptName", count(*)::int AS students  
     FROM student
     GROUP BY dept_name
     ORDER BY dept_name`
  );
  return rows;
}

// --- A4. Writing ----------------------------------------------------------

/** Stores a student and returns the row the database stored. */
export async function insertStudent(student: Student): Promise<Student> {
  const { rows } = await pool.query<Student>(`
    INSERT INTO student (id, name, dept_name, tot_cred)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, dept_name as "deptName", tot_cred::int as "totCred"`,
  [student.id, student.name, student.deptName, student.totCred]);
  return rows[0];
}

/** True when a row was deleted, false when there was nothing to delete. */
export async function deleteStudent(id: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM student WHERE id = $1`,
  [id]);
  return (rowCount ?? 0) > 0;
}

