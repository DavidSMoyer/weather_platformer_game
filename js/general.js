// API key
const KEY = "577170a37c71d9c209c23f0d23034520";
// Data on the surrounding conditions
let conditionData;
// User location
const userLocation = navigator.geolocation.getCurrentPosition(async (pos) => {
  conditionData = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${KEY}`).
    then(response => response.json());
  conditionData = {
    weather: conditionData.weather[0].main,
    temp: conditionData.main.temp,
    time: new Date()
  }
  weatherEffects(conditionData);
}, (error) => {
  console.error(error);
}, {enableHighAccuracy: true});
// User nickname
let userNick;

// Handles popup events
const popup = document.querySelector("#popup");
const nickForm = document.querySelector("#nickname");
nickForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.querySelector(".nick-input")
  const nickPattern = /^[a-z0-9]+$/i;
  if (nickPattern.test(input.value)) {
    userNick = input.value;
    popup.classList.add("hidden");
  } else {
    alert("Invalid Nickname");
  }
});

// Retrieve leaderboard stats
(async () => {
  fillLeaderboard();
  setInterval(leaderboardLoop, 5000)
})()

// Fills the leaderboards
async function fillLeaderboard() {
  const scoreData = await fetch("http://10.16.6.44:8080/API/scores").
    then(response => response.json());
  const sortedData = {
    "fire": scoreData.filter(user => user.weather === "fire"),
    "ice": scoreData.filter(user => user.weather === "ice"),
    "neutral": scoreData.filter(user => user.weather === "neutral"),
    "wet": scoreData.filter(user => user.weather === "wet"),
    "blizzard": scoreData.filter(user => user.weather === "blizzard"),
    "acid": scoreData.filter(user => user.weather === "acid")
  }
  const leaderboards = {
    "fire": document.querySelector("#fire"),
    "ice": document.querySelector("#ice"),
    "neutral": document.querySelector("#neutral"),
    "wet": document.querySelector("#wet"),
    "blizzard": document.querySelector("#ice-wet"),
    "acid": document.querySelector("#hot-wet")
  }
  for (const key in leaderboards) {
    leaderboards[key].innerHTML = `<li class="list-head">${key.charAt(0).toUpperCase() + key.slice(1)} Leaderboard</li>`;
    sortedData[key].sort((user1, user2) => user2.time - user1.time);
    for (let i = 0; i < 10; i++) {
      if (sortedData[key][i] !== undefined) {
        leaderboards[key].insertAdjacentHTML('beforeend', 
        `
          <li>${i + 1}. ${sortedData[key][i].nick} - ${sortedData[key][i].time}</li>
        `);
      } else {
        leaderboards[key].insertAdjacentHTML('beforeend', 
        `
          <li>${i + 1}.</li>
        `);
      }
    }
  }
}

// Makes the leaderboards cycle
function leaderboardLoop() {
  const left = document.querySelector("#leaderboard-left");
  const leftActive = parseInt(left.dataset.active);
  left.children[leftActive].classList.add("hidden");
  if (leftActive + 1 >= left.children.length) {
    left.children[0].classList.remove("hidden");
    left.dataset.active = 0;
  } else {
    left.children[leftActive + 1].classList.remove("hidden");
    left.dataset.active = leftActive + 1;
  }

  const right = document.querySelector("#leaderboard-right");
  const rightActive = parseInt(right.dataset.active);
  right.children[rightActive].classList.add("hidden");
  if (rightActive + 1 >= right.children.length) {
    right.children[0].classList.remove("hidden");
    right.dataset.active = 0;
  } else {
    right.children[rightActive + 1].classList.remove("hidden");
    right.dataset.active = rightActive + 1;
  }
}

// Will send leaderboard data to the server
function sendLeaderboardData(level, time, coins, weather) {

}