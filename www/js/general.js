// API Utils
const OPENWEATHER_KEY = "577170a37c71d9c209c23f0d23034520";
const SCORE_API_URL = "http://127.0.0.1:8080/API";
const LEVEL_URL = "http://127.0.0.1:8080/levels";

async function getLocation(options = {timeout: 30, maximumAge: 0, enableHighAccuracy: true}) {
  const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options)).catch(() => null);
  if (pos === null) return {lat: 180 - (Math.random() * 360), long: 90 - (Math.random() * 180)};
  return {lat: pos.coords.latitude, long: pos.coords.longitude};
}

async function getWeather(lat, long) {
  try {
    const req = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${long}&appid=${OPENWEATHER_KEY}`);
    if (!req.ok) throw new Error("fetch status not OK");
    const data = await req.json();
    return {
      weather: data.weather[0].main,
      temp: data.main.temp,
    };
  } catch(e) {
    console.log("Weather Error: " + e);
    return {
      weather: "none",
      temp: 20,
    };
  }
}

// Fills the leaderboards
function fillLeaderboards(level) {
  fillLeaderboard(document.querySelector("#fire"), level, "hot", "Fire");
  fillLeaderboard(document.querySelector("#ice"), level, "ice", "Ice");
  fillLeaderboard(document.querySelector("#neutral"), level, "", "Neutral");
  fillLeaderboard(document.querySelector("#wet"), level, "rain", "Wet");
  fillLeaderboard(document.querySelector("#ice-wet"), level, "ice,rain", "Blizzard");
  fillLeaderboard(document.querySelector("#hot-wet"), level, "rain,hot", "Acid");
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
async function sendLeaderboardData(level, time, coins, weather) {
  try {
    if (GlobalObject.currentLevelIndex !== -1) {
      const req = await fetch(`${SCORE_API_URL}/score?name=${GlobalObject.userNick}&time=${time}&weather=[]&coins=${coins}&level=${level}`, {method:"POST"});
      if (!req.ok) throw new Error("fetch status not OK");
    }
  } catch(e) {
    console.log("Score post error: " + e);
  }
}

async function showGameOverPopup() {

}

function showLeaderboard() {
  document.querySelector("#leaderboard-left").classList.remove("hidden");
  document.querySelector("#leaderboard-right").classList.remove("hidden");
}

function hideLeaderboard() {
  document.querySelector("#leaderboard-left").classList.add("hidden");
  document.querySelector("#leaderboard-right").classList.add("hidden");
}

function playGame() {
  GlobalObject.activeEngine = new GameEngine(document.getElementById("mainCanvas"), GlobalObject.levelData);
  GlobalObject.activeEngine.onEnd(e => {
    GlobalObject.activeEngine = null;
    console.log("Game Over");
    if (e.getWon()) {
      (async () => {
        showLeaderboard();
        await sendLeaderboardData(GlobalObject.levelData.id, parseInt(e.getTime()), e.getCoins(), GlobalObject.conditionData);
        fillLeaderboard(GlobalObject.levelData.id);
      })();

      showLevelPopup(GlobalObject.levelData.id, parseInt(e.getTime()), e.getCoins(), GlobalObject.levelData.coinTotal, GlobalObject.conditionData)
        .then(() => {
          hideLeaderboard();
          playNextLevel();
        })
        .catch(() => {
          hideLeaderboard();
          playGame();
        });
    } else {
      playGame();
    }
  });
}

async function getLevelIndex() {
  try {
    const req = await fetch(`${LEVEL_URL}/index.json`);
    if (!req.ok) throw new Error("fetch status not OK");
    return await req.json();
  } catch(e) {
    console.log("get level index error: " + e);
  }
};

async function getLevelData() {
  try {
    const req = await fetch(`${LEVEL_URL}/${GlobalObject.levelIndex[GlobalObject.currentLevelIndex]}`);
    if (!req.ok) throw new Error("fetch status not OK");
    return await req.json();
  } catch(e) {
    console.log("get level error: " + e);
  }
};

async function playNextLevel() {
  if (GlobalObject.currentLevelIndex !== -1) {
    ++GlobalObject.currentLevelIndex;
    if (GlobalObject.currentLevelIndex >= GlobalObject.levelIndex.length)
      GlobalObject.currentLevelIndex = 0;
    GlobalObject.levelData = await getLevelData();
    updateLevelDataWithWeather();
    playGame();
  } else {
    playGame();
  }
}

function updateLevelDataWithWeather() {

}

(async () => {
  const nick = showNickPopup();
  setInterval(leaderboardLoop, 5000);
  //fillLeaderboards(1);

  const location = await getLocation();
  const weather = await getWeather(location.lat, location.long);
  GlobalObject.conditionData = weather;
  weatherEffects(weather);
  GlobalObject.levelIndex = await getLevelIndex();
  if (GlobalObject.levelIndex.length > 0) { 
    GlobalObject.currentLevelIndex = 0;
    GlobalObject.levelData = await getLevelData();
  } else {
    console.log("Error");
    //Add fallback level here
  }

  updateLevelDataWithWeather();
  GlobalObject.userNick = await nick;
  playGame();
})();
