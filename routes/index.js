var express = require('express');
var router = express.Router();
var request = require('request');
const config = require('../config/dev');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/wxlogin', function(req, res, next){
  var code=req.body.code;
  var encryptedData=req.body.encryptedData;
  var iv=req.body.iv;
  var URL='https://api.weixin.qq.com/sns/jscode2session?appid='+config.APPID
  +'&secret='+config.APPSEC
  +'&js_code='+code
  +'&grant_type=authorization_code';
  request.get({
    url: URL
  }, function(err, response, body){
    if(err){
      console.log(err);
    }else{
      if(response.statusCode == 200){
        var data=JSON.parse(body);
        var access_token = data.access_token;
        var openid= data.openid;
        res.send({ openid: openid });
      }
    }
  });
});

module.exports = router;
