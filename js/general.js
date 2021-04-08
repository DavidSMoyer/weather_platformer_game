// API key
const KEY = "577170a37c71d9c209c23f0d23034520";
const SCORE_API_URL = "http://10.16.6.44:8080/API";
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
(() => {
  fillLeaderboards(1);
  setInterval(leaderboardLoop, 5000)
})();

// Fills the leaderboards
async function fillLeaderboards(level) {
  await fillLeaderboard(document.querySelector("#fire"), level, "hot", "Fire");
  await fillLeaderboard(document.querySelector("#ice"), level, "ice", "Ice");
  await fillLeaderboard(document.querySelector("#neutral"), level, "", "Neutral");
  await fillLeaderboard(document.querySelector("#wet"), level, "rain", "Wet");
  await fillLeaderboard(document.querySelector("#ice-wet"), level, "ice,rain", "Blizzard");
  await fillLeaderboard(document.querySelector("#hot-wet"), level, "rain,hot", "Acid");
}

async function fillLeaderboard(board, level, weather, title) {
  try {
    const req = await fetch(`${SCORE_API_URL}/scores?limit=10&level=${level}&weather=${weather}`);
    if (!req.ok)
      throw new Error("Fetch status not OK");
    const scores = await req.json();
    board.innerHTML = scores.reduce((html, score, index) => html + `
      <li>${index + 1}. ${score.nick} - ${(score.time / 60).toFixed(2)}</li>
    `, `<li class="list-head">${title} Leaderboard</li>`) + "<li></li>".repeat(10 - scores.length);
    console.log(scores);
  } catch(e) {
    console.log("Leaderboard Fill Error: " + e);
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