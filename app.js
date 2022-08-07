// For HTTP Errors --> npm install http-errors
const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
// https://www.geeksforgeeks.org/what-is-morgan-in-node-js/  -- used for logging
const logger = require('morgan');

// Environment variables
// Read .env file -- could work here but you dont want in Docker 
//   -- only local -- use it in package.json
// https://nodejs.dev/learn/how-to-read-environment-variables-from-nodejs
// npm install dotenv --save
require('dotenv').config();

// Note: process does not require a "require", it's automatically available.
//-- added for debugging  **** Note ***** Create these in a .env file (look at .env.example)
//var whitelist=["http://localhost","http://localhost:80","http://camv-d10dfdev1", "http://camv-d10dfdev1:80"]
// This file sets the ports/url/etc. -- but needs values exported?
require('./envConfig');

// Mongo URI - for local testing, but can read from envirionment if you want to change it there -- 
// const mongoUrl = 'mongodb://localhost:27017/mongouploads';
// console.log(`\r\n**** In the app.js module - Gridfs db mongoURI url:${mongoUrl}\r\n`);
var whitelist = process.env.WHITELIST;  

// Debug to see what we got from the environment
console.log(`\r\nwhitelist:${whitelist} `);

// Middleware
// Define the express app
const app = express();

// OLD -- > app.use(express.json());
app.use(bodyParser.json());
app.use(methodOverride('_method'));
// -- Setup Debug to show each post --  just gives timestamps, but also used for logging features
//var morgan = require('morgan')
//app.use(morgan('combined'));
// dev -- Concise output colored by response status for development use. 
app.use(logger('dev'));
app.use(express.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({extended: true}));   //GEL added to help parse arrays

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     console.log(`Missing URL Http:req ${req}`);   // GEL add
//     next(createError(404));
// });



// https://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connec
    var r_origin = req.headers.origin;
    
    if (whitelist.indexOf(r_origin) > -1)
        res.setHeader("Access-Control-Allow-Origin", r_origin);

    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
1
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Api version in URL 
const VERSION = "/v0.1.0"
const GRIDFS_API_URL = "/api"; // + VERSION;

app.use(GRIDFS_API_URL + '/data', require('./routes/data').router);
app.use(GRIDFS_API_URL + '/equipment', require('./routes/equipment').router);
app.use(GRIDFS_API_URL + '/dictionary', require('./routes/dataDictionary'));
app.use(GRIDFS_API_URL + '/gfs', require('./routes/file'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log(`Missing URL Http:req ${req}`);   // GEL add
    next(createError(404));
});


app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index');
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

module.exports = app;