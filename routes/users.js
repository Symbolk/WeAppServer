'use strict'

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var UserModel = mongoose.model('User');


/* GET users listing. */
router.get('/', function (req, res, next) {
  UserModel.find({}, function (err, docs) {
    res.send(JSON.stringify(docs));
  });
});

/**
 * Check if one user exists in the system or not
 */
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
  UserModel.find({}, function(err,docs){
    if(err){
      console.log(err);
    }else{
      let index=docs.length;
      let operation = {
        uid: index,
        openid: req.body.openid,
        username: req.body.username,
        avatar: req.body.avatar
      };
      UserModel.create(operation, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log('New user ' + req.body.username);
          res.send({ msg: 'Welcome new ' + req.body.username });
        }
      });
    }
  });

});

/**
 * Get a user's info(only returns necessary data)
 */
router.route('/getUserInfo/:username').get(function (req, res, next) {
  updateInfo(req.params.username);
  let fields = {
    _id: 0,
    username: 1,
    avatar: 1,
    title: 1,
    favStar: 1
  };
  UserModel.findOne({ username: req.params.username }, fields, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.send(doc);
    }
  });
});

/**
 * Calculate the user's favStar and title
 */

function updateInfo(username) {

}

/**
 * Judge if the star is flowered today
 */

router.get('/floweredToday/:username/:starname', function (req, res, next) {
  UserModel.findOne({ username: req.params.username }, { _id: 0, floweredToday: 1 }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      let hasFlowered = doc.floweredToday.some(function (p) {
        return (p.starname == req.params.starname);
      });
      res.send({flowered: hasFlowered});
    }
  });
});
module.exports = router;
