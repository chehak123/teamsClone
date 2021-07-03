const express = require('express');
const app = express();
const path = require("path");
const ejs = require("ejs");
var randomstring = require("randomstring");
const mongoose = require("mongoose");
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
var bodyParser = require("body-parser");

const peerServer = ExpressPeerServer(server, {
	debug: true,
})

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://chehak:123@cluster0.ohkb1.mongodb.net/Teams" , {
	useNewUrlParser : true, 
	useUnifiedTopology: true 
});

var Code = require("./db/models/code");
var User = require("./db/models/user");
var Usercode = require("./db/models/usercode");
var passport = require("passport");
var localStrategy = require("passport-local"),
  methodOverride = require("method-override");
app.use(
  require("express-session")({
    secret: "This is the decryption key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(methodOverride("_method"));
app.use(passport.initialize()); //use to use passport in our code
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var authRoutes = require("./routes/auth.js");
app.use("/", authRoutes);

const { v4: uuidv4 } = require('uuid')
var codeno;

app.use('/peerjs', peerServer)
app.use(express.static('public'))
app.set('view engine', 'ejs')

var username;

app.get("/", function (req, res) {
	res.render("index");
});

app.get("/error", function (req, res) {
	res.render("error");
});

app.get("/create", function (req, res) {
	var newroom=randomstring.generate(7);
	var newroomurl="/"+newroom;
	const code=new Code({
		name:newroom,
		host : req.user.username
	});

	code.save();
	username=req.user.name;

	res.render("create",{newroom:newroom, newroomurl:newroomurl, currentUser: req.user});
});

app.post("/create",function(req,res){
	codeno= req.body.givencode;
	var flag=0;

	Code.find({name:codeno}, function(err, codes){
		codes.forEach(function(err,c){
			var hostperson= codes[c].host;
            
			// function sendEmail() {
				// Email.send({
				//   Host: "smtp.gmail.com",
				//   Username: "chehakagrawal01@gmail.com",
				//   Password: "Enter your password",
				//   To: hostperson,
				//   From: req.user.username,
				//   Subject: req.user.name + " wants to join your call",
				//   Body: "Well that was easy!!",
				// })
				//   .then(function (message) {
				// 	alert("mail sent successfully")
				//   });
			//   }

			// prompt("You are joining the call of " + hostperson);
			var x="/"+codeno;
			flag=1;
		    res.redirect(x);
		});

		if(flag===0){
		res.redirect("/error");
		}
	});
	
});

app.get('/room', (req, res) => {
	res.redirect(`/${uuidv4()}`)
});

app.get('/:room', (req, res) => {
	var searchcode=req.params.room;
	var flag=0;

	Code.find({name:searchcode}, function(err, codes){
		codes.forEach(function(err,c){
			username=req.user.name;
			// console.log(username);
			// var x="/"+searchcode;
			flag=1;
		    res.render('room', { roomId: req.params.room, userId: req.user.name })
		});

		if(flag===0){
		res.render("error");
		}
	});	
});

io.on('connection', (socket) => {
	var mymap=new Map();
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId)
       const users = [];
        
	   var i=0;
	   Usercode.find({roomid:roomId},function(err,usercodes){
		usercodes.forEach(function(err,c){
			// users[i]=c.nameofuser;
			users[i]=usercodes[c].nameofuser;
			i++;
		});
		socket.to(roomId).broadcast.emit('user-connected', userId,username,users)

		});

		// socket.to(roomId).broadcast.emit('user-connected', userId,username,users)

		const usercode=new Usercode({
			nameofuser: username,
			id:userId,
			roomid: roomId
		});
	
		usercode.save();

		socket.on('message', (message) => {
			var x;
				
			Usercode.find({id:userId},function(err,usercodes){
				x=usercodes[0].nameofuser;
				// console.log(x);
			io.to(roomId).emit('createMessage', message, userId,x)
			
		});
		})
		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
