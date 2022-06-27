const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    res.locals.token="none";
  }

  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    res.locals.token="valid";
  
  } catch (err) {
    res.locals.token="invalid";
  }

  
  return next();
};

module.exports = verifyToken;