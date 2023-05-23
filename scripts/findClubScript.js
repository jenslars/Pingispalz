document.addEventListener('DOMContentLoaded', function() {
    printClubs()
});

function printClubs() {
    fetch('/findClub')
      .then(response => response.json())
      .then(data => {
  
        let clubData = data.results;
        assignPlacements(clubData);
        const ladder = document.getElementById('clubs');
        ladder.innerHTML = '';
  
        clubData.forEach(club => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${club.leaderboard_image}</td>
            <td>${club.leaderboard_name}</td>
            <td>${club.owner}</td>
            <td>${club.leaderboard_description}</td>
          `;
          ladder.appendChild(row);
        });
    });
}