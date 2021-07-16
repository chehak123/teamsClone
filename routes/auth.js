var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../db/models/user");
var middleware = require("../middleware"); //no need of writing index .js as directory always calls index.js by default

//AUTH ROUTES
//show register form
router.get("/register", (req, res) => {
  res.redirect("/");
});
//handle sign up logic
router.post("/register", function (req, res) {
  User.register(
    new User({ username: req.body.username, name: req.body.name ,score:0}),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        // req.flash("error",err.message); //this prints the err as error on the screen. error object has many things and err.message gives us the problem occured
        return res.redirect("/register");
      } //in these cases always use res.redirect and not res.render as in res.render we dont go through the app.get route so the middlware where we specify req.error is not utilized
      passport.authenticate("local")(req, res, function () {
        //req.flash("success","Welcome"+user.username);
        res.redirect("/create");
      });
    }
  );
});

//show login form
router.get("/login", function (req, res) {
  //res.render("login.ejs");
  res.redirect("/" + "#login");
  //res.redirect("/");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/create",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);


//LOGOUT
router.get("/logout", function (req, res) {
  req.logout();
  //req.flash("success","Logged You out");
  res.redirect("/");
});

module.exports = router;