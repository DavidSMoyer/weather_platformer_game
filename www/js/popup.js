// Handles popup events
let errorTimeout;

function displayError() {
  const errorPopup = document.querySelector("#error");
  clearTimeout(errorTimeout);
  errorPopup.classList.remove("hidden");
  const input = document.querySelector(".nick-input");
  input.classList.add("invalid");
  errorTimeout = setTimeout(() => errorPopup.classList.add("hidden"), 2500);
}

function showNickPopup() {
  return new Promise((resolve, reject) => {
    const popup = document.querySelector("#popup");
    const nickForm = document.querySelector("#nickname");
    popup.classList.remove("hidden");

    nickForm.onsubmit = e => {
      e.preventDefault();
      const input = document.querySelector(".nick-input")
      const nickPattern = /^[a-z0-9 ]+$/i;
      if (nickPattern.test(input.value)) {
        popup.classList.add("hidden");
        resolve(input.value);
      } else {
        displayError();
      }
    };
  });
}

function showLevelPopup(level, time, coins, coinTotal, weather) {
  return new Promise((resolve, reject) => {
    let conditionStr = "";
    if (weather.temp >= 30) conditionStr = "Hot";
    if (weather.temp <= -5) conditionStr = "Cold";
    if (weather.weather === "Rain" || weather.weather === "Snow") {
      if (weather.temp >= 30 || weather.temp <= -5) {
        conditionStr += ", Rain";
      } else {
        conditionStr = "Rain";
      }
    }
    if (conditionStr === "") conditionStr = "N/A";
    popup.innerHTML = `
      <h2>Level ${level} Complete</h2>
      <p>Time taken: ${(time / 1000).toFixed(2)} seconds</p>
      <p>Coins collected: ${coins}/${coinTotal}</p>
      <p>Active conditions: ${conditionStr}</p>
      <button class="retry">Retry</button>
      <button class="continue">Continue</button>
    `;
    popup.classList.remove("hidden");
    let promiseFunc = e => {
      if (e.target.classList.contains("continue")) {
        removeEventListener('click', promiseFunc);
        popup.classList.add("hidden");
        resolve();
      } else if (e.target.classList.contains("retry")) {
        removeEventListener('click', promiseFunc);
        popup.classList.add("hidden");
        reject();
      }
    };
    popup.addEventListener('click', promiseFunc);
  });
}