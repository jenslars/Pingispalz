document.addEventListener('DOMContentLoaded', function() {
    printClubs()
});

let clubToLeave

function leaveClubPopup(club) {
  var leaveClubPopupDiv = document.getElementById('leaveClubPopup');
  var gridcontainerLink = document.getElementById('blur');
  clubToLeave = club
  leaveClubPopupDiv.classList.add('active');
  gridcontainerLink.classList.add('active');
}

function exitPopup() { //fixa denna 
  var leaveClubPopupDiv = document.getElementById('leaveClubPopup');
  var gridcontainerLink = document.getElementById('blur');
  leaveClubPopupDiv.classList.remove('active');
  gridcontainerLink.classList.remove('active');   
}

function joinClub(club){
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/joinClub');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
      if (xhr.status === 200) {
          document.getElementById('join-club-success').innerHTML = 'Successfully joined the club';
          window.location.reload();
      } else {
          document.getElementById('join-club-error').innerHTML = 'Unable to join the club';
      }
  };
  xhr.onerror = function() {
      document.getElementById('join-club-error').innerHTML = 'Unable to join the club';
  };
  xhr.send(JSON.stringify({ club }));
}

function leaveClub(){
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/leaveClub');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
      if (xhr.status === 200) {
          document.getElementById('join-club-success').innerHTML = 'Successfully left the club';
          window.location.reload();
      } else {
          document.getElementById('join-club-error').innerHTML = 'Unable to leave the club';
      }
  };
  xhr.onerror = function() {
      document.getElementById('join-club-error').innerHTML = 'Unable to leave the club';
  };
  xhr.send(JSON.stringify({ clubToLeave }));
}

function printClubs() {
  fetch('/findClub', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    let clubData = data.leaderboards;
    let userData = data.users_in_leaderboards;
    const ladder = document.getElementById('clubs');
    ladder.innerHTML = '';
    
    clubData.forEach(club => {
      const row = document.createElement('tr');
      const newTableName = `${club.leaderboard_name}#${club.id}`;
      row.innerHTML = `
        <td><img class="clubImage" src="/${club.leaderboard_image}"></img></td>
        <td>${club.leaderboard_name}</td>
        <td>${club.username}</td>
        <td>${club.leaderboard_description}</td>
        <td id="joinClubBtn"><button onclick="joinClub('${newTableName}')">Join</button></td>
        <td id="leaveClubBtn"><button onclick="leaveClubPopup('${newTableName}')">Leave</button></td>
      `;
      const isUserInLeaderboard = userData.some(item => item.leaderboard_id === club.id);
      if (isUserInLeaderboard) {
        row.querySelector("#joinClubBtn").style.display = "none"; // Hide "Join" button
      } else {
        row.querySelector("#leaveClubBtn").style.display = "none"; // Hide "Leave" button
      }

      ladder.appendChild(row);
    });
  });
}
