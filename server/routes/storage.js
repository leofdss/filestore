var express = require('express');
var router = express.Router();
var fs = require("fs");
var auth = require('../middleware/auth-storage');
var mkdirp = require('mkdirp');
const URL = require('../url');
const rimraf = require('rimraf');

router.get('/*', auth, async function async(req, res, next) {
  readdir(req, res);
});

router.get('/', auth, async function async(req, res, next) {
  readdir(req, res);
});

router.put('/', auth, async function async(req, res, next) {
  rename(req, res);
});

router.post('/', auth, async function async(req, res, next) {
  createFolder(req, res);
});

router.delete('/*', auth, async function (req, res) {
  deleteElement(req, res);
});

router.delete('/', auth, async function (req, res) {
  res.status(400).send('error sintaxe');
});

async function deleteElement(req, res) {
  try {
    let path = '/' + req.params[0];
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
        rimraf(URL.directory + path, function () {
          res.send({ status: 'Element deleted' });
        })
      } else {
        res.send({ status: 'Element deleted' });
      }
    }
  } catch (error) {
    res.status(500).send(err);
  }
}

async function createFolder(req, res) {
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

async function rename(req, res) {
  try {
    let path = req.body.path;
    let oldPath = req.body.oldPath;

    let folder = '/';

    let split = path.split('/');

    for (let i = 0; i < (split.leght - 1); i++) {
      folder += split[i] + '/';
    }

    if (!fs.existsSync(URL.directory + folder)) {
      mkdirp(URL.directory + folder, function (err) {
        if (!err) {
          fs.rename(URL.directory + oldPath, URL.directory + path, function (err) {
            if (!err) {
              res.send({ status: 'renamed complete' });
            } else {
              res.status(500).send(err);
            }
          });
        }
        else {
          res.status(500).send(err);
        }
      });
    } else {
      fs.rename(URL.directory + oldPath, URL.directory + path, function (err) {
        if (!err) {
          res.send({ status: 'renamed complete' });
        } else {
          res.status(500).send(err);
        }
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
}

async function readdir(req, res) {
  try {
    let path = '/' + req.params[0];
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