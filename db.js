const mongoose = require('mongoose');
const config=require('./config/dev');

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
    uid: { type:Number, required:true, unique:true, index:true },
	username: { type:String, required:true},
    avatar:   { type:String },
	gender:   { type:String },    
    title:    { type:String, default:"青铜" },
    favStar: { 
        starname: { type: String },
        contribution: { type: Number }
    }, // guarding star
	floweredToday:[ // at most 3 for one day
        { 
            starname: { type: String }, 
            date: { type: String}
        }
    ],
	flowerHistory:[
        {
            starname: { type: String },
            contribution: { type: Number }
        }
    ]
	// rank:     { type:Number }
},
    // When no collection argument is passed, Mongoose pluralizes the name.
    { collection: 'users' }
);

// UserSchema.set('collection', 'users');
var User = mongoose.model('User', UserSchema, 'users');
console.log('User Model Created.');


// create star schema
var StarSchema = new mongoose.Schema({
    id: { type:Number, required:true, unique:true, index:true },
    starname: { type:String, required:true},
    sex: { type: String }, //male or female
	avatar:   { type:String },
    flowernum:    { type:Number, default:0 },
    score: { type: Number},
    floweredToday: { type: Boolean, default:false } // whether is flowered by the current user today
}, { collection: 'stars' });
var Star = mongoose.model('Star', StarSchema, 'stars');
console.log('Star Model Created.');

// create wanghong(网红) schema
var WanghongSchema = new mongoose.Schema({
    wid: { type:Number, required:true, unique:true, index:true },
    whname: { type:String, required:true },
    sex: { type : String },
	avatar:   { type:String },
    flowernum:    { type:Number, default:0 },
    score: { type: Number},
    weibo:  { type:String },
    baike:  { type:String },
    links:[
        {
            link: { type: String }
        }
    ]
}, { collection: 'wanghongs' });
var Wanghong = mongoose.model('Wanghong', WanghongSchema, 'wanghongs');
console.log('Wanghong Model Created.');

db.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

module.exports = mongoose;