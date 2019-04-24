var express = require('express');
var router = express.Router();
var multer = require('multer');
const URL = require('../url');
var mkdirp = require('mkdirp');
let auth = require('../middleware/auth-file');

/** Local e nome do arquivo */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let path = '';
      if (req.params.path) {
        path = req.params.path.replace(/:/g, '/');
      }
      mkdirp(URL.directory + path, function (err) {
        if (err) {
          console.error(err);
          res.status(500).send('error');
        } else {
          cb(null, URL.directory + path)
          console.log(URL.directory + path)
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage });

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