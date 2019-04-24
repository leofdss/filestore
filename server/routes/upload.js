var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth-storage');
var upload = require('../middleware/multer-upload');
const URL = require('../url');

router.get('/', function async(req, res, next) {
  // render the index page, and pass data to it.
  res.render('index', { title: 'Upload' });
});

//our file upload function.
router.post('/:path', auth, upload.array('storage', 20), function async(req, res, next) {
  try {
    var paths = [];
    for (var i = 0; i < req.files.length; i++) {
      var path = req.files[i].path.replace(/\\/g, '/');
      paths.push(path);
    }
    res.send({ "path": paths });
  } catch (error) {
    res.status(500).send('error');
  }
});

//our file upload function.
router.post('/', auth, upload.array('storage', 20), function async(req, res, next) {
  try {
    var paths = [];
    for (var i = 0; i < req.files.length; i++) {
      var path = req.files[i].path.replace(/\\/g, '/');
      paths.push(path);
    }
    res.send({ "path": paths });
  } catch (error) {
    res.status(500).send('error');
  }
});

module.exports = router;