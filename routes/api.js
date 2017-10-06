// API ROUTES -------------------

// get an instance of the router for api routes
var express = require('express');
var apiRoutes = express.Router();
var app = express();
var jwt = require('jsonwebtoken');
var user   = require('../back/models/user'); // get our mongoose model
var config = require('../back/config');

app.set('superSecret', config.secret);

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

    // find the user
    user.findOne({
      name: req.body.name
    }, function(err, user) {

      user = JSON.parse(JSON.stringify(user));
      if (err) throw err;

      if (!user) {
        res.json({ success: false, message: 'Authentication failed. user not found.' });
      } else if (user) {
  
        // check if password matches
        if (user.password != req.body.password) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // create a token
          console.log(app.get('superSecret'));
          console.log(typeof user);
          try {
            var token = jwt.sign(user, app.get('superSecret'), {
              expiresIn: '14h'
            });} catch (err) { throw new Error(`Kevs error: ${err}`); }

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }
      }
    });
  });

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
  
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
    // decode token
    if (token) {
  
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
  
    } else {
  
      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      });
  
    }
  });
  
// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  user.find({}, function(err, users) {
    res.json(users);
  });
});   

module.exports = apiRoutes;
