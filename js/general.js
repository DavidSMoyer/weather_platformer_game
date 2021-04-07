const KEY = "577170a37c71d9c209c23f0d23034520";
let conditionData;
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
let userNick;

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

(async () => {
  const scoreData = await fetch("/API/score").then(response => response.json());
})()