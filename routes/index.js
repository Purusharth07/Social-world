var Poll = require('../models/Poll.js');
module.exports = function(app, passport) {
    //console.log("initialising index ROUTES");
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    //Multer
    var multer= require('multer');
    var fs = require('fs');

    app.use(multer({ dest: './public/uploads/',
    rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
     }
    }).any('photo'));

   app.post("/profile",function(req,res){
        console.log(req.files);
        var newItem = new Item();
        newItem.img.data = fs.readFileSync(req.files.userPhoto.path)
        newItem.img.contentType = "image/png";
        newItem.save();
    });


    // =====================================
    // feedback ===============================
    // =====================================
    // show the feedback page
    app.get('/feedback', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('feedback.ejs', { message: req.flash('loginMessage') }); 
    });

    // =====================================
    // Poll ===============================
    // =====================================
    // show the POLL page
    app.get('/polls', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('polls.ejs', { message: req.flash('loginMessage') }); 
    });


    // =====================================
    // TaskList ===============================
    // =====================================
    // show the TaskList page
    app.get('/TaskList', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('TaskList.ejs', { message: req.flash('loginMessage') }); 
    });


    app.get('/profile2', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('profile2.ejs', { message: req.flash('loginMessage') }); 
    });

     // =====================================
    // F.A.Q ===============================
    // =====================================
    // show the F.A.Q page
    app.get('/faq', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('faq.ejs', { message: req.flash('loginMessage') }); 
    });

    // =====================================
    // form ===============================
    // =====================================
    // show the form page
    app.get('/form', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('form.ejs', { message: req.flash('loginMessage') }); 
    });

    // =====================================
    // Contact ===============================
    // =====================================
    // show the feedback page
    app.get('/contact', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('contact.ejs', { message: req.flash('loginMessage') }); 
    });


// =====================================
    // Proto-chat ===============================
    // =====================================
    // show the feedback page
    app.get('/proto-chat', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('proto-chat.ejs', { message: req.flash('loginMessage') }); 
    });


    // =====================================
    // UPDATE ===============================
    // =====================================
    // show the update page
    app.get('/update', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('update.ejs', { message: req.flash('loginMessage') }); 
    });

     // =====================================
    // About Us ===============================
    // =====================================
    // show the About US page
    app.get('/About', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('About.ejs', { message: req.flash('loginMessage') }); 
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
        // process the login form
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile1', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
   // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile1', isLoggedIn, function(req, res) {
        res.locals.user = req.user;
        res.render('profile1.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
    app.get('/profile', isLoggedIn, function(req, res) {
        res.locals.user = req.user;
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
    

    
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile1',
            failureRedirect : '/'
        }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


  //Angular
  app.get('/polls/polls', list);
  app.get('/polls/:id', poll);
  app.post('/polls', create);

}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
// JSON API for list of polls
var list = function(req, res) { 
  Poll.find({}, 'question', function(error, polls) {
    res.json(polls);
  });
}
  // JSON API for getting a single poll
var poll = function(req, res) {  
  var pollId = req.params.id;
  Poll.findById(pollId, '', { lean: true }, function(err, poll) {
    if(poll) {
      var userVoted = false,
          userChoice,
          totalVotes = 0;
      for(c in poll.choices) {
        var choice = poll.choices[c]; 
        for(v in choice.votes) {
          var vote = choice.votes[v];
          totalVotes++;
          if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
            userVoted = true;
            userChoice = { _id: choice._id, text: choice.text };
          }
        }
      }
      poll.userVoted = userVoted;
      poll.userChoice = userChoice;
      poll.totalVotes = totalVotes;
      res.json(poll);
    } else {
      res.json({error:true});
    }
  });
};
// JSON API for creating a new poll
var create = function(req, res) {
  var reqBody = req.body,
      choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
      pollObj = {question: reqBody.question, choices: choices};
  var poll = new Poll(pollObj);
  poll.save(function(err, doc) {
    if(err || !doc) {
      throw 'Error';
    } else {
      res.json(doc);
    }   
  });
};
// Socket API for saving a vote
