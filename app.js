var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var local = require('passport-local');
var flash    = require('connect-flash');
var session  = require('express-session');
//var configDB = require('./config/database.js');

var User = require('./models/user');
var Post = require('./models/post');

var Poll = require('./models/Poll');

var io = require("socket.io")();
app.io = io;

//chatting
user = [];
var connections = [];

//chatting ends

require('./config/passport')(passport); // pass passport for configuration
// configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our database
mongoose.connect('mongodb://127.0.0.1:27017/databaseName');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: '1stchattingapp',
	resave: true,
saveUninitialized: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname, 'public')));
// required for passport
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/index.js')(app, passport); // load our routes and pass in our app and fully configured passport
app.use('/', index);
app.use('/users', users);

//FOR CHATTING
//connect
console.log("Server running on port 3000");
app.get('/', function(req,res){
	res.render('profile1', {title: 'chatting page'})
});

var todoItems = [];

io.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);	

	var syncUsers = function(){
		user = [];
		connections.forEach(function(sock){
			user.push(sock.username);
		});
		io.emit("users",user);
	}

	socket.emit("updateTodoList",todoItems);
	//Disconnect
	socket.on("register",function(data){
		console.log("registered user :: "+data)
		socket.username = data.username;
		socket.userId = data.userId;
		syncUsers();
		Post.find({}).populate("userId").exec(function(err,posts){
			if(err)throw err;
			posts.forEach(function(p){
				console.log(p);
				socket.emit('new post',{
					post : p.content,
					user : p.userId.local.username,
					userId : p.userId._id.toString()
				});
			})
		})


	});
	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
		syncUsers();
	});
	//Send message
	socket.on('send message', function(data){
		console.log("message received :: "+data);
		io.emit('new message', {msg: data,user:socket.username});
	});

	socket.on('share', function(data){
		console.log("post received :: "+data);
		io.emit('new post', {post: data,user:socket.username});
		// 	User.findOne({
		// 		'local.username' : socket.username
		// 	},function(err,user){
		// 		if(err)throw err;
		// 	});
		// });
		var p = new Post({
			userId : socket.userId,
			dateCreated : new Date(),
			content : data
		});
		p.save();
	});

	function getItemPositionById(id){
		for(var i=0;i<todoItems.length;i++){
			if(todoItems[i].id == id)return i;
		}
	}

	socket.on("addTodoItem", function(data){
		todoItems.push(data);
		io.emit("updateTodoList",todoItems);
	});

	socket.on("removeTodoItem", function(data){
		todoItems.splice(getItemPositionById(data.id),1);
		io.emit("updateTodoList",todoItems);
	});

	socket.on("updateTodoItem", function(item){
		todoItems[getItemPositionById(item.id)] = item;
		io.emit("updateTodoList",todoItems);
	});

	vote(socket);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
}); 

 // error handler
 app.use(function(err, req, res, next) {
   //set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

 module.exports = app;

var vote = function(socket) {
          socket.on('send:vote', function(data) {

            var ip = socket.handshake.headers['x-forwarded-for'] || 
socket.handshake.address.address; 
console.log(data);
            Poll.findById(data.poll_id, function(err, poll) {
              var choice = poll.choices.id(data.choice);
              choice.votes.push({ ip: ip });      
              poll.save(function(err, doc) {
                var theDoc = { 
                  question: doc.question, _id: doc._id, choices: doc.choices, 
                  userVoted: false, totalVotes: 0 
                };
                for(var i = 0, ln = doc.choices.length; i < ln; i++) {
                  var choice = doc.choices[i]; 
                  for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
                    var vote = choice.votes[j];
                    theDoc.totalVotes++;
                    theDoc.ip = ip;
                    if(vote.ip === ip) {
                      theDoc.userVoted = true;
                      theDoc.userChoice = { _id: choice._id, text: choice.text };
                    }
                  }
                }
                socket.emit('myvote', theDoc);
                socket.broadcast.emit('vote', theDoc);
              });     
            });
          });
        };
