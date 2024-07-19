const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { userInfo } = require('../util/protocol');

// database class
class DatabaseManagement {
    constructor() {
        this.database = null
        this.load()
    }
    // load the database
    load() {
        let dbpath = path.resolve(__dirname, 'database.db');
        this.database = new sqlite3.Database(dbpath, (error) => {
            if (error) {
                console.log("Error opening database")
            }
        })
    }
    // handle for run sql
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
    // Use to query user's password by jid
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
    // Use to apply user's password and jid
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