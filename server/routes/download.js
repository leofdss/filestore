var express = require('express');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');
var pathConveter = require('path');
var auth = require('../middleware/auth-storage');

router.get('/:path', auth, function async(req, res, next) {
  try {
    let path = URL.directory + req.params.path.replace(/:/g, '/');
    path = path.replace(/%20/g, ' ');
    if (fs.existsSync(path)) {
      res.sendFile(pathConveter.join(path));
    } else {
      res.status(404).send('File not exist!');
    }
  } catch (error) {
    res.status(500).send('error');
  }
});

module.exports = router;
