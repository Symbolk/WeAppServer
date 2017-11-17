'use strict'

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var WHModel = mongoose.model('Wanghong');


/* GET users listing. */
router.get('/', function (req, res, next) {
  WHModel.find({}, function (err, docs) {
    res.send(JSON.stringify(docs));
  })
});

/**
 * Check if one wanghong exists in the system or not
 */
router.route('/exists/:whname').get(function (req, res, next) {
  let condition = {
    whname: req.params.whname
  };

  WHModel.count(condition, function (err, count) {
    if (err) {
      console.log(err);
    } else {
      if (count != 0) {
        res.send({ exists: true });
      } else {
        res.send({ exists: false });
      }
    }
  });
});

/**
 * Add one wanghong by the user
 */
router.post('/addWH', function (req, res, next) {
  let operation = {
    whname: req.body.whname,
    sex: req.body.sex,
    avatar: req.body.avatar,
    weibo: req.body.weibo,
    baike: req.body.baike
  };
  WHModel.create(opeation, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.send({ msg : "添加网红成功!" });
    }
  });
});


module.exports = router;
