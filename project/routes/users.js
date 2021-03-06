var express = require('express');
var router = express.Router();
var fs = require('fs');
var User = require("../models/users");
var Device = require("../models/device");
var HwData = require("../models/hwdata");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function (req, res, next) {
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) {
            res.status(401).json({
                success: false,
                error: "Error communicating with database."
            });
        } else if (!user) {
            res.status(401).json({
                success: false,
                error: "The email or password provided was invalid."
            });
        } else {
            bcrypt.compare(req.body.password, user.passwordHash, function (err, valid) {
                if (err) {
                    res.status(401).json({
                        success: false,
                        error: "Error authenticating. Please contact support."
                    });
                } else if (valid) {
                    var token = jwt.encode({
                        email: req.body.email
                    }, secret);
                    res.status(201).json({
                        success: true,
                        token: token
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        error: "The email or password provided was invalid."
                    });
                }
            });
        }
    });
});

/* Register a new user */
router.post('/register', function (req, res, next) {

    // FIXME: Add input validation
    bcrypt.hash(req.body.password, null, null, function (err, hash) {
        // Create an entry for the user
        var newUser = new User({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash // hashed password
        });

        newUser.save(function (err, user) {
            if (err) {
                // Error can occur if a duplicate email is sent
                res.status(400).json({
                    success: false,
                    message: err.errmsg
                });
            } else {
                res.status(201).json({
                    success: true,
                    message: user.fullName + " has been created."
                })
            }
        });
    });
});

router.get("/account", function (req, res) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({
            success: false,
            message: "No authentication token"
        });
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        var userStatus = {};

        User.findOne({
            email: decodedToken.email
        }, function (err, user) {
            if (err) {
                return res.status(200).json({
                    success: false,
                    message: "User does not exist."
                });
            } else {
                userStatus['success'] = true;
                userStatus['email'] = user.email;
                userStatus['fullName'] = user.fullName;
                userStatus['lastAccess'] = user.lastAccess;

                // Find devices based on decoded token
                Device.find({
                    userEmail: decodedToken.email
                }, function (err, devices) {
                    if (!err) {
                        // Construct device list
                        var deviceList = [];
                        for (device of devices) {
                            deviceList.push({
                                deviceId: device.deviceId,
                                apikey: device.apikey,
                                name: device.name
                            });
                        }

                        userStatus['devices'] = deviceList;
                        HwData.find({
                            userEmail: decodedToken.email
                        }, function (err, hwdatas) {
                            if (!err) {
                                var dataList = [];
                                for (hwdata of hwdatas) {
                                    dataList.push({
                                        latitude: hwdata.latitude,
                                        longitude: hwdata.longitude,
                                        speed: hwdata.speed,
                                        uv: hwdata.UVIndex
                                    });
                                }
                                userStatus['data'] = dataList;
                            }
                            return res.status(200).json(userStatus);
                        });
                    }

                });



            }
        });
    } catch (ex) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }

});

router.put("/update", function (req, res, next) {

    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({
            success: false,
            message: "No authentication token"
        });
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        var userStatus = {};

        bcrypt.hash(req.body.password, null, null, function (err, hash) {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: err.errmsg
                });
            } else {
                User.updateOne({
                        email: decodedToken.email
                    }, {
                        fullName: req.body.name,
                        passwordHash: hash,
                        email: req.body.email
                    },
                    function (err, user) {
                        if (err) {
                            res.status(400).json({
                                success: false,
                                message: err.errmsg
                            });
                        } else {
                            Device.updateMany({
                                    userEmail: decodedToken.email
                                }, {
                                    userEmail: req.body.email
                                },
                                function (err, devices) {
                                    if (err) {
                                        res.status(400).json({
                                            success: false,
                                            message: err.errmsg
                                        });
                                    } else {
                                        HwData.update({
                                                userEmail: decodedToken.email
                                            }, {
                                                $set: {
                                                    userEmail: req.body.email
                                                }
                                            }, {
                                                multi: true
                                            },
                                            function (err, hwdatas) {
                                                if (err) {
                                                    res.status(400).json({
                                                        success: false,
                                                        message: err.errmsg
                                                    });
                                                } else {

                                                    res.status(201).json({
                                                        success: true,
                                                        message: "Information has been updated successfully."
                                                    });
                                                    console.log(res.status);
                                                } //else
                                            } //function
                                        ); //update many										
                                    } //else
                                } //function
                            ); //update many
                        } //else
                    }); //function and update one	
            } //else
        });

    } catch (ex) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }
});

router.put('/updatedevice', function (req, res, next) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({
            success: false,
            message: "No authentication token"
        });
    }

    var authToken = req.headers["x-auth"];
    try {
        if(req.body.deviceId != null){
            Device.findOne({
                deviceId: req.body.deviceId
            }, function (err, device) {
                if (device !== null) {
                    return res.status(400).json({
                        success: false,
                        message: "A device with that ID is already registered"
                    });
                } else {
                    Device.updateOne({
                            apikey: req.body.apikey
                        }, {
                            deviceId: req.body.deviceId,
                            name: req.body.name,
                        },
                        function (err, user) {
                            if (err) {
                                res.status(400).json({
                                    success: false,
                                    message: err.errmsg
                                });
                            } else {
                                Device.update({
                                        apikey: req.body.apikey
                                    }, {
                                        $set: {
                                            deviceId: req.body.deviceId,
                                            name: req.body.name
                                        }
                                    }, {
                                        multi: false
                                    },
                                    function (err, devices) {
                                        if (err) {
                                            res.status(400).json({
                                                success: false,
                                                message: err.errmsg
                                            });
                                        } else {
                                            res.status(201).json({
                                                success: true,
                                                message: "Device information has been updated successfully."
                                            });
                                        }
                                    })
    
                            }
    
                        });
                }
            });
        }else{
            Device.updateOne({
                apikey: req.body.apikey
            }, {
                name: req.body.name,
            },
            function (err, user) {
                if (err) {
                    res.status(400).json({
                        success: false,
                        message: err.errmsg
                    });
                } else {
                    Device.update({
                            apikey: req.body.apikey
                        }, {
                            $set: {
                                name: req.body.name
                            }
                        }, {
                            multi: false
                        },
                        function (err, devices) {
                            if (err) {
                                res.status(400).json({
                                    success: false,
                                    message: err.errmsg
                                });
                            } else {
                                res.status(201).json({
                                    success: true,
                                    message: "Device information has been updated successfully."
                                });
                            }
                        })

                }

            });
        }
        

    } catch (ex) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }


});

router.post('/deletedevice', function (req, res, next) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({
            success: false,
            message: "No authentication token"
        });
    }
    try {
        Device.deleteOne({
                apikey: req.body.apikey
            },
            function (err, user) {
                if (err) {
                    res.status(400).json({
                        success: false,
                        message: err.errmsg
                    });
                } else {
                    res.status(201).json({
                        success: true,
                        message: "Device has been deleted successfully."
                    });

                }

            });
    } catch (ex) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }


});

module.exports = router;