// Handles popup events
let errorTimeout;
const popup = document.querySelector("#popup");
setTimeout(() => popup.classList.remove("hidden"), 100);
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

function errorPopup() {
  clearTimeout(errorTimeout);
}