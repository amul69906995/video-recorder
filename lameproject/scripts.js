let stream = null;
const videoElement = document.querySelector('#my-video');
const otherVideoElement = document.querySelector('#other-video');
let timer;
const recordingState = document.querySelector('#recording-state')
const audioInpEl=document.querySelector('#audio-input');
const audioOutEl=document.querySelector('#audio-output');
const videoInpEl=document.querySelector('#video-input');


const getMicAndCamera = async () => {
    try {
        const constrains = { video: true, audio: true };//which usermedia u want to ask for
        // audio true means both mic and speaker
        stream = await navigator.mediaDevices.getUserMedia(constrains);
        console.log(stream);
    } catch (error) {
        console.log(error)
    }
}
const showMyFeed = (e) => {
    if(stream){
        console.log("show my feed")
    videoElement.srcObject = stream;//this will set the src in video element with our stream 
    const tracks = stream.getTracks();
    console.log(tracks);
    }else{
        alert('stream is null')
    }
}
const stopMyFeed = (e) => {
    // videoElement.srcObject=null;
    if (stream) {
        const tracks = stream.getTracks();
        console.log(tracks);
        tracks.forEach(track => {
            track.stop();
            console.log(track);
            console.log("track stopped")
        })
        videoElement.srcObject = null;  
        
        // Set the global stream variable to null to fully disassociate
        stream = null;
    }
}
const changeVideoSize = (e) => {
    // const tracks = stream.getTracks();
    // tracks.forEach(track => {
    //     const capabilities = track.getCapabilities();
    //     console.log(capabilities);//based on this we apply constrains using applyConstrains method
    // })
    const videoWidth = document.querySelector('#vid-width').value;
    const videoHeight = document.querySelector('#vid-height').value;
    const videoTracks = stream.getVideoTracks();
    //console.log(videoTracks);//get all video input device available
    videoTracks.forEach(videoTrack => {
        const capabilities = videoTrack.getCapabilities();
        console.log(capabilities);
        console.log(videoHeight, videoWidth);
        videoTrack.applyConstraints({ height: { exact: videoHeight }, width: { exact: videoWidth } });
    })

}
let recordedBlob = [];
let mediaRecorder;
const startRecord = (e) => {
    if (!stream) {
        alert('allow mic and camera/not supported')
    }
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    recordingState.textContent = mediaRecorder.state;
    mediaRecorder.ondataavailable = (e) => {
        console.log(e.data)
        recordedBlob.push(e.data);
    }
}
const stopRecord = (e) => {
    mediaRecorder.stop();
    recordingState.textContent = mediaRecorder.state;

}
const playRecord = (e) => {
    if (!recordedBlob) {
        alert('no recorded data')
    }
    if (recordedBlob) {
        const recordedSuperBlob = new Blob(recordedBlob, { type: 'video/webm' });
        otherVideoElement.src = URL.createObjectURL(recordedSuperBlob);
        console.log("recorded blob", recordedBlob);
        console.log("recorded super blob", recordedSuperBlob)
        otherVideoElement.controls = true;
        otherVideoElement.play();
    }
}
const pauseRecord = (e) => {
    console.log(mediaRecorder.state)
    if (mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        recordingState.textContent = mediaRecorder.state;
        document.getElementById('pause-record').textContent = "Resume Recording";
        // recording paused
    } else if (mediaRecorder.state === "paused") {
        mediaRecorder.resume();
        recordingState.textContent = mediaRecorder.state;
        document.getElementById('pause-record').textContent = "Pause Recording";
        // resume recording
    }
    console.log(mediaRecorder.state)
}
// let screenStream = null;
const shareScreen = async () => {
    try {
        stopMyFeed();
        const constrains = {
            video: true,
            audio: true,
            surfaceSwitching: 'exclude'
        }
        videoElement.style.display = 'none';

        //if any case video is false then it will throw error cause u want to share screen and in any case video is there
        stream = await navigator.mediaDevices.getDisplayMedia(constrains);
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';

    } catch (error) {
        console.log(error)
    }
}
const getDevices = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        devices.forEach(device=>{
            const option=document.createElement('option');
            option.value=device.deviceId;
            option.textContent=device.label;
       console.log(device.kind==="audioinput")
        if(device.kind==="audioinput"){
            console.log("inside audio input")
            audioInpEl.appendChild(option);
        }else if(device.kind==="audiooutput"){
            audioOutEl.appendChild(option)
        }
        else{
            videoInpEl.appendChild(option)
        }
    })
    }
    catch (error) {
        console.log(error)
    }
}
getDevices();
const changeAudioInput=async(e)=>{
    const deviceId=e.target.value;
    const newConstraints={
        audio:{deviceId:{exact:deviceId}},
        video: true
    }
    try {
        stream=await navigator.mediaDevices.getUserMedia(newConstraints);
        videoElement.srcObject=stream;
        const tracks=stream.getTracks();
        console.log(tracks)
    } catch (error) {
        console.log(error)
    }
}
const changeAudioOutput=async(e)=>{
    const deviceId=e.target.value;
   await videoElement.setSinkId(deviceId);
}
const changeVideoDevice = async(e)=>{
    //changed video input!!!
    const deviceId = e.target.value;
    const newConstraints = {
        audio: true,
        video: {deviceId: {exact: deviceId}},
    }
    try{
        stream = await navigator.mediaDevices.getUserMedia(newConstraints);
        videoElement.srcObject = stream;
        console.log(stream);
        const tracks = stream.getVideoTracks();
        console.log(tracks);
    }catch(err){
        console.log(err)
    }
}
document.querySelector('#share').addEventListener('click', () => {
    getMicAndCamera();
})
document.querySelector('#show-video').addEventListener('click', (e) => {
    showMyFeed(e);
})
document.querySelector('#stop-video').addEventListener('click', (e) => {
    stopMyFeed(e);
})
document.querySelector('#change-size').addEventListener('click', (e) => {
    changeVideoSize(e);
})
document.querySelector('#start-record').addEventListener('click', (e) => {
    startRecord(e);
})
document.querySelector('#stop-record').addEventListener('click', (e) => {
    stopRecord(e);
})
document.querySelector('#play-record').addEventListener('click', (e) => {
    playRecord(e);
})
document.querySelector('#pause-record').addEventListener('click', (e) => {
    pauseRecord(e);
})
document.querySelector('#share-screen').addEventListener('click', (e) => {
    shareScreen(e);
})
document.querySelector('#audio-input').addEventListener('change',(e)=>{
    changeAudioInput(e)
})
document.querySelector('#audio-output').addEventListener('change',(e)=>{
    changeAudioOutput(e)
})
document.querySelector('#video-input').addEventListener('change',(e)=>{
    changeVideoDevice(e)
})