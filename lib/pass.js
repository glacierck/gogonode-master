var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./user');



// Passport session setup.会话设置。

passport.serializeUser(function(user, done) {
    done(null, user.uid);
});

passport.deserializeUser(function(uid, done) {
    User.get(uid, function (err, user) {
        done(err, user);
    });
});

//   Use the LocalStrategy within Passport.使用当地的策略。

passport.use(new LocalStrategy(function(username, password, done) {
    User.authenticate(username, password, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Either the username or the password are wrong'}); }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Invalid password' });
        }

    });
}));

// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
// 简单的路线中间件,以确保用户身份验证。否则发送到登录页面
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        return next();
    }

    res.redirect('/login?redirect=' + encodeURIComponent(req.url));

}

// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
// 简单的路线中间件,以确保用户身份验证。否则发送到登录页面
exports.checkUser = function checkUser(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        res.locals.user.publicview = '1';
        return next();
    }
    else {
        return next();
    }
}


// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
// 简单的路线中间件,以确保用户身份验证。否则发送到登录页面
exports.checkLogin = function checkLogin(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        var userpath = '/' + res.locals.user['substance'] + '/edit';
        res.redirect(userpath);
    }
    else {
        next();
    }



}
