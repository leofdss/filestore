//require express library
let express = require('express');
//require the express router
let router = express.Router();
var request = require('request');
let path = require('path');
const URL = require('../url');

/** Autenticação */
router.use(function async(req, res, next) {
  console.log(req.method)
  if (req.method == 'GET') {
    next();
  }
  else if (req.body.session && req.method == 'POST') {
    try {
      request.post(
        URL.server,
        {
          json: {
            'session': req.body.session,
            'method': 'auth.get_current_user'
          }
        },
        function async(error, response, body) {
          if (!error) {
            if (!body.error) {
              next();
            } else {
              res.status(401).send(body);
            }
          } else {
            res.status(response.statusCode).send(error);
          }
        }
      );
    } catch (error) {
      res.status(500).send('error');
    }
  } else {
    res.status(500).send('error');
  }
});

router.post('/', function async(req, res, next) {
  var filepath = req.body.url.replace('cloudflow://PP_FILE_STORE/', 'E://CloudFlow/');
  filepath = filepath.replace(/%20/g, ' ');
  console.log(path.join(filepath));
  res.sendFile(path.join(filepath));
});

module.exports = router;
