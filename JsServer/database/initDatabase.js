// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// This js file is to reset the database


const dbPath = path.resolve(__dirname, 'database.db');
// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the database.');
    }
});
// Create Tables
db.serialize(() => {
    db.run(
        `CREATE TABLE users (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    jid TEXT NOT NULL UNIQUE,
    passwordhash TEXT NOT NULL
);`
    )
}
)
db.close()