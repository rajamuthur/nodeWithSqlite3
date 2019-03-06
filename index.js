var UserModule = require('./user.js');
var ExperianceModule = require('./experiance.js');
const express = require('express');
const Joi = require('joi');
const app = express();
const async = require('async');
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(express.json());

let secreteKey = 'angularNodeJsSqlite3';



function validateDetails(bodyRequest) {
    const schema = {
        id: Joi.number(),
        name: Joi.string().required().min(3),
        age: Joi.number().required(),
        gender: Joi.string().required(),
        preference: Joi.string().required(),
        phoneNumber: Joi.number(),
        email: Joi.string(),
        password: Joi.string().required(),
        cpassword: Joi.string(),
        dob: Joi.date().required(),
        isActive: Joi.boolean().required(),
        experiances: Joi.array(),
        deletedExpIds: Joi.array()
    };
    return Joi.validate(bodyRequest, schema);
}

let userModule = new UserModule();
let expModule = new ExperianceModule();
// let set ={
//     name: 'raj',
//     preference: 'phoneNumber',
//     phoneNumber: 324891687,
//     isActive: true,
//     email: 'rrr@imp.com',
//     password: 'rrr',
//     gender: 'male',
//     age: 21,
//     dob: '10/13/2018'
// };
// userModule.updateRecordById(2, set, function(data){
//     console.log('updateRecordById success:', data);
// })
// const courses = [
//     {
//         id: 1,
//         name: 'raj',
//         preference: 'phoneNumber',
//         phoneNumber: 324891687,
//         isActive: true,
//         email: 'rrr@imp.com',
//         password: 'rrr',
//         gender: 'male',
//         age: 21,
//         dob: new Date('10/13/2018')
//     },
//     {
//         id: 2,
//         name: 'ram',
//         preference: 'email',
//         phoneNumber: 465784684,
//         isActive: true,
//         email: 'ram@imp.com',
//         password: 'ram',
//         gender: 'male',
//         age: 21,
//         dob: new Date('10/23/2041')
//     },
//     {
//         id: 3,
//         name: 'nithu',
//         preference: 'phoneNumber',
//         phoneNumber: 98752487146,
//         isActive: true,
//         email: 'nithu@imp.com',
//         password: 'nithu',
//         gender: 'female',
//         age: 81,
//         dob: new Date('10/3/1918')
//     },
//     {
//         id: 4,
//         name: 'kk',
//         preference: 'email',
//         phoneNumber: 9878671641,
//         isActive: false,
//         email: 'kk@imp.com',
//         password: 'kk',
//         gender: 'male',
//         age: 31,
//         dob: new Date('10/13/1958')
//     },

// ];

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', (req, resp) => {
    resp.send('Welcome');
});

function getNewToken(userId) {
    let payLoad = { subject: userId};
    let token = jwt.sign(payLoad, secreteKey);
    return token;
}

function verifyToken(req, resp, next) {
    if(!req.headers.authorization) {
        return resp.status(401).send('Unauthorized Access - 1');
    } 
    let token = req.headers.authorization.split(' ')[1];
    if(!token || token == null) {
        return resp.status(401).send('Unauthorized Access - 2');
    }

    let payLoad = jwt.verify(token, secreteKey);
    if(!payLoad) {
        return resp.status(401).send('Unauthorized Access - 3');
    }
    let userId = payLoad.subject; //Get back stored value
    console.log('VerifyToken userId: ', userId, ', from token: ', token, payLoad);
    next();
}

app.post('/api/validateUser/', (req, resp) => {
    let name = req.body.name || '';
    let password = req.body.password || '';
    userModule.isValidUser({ 'name': name, 'password': password }, function (data) {
        console.log('after isValidUser data: ', data)
        if (data == -1) {
            resp.status(404).send('Failed to validate user');
        } else if (!data) {
            resp.status(404).send('Invalid User');
        } else {
            getUserDetails(data, resp);
        }
    })
});

function getUserDetails(userData, resp) {
    let usergroupId = userData['usergroup_id'] || '';
    userModule.getPriviliegeListByUsergroupId(usergroupId, function (data) {
        console.log('after getUserDetails data: ', data)
        if (data == -1) {
            resp.status(404).send('Failed to get user privileges list');
        } else if (!data) {
            userData['privileges'] = [];
            userData['role'] = '';
            resp.send(data);
        } else {
            userData['privileges'] = data['privilege_list'];
            userData['role'] = data['role_name'];
            userData['token'] = getNewToken(userData['id']);
            resp.send(userData);
        }
    })
}

app.get('/api/employees/', verifyToken, (req, resp) => {
    setTimeout(function () {
        userModule.getAllRecords(function (data) {
            console.log('settimeout sleep after 2 seconds: ', data)
            resp.send(data);
        });
    }, 200);
    // async (resp) => {
    //     await sleep(2000);
    //     console.log('await sleep after 2 seconds: ', resp)
    // }
});

app.get('/api/employees/:id', verifyToken, (req, resp) => {
    userModule.getRecordById(req.params.id, function (data) {
        console.log('getRecordById: ', req.params.id, ', resp:', data)
        expModule.getSkillsById(req.params.id, function (skillSet) {
            console.log('getSkillsById: ', skillSet, typeof skillSet)
            data['experiances'] = skillSet || [];
            resp.send(data);
        });
    });
});

// function getDetailsById(id) {
//     return courses.find(details => details.id == parseInt(id))
// }

// function getObjectIndex(keyName, value) {
//     return courses.map(function (obj) { return obj[keyName]; }).indexOf(value);
// }

//Add/update new data set
//http://localhost:3000/api/employees
app.post('/api/employees/', verifyToken, (req, apiResp) => {
    req.body.isActive = req.body.isActive == 1 ? true : false;
    console.log('Add/update: req.body: ', req.body, req.body.isActive, typeof req.body.isActive)
    let { error } = validateDetails(req.body); //Object destructuring ie. response.error is eq to {error}
    console.log('Add/update: Server error: ', error)
    if (error) {
        let status = {'success': false, 'msg': error.details[0].message};
        apiResp.status(400).send(status);
        return;
    }
    let newSet = {
        'name': req.body.name,
        'preference': req.body.preference,
        'phoneNumber': req.body.phoneNumber,
        'isActive': req.body.isActive,
        'email': req.body.email,
        'password': req.body.password,
        'gender': req.body.gender,
        'age': req.body.age,
        'dob': req.body.dob
    };
    let data = {};
    data.empId = req.body.id || 0;
    data.empData = newSet;
    data.experiances = req.body.experiances;

    //Update
    if (req.body.id && req.body.id > 0) {
        userModule.dbConnection.serialize(function () {
            data.deletedExpIds = req.body.deletedExpIds || [];
            initiateUpdateEmpRequest(data, apiResp);
        });
    } else { //Add    
        initiateAddEmpRequest(data, apiResp);     
    }
});

const initiateAddEmpRequest = async (data, apiResp) => {
    try {
        let empId = await addEmpDetails(data);
        if (empId) {
            data['empId'] = empId;
            await addEmpExperiance(data);
        }
        let status = {'success': true, 'msg': 'Successfully added employee details'};
        apiResp.send(status)
    } catch (err) {
        let status = {'success': false, 'msg': 'Failed to add employee details'};
        console.log('initiateUpdateEmpRequest err: ', err)
        apiResp.status(404).send(status)
    }
}

function addEmpDetails(data) {
    return new Promise((resolve, reject) => {
        userModule.addRecord(data['empData'], function (resp) {
            console.log('addEmpDetails resp:', resp, data);
            (!resp) ? reject(false) : resolve(resp);
        });
    })
}

const initiateUpdateEmpRequest = async (data, apiResp) => {
    try {
        await updateEmpDetails(data);
        await updateEmpExperiance(data);
        await addEmpExperiance(data);
        if (data['deletedExpIds'].length > 0) {
            await deleteEmpExperiance(data['deletedExpIds']);
        }
        let status = {'success': true, 'msg': 'Successfully updated employee details'};
        apiResp.send(status)
    } catch (err) {
        let status = {'success': false, 'msg': 'Failed to update employee details'};
        console.log('initiateUpdateEmpRequest err: ', err)
        apiResp.status(404).send(status)
    }
}

function updateEmpDetails(data) {
    return new Promise((resolve, reject) => {
        userModule.updateRecordById(data['empId'], data['empData'], function (resp) {
            console.log('updateEmpDetails resp:', resp, data);
            (!resp) ? reject(false) : resolve(true);
        });
    })
}

function deleteEmpExperiance(ids) {
    return new Promise((resolve, reject) => {
        expModule.deleteExperianceByIds(ids, function (resp) {
            console.log('deleteEmpExperiance resp:', resp);
            (!resp) ? reject(false) : resolve(true);
        });
    })
}

function addEmpExperiance(data) {
    return new Promise((resolve, reject) => {
        let expList = getExpList(data['experiances'], data['empId'], true);
        if (expList.length > 0) {
            expModule.addExperiances(expList, function (resp) {
                console.log('addEmpExperiance resp:', resp);
                (!resp) ? reject(false) : resolve(true);
            });
        } else {
            console.log('No records avaliable to add employee experiance');
            resolve(true);
        }
    })
}

function updateEmpExperiance(data) {
    return new Promise((resolve, reject) => {
        let expList = getExpList(data['experiances'], data['empId'], false);
        if (expList.length > 0) {
            expModule.updateExpById(expList[0], function (resp) {
                console.log('updateEmpExperiance resp:', resp);
                (!resp) ? reject(false) : resolve(true);
            });
        } else {
            console.log('No records avaliable to update employee experiance resp:');
            resolve(true);
        }
    })
}

function getExpList(exp, empId, getNewExperiances) {
    let expList = [];
    exp.map(data => {
        if (getNewExperiances && data.experianceId == 0) {
            let newExpSet = [empId, data['skill'], data['expInMonths']];
            expList.push(newExpSet);
        } else if (!getNewExperiances && data.experianceId != 0) {
            expList.push(data);
        }
    });
    return expList;
}

//Delete data set by id
app.delete('/api/employees/:id', verifyToken, (req, resp) => {
    console.log('deleteRecordById: ', req.params.id);
    userModule.deleteRecordById(req.params.id, function (data) {
        console.log('deleteRecordById success:', data, 'ID: ', req.params.id);
        if (data) {
            userModule.getAllRecords(function (data) {
                console.log('After successfull delete send allRecords: ', data)
                resp.send(data);
            });
        } else {
            resp.status(404).send('Failed to delete employee');
        }
    });
});

//update data set by id
// app.put('/api/courses/:id', (req, resp) => {

//     let courseDetails = courses.find((list) => {
//         return list.id == parseInt(req.params.id)
//     });
//     console.log('Update:  id: ', req.params.id);
//     if (!courseDetails) {
//         resp.status(404).send('Course details not avaliable');
//         return;
//     }

//     let { error } = validateDetails(req.body); //Object destructuring ie. response.error is eq to {error}
//     console.log('Update: Server error: ', error)
//     if (error) {
//         resp.status(400).send(error.details[0].message);
//         return;
//     }

//     courseDetails.name = req.body.name;
//     courseDetails.age = req.body.age;
//     console.log('Update:  resp: ', courseDetails);
//     resp.send(courseDetails);
// });

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening port ${port}`));