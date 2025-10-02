const socket = io("/");
const videoDiv = document.getElementById("videoDiv");

// create peer connection
const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: location.port || (location.protocol === 'https:' ? 443 : 80),
});

const myVideo = document.createElement("video");
myVideo.muted = true; // prevent echo
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    addVideoStream(myVideo, stream);

    // answer calls
    peer.on("call", call => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    // when new user connects
    socket.on("user-connected", userId => {
      connectToNewUser(userId, stream);
    });
  });

// connect peers
peer.on("open", id => {
  socket.emit("join-room", roomID, id);
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoDiv.append(video);
}
