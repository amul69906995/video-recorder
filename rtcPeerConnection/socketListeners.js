import { startAnswering,addAnswerToPeerConnection,addIceCandidateToOfferer} from "./script.js";

socket.on('availableOffers',offers=>{
    console.log(offers);
    createAnswerButton(offers);
})
socket.on('waitingNewOffer',offer=>{
    console.log(offer);
    createAnswerButton(offer);

})
const createAnswerButton=(offerObj)=>{
 offerObj.forEach(offer=> {
    const answerButton=document.createElement('button');
    answerButton.textContent="answer to-"+offer.offererUserName;
    const answerDiv=document.querySelector('#answer');
    answerDiv.appendChild(answerButton);
    answerButton.addEventListener('click',()=>{
        startAnswering(offer);
    })
 });
}

socket.on('answerResponse',offerObj=>{
   // console.log("answer Response..................",offerObj);
//add answer to peerconnection by setting remoteDescription(answer)
    addAnswerToPeerConnection(offerObj.answer);
})

socket.on('iceCandidateFromAnswererToOfferer',(iceCandidate)=>{
    //now add these ice candidate to offerer
    addIceCandidateToOfferer(iceCandidate);
})