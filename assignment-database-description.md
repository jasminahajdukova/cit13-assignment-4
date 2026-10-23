# Assignment: database access

Complex IT Systems – Theory E2026 (40417)  ·  Section 2, backend development
Units: asynchronous code, PostgreSQL, queries, stored routines and transactions

Work as a group. Discuss each task before you write anything, then write the
code together, and make sure every one of you can explain every query
afterwards. What you can do at the end is the point of this; the file you
hand in is only the evidence.

## Before you start

Download the zip with the starting project from the course website and
unpack it. Everything you need is inside. Open that folder in VS Code (File >
Open Folder) and open a terminal in it.

Copy `.env.example` to `.env` and put your own database password in it. Then
install the dependencies and run the project once, so you know the loop you
will be working in:

```
npm install
npm run build
npm start
```

Expected: `connected`.

You need the `university` database from the database exercises. If you need
the schema again, `university_database.sql` is in this folder.

This database stores grades on the American letter scale (A, A-, B+, …),
because that is the scale it came with. The course uses the Danish 7-point
scale everywhere else. The data is not rewritten: it belongs to whoever gave
it to you, and other systems may depend on it. Instead the conversion lives
in the database, in the `danish_grade` function you wrote in Task 5 of the
database exercises, and every query here that returns a grade calls it.
Check that it is still in your database:

```sql
SELECT danish_grade('A'), danish_grade('C-'), danish_grade(NULL);
```

Fill in every `TODO` and do not change the signatures. Uncomment the blocks
in `src/index.ts` as you finish each function. The expected result is
written beside every line, so you can check your own work without waiting
for us. The runner puts the database back as it was, so you can run it as
often as you like.

---

## Part A: Queries

Work in `src/queries.ts`. Every query passes its values to the database as
parameters (`$1`, `$2`), never inside the SQL text. Every function returns
objects that match the interfaces at the top of the file: property names such
as `deptName`, not `dept_name`, and numbers as numbers, not strings.

### A1 `listStudents(limit, offset)`, `findStudent(id)` and `studentsIn(deptName)`

Write three functions that read students. `listStudents` returns one page of
students ordered by id: `limit` students, after skipping the first `offset`.
`findStudent` returns one student, or `undefined` when there is no student
with that id. `studentsIn` returns the students of one department, ordered by
name.

```
listStudents(5, 0)         // ids 00128 12345 19991 23121 44553
listStudents(5, 5)         // ids 45678 54321 55739 70557 76543
findStudent('00128')       // { id: '00128', name: 'Zhang', deptName: 'Comp. Sci.', totCred: 102 }
findStudent('99999')       // undefined
studentsIn('Comp. Sci.')   // Brown, Shankar, Williams, Zhang
```

A student who does not exist is an ordinary answer here, not a failure, so
`findStudent` returns `undefined` rather than throwing.

### A2 `coursesFor(studentId)`

Write a function that takes a student's id and returns the courses that
student takes, ordered by course id, each with its course id, title and
grade. The grade is on the Danish scale. A student who takes nothing gives
an empty array.

```
coursesFor('00128')   // CS-101 Intro. to Computer Science, grade '12'
                      // CS-347 Database System Concepts, grade '10'
coursesFor('70557')   // []
```

The grade is in one table and the title in another, so the query needs
both.

### A3 `studentsPerDepartment()`

Write a function that takes nothing and returns, for each department, how
many students it has, ordered by department name. The count is a number.

```
studentsPerDepartment()   // [ { deptName: 'Biology', students: 1 },
                          //   { deptName: 'Comp. Sci.', students: 4 }, ... ]
```

Check the type of the count you get back, before and after you cast it in
the query, and be able to say why the driver behaves that way.

### A4 `insertStudent(student)` and `deleteStudent(id)`

Write two functions. `insertStudent` stores a new student and returns the
student as the database stored it, without running a second query.
`deleteStudent` deletes a student and returns `true`, or `false` when there
was nothing to delete.

```
insertStudent({ id: '90000', name: 'Testperson', deptName: 'Music', totCred: 0 })
                          // { id: '90000', name: 'Testperson', deptName: 'Music', totCred: 0 }
```

A delete that matches no row is not an error to PostgreSQL. Deciding that
nothing was deleted is your job.

---

## Part B: Transactions and stored routines

### B1 `enrolInTypeScript(input)`

Work in `src/transaction.ts`. Write a function that enrols a student in a
course section, adds the credits of that course to the student's total, and
returns the new total. Either both changes happen, or neither does.

```
enrolInTypeScript({ studentId: '90000', courseId: 'MU-199',
                    secId: '1', semester: 'Spring', year: 2018 })   // 3
```

An enrolment without the credits, or credits without the enrolment, leaves
a database that quietly disagrees with itself, and nothing will report it.

### B2 `student_transcript(id)`, `transcriptOf(studentId)` and `transcriptOrUndefined(studentId)`

In `procedures.sql`, write the database function `student_transcript`. It
takes a student's id and returns one row per course that student takes,
ordered by course id, with the course id, the title and the grade already on
the Danish scale. For a student that does not exist, it raises an exception
with the message `No student with id <id>`. Write it in pgAdmin and test it
there first:

```sql
SELECT * FROM student_transcript('00128');   -- two rows, grades 12 and 10
SELECT * FROM student_transcript('99999');   -- an error
```

Then, in `src/procedures.ts`, write two functions that call it.
`transcriptOf` returns the transcript, and fails with the database's error
for a student that does not exist. `transcriptOrUndefined` returns
`undefined` for a student that does not exist, and still fails for any other
error.

```
transcriptOf('00128')            // two rows: CS-101 with 12, CS-347 with 10
transcriptOrUndefined('99999')   // undefined
transcriptOf('99999')            // fails: No student with id 99999
```

An exception you raised yourself arrives with the code `P0001`. A syntax
error in your SQL is not "no such student", so do not turn every error into
`undefined`. And once you change which columns the function returns,
`CREATE OR REPLACE FUNCTION` fails: drop the function first, as the message
tells you.

### B3 `enrol_student(...)` and `enrolWithProcedure(...)`

In `procedures.sql`, write the procedure `enrol_student`. It does the same
job as B1, inside the database: it enrols a student in a course section,
adds the credits of the course to the student's total, and reports the new
total through its `INOUT` parameter. When the course does not exist, it
raises an exception. Test it in pgAdmin:

```sql
CALL enrol_student('70557', 'CS-319', '1', 'Spring', 2018);
```

Then, in `src/procedures.ts`, write `enrolWithProcedure`, which calls the
procedure and returns the new total as a number.

```
enrolWithProcedure('90000', 'CS-101', '1', 'Fall', 2017)   // 7   3 from B1, plus 4
```

The total comes back from a `numeric` column, so it arrives as a string.

**Then answer, in a few sentences in your repository:** you have now written
the same enrolment twice, once in TypeScript (B1) and once in the database
(B3). What does each version give you, what does it cost, and where would
you put it in a system you had to maintain? This course keeps business logic
in TypeScript; be able to say what that choice costs.

---

## Part C: Asynchronous code

Work in `src/async.ts`.

### C1 `firstCourseTitle(studentId)`

Write a function that takes a student's id and returns the title of the
first course that student takes, in course id order. It returns `undefined`
when the student does not exist or takes nothing.

```
firstCourseTitle('00128')   // Intro. to Computer Science
firstCourseTitle('99999')   // undefined
```

Say in a comment whether you handled a missing student with a check or with
`try`/`catch`, and why.

### C2 `overviewSlowly()` and `overview()`

Write two functions that both return the number of students, courses and
departments. `overviewSlowly` runs the three counts one after another.
`overview` runs them all at the same time. Each count uses the query given
in the file, which waits 200 ms on purpose.

```
overviewSlowly()   // about 600 ms
overview()         // about 200 ms, and the same three numbers
```

Without the delay, the counts against your own database take about a
millisecond each, and starting them together costs more than it saves. That
is worth understanding too.

### C3 `removeAndCheck(id)`

`removeAndCheckBroken` is given to you, and it is wrong. It should delete a
student and then report whether the student is still there, and it reports
that the student is. Explain in a comment what happens and in which order,
and what happens to the error if the delete fails. Then write
`removeAndCheck`, which does the same job correctly.

```
removeAndCheckBroken('90000')   // true: still there
removeAndCheck('90000')         // false: really gone
```

---

## Handing in

Push your solution to your group’s Git repository and hand in the link
before the next session (One link per group). Make sure that repository is
public.
