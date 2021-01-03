const WS_PORT = 8443; //make sure this matches the port for the webscokets server

var localUuid;
var localDisplayName;
var localStream;
var serverConnection;
var peerConnections = {}; // key is uuid, values are peer connection object and user defined display name string
var recorder;

var peerConnectionConfig = {
  'iceServers': [
    { 'urls': 'stun:stun.stunprotocol.org:3478' },
    { 'urls': 'stun:stun.l.google.com:19302' },
  ]
};

function start () {
  localUuid = createUUID();

  // check if "&displayName=xxx" is appended to URL, otherwise alert user to populate
  var urlParams = new URLSearchParams(window.location.search);
  localDisplayName = urlParams.get('displayName') || prompt('Enter your name', '');
  document.getElementById('localVideoContainer').appendChild(makeLabel(localDisplayName));

  // specify no audio for user media
  var constraints = {
    video: {
      width: { max: 320 },
      height: { max: 240 },
      frameRate: { max: 30 },
    },
    audio: true, // we need this for backup
  };

  // set up local video stream
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        recorder = new MediaRecorder(document.getElementById('localVideo').srcObject = localstream = stream);
      }).catch(errorHandler)

      // set up websocket and message all existing clients
      .then(() => {
        serverConnection = new WebSocket('wss://' + window.location.hostname + ':' + WS_PORT);
        serverConnection.onmessage = gotMessageFromServer;
        serverConnection.onopen = event => {
          serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': 'all' }));
          recorder.ondataavailable = (event) => { serverConnection.send(event.data); }
          const miliSeconds = 1500;
          recorder.start(miliSeconds);
        }
      }).catch(errorHandler);

  } else {
    alert('Your browser does not support getUserMedia API');
  }
}

function gotMessageFromServer (message) {
  var signal = JSON.parse(message.data);
  var peerUuid = signal.uuid;

  // Process only messages from others, and that are either to us, or to everybody
  if (peerUuid != localUuid && (signal.dest == localUuid || signal.dest == 'all')) {
    if (signal.displayName && signal.dest == 'all') {
      // set up peer connection object for a newcomer peer
      setUpPeer(peerUuid, signal.displayName);
      serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': peerUuid }));

    } else if (signal.displayName && signal.dest == localUuid) {
      // initiate call if we are the newcomer peer
      setUpPeer(peerUuid, signal.displayName, true);

    } else if (signal.sdp) {
      peerConnections[peerUuid].pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          peerConnections[peerUuid].pc.createAnswer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
        }
      }).catch(errorHandler);

    } else if (signal.ice) {
      peerConnections[peerUuid].pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
  }
}

function setUpPeer (peerUuid, displayName, initCall = false) {
  peerConnections[peerUuid] = { displayName: displayName, pc: new RTCPeerConnection(peerConnectionConfig) };
  peerConnections[peerUuid].pc.onicecandidate = event => gotIceCandidate(event, peerUuid);
  peerConnections[peerUuid].pc.ontrack = event => gotRemoteStream(event, peerUuid);
  peerConnections[peerUuid].pc.oniceconnectionstatechange = event => checkPeerDisconnect(event, peerUuid);
  peerConnections[peerUuid].pc.addStream(localStream);

  if (initCall) {
    peerConnections[peerUuid].pc.createOffer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
  }
}

function gotIceCandidate (event, peerUuid) {
  if (event.candidate != null) {
    serverConnection.send(JSON.stringify({ 'ice': event.candidate, 'uuid': localUuid, 'dest': peerUuid }));
  }
}

function createdDescription (description, peerUuid) {
  console.log(`got description, peer ${peerUuid}`);
  peerConnections[peerUuid].pc.setLocalDescription(description).then(function () {
    serverConnection.send(JSON.stringify({ 'sdp': peerConnections[peerUuid].pc.localDescription, 'uuid': localUuid, 'dest': peerUuid }));
  }).catch(errorHandler);
}

function gotRemoteStream (event, peerUuid) {
  const vidId = 'remoteVideo_' + peerUuid;
  if (!document.getElementById(vidId)) { // ignore the MediaRecorder stream copy
    console.log(`got remote stream, peer ${peerUuid}`);
    //assign stream to new HTML video element
    var vidElement = document.createElement('video');
    vidElement.setAttribute('autoplay', '');
    vidElement.setAttribute('muted', '');
    vidElement.srcObject = event.streams[0];

    var vidContainer = document.createElement('div');
    vidContainer.setAttribute('id', vidId);
    vidContainer.setAttribute('class', 'videoContainer');
    vidContainer.appendChild(vidElement);
    const peerName = peerConnections[peerUuid].displayName;
    vidContainer.appendChild(makeLabel(peerName));
    toast.success(peerName + " joined!");

    document.getElementById('videos').appendChild(vidContainer);

    updateLayout();
  }
}

function checkPeerDisconnect (event, peerUuid) {
  var state = peerConnections[peerUuid].pc.iceConnectionState;
  console.log(`connection with peer ${peerUuid} ${state}`);
  if (state === "failed" || state === "closed" || state === "disconnected") {
    toast.info(peerConnections[peerUuid].displayName + " left!");
    delete peerConnections[peerUuid];
    document.getElementById('videos').removeChild(document.getElementById('remoteVideo_' + peerUuid));
    updateLayout();
  }
}

function updateLayout () {
  // update CSS grid based on number of diplayed videos
  var rowHeight = '98vh';
  var colWidth = '98vw';

  var numVideos = Object.keys(peerConnections).length + 1; // add one to include local video

  if (numVideos > 1 && numVideos <= 4) { // 2x2 grid
    rowHeight = '48vh';
    colWidth = '48vw';
  } else if (numVideos > 4) { // 3x3 grid
    rowHeight = '32vh';
    colWidth = '32vw';
  }

  document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
  document.documentElement.style.setProperty(`--colWidth`, colWidth);
}

function makeLabel (label) {
  var vidLabel = document.createElement('div');
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute('class', 'videoLabel');
  return vidLabel;
}

function errorHandler (error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID () {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
