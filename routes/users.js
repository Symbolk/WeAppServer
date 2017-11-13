'use strict'

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var UserModel = mongoose.model('User');


/* GET users listing. */
router.get('/', function (req, res, next) {
  UserModel.find({}, function (err, docs) {
    res.send(JSON.stringify(docs));
  })
});

// check if one user exists
router.route('/exists/:username').get(function (req, res, next) {
  let condition = {
    username: req.params.username
  };
  UserModel.count(condition, function (err, count) {
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

router.post('/createUser', function (req, res, next) {
  let operation = {
    username: req.body.username,
    avatar: req.body.avatar
  };
  UserModel.create(operation, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log('++User' + req.body.username);
      res.send({ msg: 'Welcome new ' });
    }
  });
});

module.exports = router;
