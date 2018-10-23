const config = require('./bin/config');
const jwt = require('jsonwebtoken');


// Token Doğrular.
var verifyToken = (req,res,next)=>{

    const token = req.body.token;

    if (token) {

        jwt.verify(token, config.tokenKeyWord, (err, decode) => {
            if (err) {
              res.statusCode=401;
              res.json({status: false, messages: 'Token Not Verify'});
            }
            else next();
        })
    }

    else res.json({status: false, messages: "Token not found"})
}

module.exports = verifyToken;
