const KEY = "577170a37c71d9c209c23f0d23034520";
let conditionData;

(async () => {
  const location = navigator.geolocation.getCurrentPosition(async (pos) => {
    console.log(pos);
    conditionData = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${KEY}`).
      then(response => response.json());
    conditionData = {
      weather: conditionData.weather[0].main,
      temp: conditionData.main.temp,
      time: new Date()
    }
    console.log(conditionData);
  }, (error) => {
    console.error(error);
  }, {enableHighAccuracy: true})
})();