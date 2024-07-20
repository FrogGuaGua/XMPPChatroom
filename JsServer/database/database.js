// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { userInfo } = require('../util/protocol');

// Database class for database operations
class DatabaseManagement {
    constructor() {
        this.database = null
        this.load()
    }
    // Load the database from the path
    load() {
        let dbpath = path.resolve(__dirname, 'database.db');
        this.database = new sqlite3.Database(dbpath, (error) => {
            if (error) {
                console.log("Error opening database")
            }
        })
    }
    // Execute a SQL query with parameters
    async execute(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.database.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row)
                }
            });
        });
    }
    // Query a user's password by their jid
    // Return false if error
    async queryUser(jid){
        let sql =  "SELECT jid,passwordhash FROM users WHERE jid = ?";
        try{
            const info = await this.execute(sql, [jid]);
            return info
        }
        catch (error) {
            return false
        }
    }
    // Register a user with their jid and password hash
    // Return false if error
    async registerUser(jid, password) {
        let sql = "INSERT INTO users (jid, passwordhash) VALUES (?, ?)";
        try {
            const userId = await this.execute(sql, [jid, password]);
            return true
        } catch (error) {
            console.log("Reg in same jid")
            return false
        }
    }

}


module.exports = DatabaseManagement;