var express = require('express');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');

router.get('/:path', function async(req, res, next) {
  try {
    let path = URL.directory + req.params.path.replace(/:/g, '/');
    if (fs.existsSync(path)) {
      fs.createReadStream(path).pipe(res);
    } else {
      res.status(404).send('File not exist!');
    }
  } catch (error) {
    res.status(500).send('error');
  }
});

module.exports = router;
