'use strict'

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var StarModel = mongoose.model('Star');
var UserModel = mongoose.model('User');
var util = require('./util.js');

/**
 * Get all stars in the database, as a string
 */
router.get('/', function (req, res, next) {
    StarModel.find({}, function (err, docs) {
        res.send(JSON.stringify(docs));
    });
});

/**
 * ONLY FOR TEST
 * Create some data in the database
 */
router.get('/createStar', function (req, res) {
    
    let operation = {
        sid: 3,
        starname: '李易峰',
        sex: 'male',
        avatar: 'http://img4.imgtn.bdimg.com/it/u=1343872547,3812704371&fm=27&gp=0.jpg',
        flowernum: 245,
        score: 200
    };
    StarModel.create(operation, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('++ ' + operation.starname);
            res.send({ msg: '++' });
        }
    })
});

/**
 * Flower one star
 */
router.post('/flowerStar', function (req, res) {
    var operation = {};
    UserModel.findOne({ openid: req.body.openid }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            let hasFlowered = doc.floweredToday.some(function (p) {
                return (p.starname == req.body.starname);
            });

            if (!hasFlowered) {
                if (doc.floweredToday.length < 3) {
                    // add one flower for the star
                    operation = {
                        $inc: {
                            flowernum: 1
                        }
                    };
                    StarModel.update({ starname: req.body.starname }, operation, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({ msg: req.body.starname + '+1', success: true });
                        }
                    });

                    // add the star for the user
                    operation = {
                        $addToSet: {
                            floweredToday: {
                                starname: req.body.starname,
                                date: util.getNowFormatDate()
                            }
                        }
                    };
                    UserModel.update({ openid: req.body.openid }, operation, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(req.body.username + ' flowered ' + req.body.starname);
                        }
                    });
                    // add the user's contribution to all flowered stars
                    UserModel.findOne({ openid: req.body.openid }, { _id: 0, flowerHistory: 1 }, function (err, doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            let everFlowered = doc.flowerHistory.some(function (p) {
                                return (p.starname == req.body.starname);
                            });
                            if (everFlowered) {
                                operation = {
                                    $inc: {
                                        "flowerHistory.$.contribution": 1
                                    }
                                };
                                UserModel.update({ openid: req.body.openid, "flowerHistory.starname": req.body.starname }, operation, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(req.body.username + "+ 1 for " + req.body.starname);
                                    }
                                });
                            } else {
                                operation = {
                                    $addToSet: {
                                        flowerHistory: {
                                            starname: req.body.starname,
                                            contribution: 1
                                        }
                                    }
                                };
                                UserModel.update({ openid: req.body.openid }, operation, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(req.body.username + "++1 to " + req.body.starname);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.send({ msg: "没有赞了今天", success: false });
                }
            } else {
                res.send({ msg: "今天已经赞过了", success: false });
            }
        }
    });
});

/**
 * Unflower a star
 */
router.post('/unflowerStar', function (req, res) {
    let operation = {};
    UserModel.findOne({ openid: req.body.openid }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            let hasFlowered = doc.floweredToday.some(function (p) {
                return (p.starname == req.body.starname);
            });
            if (hasFlowered) {
                operation = {
                    $inc: {
                        flowernum: -1
                    }
                };
                StarModel.findOneAndUpdate({ starname: req.body.starname }, operation, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send({ msg: req.body.starname + '-1', success: true });
                    }
                });

                // add the star for the user
                operation = {
                    $pull: {
                        floweredToday: {
                            starname: req.body.starname
                        }
                    }
                };
                UserModel.update({ openid: req.body.openid }, operation, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.body.username + ' unflowered ' + req.body.starname);
                    }
                });
                // decrease the user's contribution to the unflowered star
                UserModel.findOne({ openid: req.body.openid }, { _id: 0, flowerHistory: 1 }, function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        let everFlowered = doc.flowerHistory.some(function (p) {
                            return (p.starname == req.body.starname);
                        });
                        if (everFlowered) { // to make sure
                            operation = {
                                $inc: {
                                    "flowerHistory.$.contribution": -1
                                }
                            };
                            UserModel.update({ openid: req.body.openid, "flowerHistory.starname": req.body.starname }, operation, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(req.body.username + "-1 to " + req.body.starname);
                                }
                            });
                        } else {
                            console.log("Unreachable case.");
                        }
                    }
                });
            } else {
                res.send({ msg: "今天还没有赞过ta呢", success: false });
            }
        }
    });
});

/**
 * Get all stars in the database as an array
 */
router.get('/getAllStars/:oid', function (req, res) {
    let fields = {
        _id: 0, 
        sid: 1, 
        starname: 1, 
        flowernum: 1, 
        avatar: 1
     };
    StarModel.find({}, fields, { sort: { flowernum: -1 }, limit: 100 }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            let allStarsList = new Array();
            for (let d of docs) {
                allStarsList.push(d);
            }
            UserModel.findOne({ openid: req.params.oid }, { _id: 0, floweredToday: 1 }, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    for (let d of allStarsList) {
                        let hasFlowered = doc.floweredToday.some(function (p) {
                            return (p.starname == d.starname);
                        });
                        if (hasFlowered) {
                            d.floweredToday = true;
                        } else {
                            d.floweredToday = false;
                        }
                    }
                    res.send({ data: allStarsList });
                }
            });
        }
    });
});



/**
 * Get a limited number of stars(for one page display)
 */
router.get('/getNStars/:num', function (req, res) {
    // or: find(Conditions,fields,options,callback);
    // like:   Model.find({},null,{limit: 3, sort:{age:-1}},function(err,docs){
    StarModel.find({})
        .sort({ flowernum: -1 })
        .limit(Number(req.params.num))
        .exec(function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.send(JSON.stringify(docs));
            }
        });
});

/**
 * Get a limited number of stars(for one page display)
 */
router.get('/getMaleStars/:oid', function (req, res) {
    StarModel.find({ sex: 'male' }, { _id: 0, id: 1, starname: 1, flowernum: 1, avatar: 1, floweredToday: 1 }, { sort: { flowernum: -1 } }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            let allStarsList = new Array();
            for (let d of docs) {
                allStarsList.push(d);
            }
            UserModel.findOne({ openid: req.params.oid }, { _id: 0, floweredToday: 1 }, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    for (let d of allStarsList) {
                        let hasFlowered = doc.floweredToday.some(function (p) {
                            return (p.starname == d.starname);
                        });
                        if (hasFlowered) {
                            d.floweredToday = true;
                        } else {
                            d.floweredToday = false;
                        }
                    }
                    res.send({ data: allStarsList });
                }
            });

        }
    });
});

/**
 * Get a limited number of stars(for one page display)
 */
router.get('/getFemaleStars/:oid', function (req, res) {
    StarModel.find({ sex: 'female' }, { _id: 0, id: 1, starname: 1, flowernum: 1, avatar: 1, floweredToday: 1 }, { sort: { flowernum: -1 } }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            let allStarsList = new Array();
            for (let d of docs) {
                allStarsList.push(d);
            }
            UserModel.findOne({ openid: req.params.oid }, { _id: 0, floweredToday: 1 }, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    for (let d of allStarsList) {
                        let hasFlowered = doc.floweredToday.some(function (p) {
                            return (p.starname == d.starname);
                        });
                        if (hasFlowered) {
                            d.floweredToday = true;
                        } else {
                            d.floweredToday = false;
                        }
                    }
                    res.send({ data: allStarsList });
                }
            });

        }
    });
});

module.exports = router;
