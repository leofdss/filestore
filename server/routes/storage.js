var express = require('express');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');

router.get('/readdir:path', function async(req, res, next) {
  readdir(req, res);
});

router.get('/readdir', function async(req, res, next) {
  readdir(req, res);
});

function readdir(req, res) {
  try {
    let path;
    if (req.params.path) {
      path = req.params.path.replace(/:/g, '/');
    } else {
      path = '/'
    }
    fs.readdir(URL.directory + path, function (err, files) {
      res.send({ files: files });
    });
  } catch (error) {
    res.status(500).send('error');
  }
}

module.exports = router;