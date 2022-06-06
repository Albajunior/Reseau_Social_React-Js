const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log(req.method);
    console.log(req.headers);
    console.log(req.body);
    console.log("------------------------------------------");
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JSON_TOKEN);
    const userId = decodedToken.userId;
    
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      res.locals.userId = userId;
      next();
    }
  } catch {
    res.status(401).json({
      error: "Authentication failed !"
    });
  }
};