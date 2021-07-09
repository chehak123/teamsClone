const socket = io('/')
const videoGrid = document.getElementById('videoGrid')
const myVideo = document.createElement('video')
// const Participants_list=document.getElementById('Participants_list')

myVideo.muted = true

var peer = new Peer()

const myPeer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: '5000',
})

var usern;

///screenshare/////////////////////////////////////////////////////////////////////////////
const videoElem = document.getElementById("video");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
let myVideoStream;
// Options for getDisplayMedia()

var displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: false
};

// Set event listeners for the start and stop buttons
startElem.addEventListener("click", function(evt) {
  startCapture();
}, false);

stopElem.addEventListener("click", function(evt) {
  stopCapture();
}, false);


async function startCapture() {
  // logElem.innerHTML = "";

  try {
    // videoElem.srcObject = await 
	navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
	.then((stream)=>{
		sender.replaceTrack(stream);
		// myVideoStream = stream
		// addVideoStream(myVideo, stream)
        
		// var x="screen";
		// socket.on('user-connected', (userId,x,users) => {
		// 	console.log(userId);
		// 	connectToNewUser(userId, stream)
		// 	alert('screen connected', userId)
		// })

		// peer.on('call', (call) => {
		// 	call.answer(stream)
		// 	const video = document.createElement('video')
		// 	call.on('stream', (userVideoStream) => {
		// 		addVideoStream(video, userVideoStream)
		// 	})
		// })

        // var name="screen";
		// socket.on('user-connected', (userId,name,users) => {
		// 	// usern=username;
		// 	connectToNewUser(userId, stream)
		// 	alert(username + ' connected', userId)
		// });
	});

    dumpOptionsInfo();
  } catch(err) {
    console.error("Error: " + err);
  }
}

function stopCapture(evt) {
  let tracks = videoElem.srcObject.getTracks();
//   sender.replaceTrack()
//   socket.on('user-disconnected', (userId) => {
// 	peers[userId].close()
// })

  tracks.forEach(track => track.stop());
  videoElem.srcObject = null;
}


//screenshare ends//////////////////////////////////////////////////////////////////


const peers = {}
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream
		addVideoStream(myVideo, stream)

		socket.on('user-connected', (userId,username,users) => {
			
            //  users.forEach(function(err,c){
			// 	//  console.log(users[c]);
			// 	$("#Participants_list").append(`<li><h6>${users[c]}</h6></li>`)
			//  });

			// usern=username;
			connectToNewUser(userId, stream)
			alert(username + ' connected', userId)
		})

		peer.on('call', (call) => {
			call.answer(stream)
			const video = document.createElement('video')
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream)
			})
		})

		let text = $('input')

		$('html').keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit('message', text.val())
				text.val('')
			}
		})

		socket.on('createMessage', (message, userId,x) => {
			$('ul').append(`<li >
								<span class="messageHeader">
									<span>
										From 
										<span class="messageSender">${x}</span> 
										to 
										<span class="messageReceiver">Everyone:</span>
									</span>

									${new Date().toLocaleString('en-US', {
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
								</span>

								<span class="message">${message}</span>
							
							</li>`)
			scrollToBottom()
		})

	})

socket.on('user-disconnected', (userId) => {
	peers[userId].close()
})

peer.on('open', (id) => {
	socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream)
	const video = document.createElement('video')
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream)
	})
	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
}

const addVideoStream = (video, stream) => {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
	// if(usern!="undefined"){
	// $("#Participants_list").append(`<li><h6>${usern}</h6></li>`)
	// }
}

const scrollToBottom = () => {
	var d = $('.mainChatWindow')
	d.scrollTop(d.prop('scrollHeight'))
}

const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}

const setMuteButton = () => {
	const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const setUnmuteButton = () => {
	const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const playStop = () => {
	// console.log('object')
	let enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		setStopVideo()
		myVideoStream.getVideoTracks()[0].enabled = true
	}
}

const setStopVideo = () => {
	const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

const setPlayVideo = () => {
	const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}
