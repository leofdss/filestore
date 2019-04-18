var express = require('express');
var router = express.Router();
var multer = require('multer');
const URL = require('../url');
let request = require('request');
let mkdirp = require('mkdirp');

/** Autenticação */
router.use(function async(req, res, next) {
  if (req.method == 'GET') {
    next();
  }
  else if (req.headers.authorization && req.method == 'POST') {
    if (req.headers.authorization == '123') {
      next();
    } else {
      res.status(401).send('Não autenticado');
    }
  } else {
    res.status(500).send('error');
  }
});

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

router.get('/avatar', function async(req, res, next) {
  // render the index page, and pass data to it.
  res.render('index', { title: 'Avatar' });
});

//our file upload function.
router.post('/avatar:path', upload.array('avatar', 20), function async(req, res, next) {
  try {
    var paths = [];
    for (var i = 0; i < req.files.length; i++) {
      var path = req.files[i].path.replace(/\\/g, '/');
      path = path.replace('E:/CloudFlow/', 'cloudflow://PP_FILE_STORE/');
      path = path.replace(/ /g, '%20');
      paths.push(path);
    }
    return res.send({ "path": paths });
  } catch (error) {
    res.status(500).send('error');
  }
});

//our file upload function.
router.post('/storage:path', upload.array('storage', 20), function async(req, res, next) {
  try {
    var paths = [];
    for (var i = 0; i < req.files.length; i++) {
      var path = req.files[i].path.replace(/\\/g, '/');
      path = path.replace('E:/CloudFlow/', 'cloudflow://PP_FILE_STORE/');
      path = path.replace(/ /g, '%20');
      paths.push(path);
    }
    return res.send({ "path": paths });
  } catch (error) {
    res.status(500).send('error');
  }
});

module.exports = router;