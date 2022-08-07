var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var JWTstrategy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;
var util = require('./util');
var jwtSecret = require('./jwtConfig');
const mongoose = require('mongoose');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    var user = await util.getModel()["Users"]["authUser"].findById(id);
    done(null, user);
});

passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            session: false
        },
        async function(username, password, done){
            try{
                //find the user and the associated secret
                var user = await mongoose.model('authUser').findOne({uuid: username});
                console.log(user);
                if( user == null) {
                    console.log('Username does not exist.');
                    return done(null, false, {message: 'Username does not exist.'})
                } else {
                    if(!user.active)
                    {
                        console.log('User is inactive and cannot log in.')
                        return done(null, false, {message: 'User is inactive and cannot log in.'})
                    } else {
                        var secret = await util.getModel()["Users"]["authSecret"].findById(user.secret);
                        bcrypt.compare(password, secret.secret).then(response =>{
                            if(response != true) {
                                console.log("Secrets do not match.");
                                return done(null, false, {message: 'Secrets do not match.'});
                            } else {
                                console.log("User found and authenticated.")
                                return done(null, user);
                            }
                        })
                    }
                }
            } catch (err) {
                done(err);
            }
        }
    )
)

async function isAuthorized(req, res, next) {
    try {
        var authHeader = req.headers.authorization;
        if(authHeader == undefined){
            res.send(401, "Token is invalid.");
        }
        var token = authHeader.replace('JWT ', '');
        var decoded = jwt.verify(token, jwtSecret.secret);
        var path = req.route.path;
        var baseUrl = req.baseUrl;
        var method = req.method;

        // Find endpoint document with the same url & method
        console.log(baseUrl + path);
        var endpoint = await util.getModel()["EndPoints"].findOne({uniqueName: baseUrl + path, method: method});
        if(endpoint != null){
            //console.log(endpoint._id);
            // Find all the roles that have the _id of the end point
            var foundRoles = await util.getModel()["Users"]["authRole"].find({authorizations: endpoint._id});
            // Compare to list of roles from token. If list has even one, good to go.
            var ids = [];
            foundRoles.forEach(role => {ids.push(role._id.toString())});
            var hasRole = false;
            for(var i = 0; i < decoded.roles.length; i++){
                var index = ids.indexOf(decoded.roles[i]);
                if(index != -1) {
                    hasRole = true;
                }
            }

            if(hasRole) {
                req.userId = decoded.id;
                console.log(`User ID: ${req.userId}`); 
                next();
            } else {    
                // If none found, unauthorized
                res.send.status(401).send( "Unauthorized. User does not have correct privilege.");
                //next(false);
            }
        } else {
            next (new Error("Endpoint does not exist in database."))
        }

    } catch (err) {
        next (err);
    }
}

module.exports = {
    passport: passport,
    isAuthorized: isAuthorized
}
