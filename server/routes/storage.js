var express = require('express');
var router = express.Router();
var fs = require("fs");
var auth = require('../middleware/auth-storage');
var mkdirp = require('mkdirp');
const URL = require('../url');

router.get('/:path', auth, function async(req, res, next) {
  readdir(req, res);
});

router.get('/', auth, function async(req, res, next) {
  readdir(req, res);
});

router.put('/', auth, function async(req, res, next) {
  rename(req, res);
});

router.post('/', auth, function async(req, res, next) {
  createFolder(req, res);
});

router.delete('/:path', auth, function (req, res) {
  deleteElement(req, res);
});

router.delete('/', auth, function (req, res) {
  res.status(400).send('error sintaxe');
});

function deleteElement(req, res) {
  try {
    let path = req.params.path.replace(/:/g, '/');
    if (path.includes('.')) {
      fs.unlink(URL.directory + path, function (err) {
        if (!err) {
          res.send({ status: 'Element deleted' });
        } else {
          res.status(500).send(err);
        }
      });
    } else {
      if (fs.existsSync(URL.directory + path)) {
        fs.readdirSync(URL.directory + path).forEach(function (file, index) {
          var curPath = URL.directory + path + "/" + file;
          if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(URL.directory + path);
        res.send({ status: 'Element deleted' });
      }
    }
  } catch (error) {
    res.status(500).send(err);
  }
}

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
    if (!fs.existsSync(URL.directory)) {
      mkdirp(URL.directory, function (err) {
        if (err) {
          res.status(500).send('error');
        } else {
          fs.readdir(URL.directory + path, function (err, files) {
            if (!err) {
              res.send({ files: files });
            } else {
              res.status(500).send('error');
            }
          });          
        }
      });
    } else {
      fs.readdir(URL.directory + path, function (err, files) {
        if (!err) {
          res.send({ files: files });
        } else {
          res.status(500).send('error');
        }
      });
    }
  } catch (error) {
    res.status(500).send('error');
  }
}

module.exports = router;