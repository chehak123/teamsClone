const express = require('express');
const app = express();
const path = require("path");
const ejs = require("ejs");
var randomstring = require("randomstring");
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

const { v4: uuidv4 } = require('uuid')
var codeno;

app.use('/peerjs', peerServer)
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get("/", function (req, res) {
	res.render("index");
});


app.get("/create", function (req, res) {
	var newroom=randomstring.generate(7);
	var newroomurl="/"+newroom;
	// console.log(newroomurl);
	res.render("create",{newroom:newroom, newroomurl:newroomurl});
});

app.post("/create",function(req,res){
	codeno= req.body.givencode;
	var c="/"+codeno;
	// console.log(req.body.givencode);
	res.redirect(c);
  });

app.get('/room', (req, res) => {
	res.redirect(`/${uuidv4()}`)
});

app.get('/:room', (req, res) => {
	// console.log(req.params.room);
	res.render('room', { roomId: req.params.room })
});


io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected', userId)

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userId)
		})
		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
