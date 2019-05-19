var express = require('express');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');
var pathConveter = require('path');
var auth = require('../middleware/auth-storage');

router.get('/*', auth, function async(req, res, next) {
  try {
    let path = '/' + req.params[0];
    if (fs.existsSync(URL.directory + path)) {
      console.log(URL.directory + path);
      res.sendFile(pathConveter.join(URL.directory + path));
    } else {
      res.status(404).send('File not exist!');
    }
  } catch (error) {
    res.status(500).send('error');
  }
});

module.exports = router;
