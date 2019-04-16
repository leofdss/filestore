//require express library
let express = require('express');
//require the express router
let router = express.Router();
var request = require('request');
let path = require('path');
var fs = require("fs");
const URL = require('../url');

router.get('/readdir:path', function async(req, res, next) {
  // render the index page, and pass data to it.
  readdir(req, res);
});

router.get('/readdir', function async(req, res, next) {
  // render the index page, and pass data to it.
  readdir(req, res);
});

function readdir(req, res) {
  let path;
  console.log(req.params.path);
  if (req.params.path) {
    path = req.params.path.replace(/:/g, '/');
  } else {
    path = '/'
  }
  fs.readdir(URL.directory + path, function (err, files) {
    res.send({ "files": files });
  });
}

module.exports = router;