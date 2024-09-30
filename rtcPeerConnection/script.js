const localVideoElement = document.querySelector('#local-video');
const remoteVideoElement = document.querySelector('#remote-video');
let audio=true;
let video=true;
const audioButton = document.querySelector('#audio-button');
const videoButton = document.querySelector('#video-button');
audioButton.addEventListener('click', () => {
    audio = !audio;
    localStream.getAudioTracks()[0].enabled = audio;

    // Update the button's text decoration based on the audio state
    if (audio) {
        audioButton.style.textDecoration = 'none';
    } else {
        audioButton.style.textDecoration = 'line-through';
    }

});
videoButton.addEventListener('click', () => {
    video = !video;
    localStream.getVideoTracks()[0].enabled = video;
    // Update the button's text decoration based on the video state
    if (video) {
        videoButton.style.textDecoration = 'none';
    }else{
        videoButton.style.textDecoration = 'line-through';
    }
})

let localStream;// this stream will be of caller
let remoteStream;// this stream will be of answerer
let peerConnection;//the peerconnection used by two client to talk
//config contains ice server which is an array of object describing one server used by ice agent 
//these are stun or turn server
let userName = "Amul-" + Math.floor(Math.random() * 1000000);
let didIoffer;
document.querySelector('#user-name').textContent = userName;
const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}
window.socket = io.connect('https://localhost:3000', {
    auth: {
        userName,
        password: '1234'
    }
});
const fetchUserMedia = async () => {
    try {

      localStream=await navigator.mediaDevices.getUserMedia({ video, audio });
        localVideoElement.srcObject = localStream;

    } catch (error) {
        throw error
    }

}
const startCalling = async (e) => {
    try {
        await fetchUserMedia();
        //we are creating a peer connection and  generating ice candidate
        createPeerConnection();

        //we need to addTrack before creatOffer because createOffer gives sdp which is codec info so it should be associated with stream
        //this is sent to the peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        // creating sdp by createOffer();
        const offer = await peerConnection.createOffer();
        console.log("sdp generated using createOffer", offer);
        //setting that i am offerer true
        didIoffer = true;
        //setting localdescription which takes sdp and return promise and fire icecandidate event
        await peerConnection.setLocalDescription(offer);

        //send newOffer to the server
        socket.emit('newOffer', offer);

    } catch (error) {
        console.log(error)
    }


}
const createPeerConnection = () => {
    console.log(" create peer connection function")
    peerConnection = new RTCPeerConnection(configuration);
    console.log("peerConnection", peerConnection);
    //add event listeners to RTCPeerConnection
    peerConnection.addEventListener('icecandidate', e => {
        console.log("ice candidate found.....")
        console.log(e)
        if (e.candidate) {
            console.log("sendIceCandidateToSignalingServer");
            socket.emit('sendIceCandidateToSignalingServer', {
                iceCandidate: e.candidate,
                userName,
                didIoffer
            });
        }

    });
    //this will run by both caller and answerer so now we have to add remote track
    remoteStream=new MediaStream();
    remoteVideoElement.srcObject=remoteStream;
    peerConnection.addEventListener('track', (event) => {
        console.log("Received track from peer connection:", event);
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    });
    
}
export const startAnswering = async (offerObj) => {
    console.log("answering")
    try {
        await fetchUserMedia();
        createPeerConnection();
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        //before answer we have to setRemotedescription cause if we donot 
        //answerer pperconnection will not know about remote offer and cannot createAnswer
        await peerConnection.setRemoteDescription(offerObj.offer);
        //this offerobject contains offererUserNmae,offer,answererUserName,answer,icecandidate of both
        const answer=await peerConnection.createAnswer();
        console.log("sdp generated using createAnswer", answer);
        didIoffer = false;
        await peerConnection.setLocalDescription(answer);
        //add answer to offerObject
        offerObj.answer = answer;
        offerObj.answererUserName=userName;
        //emit answer to signaling server then sent to client1 or offerer
        //when sombody answere we have some icecandidate from offerer
        const offererIceCandidates=await socket.emitWithAck('newAnswer',offerObj);
        console.log("offerIceCandidate",offererIceCandidates);
        //now add these iceCandidate to peerconnection
        offererIceCandidates.forEach(candidate=>{
            peerConnection.addIceCandidate(candidate)
        })
        console.log("................peerconnection with local remote and iceCandidate of offerer................",peerConnection);
    } catch (error) {
        console.log(error)
    }
}

export const addAnswerToPeerConnection=async (answer)=>{
   await peerConnection.setRemoteDescription(answer);
    console.log("....peerconnection caller.....",peerConnection)
}
export const addIceCandidateToOfferer=(iceCandidate)=>{
    peerConnection.addIceCandidate(iceCandidate);
    console.log("answerer ice candidate to caller",iceCandidate);
    console.log(".........peerConnection of caller.......",peerConnection)
}
document.querySelector('#call').addEventListener('click', e => {
    startCalling(e);
})
document.querySelector('#hangup').addEventListener('click',e=>{
peerConnection.close();
})
