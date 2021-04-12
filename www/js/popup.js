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

async function showNickPopup() {
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

async function showLevelPopup(level, time, coins, coinTotal, weather) {
  return new Promise((resolve, reject) => {
    resolve();
  });
}