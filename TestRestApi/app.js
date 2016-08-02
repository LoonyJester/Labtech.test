console.log('start');

var lt = require('./LabTech.js')([url], [username], [password]);



lt.AssignToken().then(function (response) {
    lt.Computers.GetAll().then(function (result) {
        success(result);
    });
}).catch(function (err) {
    error(err);
});

console.log('finish');






