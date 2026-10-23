From the Assignment description:
_Then answer, in a few sentences in your repository: you have now written the same enrolment twice, once in
TypeScript (B1) and once in the database (B3). What does each version give you, what does it cost, and where
would you put it in a system you had to maintain? This course keeps business logic in TypeScript; be able to say
what that choice costs._

Our answer:
TypeScript (B1): The logic sits with the rest of the code, so it is easy to read, test, debug and change in one deploy. 
The cost is more round trips to the database, and any other program that writes to the database has to repeat the rule or can skip it.

Stored procedure (B3): The rule runs inside the database in one call, so it applies to every client. 
The cost is that the logic lives outside the main code, so it is harder to version, test and debug, and it is tied to PostgreSQL.

Our choice: We would keep the logic in TypeScript, as this course does, so there is one place to maintain it. The cost is that the database does not protect itself, because another client could add an enrolment without updating tot_cred.
The routine has to be deployed to the database separately from the code, and the application fails if that step is forgotten.
