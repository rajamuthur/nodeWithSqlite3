const DBModule = require('./db.js');
class ExperianceModule extends DBModule {
    constructor() {
        super();
        console.log('ExperianceModule constructor')
    }
    getSkillsById(id, callBack) {
        this.dbConnection.all(`SELECT *
               FROM experiances WHERE emp_id = ?`, [id], (err, rows) => {
                if (err) {
                    console.error('getRecordById: Failed to get employee skill details by id: ' + id + ', Error: ', err.message);
                } else {
                    console.log('inside getRecordById', rows);
                    callBack(rows);
                }
            });
        return;
    }
    addExperiances(data, callBack) {
        let list = [];
        data.forEach(exp => {
            list.push("('"+exp.join("','")+"')");
        });
        let sql = "INSERT INTO experiances (emp_id, skill, month_experiance) VALUES "+ list.join(',');
        this.dbConnection.run(sql, [], function (err) {
                if (err) {
                    console.error('addRecord: Failed to add employee exp details, Error: ', err.message, 'sql:  ', sql);
                    callBack(false);
                } else {
                    console.log(`addRecord: added employee exp details`);
                    callBack(true);
                }
            });
        return;
    }
    updateExpById(data, callBack) {
        this.dbConnection.run(`UPDATE experiances SET skill=$skill, month_experiance = $experiance WHERE id = $id`, {
            $id: data.experianceId,
            $skill: data.skill,
            $experiance: data.expInMonths
        }, function (err) {
            if (err) {
                console.error('updateExpById: Failed to update employee experiance details, Error: ', err.message);
                callBack(false);
            } else {
                console.log(`updateExpById: Updated employee experiance`);
                callBack(true);
            }
        });
        return;
    }
    deleteExperianceByIds(expIds, callBack) {
        let sql = 'DELETE FROM experiances WHERE id IN('+expIds.join(',')+')'
        this.dbConnection.run(sql, [], function (err) {
            if (err) {
                console.error('deleteRecordById: Failed to delete employee details, Error: ', err.message, 'sql: ', sql);
                callBack(false);
            } else {
                console.log(`deleteRecordById: Successfully deleted id:`, expIds, 'sql: ', sql);
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

module.exports = ExperianceModule;