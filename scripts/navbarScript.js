//All scripts for the navbar

//Runs Script when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    getUserInfoForNav()
    fetchClubLinks()
    });

//Logout function/eventlistener
document.getElementById("logout").addEventListener("click", async (event) => {
    event.preventDefault();

    try {
    const response = await fetch("/logout", {
        method: "POST",
    });

    if (response.ok) {
        window.location.href = "/";
    } else {
        console.error("Error: " + response.status);
    }
    } catch (err) {
    console.error("Error: " + err);
    }
});

//Popup for changing status
function changestatuspopup() {
    var statuspopupdiv = document.getElementById('statuspopupdiv');
    statuspopupdiv.classList.toggle('active');
}

//Function for fetching user info for nav
function getUserInfoForNav() {
    fetch('/getLoggedInUserInfoForNav')
    .then(response => response.json())
    .then(data => {
        document.getElementById('navprofileimage').src = `/${data.profile_image}`;
        document.getElementById('navusername').textContent = data.username;
        document.getElementById('navstatus').textContent = data.status;

        var navstatus = document.getElementById('changestatusbutton');
        var status = data.status;

        if (status === 'Away') {
        navstatus.classList.add('away');
        navstatus.classList.remove('matchready');
        navstatus.classList.remove('online');
        } else if (status === 'Match ready') {
        navstatus.classList.add('matchready');
        navstatus.classList.remove('away');
        navstatus.classList.remove('online');
        } else if (status === 'Online') {
        navstatus.classList.add('online');
        navstatus.classList.remove('matchready');
        navstatus.classList.remove('away');
        }
    });
}

//Function for setting status online
async function setstatusonline() {
    try {
    const response = await fetch("/setstatusonline", {
        method: "POST",
    });

    if (response.ok) {
        getUserInfoForNav()
        changestatuspopup()
    } else {
        console.error("Error: " + response.status);
    }
    } catch (err) {
    console.error("Error: " + err);
    }
}

//Function for setting status away 
async function setstatusaway() {
    try {
    const response = await fetch("/setstatusaway", {
        method: "POST",
    });

    if (response.ok) {
        getUserInfoForNav()
        changestatuspopup()
    } else {
        console.error("Error: " + response.status);
    }
    } catch (err) {
    console.error("Error: " + err);
    }
}

//Function for setting status match ready
async function setstatusmatchready() {
    try {
    const response = await fetch("/setstatusmatchready", {
        method: "POST",
    });

    if (response.ok) {
        getUserInfoForNav()
        changestatuspopup()
    } else {
        console.error("Error: " + response.status);
    }
    } catch (err) {
    console.error("Error: " + err);
    }
}

// Get the div where the links are displayed
function fetchClubLinks() {
    const clubLinksDiv = document.getElementById('clublinks');
    fetch('/clubLinks')
        .then(response => response.json())
        .then(leaderboardsData => {
            leaderboardsData.forEach((leaderboard) => {
                const link = document.createElement('a');
                link.href = `/leaderboards/${leaderboard.id}`; 
                link.classList.add('club-link'); 
                const image = document.createElement('img');
                image.src = `/${leaderboard.leaderboard_image}`;
                link.appendChild(image);
                clubLinksDiv.appendChild(link);
            });
        })
        .catch(error => console.error(error));
}

//Popup for adding leaderboards
function leaderboardpopup() {
    var leaderboardpopupDiv = document.getElementById('leaderboardpopup');
    var gridcontainerLink = document.getElementById('blur');
    leaderboardpopupDiv.classList.add('active');
    gridcontainerLink.classList.add('active');
}

//Exits popup for adding leaderboards
function exitpopup() {
    var leaderboardpopupDiv = document.getElementById('leaderboardpopup');
    var gridcontainerLink = document.getElementById('blur');
    leaderboardpopupDiv.classList.remove('active');
    gridcontainerLink.classList.remove('active');   
}

//Sends Join a Club form to backend
document.getElementById('join-club-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const club = document.getElementById('join-club-input').value;

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
});

//Navbar link function
var homeLink = document.getElementById('home');
var searchLink = document.getElementById('search');
var leaderboardsLink = document.getElementById('leaderboards');
var challengesLink = document.getElementById('challenges');
var profileLink = document.getElementById('profile');
var searchfieldLink = document.getElementById('searchfield');
var leaderboardoptionsLink = document.getElementById('leaderboardoptions');

homeLink.addEventListener('click', function() {
homeLink.classList.add('active');

searchLink.classList.remove('active');
searchfieldLink.classList.remove('active');
leaderboardsLink.classList.remove('active');
leaderboardoptionsLink.classList.remove('active');
challengesLink.classList.remove('active');
profileLink.classList.remove('active');
});

searchLink.addEventListener('click', function() {
searchLink.classList.add('active');
searchfieldLink.classList.add('active');

homeLink.classList.remove('active');
leaderboardsLink.classList.remove('active');
leaderboardoptionsLink.classList.remove('active');
challengesLink.classList.remove('active');
profileLink.classList.remove('active');
});

leaderboardsLink.addEventListener('click', function() {
leaderboardsLink.classList.add('active');
leaderboardoptionsLink.classList.add('active');

homeLink.classList.remove('active');
searchLink.classList.remove('active');
searchfieldLink.classList.remove('active');
challengesLink.classList.remove('active');
profileLink.classList.remove('active');
});

challengesLink.addEventListener('click', function() {
challengesLink.classList.add('active');

homeLink.classList.remove('active');
searchLink.classList.remove('active');
searchfieldLink.classList.remove('active');
leaderboardsLink.classList.remove('active');
leaderboardoptionsLink.classList.remove('active');
profileLink.classList.remove('active');
});

profileLink.addEventListener('click', function() {
profileLink.classList.add('active');
homeLink.classList.remove('active');
searchLink.classList.remove('active');
searchfieldLink.classList.remove('active');
leaderboardsLink.classList.remove('active');
leaderboardoptionsLink.classList.remove('active');
challengesLink.classList.remove('active');
});