function auth(req, res, next) {
  //verificação do token
  try {
    if (req.headers.authorization == '123') {
      next();
    } else {
      res.status(401).send('Not authorized');
    }
  } catch (error) {
    res.status(500).send('error');
  }
}

module.exports = auth;