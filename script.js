// Function to convert temperature from Kelvin to Celsius
function kelvinToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(2);
}

function formatTime(time) {
  var hours = ('0' + time.getHours()).slice(-2); // Ensure two-digit format for hours
  var minutes = ('0' + time.getMinutes()).slice(-2); // Ensure two-digit format for minutes

  return hours + ':' + minutes; // Return formatted time string
}

function speakWeatherInfo(city, description, temperature,place, sunrise, sunset) {
  var message = "The weather in " + city + " is currently " + description + " and the temperature is " + temperature + " degrees Celsius. ";
  message += "The sunrise is at " + sunrise + " and the sunset is at " + sunset + ".";
  
  var speech = new SpeechSynthesisUtterance(message);
  speech.lang = 'en-US';
  
  window.speechSynthesis.speak(speech);
}

// Function to change background based on weather description and time
function changeBackground(weatherDescription) {
  const body = document.getElementById('body');
  const currentTime = new Date().getHours();

  // Map weather descriptions to background styles
  const backgroundStyles = {
    'clear sky': 'url("https://images.unsplash.com/photo-1467740100611-36858db27485?q=80&w=1746&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'few clouds': 'url("https://images.unsplash.com/photo-1466527496777-6ed64c30572e?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'scattered clouds': 'url("https://images.unsplash.com/photo-1642447733831-2cdd9f5efae7?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'broken clouds': 'url("https://images.unsplash.com/photo-1642447733831-2cdd9f5efae7?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'shower rain': 'url("https://images.unsplash.com/photo-1438449805896-28a666819a20?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'rain': 'url("https://images.unsplash.com/photo-1438449805896-28a666819a20?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'thunderstorm': 'url("https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'snow': 'url("https://images.unsplash.com/photo-1414541944151-2f3ec1cfd87d?q=80&w=1748&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    'mist': 'url("https://images.unsplash.com/photo-1560996025-95b43d543770?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
  };

  // Set background style based on weather description and time
  if (backgroundStyles.hasOwnProperty(weatherDescription)) {
    body.style.backgroundImage = backgroundStyles[weatherDescription];
  } else {
    // Set default background if description doesn't match
    body.style.backgroundImage = backgroundImage;
  }
}

document.getElementById("voice-search-button").addEventListener("click", function() {
  recognizeSpeech();
});

function recognizeSpeech() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  
  recognition.onresult = function(event) {
    const speechToText = event.results[0][0].transcript;
    document.getElementById("city-input").value = speechToText;
    searchWeather(speechToText);
  }
  
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
  }
}

// Add event listener for clicking the search button
document.getElementById("search-button").addEventListener("click", function() {
  var city = document.getElementById("city-input").value;
  searchWeather(city);
});


document.getElementById("search-button").addEventListener("click", function() {
  var city = document.getElementById("city-input").value;
  fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=efa343dc4e8b491453855c6c6d106bab")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const temperature = kelvinToCelsius(data.main.temp);
      const place = data.name;
      const country = data.sys.country;
      const description = data.weather[0].description;
      const icon = data.weather[0].icon;
      const sunrise = formatTime(new Date(data.sys.sunrise * 1000));
      const sunset = formatTime(new Date(data.sys.sunset * 1000));

      // Change background based on weather description
      changeBackground(description);
      
      document.getElementById("place").innerHTML = place;
      document.getElementById("country").innerHTML = country;
      document.getElementById("temperature").innerHTML = temperature + "°C";
      document.getElementById("icon").src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      document.getElementById("description").innerHTML = description;
      document.getElementById("sunrise").innerHTML = "Sunrise: " + sunrise;
      document.getElementById("sunset").innerHTML = "Sunset : " + sunset;
      speakWeatherInfo(city, description, temperature, place, sunrise, sunset);
      
      // Update time every second
      setInterval(updateTime, 1000);  
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});
