var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [
        {
            "dateTime": Date,
            "userAgent": String
        }
    ]
})

let User;


exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://imssjassal:XrbV2VC1NqZv58Oh@senecaweb.pv3xiob.mongodb.net/Users?retryWrites=true&w=majority");

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password == userData.password2) {
            let newUser = new User(userData);
            bcrypt.hash(newUser.password, 10)
                .then((hash) => {
                    newUser.password = hash;
                    return newUser.save();
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    if (err.code == 11000) {
                        reject("User name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                });
        }   
        else {
            reject("Passwords do not match")
        }
    })
}

exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length == 0) {
                    reject("Unable to find user: " + userData.userName)
                }
                else {
                    bcrypt.compare(userData.password, users[0].password)
                        .then((result) => {
                            if (result === true) {
                                users[0].loginHistory.push({
                                    dateTime: (new Date()).toString(),
                                    userAgent: userData.userAgent
                                });

                                User.updateOne(
                                    { userName: userData.userName },
                                    { $set: { loginHistory: users[0].loginHistory } }
                                ).exec()
                                .then(() => 
                                {
                                    resolve(users[0]);
                                })
                                .catch((err) => 
                                {
                                    reject("There was an error updating the user's login history: " + err);
                                });
                            } else 
                            {
                                reject("Incorrect Password for user:" + userData.userName);
                            }
                        })
                        .catch((err) => {
                            reject("An error occured: " + err);
                        });
                }
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName)
            })
    })
}