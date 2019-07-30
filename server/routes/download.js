var express = require('express');
var zip = require('express-zip');
var router = express.Router();
var fs = require("fs");
const URL = require('../url');
var pathConveter = require('path');
var auth = require('../middleware/auth-storage');
const v4 = require('uuid/v4');

var keys = [];

router.get('/*', async function async(req, res) {
  try {
    let key = req.params[0];
    let id = keys.findIndex(obj => obj.key == key);

    if (id == -1) {
      res.status(404).send('File not exist!');
    } else {
      if (keys[id].path) {
        let path = keys[id].path;
        if (fs.existsSync(URL.directory + path)) {
          res.download(pathConveter.join(fs.realpathSync(URL.directory + path)));
          if (req.method == 'GET') {
            keys.splice(id, 1);
          }
        } else {
          res.status(404).send('File not exist!');
        }
      } else if (keys[id].paths) {
        folder(keys[id].paths, '', (error, files) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.zip(files, 'files.zip', (err, bytesZipped) => {
              res.end();
            });
          }
        });
      } else if (keys[id].folder) {
        folder(URL.directory + keys[id].folder, keys[id].folder, (error, files) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.zip(files, 'files.zip', (err, bytesZipped) => {
              res.end();
            });
          }
        });
      } else {
        res.status(404).send('File not exist!');
      }
    }
  } catch (error) {
    res.status(500).send('error');
  }
});

router.post('/', auth, async function async(req, res) {
  try {
    let path = req.body.path;
    let paths = req.body.paths;
    let folder = req.body.folder;
    let key = v4();

    keys.push({
      key, path, paths, folder
    });

    res.status(200).send({ key: key });

  } catch (error) {
    res.status(500).send('error');
  }
});

async function folder(dir, root, callbalk) {
  var array = [];
  if (!Array.isArray(dir)) {
    let stat = fs.statSync(pathConveter.join(dir));
    if (stat.isDirectory()) {
      var list = fs.readdirSync(dir);
      for (var i = 0; i < list.length; i++) {
        var filename = pathConveter.join(dir, list[i]);
        let stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
          // pass these files
        } else if (stat.isDirectory()) {
          await folder(filename, root + '/' + list[i], (error, files) => {
            array = array.concat(files);
          });
        } else {
          let path = pathConveter.join(fs.realpathSync(filename));
          array.push({ path, name: root + '/' + list[i] });
        }
      }
    } else {
      let path = pathConveter.join(fs.realpathSync(dir));
      let name = pathConveter.basename(fs.realpathSync(dir));
      array.push({ path, name: root + '/' + name });
    }
  } else {
    for (let element of dir) {
      let stat = fs.statSync(pathConveter.join(URL.directory + element));
      if (stat.isDirectory()) {
        await folder(URL.directory + element, element, (error, files) => {
          array = array.concat(files);
        });
      } else {
        await folder(URL.directory + element, '', (error, files) => {
          array = array.concat(files);
        });
      }
    }
  }
  callbalk(null, array);
}

module.exports = router;
