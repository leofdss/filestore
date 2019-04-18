var express = require('express');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');

router.get('/:path', function async(req, res, next) {
  readdir(req, res);
});

router.get('/', function async(req, res, next) {
  readdir(req, res);
});

router.put('/', function async(req, res, next) {
  rename(req, res);
});

router.post('/', function async(req, res, next) {
  createFolder(req, res);
});

function createFolder(req, res) {
  try {
    let path = req.body.path;
    fs.mkdir(URL.directory + path, function (err) {
      if (!err) {
        res.send({ status: 'Folder created' });
      }
      else {
        res.status(500).send(err);
      }
    });
  } catch (error) {
    res.status(500).send(err);
  }
}

function rename(req, res) {
  try {
    let path = req.body.path;
    let oldPath = req.body.oldPath;
    fs.rename(URL.directory + oldPath, URL.directory + path, function (err) {
      if (!err) {
        res.send({ status: 'renamed complete' });
      } else {
        res.status(500).send(err);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

function readdir(req, res) {
  try {
    let path;
    if (req.params.path) {
      path = req.params.path.replace(/:/g, '/');
    } else {
      path = '/'
    }
    fs.readdir(URL.directory + path, function (err, files) {
      if (!err) {
        res.send({ files: files });
      } else {
        res.status(500).send('error');
      }
    });
  } catch (error) {
    res.status(500).send('error');
  }
}

module.exports = router;