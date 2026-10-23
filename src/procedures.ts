// Part B2 and B3 - calling what you wrote in the database
//
// Write the routines in procedures.sql first, in pgAdmin. Calling them is an
// ordinary query: a FUNCTION goes inside a SELECT, a PROCEDURE uses CALL.

import { pool } from './db.js';

export interface TranscriptRow {
  courseId: string;
  title: string;
  grade: string | null;
}

/**
 * The transcript of a student, from the stored function:
 *
 *     SELECT * FROM student_transcript($1)
 *
 * The function raises an exception for an unknown student, which arrives
 * here as a rejected promise. Let it travel on: this one throws.
 */
export async function transcriptOf(studentId: string): Promise<TranscriptRow[]> {
  // TODO
  throw new Error('not implemented');
}

/**
 * The same, but undefined instead of an error when the student does not
 * exist.
 *
 * An exception you raised yourself arrives with err.code === 'P0001'. Any
 * other code is a real failure and must be re-thrown rather than swallowed:
 * a syntax error in your SQL is not "no such student".
 */
export async function transcriptOrUndefined(
  studentId: string): Promise<TranscriptRow[] | undefined> {
  // TODO
  throw new Error('not implemented');
}

/**
 * Enrols a student by calling the stored procedure:
 *
 *     CALL enrol_student($1, $2, $3, $4, $5, NULL)
 *
 * The INOUT parameter comes back as a row. Note that tot_cred is numeric, so
 * the new total arrives as a string: convert it.
 *
 * Returns the new credit total.
 */
export async function enrolWithProcedure(
  studentId: string, courseId: string, secId: string,
  semester: string, year: number): Promise<number> {
  // TODO
  throw new Error('not implemented');
}
