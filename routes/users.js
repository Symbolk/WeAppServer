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
router.route('/exists/:oid').get(function (req, res, next) {
  let condition = {
    openid: req.params.oid
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
        avatar: req.body.avatar,
        sumContribution:0
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
 * Get a user's info(including username, favStar, title)
 */
router.route('/getUserInfo/:username').get(function (req, res, next) {
  updateInfo(req.params.username);
  let fields = {
    _id: 0,
    username: 1,
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
 * Judge if the star is flowered today
 */

// router.get('/floweredToday/:username/:starname', function (req, res, next) {
//   UserModel.findOne({ username: req.params.username }, { _id: 0, floweredToday: 1 }, function (err, doc) {
//     if (err) {
//       console.log(err);
//     } else {
//       let hasFlowered = doc.floweredToday.some(function (p) {
//         return (p.starname == req.params.starname);
//       });
//       res.send({flowered: hasFlowered});
//     }
//   });
// });

/**
 * Get all ever flowered stars and the user's contributions
 * for selection in the rank page
 */
router.route('/getEverStars/:oid').get(function (req, res, next) {
  let condition={
    openid: req.params.oid
  };
  let fields = {
    _id: 0,
    flowerHistory:1
  };
  UserModel.findOne(condition, fields, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      let everFlowered = new Array();
      for (let d of doc.flowerHistory) {
          everFlowered.push(d);
      }
      res.send({data : everFlowered });
    }
  });

});

/**
 * Get all users and rank them
 */
router.route('/getAllUsers').get(function(req, res, next){
  let fields={
    _id: 0,
    username: 1,
    openid: 1,// just to make sure unique
    avatar: 1,
    title: 1,
    flowerHistory: 1,
    favStar: 1,
    sumContribution: 1
  };
  
  UserModel.find({}, fields,  { sort: { sumContribution: -1 }, limit: 100 }, function(err, docs){
    if(err){
      console.log(err);
    }else{
      // recompute the favStar and sum contribution for all users
      let usersList = new Array();
      for (let d of docs) {
        let sum_contri=0;
        // find the fav star
        if(d.flowerHistory.length>0){
          var fav=d.flowerHistory[0];
          for(let fh of d.flowerHistory){
            sum_contri+=fh.contribution;
            if(fh.contribution > fav.contribution){
              fav=fh;
            }
          }
        }
        d.sumContribution=sum_contri;
        d.favStar=fav;
        usersList.push(d);
        // update the database
        UserModel.update({ openid: d.openid },
          { $set: {favStar: fav, sumContribution: sum_contri}},
          function(err){
            if(err){
              console.log(err);
            }
          });
      }
      // console.log(usersList);
      res.send({data : usersList });
    }
  });  

});

module.exports = router;
