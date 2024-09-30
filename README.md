# WebRTC Media Stream, Screen Sharing & Device Management

This project demonstrates how to work with media streams (microphone and camera), screen sharing, and media device management using the WebRTC API and `navigator.mediaDevices`. The project includes functionalities like capturing audio and video from the user, recording media streams, switching between input/output devices, and screen sharing.
### RtcPeerConnection signaling server
The signaling server is a crucial component of the WebRTC architecture. It is responsible for exchanging signaling messages
between peers.
![signaling server ](/video-recorder/peerConnectionSignalingServer)
## images
![screen record](/video-recorder/assets/screencapture.png)
![video recorder](/video-recorder/assets/video-recorder.png)
## Features

1. **Capture Audio and Video**:
   - Get access to the user's microphone and camera using `navigator.mediaDevices.getUserMedia()`.
   
2. **Display Video Feed**:
   - Display the live video stream in a video element on the page.

3. **Stop Video Feed**:
   - Stop the video stream and free up system resources by stopping the individual tracks.

4. **Change Video Resolution**:
   - Adjust the video resolution (width and height) by applying media constraints on the video track.

5. **Media Recording**:
   - Record the video and audio stream using the `MediaRecorder` API.
   - Start, pause, resume, and stop recording.
   - Playback the recorded stream.

6. **Screen Sharing**:
   - Share your screen instead of the camera feed using `navigator.mediaDevices.getDisplayMedia()`.

7. **Device Management**:
   - Enumerate all available media devices (audio input, audio output, video input).
   - Change audio input, audio output, and video input devices dynamically.
