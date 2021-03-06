const localStrategy = require('passport-local').Strategy;
const models = require('../model.js');
const authenticationMiddleware = require('./passportMiddleware');
const passport = require('passport');

module.exports = () => {
  passport.serializeUser(function (user, cb) {
    cb(null, user._id)
  })

  passport.deserializeUser(function (id, cb) {
    console.log(id)
    cb(null, id)
    // models.users.findById(id).then(user => {
    //   cb(null, user);
    // }).catch(err => {
    //   cb(err, null);
    // })
  })
  passport.use(new localStrategy({usernameField: 'acount', passwordField: 'password'}, (username, password, done) => {
    console.log('进入')
    models.users.findOne({acount: username}, (err, user) => {
      console.log(err, user, username, password, user.passwrod !== password)
      if(err) {return done(err)}
      if(!user) {
        return done(null, false, { message: '用户不存在'})
      }

      if(user.password !== password) {
        return done(null, false, { message: '密码不正确'})
      }
      console.log(user)
      return done(null, user);
    })
  }));
}
