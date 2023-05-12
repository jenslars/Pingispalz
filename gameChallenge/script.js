//Play button
document.getElementById("button").addEventListener("click", function(){
    document.querySelector(".popup").style.display = "flex";
})

document.querySelector(".close").addEventListener("click", function(){
    document.querySelector(".popup").style.display = "none";
})


//gameChallenge funktion
const inviteButton = document.getElementById('sendChallenge');
inviteButton.addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value;
    const inviteMessage = `Hey ${playerName}, want to play a game with me?`;


  //Skriv kod här för att skicka inbjudan til en spelare
  sendInvite(playerName, inviteMessage);
});

function sendInvite(playerName, inviteMessage) {
    const inviteEndpoint = 'https://.....';

    const payload = {
        playerName: playerName,
        message: inviteMessage
      };

// Jag behöver bjuda in spelaren med POST request
fetch(inviteEndpoint, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (response.ok) {
      console.log(`Invite sent to ${playerName}`);
    } else {
      console.error('Failed to send invite');
    }
  })
  .catch(error => {
    console.error('Error sending invite:', error);
  });
}

  // Här ska man skriva en kod för att skicka en inbjuda till en specifik spelare,
  
  // gör en inbljuda till spelservern med fetch() funktionen 
  // eller använd websocket för att skicka meddelandet direkt till den andra användarens browser

  //Printar ut vem man skickar invite till och meddelande
  console.log(`Sending invite to ${playerName}: ${inviteMessage}`);

