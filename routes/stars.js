'use strict'

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var StarModel = mongoose.model('Star');
var UserModel = mongoose.model('User');
var myDate=new Date();

/* GET users listing. */
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


router.post('/flowerStar', function (req, res) {
    let condition = {
        username: req.body.username
    };

    UserModel.findOne(condition, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            if (doc.floweredToday.length < 3) {
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
                        res.send({ msg: operation.starname + '+1', success: true });
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
                            date:  myDate.getFullYear()+"-"+(myDate.getMonth()+1)+"-"+myDate.getDate()
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
                res.send({ msg: '没有赞了今天', success: false });
            }
        }
    });
});

router.get('/getAllStars', function (req, res) {
    StarModel.find({}, function (err, docs) {
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

module.exports = router;
