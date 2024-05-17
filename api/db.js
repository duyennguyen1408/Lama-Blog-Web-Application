import mysql from "mysql";

export const db = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "12345678",
    database: "blog",
});
