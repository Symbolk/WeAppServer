'use strict'

var fs = require('fs');
var multer = require('multer');
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var WHModel = mongoose.model('Wanghong');
var UserModel = mongoose.model('User');
var util = require('./util.js');

/**
 * Get all wanghong in the database, as a string
 */
router.get('/', function (req, res, next) {
  WHModel.find({}, function (err, docs) {
    res.send(JSON.stringify(docs));
  });
});

/**
 * Uppload avatar for wanghong
 */
var upload = multer({ dest: 'avatars/' });
var wh_avatar = "wh_";
router.post('/upload', upload.single('file'), function (req, res, next) {
  // 文件路径
  // var filePath = './' + req.file.filePath;
  var filePath = req.file.path;
  // 文件类型
  var fileType = req.file.mimetype;
  var format = '';
  switch (fileType) {
    case 'image/png':
      format = '.png';
      break;
    case 'image/jpeg':
      format = '.jpg';
      break;
    case 'image/jpg':
      format = '.jpg';
      break;
    default:
      format = '.png';
      break;
  }
  // 构建图片名
  var fileName = 'avatars/' + Date.now() + format;
  // 对临时文件转存，fs.rename(oldPath, newPath,callback);
  fs.rename(filePath, fileName, function(err){
    if (err) {
      console.log(err);
      res.end(JSON.stringify({ status: '102', msg: '头像上传失败' }));
    } else {
      wh_avatar=wh_avatar + fileName;
      console.log('Newly uploaded avatar: '+wh_avatar);
      // var formUploader = new qiniu.form_up.FormUploader(config);
      // var putExtra = new qiniu.form_up.PutExtra();
      // var key = fileName;

      // // 文件上传到七牛云
      // formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
      //   respBody, respInfo) {
      //   if (respErr) {
      //     res.end(JSON.stringify({status:'101',msg:'上传失败',error:respErr}));   
      //   }
      //   if (respInfo.statusCode == 200) {
      //     var imageSrc = 'http://o9059a64b.bkt.clouddn.com/' + respBody.key;
      //     res.end(JSON.stringify({status:'100',msg:'上传成功',imageUrl:imageSrc}));   
      //   } else {
      //     res.end(JSON.stringify({status:'102',msg:'上传失败',error:JSON.stringify(respBody)}));  
      //   }
      //   // 上传之后删除本地文件
      //   fs.unlinkSync(localFile);
      // });
    }
  });
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*"//允许跨域。。。
  });
})

/**
 * Create some data in the database
 */
router.post('/createWH', function (req, res) {
  WHModel.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      let index = docs.length;
      let operation = {
        wid: index,
        submiter: req.body.openid,     
        // whname: '陈一发儿',
        // sex: 'female',
        // avatar: 'http://img4.imgtn.bdimg.com/it/u=1343872547,3812704371&fm=27&gp=0.jpg',
        whname: req.body.whname,
        sex: req.body.sex,
        // avatar: req.body.avatar,
        avatar: 'https://xcx.toupaiyule.com/avatars/'+wh_avatar,
        weibo: req.body.weibo,
        baike: req.body.baike,
        workLinks: req.body.works,
        flowernum: 0,
      };
      WHModel.create(operation, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Newly submitted wanghong: ' + operation.whname);
          res.send({ msg: "添加网红成功!" });
        }
      });
    }
  });
});

/**
 * Flower one wanghong
 */
router.post('/flowerWH', function (req, res) {
  var operation = {};
  UserModel.findOne({ openid: req.body.openid }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      let hasFlowered = doc.floweredWHToday.some(function (p) {
        return (p.whname == req.body.whname);
      });

      if (!hasFlowered) {
        if (doc.floweredWHToday.length < 3) {
          // add one flower for the wanghong
          operation = {
            $inc: {
              flowernum: 1
            }
          };
          WHModel.update({ whname: req.body.whname }, operation, function (err) {
            if (err) {
              console.log(err);
            } else {
              res.send({ msg: req.body.whname + '+1', success: true });
            }
          });

          // add the wanghong for the user
          operation = {
            $addToSet: {
              floweredWHToday: {
                whname: req.body.whname,
                date: util.getNowFormatDate()
              }
            }
          };
          UserModel.update({ openid: req.body.openid }, operation, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log(req.body.username + ' flowered ' + req.body.whname);
            }
          });
          // add the user's contribution to all flowered wanghong
          UserModel.findOne({ openid: req.body.openid }, { _id: 0, flowerWHHistory: 1 }, function (err, doc) {
            if (err) {
              console.log(err);
            } else {
              let everFlowered = doc.flowerWHHistory.some(function (p) {
                return (p.whname == req.body.whname);
              });
              if (everFlowered) {
                operation = {
                  $inc: {
                    "flowerWHHistory.$.contribution": 1
                  }
                };
                UserModel.update({ openid: req.body.openid, "flowerWHHistory.whname": req.body.whname }, operation, function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(req.body.username + " + 1 for " + req.body.whname);
                  }
                });
              } else {
                operation = {
                  $addToSet: {
                    flowerWHHistory: {
                      whname: req.body.whname,
                      contribution: 1
                    }
                  }
                };
                UserModel.update({ openid: req.body.openid }, operation, function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(req.body.username + " ++1 to " + req.body.whname);
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
 * Unflower a wanghong
 */
router.post('/unflowerWH', function (req, res) {
  let operation = {};
  UserModel.findOne({ openid: req.body.openid }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      let hasFlowered = doc.floweredWHToday.some(function (p) {
        return (p.whname == req.body.whname);
      });
      if (hasFlowered) {
        operation = {
          $inc: {
            flowernum: -1
          }
        };
        WHModel.findOneAndUpdate({ whname: req.body.whname }, operation, function (err) {
          if (err) {
            console.log(err);
          } else {
            res.send({ msg: req.body.whname + '-1', success: true });
          }
        });

        // add the wanghong for the user
        operation = {
          $pull: {
            floweredWHToday: {
              whname: req.body.whname
            }
          }
        };
        UserModel.update({ openid: req.body.openid }, operation, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log(req.body.username + ' unflowered ' + req.body.whname);
          }
        });
        // decrease the user's contribution to the unflowered wanghong
        UserModel.findOne({ openid: req.body.openid }, { _id: 0, flowerWHHistory: 1 }, function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            let everFlowered = doc.flowerWHHistory.some(function (p) {
              return (p.whname == req.body.whname);
            });
            if (everFlowered) { // to make sure
              operation = {
                $inc: {
                  "flowerWHHistory.$.contribution": -1
                }
              };
              UserModel.update({ openid: req.body.openid, "flowerWHHistory.whname": req.body.whname }, operation, function (err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(req.body.username + " -1 to " + req.body.whname);
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
 * Get all wanghong in the database as an array
 */
router.get('/getAllWHs/:oid', function (req, res) {
  let fields = {
    _id: 0,
    wid: 1,
    whname: 1,
    flowernum: 1,
    avatar: 1
  };
  // only verified wanghong are returned
  WHModel.find({ verified: true }, fields, { sort: { flowernum: -1 }, limit: 100 }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      let allWHsList = new Array();
      for (let d of docs) {
        allWHsList.push(d);
      }
      UserModel.findOne({ openid: req.params.oid }, { _id: 0, floweredWHToday: 1 }, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          for (let d of allWHsList) {
            let hasFlowered = doc.floweredWHToday.some(function (p) {
              return (p.whname == d.whname);
            });
            if (hasFlowered) {
              d.floweredWHToday = true;
            } else {
              d.floweredWHToday = false;
            }
          }
          res.send({ data: allWHsList, num: allWHsList.length });
        }
      });
    }
  });
});



/**
 * Get a limited number of wanghong(for one page display)
 */
router.get('/getNWHs/:num', function (req, res) {
  // or: find(Conditions,fields,options,callback);
  // like:   Model.find({},null,{limit: 3, sort:{age:-1}},function(err,docs){
  WHModel.find({})
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
 * Get a limited number of wanghong(for one page display)
 */
router.get('/getMaleWHs/:oid', function (req, res) {
  WHModel.find({ sex: 'male', verified: true }, { _id: 0, id: 1, whname: 1, flowernum: 1, avatar: 1, floweredWHToday: 1 }, { sort: { flowernum: -1 } }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      let allWHsList = new Array();
      for (let d of docs) {
        allWHsList.push(d);
      }
      UserModel.findOne({ openid: req.params.oid }, { _id: 0, floweredWHToday: 1 }, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          for (let d of allWHsList) {
            let hasFlowered = doc.floweredWHToday.some(function (p) {
              return (p.whname == d.whname);
            });
            if (hasFlowered) {
              d.floweredWHToday = true;
            } else {
              d.floweredWHToday = false;
            }
          }
          res.send({ data: allWHsList, num: allWHsList.length });
        }
      });

    }
  });
});

/**
 * Get a limited number of wanghongs(for one page display)
 */
router.get('/getFemaleWHs/:oid', function (req, res) {
  WHModel.find({ sex: 'female', verified: true }, { _id: 0, id: 1, whname: 1, flowernum: 1, avatar: 1, floweredWHToday: 1 }, { sort: { flowernum: -1 } }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      let allWHsList = new Array();
      for (let d of docs) {
        allWHsList.push(d);
      }
      UserModel.findOne({ openid: req.params.oid }, { _id: 0, floweredWHToday: 1 }, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          for (let d of allWHsList) {
            let hasFlowered = doc.floweredWHToday.some(function (p) {
              return (p.whname == d.whname);
            });
            if (hasFlowered) {
              d.floweredWHToday = true;
            } else {
              d.floweredWHToday = false;
            }
          }
          res.send({ data: allWHsList, num: allWHsList.length });
        }
      });

    }
  });
});


/**
 * Check if one wanghong exists in the system or not
 */
router.route('/checkExists/:whname').get(function (req, res, next) {
  let condition = {
    whname: req.params.whname
  };

  WHModel.find(condition, {_id:0, whname: 1, avatar: 1}, { limit:3 },function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      if (docs.length!= 0) {
        let possible=new Array();
        for(let d of docs){
          possible.push(d);
        }
        res.send({ exists: true, data: possible });
      } else {
        res.send({ exists: false });
      }
    }
  });
});



module.exports = router;
