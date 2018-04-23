const express = require('express');
const bcrypt = require ('bcrypt');
const router = express.Router();
const User = require('../db/user');

router.get('/', (req, res) => {
  res.json({
    message: 'hey'
  });
});

function validUser(user){
  //do stuff
  const validEmail = typeof user.email == 'string' &&
                    user.email.trim() != '';

  const validPassword = typeof user.password == 'string' &&
                     user.password.trim() != '' &&
                     user.password.trim().length >= 6;

  return validEmail && validPassword;

};


router.post('/signup', (req, res, next) => {
  if(validUser(req.body)){
    User
      .getOneByEmail(req.body.email)
      .then((user) => {
        console.log('user', user);
        if(!user){
          bcrypt.hash(req.body.password, 10)
            .then((hash) => {
              const user = {
                email: req.body.email,
                password: hash,
                created_at: new Date()
              };
              User
              .create(user)
              .then(id => {
                res.json ({
                id,
                message: 'true'
              });
              });

          // Store hash in your password DB.
          });
        } else {
          //email in use
        }
      });
    } else {
      next(new Error('invalid user'));
    }
});



router.post('/login', (req, res, next) => {
  if (validUser(req.body)){
    User
      .getOneByEmail(req.body.email)
      .then(user =>{
        console.log('user', user);
        if(user) {
          //compare pasword with hashed password. comparing password they entered in with password in db.
          // Load hash from your password DB.
          bcrypt.compare(req.body.password, user.password)
          .then((result) => {
            //if the passwords matched
            if(result){
              //setting the 'set-cookie' header
              const isSecure = req.app.get('env') != 'development';
              res.cookie('user_id', user.id, {
                httpOnly: true,
                secure: isSecure,
                signed: true
              });
              res.json({
                id: user.id,
                message: 'logged in!'
              });
            } else {
              next (new Error('invalid login'));
            }
          });
      } else {
        next (new Error('invalid login'));
      }
      });
  }else{
    next (new Error('invalid login'));
  }
});

module.exports = router;
