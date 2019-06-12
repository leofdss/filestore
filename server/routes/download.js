var express = require('express');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');
var pathConveter = require('path');
var auth = require('../middleware/auth-storage');
const v4 = require('uuid/v4');

var keys = [];

router.get('/*', async function async(req, res, next) {
  try {
    let key = req.params[0];

    let id = keys.findIndex(obj => obj.key == key);

    console.log(id);
    if (id == -1) {
      res.status(404).send('File not exist!');
    } else {
      let path = keys[id].path;
      if (fs.existsSync(URL.directory + path)) {
        res.sendFile(pathConveter.join(fs.realpathSync(URL.directory + path)));
        if (req.method == 'GET') {
          keys.splice(id, 1);
        }
      } else {
        res.status(404).send('File not exist!');
      }
    }
  } catch (error) {
    res.status(500).send('error');
  }
});

router.post('/', auth, async function async(req, res, next) {
  try {
    let path = req.body.path;
    let key = v4();

    keys.push({
      key: key,
      path: path
    });

    res.status(200).send({ key: key });

  } catch (error) {
    res.status(500).send('error');
  }
});

module.exports = router;
