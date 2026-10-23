// Part B1 - one operation, two statements, one transaction

import { pool } from './db.js';

export interface EnrolInput {
  studentId: string;
  courseId: string;
  secId: string;
  semester: string;
  year: number;
}

/**
 * Enrols a student in a course section and adds the course credits to the
 * student's total.
 *
 * Two statements:
 *   INSERT INTO takes (id, course_id, sec_id, semester, year, grade)
 *     VALUES ($1, $2, $3, $4, $5, NULL)
 *   UPDATE student SET tot_cred = tot_cred + <the course credits>
 *     WHERE id = $1
 *
 * They must both happen or neither. A student enrolled without the credits
 * being added is a database that quietly disagrees with itself.
 *
 * A transaction runs on one connection, so take a client from the pool
 * rather than using the pool directly: BEGIN, both statements, COMMIT, and
 * ROLLBACK if anything fails. Release the client in a finally block.
 *
 * Returns the student's new credit total.
 */
export async function enrolInTypeScript(input: EnrolInput): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO takes (id, course_id, sec_id, semester, year)
        VALUES ($1, $2, $3, $4, $5)`,
      [input.studentId, input.courseId, input.secId, input.semester, input.year]
    );

    const { rows } = await client.query<{ totCred: number }>(
      `UPDATE student
          SET tot_cred = tot_cred + (SELECT credits FROM course WHERE course_id = $2)
        WHERE id = $1
        RETURNING tot_cred::int AS "totCred"`,
      [input.studentId, input.courseId]
    );

    await client.query('COMMIT');
    return rows[0].totCred;

  } catch (err) {
      await client.query('ROLLBACK');
      throw err;

  } finally {
      client.release();
  }
}