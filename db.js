const sqlite3 = require('sqlite3').verbose();
// db.serialize(() => {
//     db.each(`SELECT *
//            FROM employee_details`, (err, row) => {
//             if (err) {
//                 console.error(err.message);
//             }
//             console.log(row.id + "\t" + row.name, row, typeof row);
//         });
// });

class DBModule {
    constructor() {
        this.dbConnection = '';
        this.conf = {
            path: './database/employee-db.db',
            mode: sqlite3.OPEN_READWRITE
        };
        console.log('DBModule constructor conf:', this.conf)
        this.createDBConnection();
    }
    createDBConnection() {
        // open the database
        this.dbConnection = new sqlite3.Database(this.conf.path, this.conf.mode, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('createDBConnection: Connected to the database.');
        });
    }
    getDBConnection() {
        if (this.dbConnection == '') {
            this.createDBConnection();
        }
        return this.dbConnection;
    }

    beginDBTrans() {
        
    }
    commitDBTrans() {
        this.dbConnection.commit();
    }
    rollbackDBTrans() {
        this.dbConnection.rollback();
    }
    closeDBConnection() {
        this.dbConnection.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Close the database connection.');
            }
        });
    }
}

module.exports = DBModule;