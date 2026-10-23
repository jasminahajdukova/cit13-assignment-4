// Run your work with:  npm run build   then   npm start
//
// Uncomment each block as you finish it. The expected result is beside each
// line. The last block puts the database back as it was, so you can run this
// as often as you like.

import { pool } from './db.js';
import {
  listStudents, findStudent, studentsIn, coursesFor,
  studentsPerDepartment, insertStudent, deleteStudent,
} from './queries.js';
import { enrolInTypeScript } from './transaction.js';
import { transcriptOf, transcriptOrUndefined, enrolWithProcedure } from './procedures.js';
import { firstCourseTitle, overview, overviewSlowly, removeAndCheckBroken, removeAndCheck } from './async.js';

// Start from a known state, so this file can be run again after a failure.
await pool.query("DELETE FROM takes WHERE id = '90000'");
await pool.query("DELETE FROM student WHERE id = '90000'");

console.log('connected');

// --- Part A ---
console.log((await listStudents(5, 0)).map(s => s.id));   // 00128 12345 19991 23121 44553
console.log((await listStudents(5, 5)).map(s => s.id));   // 45678 54321 55739 70557 76543
// console.log(await findStudent('00128'));
//   { id: '00128', name: 'Zhang', deptName: 'Comp. Sci.', totCred: 102 }
// console.log(await findStudent('99999'));                  // undefined
console.log((await studentsIn('Comp. Sci.')).map(s => s.name));
//   [ 'Brown', 'Shankar', 'Williams', 'Zhang' ]
// console.log(await coursesFor('00128'));
//   [ { courseId: 'CS-101', title: 'Intro. to Computer Science', grade: '12' },
//     { courseId: 'CS-347', title: 'Database System Concepts', grade: '10' } ]
//   Grades on the Danish scale, because the query calls danish_grade.
// console.log(await coursesFor('70557'));                   // []
console.log(await studentsPerDepartment());
//   [ { deptName: 'Biology', students: 1 }, { deptName: 'Comp. Sci.', students: 4 }, ... ]
// console.log(typeof (await studentsPerDepartment())[0].students);   // number

// --- Part B1: the transaction ---
// console.log(await insertStudent(
//   { id: '90000', name: 'Testperson', deptName: 'Music', totCred: 0 }));
//   { id: '90000', name: 'Testperson', deptName: 'Music', totCred: 0 }
// console.log(await enrolInTypeScript(
//   { studentId: '90000', courseId: 'MU-199', secId: '1', semester: 'Spring', year: 2018 }));
//   3   (the credits of MU-199)

// --- Part B2 and B3: the routines in the database ---
// First check that danish_grade, from the database exercises, is still there:
// console.log((await pool.query(
//   "SELECT danish_grade('A') AS a, danish_grade('C-') AS c, danish_grade(NULL) AS n")).rows[0]);
//   { a: '12', c: '02', n: null }
console.log(await transcriptOf('00128'));
//   two rows: CS-101 with 12, CS-347 with 10
// console.log(await transcriptOrUndefined('99999'));        // undefined
// try {
//   await transcriptOf('99999');
// } catch (err) {
//   console.log('caught:', (err as Error).message);         // No student with id 99999
// }
// console.log(await enrolWithProcedure('90000', 'CS-101', '1', 'Fall', 2017));
//   7   (3 from before, plus the 4 credits of CS-101)

// --- Part C ---
// console.log(await firstCourseTitle('00128'));             // Intro. to Computer Science
// console.log(await firstCourseTitle('99999'));             // undefined
// console.time('one after another');
console.log(await overviewSlowly());
// console.timeEnd('one after another');   // about 600 ms
// console.time('together');
// console.log(await overview());
// console.timeEnd('together');            // about 200 ms
//   the same three numbers, in a third of the time

// --- Part C3, and tidying up ---
// await pool.query("DELETE FROM takes WHERE id = '90000'");
// console.log(await removeAndCheckBroken('90000'));         // true: still there
// console.log(await removeAndCheck('90000'));               // false: really gone

await pool.end();
