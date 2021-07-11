require("dotenv").config({ path: ".env" });
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
var nodemailer=require('nodemailer');

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

app.get("/share", function (req, res) {
	res.render("share",{currentUser: req.user});
});

var hostperson;
var teamcreated;

app.get("/create", function (req, res) {
	var newroom=randomstring.generate(7);
	var newroomurl="/"+newroom;
    var x=req.user.username;

	const code=new Code({
		name:newroom,
		host:x
	});

	hostperson= req.user.name;
	teamcreated=newroom;

	code.save();
	username=req.user.name;

	User.findOne({ name: hostperson}, function (err, users){
		users.rooms.push(newroom);
		users.save();
	});

	res.render("create",{newroom:newroom, newroomurl:newroomurl, currentUser: req.user});
});

app.post("/create",function(req,res){
	codeno= req.body.givencode;
	var flag=0;

	Code.find({name:codeno}, function(err, codes){
		// codes.forEach(function(err,c){
			 teamcreated=codeno;
            
			var x="/"+codeno;
			flag=1;

			//adding room to userrooms
			User.findOne({ name: hostperson}, function (err, users){
				users.rooms.push(codeno);
				users.save();
			  });

			  hostperson= codes[0].host;

		    res.redirect(x);
		// });

		if(flag===0){
		res.redirect("/error");
		}
	});
	
});

app.post("/share", function(req,res){
	console.log(hostperson);
	console.log(teamcreated);
	var friendmail=req.body.friendmail;
		var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
				  user: process.env.MAIL,
				  pass: process.env.PASS
				}
			  });
			  
			  var mailOptions = {
				from: process.env.MAIL,
				to: friendmail,
				subject: 'Invite to join teams meet',
				text: `Hi there, ${hostperson} has invited you to join the teams meet 
				Teams code - ${teamcreated}`
			  };
			  
			  transporter.sendMail(mailOptions, function(error, info){
				if (error) {
				  console.log(error);
				} else {
				  console.log('Email sent: ' + info.response);
				}
			  });

			  res.redirect("/share");

})

app.get('/room', (req, res) => {
	res.redirect(`/${uuidv4()}`)
});

app.get('/:room', (req, res) => {
	var searchcode=req.params.room;
	var flag=0;
    
	var groupmess=[];
	Code.findOne({name:req.params.room},function(err,codes){
        groupmess=codes.messages;
		 
	});
	

	Code.find({name:searchcode}, function(err, codes){
		codes.forEach(function(err,c){
			username=req.user.name;
			console.log(groupmess);

			flag=1;
		    res.render('room', { groupmess:groupmess , roomId: req.params.room, userId: req.user.name })
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

       Code.findOne({name:roomId},function(err,codes){
		   codes.messages.forEach(function(mess){  
			io.to(roomId).emit('createMessage', mess,'','')
			});  
	   });

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
			var fullmessage;
				
			Usercode.find({id:userId},function(err,usercodes){
				x=usercodes[0].nameofuser;
				fullmessage= x+" : "+message;
	
			io.to(roomId).emit('createMessage', message, userId,x)
			
		});

		//saving messages
		Code.findOne({ name: roomId}, function (err, codes){
			codes.messages.push({username:x,chat:message});
			codes.save();
		  });


		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})

	// /
})
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))