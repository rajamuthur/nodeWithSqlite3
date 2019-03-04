const DBModule = require('./db.js');
class UserModule extends DBModule {
    constructor() {
        super();
        console.log('UserModule constructor')
    }
    getAllRecords(callBack) {
        this.dbConnection.all(`SELECT *
               FROM employee_details`, (err, rows) => {
                if (err) {
                    console.error('getAllRecords: Failed to get employee details. Error: ', err.message);
                } else {
                    console.log('inside getAllRecords', rows);
                    callBack(rows);
                }
            });
        return;
    }
    getRecordById(id, callBack) {
        this.dbConnection.get(`SELECT *
               FROM employee_details WHERE id = ?`, [id], (err, rows) => {
                if (err) {
                    console.error('getRecordById: Failed to get employee details by id: ' + id + ', Error: ', err.message);
                } else {
                    console.log('inside getRecordById', rows);
                    callBack(rows);
                }
            });
        return;
    }
    addRecord(data, callBack) {
        let fields = [];
        let fieldVal = [];
        for (var field in data) {
            fields.push(field);
            fieldVal.push(data[field]);
        }
        let fieldString = fields.join(',');
        this.dbConnection.run(`INSERT INTO employee_details ( ${fieldString}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, fieldVal, function (err) {
                if (err) {
                    console.error('addRecord: Failed to add employee details, Error: ', err.message);
                } else {
                    // get the last insert id
                    console.log(`addRecord: A row has been inserted with rowid ${this.lastID}`);
                    callBack(this.lastID);
                }
            });
        return;
    }
    updateRecordById(id, data, callBack) {
        this.dbConnection.run(`UPDATE employee_details SET name=$name, preference = $preference, phoneNumber = $phoneNumber, isActive = $isActive, email = $email, password = $password, gender = $gender, age = $age, dob = $dob WHERE id = $id`, {
            $id: id,
            $name: data.name,
            $preference: data.preference,
            $phoneNumber: data.phoneNumber,
            $isActive: data.isActive,
            $email: data.email,
            $password: data.password,
            $gender: data.gender,
            $age: data.age,
            $dob: data.dob
        }, function (err) {
            if (err) {
                console.error('updateRecordById: Failed to update employee details, Error: ', err.message);
                callBack(false);
            } else {
                console.log(`updateRecordById: A row has been updated ${this.changes}`);
                callBack(true);
            }
        });
        return;
    }
    deleteRecordById(id, callBack) {
        this.dbConnection.run(`DELETE FROM employee_details WHERE id = $id`, {
            $id: id
        }, function (err) {
            if (err) {
                console.error('deleteRecordById: Failed to delete employee details, Error: ', err.message);
                callBack(false);
            } else {
                console.log(`deleteRecordById: Successfully deleted id:`, id);
                callBack(true);
            }
        });
        return;
    }
    isValidUser(data, callBack) {
        console.log('isValidUser data:', data);
        this.dbConnection.get(`SELECT *
               FROM employee_details WHERE name = ? AND password = ? AND isActive = 1`, [data['name'], data['password']], (err, rows) => {
                if (err) {
                    console.error('isValidUser: Failed to validate employee details: ', data, ', Error: ', err.message);
                    callBack(-1);
                } else {
                    console.log('isValidUser', rows, typeof rows);
                    if (rows) {
                        callBack(rows);
                    } else {
                        callBack(false);
                    }
                }
            });
        return;
    }
    getPriviliegeListByUsergroupId(id, callBack) {
        let sql = 'select u.name as role_name, GROUP_CONCAT(p.name) as privilege_list from usergroups u, usergroup_privileges_map upm, privileges p WHERE u.id == upm.usergroup_id AND p.id == upm.privilege_id AND upm.usergroup_id = ?';
        console.log('getPriviliegeListByUsergroupId:', id);
        this.dbConnection.get(sql, [id], (err, rows) => {
            if (err) {
                console.error('getPriviliegeListByUsergroupId: Failed to get privilege details for employee. Usergroup ID: ', id, ', Error: ', err.message);
                callBack(-1);
            } else {
                console.log('getPriviliegeListByUsergroupId resp: ', rows);
                if (rows) {
                    callBack(rows);
                } else {
                    callBack(false);
                }
            }
        });
        return;
    }
}

module.exports = UserModule;