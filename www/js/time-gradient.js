const time = new Date();

if (time.getHours() >= 21 || time.getHours() <= 5) {
  document.body.classList.add("night");
} else if (time.getHours() <= 20 && time.getHours() >= 7) {
  document.body.classList.add("day");
} else {
  document.body.classList.add("set");
}