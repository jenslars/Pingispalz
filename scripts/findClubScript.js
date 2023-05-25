document.addEventListener('DOMContentLoaded', function() {
    printClubs()
});


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


function printClubs() {
  fetch('/findClub', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    // console.log(data);
    let clubData = data;
    console.log(clubData);
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
        <td><button onclick="joinClub('${newTableName}')">Join</button></td>
      `;
      ladder.appendChild(row);
    });
  });
}