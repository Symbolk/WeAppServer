const mongoose = require('mongoose');
const config = require('./config/dev');
// const config=require('./config/pro');
const schedule = require('node-schedule');
const DB_URL = config.database;
mongoose.connect(DB_URL, { useMongoClient: true });
const db = mongoose.connection;

// const User = require('../models/user.js');

db.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});


db.on('connected', function () {
    console.log('Mongoose connected to ' + DB_URL);
});

db.once('open', function () {
    console.log('Mongoose connecting to ' + DB_URL);
});

// create the user schema
var UserSchema = new mongoose.Schema({
    uid: { type: Number, required: true, unique: true },
    openid: { type: String, required: true, index: true }, // the unique identifier for one user
    username: { type: String, required: true }, // the nickName in Wechat, may not be unique
    avatar: { type: String },
    gender: { type: String },
    floweredToday: [ // at most 3 for one day
        {
            starname: { type: String },
            date: { type: String }
        }
    ],
    flowerHistory: [
        {
            starname: { type: String },
            contribution: { type: Number, default: 0 }
        }
    ],
    floweredWHToday: [ // at most 3 for one day
        {
            whname: { type: String },
            date: { type: String }
        }
    ],
    flowerWHHistory: [
        {
            whname: { type: String },
            contribution: { type: Number, default: 0 }
        }
    ]
},
    // When no collection argument is passed, Mongoose pluralizes the name.
    { collection: 'users' }
);

// UserSchema.set('collection', 'users');
var User = mongoose.model('User', UserSchema, 'users');
console.log('User Model Created.');


// create star schema
var StarSchema = new mongoose.Schema({
    sid: { type: Number, required: true, unique: true, index: true },
    starname: { type: String, required: true },
    sex: { type: String }, //male or female
    avatar: { type: String },
    flowernum: { type: Number, default: 0 },
    score: { type: Number, default:0 },
    floweredToday: { type: Boolean, default: false }, // whether is flowered by the current user today
    supporters: [
        {
            openid: { type: String },
            username: { type: String },
            avatar: { type: String },
            title : { type: String },
            contribution: { type: Number, default: 1 }
        }
    ]
}, { collection: 'stars' });
var Star = mongoose.model('Star', StarSchema, 'stars');
console.log('Star Model Created.');

// create wanghong(网红) schema
var WanghongSchema = new mongoose.Schema({
    wid: { type: Number, required: true, unique: true, index: true },
    submiter: { type: String }, // submiter's openid
    whname: { type: String, required: true },
    sex: { type: String },
    avatar: { type: String },
    flowernum: { type: Number, default: 0 },
    floweredWHToday: { type: Boolean, default: false }, // whether is flowered by the current user today
    score: { type: Number },
    weibo: { type: String },
    baike: { type: String },
    workLinks: [],
    verified: { type: Boolean, default: false }
}, { collection: 'wanghongs' });
var Wanghong = mongoose.model('Wanghong', WanghongSchema, 'wanghongs');
console.log('Wanghong Model Created.');

db.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

var rule = new schedule.RecurrenceRule();
rule.hour = 0; rule.minute = 0; rule.second = 0;
// var rule='*/4 * * * * *';
schedule.scheduleJob(rule, function () {
    // update the user's flowered today list
    User.update({},
        { $set: { floweredToday: [], floweredWHToday:[] } },
        { multi: true }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("FloweredToday has been reset.");
            }
        });
});


module.exports = mongoose;