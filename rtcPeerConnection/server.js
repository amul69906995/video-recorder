const express = require('express');
const app = express();
const https = require('https')
const socketio = require('socket.io')
const fs = require('node:fs')

const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt')
const expressServer = https.createServer({ key, cert }, app);
const io = socketio(expressServer);

app.use(express.static(__dirname));
//array of all offers
/*
{
offererUserName
offer
offererIceCandidate:[]
answererUserName
answer
answererIceCandidate:[]
}
*/
let offers = [];
//map socketId:socket.id and userName
let connectedSocket=[];
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    //when user is connected we grab query using socket.handsake
    const { userName, password } = socket.handshake.auth;
    console.log(userName, password);
    //socket.id and useName relation
    connectedSocket.push({
        socketId: socket.id,
        userName
    })
    //emit all available offer to client when new client connects
    if(offers.length>0){
    socket.emit('availableOffers',offers);
    }
    //newoffer  event
    socket.on('newOffer', (offer) => {
        console.log('new offer received', offer.type);
        offers.push({
            offererUserName:userName,
            offer,
            offererIceCandidate: [],
            answererUserName:null,
            answer:null,
            answererIceCandidate: []
        })
            //now this offer will be sent to all connected user except itself
            socket.broadcast.emit('waitingNewOffer',offers.slice(-1));
    })
    //newAnswer
    socket.on('newAnswer',(offerObj,ackFunction)=>{
        //console.log('new offerObj with answer in it received',offerObj);
        //find which socket to give answer
        const socketToAnswer=connectedSocket.find(s=>s.userName===offerObj.offererUserName);
        if(!socketToAnswer){
            console.log('socket not found for offererUserName',offerObj.offererUserName);
            return;
        }
        //update the local offervariable
        const offerToUpdate=offers.find(o=>o.userName===offerObj.userName);
        //send offerer ice candidate to answerer
        console.log("sending ack function------")
        ackFunction(offerToUpdate.offererIceCandidate)
        if(!offerToUpdate){
            console.log('offer not found');
            return;
        }
        offerToUpdate.answer=offerObj.answer;
        offerToUpdate.answererUserName=offerObj.answererUserName;
       // console.log("updated offer",offerToUpdate);
        //emit to offerer
        socket.to(socketToAnswer.socketId).emit('answerResponse',offerToUpdate);
    })
    //offer ice candidate
    socket.on('sendIceCandidateToSignalingServer',iceCandidateObj=>{
        const {iceCandidate, userName, didIoffer}=iceCandidateObj;
        console.log('ice candidate received',iceCandidateObj);
        //find offer using userName and set iceCandidate according to did i offer 
        if(didIoffer){
            const reqOffer=offers.find(offer=>offer.offererUserName===userName);
            reqOffer.offererIceCandidate.push(iceCandidate);
            // console.log("offerer ice Candidate",reqOffer);
        }
        if(didIoffer===false){
            const reqOffer=offers.find(offer=>offer.answererUserName===userName);
            reqOffer.answererIceCandidate.push(iceCandidate);
            //this we got from answerer so we should send it to offerer
            const socketToAnswer=connectedSocket.find(s=>s.userName===reqOffer.offererUserName);
            socket.to(socketToAnswer.socketId).emit('iceCandidateFromAnswererToOfferer',iceCandidate);
            // console.log("got answerer iceCandidate............",reqOffer);

        }
    })
})

expressServer.listen(3000, () => {
    console.log('server is running on port 3000')
})


