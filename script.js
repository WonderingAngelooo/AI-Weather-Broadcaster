// Typing effect function
function typeEffect(element, speed) {
  const text = element.innerHTML;
  element.innerHTML = '';

  let i = 0;
  const typing = setInterval(function() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(typing);
    }
  }, speed);
}

// Call the typing effect function
const weatherInfo = document.getElementById('weather-info');

// Check if the screen width is greater than a certain threshold (e.g., 768 pixels)
if (window.innerWidth > 768) {
  // Call the typeEffect function for non-mobile view
  const element = document.getElementById('weather-info');
  typeEffect(element, 30);
}

// Function to convert temperature from Kelvin to Celsius
function kelvinToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(2);
}

function formatTime(time) {
  var hours = ('0' + time.getHours()).slice(-2); // Ensure two-digit format for hours
  var minutes = ('0' + time.getMinutes()).slice(-2); // Ensure two-digit format for minutes

  return hours + ':' + minutes; // Return formatted time string
}

// Function to speak weather info and trigger video
function speakWeatherInfo(city, country, description, temperature, place, sunrise, sunset, humidity, windSpeed) {
  var message = "The weather in " + city + country + " is currently " + description + " and the temperature is " + temperature + " degrees Celsius. ";
  message += "The sunrise is at " + sunrise + " the sunset is at " + sunset + " the humidity percentage is " + humidity + "percent " + " and the wind speed is " + windSpeed + " kilometers per hour " + ".";

  var speech = new SpeechSynthesisUtterance(message);
  speech.lang = 'en-US';

  // Get list of available voices
  var voices = window.speechSynthesis.getVoices();

  // Find a female voice
  var femaleVoice = voices.find(voice => voice.name === 'Google UK English Female');

  // When speech synthesis starts speaking, play the second video
  speech.onstart = function() {
    startActiveState();
  };

  // When speech synthesis ends, play the first video again
  speech.onend = function() {
    endActiveState();
  };

  window.speechSynthesis.speak(speech);
}

// Function to trigger speech recognition
function recognizeSpeech() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  // Add text indicating that the mic is on
  const micStatus = document.createElement('p');
  micStatus.textContent = 'Microphone is ON. You can speak now.';
  micStatus.id = 'mic-status';
  document.getElementById('search-container').appendChild(micStatus);

  recognition.onresult = function(event) {
    const speechToText = event.results[0][0].transcript;
    document.getElementById("city-input").value = speechToText;
    if (speechToText.toLowerCase().includes('angelo pogi')) {
      // If the speech contains "angelo pogi", trigger a specific sentence
      var specificSentence = "Angelo is the most handsome person!";
      var specificSpeech = new SpeechSynthesisUtterance(specificSentence);
      specificSpeech.lang = 'en-US';
      specificSpeech.onstart = function() {
        startActiveState();
      };
      specificSpeech.onend = function() {
        endActiveState();
      };
      window.speechSynthesis.speak(specificSpeech);
    } else {
      searchWeather(); // Trigger search after setting the input field value
    }
  }

  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
  }

  // Remove mic status text when the mic is turned off
  recognition.onend = function() {
    const micStatus = document.getElementById('mic-status');
    if (micStatus) {
      micStatus.parentNode.removeChild(micStatus);
    }
  }
}

// Function to trigger weather search when Enter key is pressed
document.getElementById("city-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    // Prevent the default action of the Enter key (e.g., form submission)
    event.preventDefault();
    // Start speech recognition
    recognizeSpeech();
  }
});

// Function to trigger weather search
function searchWeather() {
  var city = document.getElementById("city-input").value;
  fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=efa343dc4e8b491453855c6c6d106bab")
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
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
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;


      

      document.getElementById("place").innerHTML = place + " " + country;
      document.getElementById("temperature").innerHTML = "Temp: " + temperature + "°C";
      document.getElementById("icon").src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      document.getElementById("icon").style.width = "150px"; // Adjust the width as needed
      document.getElementById("icon").style.height = "150px"; // Adjust the height as needed
      document.getElementById("description").innerHTML = "Description: " + description.charAt(0).toUpperCase() + description.slice(1);
      document.getElementById("sunrise").innerHTML = "Sunrise: " + sunrise;
      document.getElementById("sunset").innerHTML = "Sunset: " + sunset;
      document.getElementById("humidity").innerHTML = "Humidity: " + humidity + "%";
      document.getElementById("windSpeed").innerHTML = "Wind: " + windSpeed + "<small>Kph</small>";

      speakWeatherInfo(city, country, description, temperature, place, sunrise, sunset, humidity, windSpeed);
    })
    .catch(error => {
      console.error("Error:", error);
      // Speak the error message when city not found
      var errorMessage = "City not found. Please enter a valid city name.";
      var errorSpeech = new SpeechSynthesisUtterance(errorMessage);
      errorSpeech.lang = 'en-US';
      errorSpeech.onstart = function() {
        startActiveState();
      };
      errorSpeech.onend = function() {
        endActiveState();
      };
      window.speechSynthesis.speak(errorSpeech);
    });
}

// Function to change background based on weather description
function changeBackground(weatherDescription) {
  const body = document.getElementById('body');
  body.style.backgroundImage = 'none'; // Remove any existing background image
}

// Function to start active state (show active video)
function startActiveState() {
  document.getElementById('background-video-idle').classList.add('hidden'); // Hide idle video
  document.getElementById('background-video-active').classList.remove('hidden'); // Show active video
}

// Function to end active state (show idle video)
function endActiveState() {
  document.getElementById('background-video-active').classList.add('hidden'); // Hide active video
  document.getElementById('background-video-idle').classList.remove('hidden'); // Show idle video
}

// Event listener for the search button
document.getElementById("search-button").addEventListener("click", searchWeather);

// Event listener for the voice button
document.getElementById("voice-search-button").addEventListener("click", recognizeSpeech);
