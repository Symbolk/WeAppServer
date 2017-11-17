'use strict'

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var StarModel = mongoose.model('Star');
var UserModel = mongoose.model('User');
var myDate = new Date();

/**
 * Get all stars in the database, as a string
 */
router.get('/', function (req, res, next) {
    StarModel.find({}, function (err, docs) {
        res.send(JSON.stringify(docs));
    });
});

/**
 * TEMP
 * Create some data in the database
 */
router.get('/init', function (req, res) {
    let operation = {
        starname: '鹿晗',
        sex: 'female',
        avatar: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1509010013642&di=0782e2c8a26cf02704a031967be809f3&imgtype=0&src=http%3A%2F%2Fimg.mp.itc.cn%2Fupload%2F20170708%2F13d8a274edb54ed5903ebb025759a97f_th.jpg',
        flowernum: 999,
        score: 999
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
    let condition = {
        username: req.body.username
    };
    UserModel.findOne(condition, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            let hasFlowered = doc.floweredToday.some(function (p) {
                return (p.starname == req.body.starname);
            });

            if (!hasFlowered){
                if (doc.floweredToday.length < 3) {
                    // add one flower for the star
                    condition = {
                        starname: req.body.starname
                    };
                    let operation = {
                        $inc: {
                            flowernum: 1
                        }
                    };
                    StarModel.update(condition, operation, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({ msg: req.body.starname + '+1', success: true });
                        }
                    });

                    // add the star for the user
                    condition = {
                        username: req.body.username
                    };
                    operation = {
                        $addToSet: {
                            floweredToday: {
                                starname: req.body.starname,
                                date: myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDay()
                            }
                        }
                    };
                    UserModel.update(condition, operation, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(condition.username + ' flowered ' + req.body.starname);
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
    let condition={
        username: req.body.username        
    };
    UserModel.findOne(condition, function(err, doc){
        if(err){
            console.log(err);
        }else{
            let hasFlowered = doc.floweredToday.some(function (p) {
                return (p.starname == req.body.starname);
            });
            if(hasFlowered){
                condition = {
                    starname: req.body.starname
                };
                let operation = {
                    $inc: {
                        flowernum: -1
                    }
                };
                StarModel.findOneAndUpdate(condition, operation, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send({ msg: req.body.starname + '-1', success: true });
                    }
                });

                // add the star for the user
                condition = {
                    username: req.body.username
                };
                operation = {
                    $pull: {
                        floweredToday: {
                            starname: req.body.starname
                        }
                    }
                };
                UserModel.update(condition, operation, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(condition.username + ' unflowered ' + req.body.starname);
                    }
                });
            }else{
                res.send({ msg: "今天还没有赞过ta呢", success: false });                
            }
        }
    });
});

/**
 * Get all stars in the database as an array
 */
router.get('/getAllStars', function (req, res) {
    StarModel.find({})
    .sort({ flowernum: -1 })
    .exec(function (err, docs) {
        if (err) {
            console.log(er);
        } else {
            let allStarsList = new Array();
            for (let d of docs) {
                allStarsList.push(d);
            }
            res.send({ data: allStarsList });
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
router.get('/getMaleStars', function (req, res) {
    StarModel.find({ sex: "male" })
        .sort({ flowernum: -1 })
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
router.get('/getFemaleStars', function (req, res) {
    StarModel.find({ sex: "female" })
        .sort({ flowernum: -1 })
        .exec(function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.send(JSON.stringify(docs));
            }
        });
});

module.exports = router;
