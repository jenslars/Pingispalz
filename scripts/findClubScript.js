document.addEventListener('DOMContentLoaded', function() {
    printClubs()
});

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
          row.innerHTML = `
            <td><img class="clubImage" src="/${club.leaderboard_image}"></img></td>
            <td>${club.leaderboard_name}</td>
            <td>${club.owner}</td>
            <td>${club.leaderboard_description}</td>
            <td><button>Join</button></td>
          `;
          ladder.appendChild(row);
        });
    });
}