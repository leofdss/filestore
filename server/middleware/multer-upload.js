var multer = require('multer');
var mkdirp = require('mkdirp');
const URL = require('../url');

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

module.exports = multer({ storage: storage });