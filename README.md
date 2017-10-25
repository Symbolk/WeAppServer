# WeApp Server

---

** A Node.js+Express+MongoDB Server for WeApp(Wexin Mini App) **

_Powered By [@Symbolk](http://www.symbolk.com)_

## Overview

Language : 

> [Javascrip]

Based on :

> [Express](http://www.expressjs.com.cn/ "Express offical site") 

> [Mongodb](https://www.mongodb.com/ "Mongodb offical site")

Requirements :

> OS: Windows or Linux

> Node.js ~6.11.0

> Express ~4.15.0

> Mongodb ~3.4.7

_P.S. See npm dependencies in package.json_
 
---
## Usage

## Development(Windows)

1, Start mongodb service with the command:

```shell
# Make a new folder as your database, e.g. d:\database
mongod --dbpath d:\database
```
2, Create the database required in another CMD:

```sh
# get into the interactive shell of mongodb
mongo
# create the userinfo database
> use userinfo;
# check the current database
> show dbs;
> db;

```
3, Under the project folder, install the package dependencies:

```sh
cd Server
npm install
```

4, Start the server:

```sh
# test or debug it locally(automatically restart server once code changed)
npm test
# or use nodemon directly
nodemon app.js
```

## Delpoyment(Aliyun CentOS)

1, Start mongodb service with the command:

```shell
# Make a new folder as your database, e.g. d:\database
nohup mongod --dbpath /var/www/database &
```

2, Edit app.js in the end:

```javascript
// nodemon or npm test
// app.listen(3000);
// npm start
app.listen(4000);
module.exports = app; 
```
3, Start the server:

```sh
forever start app.js
```