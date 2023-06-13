const jwt = require('jsonwebtoken')
const db = require('../models');
const User = db.undefined.User

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt; // Get the token from the request cookies
    //console.log("token");
    //console.log(token);
    // Check if the token exists and is valid (you can implement your own token validation logic here)
    if (token) {
        jwt.verify(token, 'secret salt', async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                res.redirect('/login');
            }
            else {
                //console.log("TOKEN");
                //console.log(decodedToken);
                let user = await User.findOne({
                    where: {
                        id: decodedToken.id
                    }
                });
                res.locals.user = user;
                next();
            }
        })

    } else {
        // Token is missing or invalid, redirect to the login page or return an error response
        res.locals.user = null;
        res.redirect('/login'); // Replace '/login' with the appropriate login route
    }
};

module.exports = requireAuth;