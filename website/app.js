/* Global Variables */
// Personal API Key for OpenWeatherMap API
const API_KEY = "c8b35321e4319a727a2a7258089d9742&units=imperial";
//main content
const mainContentDiv = document.querySelector(".main-content-section");
const feelingsContainer = document.querySelector(".feelings-container");

const tempAndUnitsHolder = document.querySelector(".tempAndUnits-holder");
const tempDiv = document.querySelector("#temp");
const celsiusSymbol = document.querySelector(".celsius");
const fahrenheitSymbol = document.querySelector(".fahrenheit");
const separetorSymbol = document.querySelector(".separator");

const cityAndDateHolder = document.querySelector(".cityAndDate-holder");
const cityDiv = document.querySelector("#city");
const dateDiv = document.querySelector("#date");

const weatherImgHolder = document.querySelector(".weatherImg-holder");
const weatherImage = document.querySelector(".weatherImg-holder img");
const weatherDescriptionDiv = document.querySelector(".weather-description");

//aside content
const asideContentDiv = document.querySelector(".aside-content-holder");
const cloudyValueDiv = document.querySelector(".cloudy div.value");
const humidityValueDiv = document.querySelector(".humidity  div.value");
const windValueDiv = document.querySelector(".wind div.value");
const visibilityValueDiv = document.querySelector(".visibility div.value");

//generate button
const generateBtn = document.getElementById("generate");

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?";

const days = ["Sun", "Mon", "Tues", "Wed", "Thrus", "Fri", "Sat"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Create a new date instance dynamically with JS
let d = new Date();
let day = d.getDate();
let year = d.getFullYear();
let hours = d.getHours();
let minutes = d.getMinutes() > 9 ? d.getMinutes() : "0" + d.getMinutes();
let time = `${hours}:${minutes}`;
let dayName = days[d.getDay()];
let monthName = months[d.getMonth()];
let newDate = `${time} - ${dayName}, ${day} ${monthName} ${year}`;

let tempInFahernheit = 0;

/*  end of golbal varables  */

//*  start of Helper functions  *//

function getCityOrZip(location) {
  let cityOrZip = "";
  isNaN(location) ? (cityOrZip = "q=") : (cityOrZip = "zip=");
  return cityOrZip;
}

/**
 * @description method to covert temperature from fahernheit to celsius.
 * @param {number} fahernheit is the fahernheit value of temperature.
 * @returns {number} celsius value of temperature.
 */
function inCelsius(fahernheit) {
  const celsius = (fahernheit - 32) * (5 / 9);
  return celsius.toFixed(0);
}

/**
 * @description method to covert temperature from celsius to fahrenheit.
 * @param {number} celsius is the celsius value of temperature.
 * @returns {number} fahrenheit value of temperature.
 */
function inFahrenheit(celsius) {
  const fahrenheit = celsius * (9 / 5) + 32;
  return fahrenheit.toFixed(0);
}

/**
 * @description method to add active class to specific element.
 * @param {Element} element
 */
function addActiveClass(element) {
  if (!element.classList.contains("active")) {
    element.classList.add("active");
  }
}

/**
 * @description method to remove active class from specific element.
 * @param {Element} element
 */
function removeActiveClass(element) {
  if (element.classList.contains("active")) {
    element.classList.remove("active");
  }
}

/**
 * @description method to filter cities.
 * @param {Array} cities
 * @returns {Array} of max 3 non duplicated values doesnt contains ['',null,undefined].
 */
function filterCities(cities) {
  const clearArray = cities.filter((element) => {
    return element !== "" && element !== null && element !== undefined;
  });
  return clearArray.reverse().slice(0, 3);
}

/**
 * @description method to make model of data or object of data needed.
 * @param {data} json data from api
 * @returns {object} of need data that we will send to server to save it.
 */
function makeDataModel(data) {
  dataModel = {};
  //date
  dataModel.date = data.date;
  //user feelings
  dataModel.userFeelings = data.feelings || "";
  //temp in fahernheit(imperial)
  tempInFahernheit = data["weather-data"]["main"]["temp"];
  dataModel.tempInFahernheit = tempInFahernheit;
  //city name
  dataModel.city = data["weather-data"]["name"];
  //favorite Cities
  dataModel.favoriteCities = filterCities(data["favorite-Cities"]);
  //weather icon
  dataModel.weatherIcon = data["weather-data"]["weather"][0].icon;
  //weather description
  dataModel.weatherDescription =
    data["weather-data"]["weather"][0]["description"];
  //cloudy
  dataModel.cloudy = data["weather-data"]["clouds"]["all"];
  //humidity
  dataModel.humidity = data["weather-data"]["main"]["humidity"];
  //wind
  dataModel.wind = data["weather-data"]["wind"]["speed"];
  //visibility
  dataModel.visibility = data["weather-data"]["visibility"];

  return dataModel;
}

/**
 * @description method to return url of weather icon provided by api.
 * get weather icon string to get weather image
 * for more information about weather data and icons check https://openweathermap.org/weather-conditions
 * @param {string} icon data from api
 * @returns {string} of weather icon url, this url will be use in img later.
 */
function getIconUrl(icon) {
  const weatherIconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
  return weatherIconUrl;
}
//*  end of Helper functions  *//

// Event listener to add function to existing HTML DOM element

generateBtn.addEventListener("click", generate);

/* Function called by event listener */
function generate(event) {
  const userLocation = document.getElementById("location-user-input").value;
  const feelingsValue = document.getElementById("feelings-user-input").value;
  //check userlocation input and adapt the basic url with needed.
  const cityOrZip = getCityOrZip(userLocation);

  const url = BASE_URL + cityOrZip + userLocation + "&appid=" + API_KEY;

  //start of promise
  getWebApiData(url)
    .then(
      // incase of resolve
      (weatherData) => {
        console.log("api data fetched.");
        console.log(weatherData);
        if (weatherData.cod === 200) {
          console.log("data is okay data will post to local server");
          postNewData("/add", {
            date: newDate,
            feelings: feelingsValue,
            "weather-data": weatherData,
          });
          return true;
        } else {
          console.log("data isnot ok data will not post");
          return false;
        }
      }
    )
    .then((isValid) => {
      isValid ? updateUI(event.target) : showNotFound();
    })
    .catch((e) => {
      console.log(Error("promise chain failled") + e);
    });
}
/* Function to GET Web API Data*/
/**
 * @description method to fetch data from web server
 * @param {string} url is the url of our local server in our case https://api.openweathermap.org/data/2.5/weather?zip={zip_code}&appid={api_key}
 * @returns {object} data object of weath according to zip code.
 */
const getWebApiData = async function (url = "") {
  const res = await fetch(url);
  try {
    const weatherData = await res.json();
    return weatherData;
  } catch (e) {
    console.log("error: " + e);
  }
};

/* Function to POST data */
/**
 * @description method for posting new data to our local server.
 * @param {string} url is the url of our local server in our case http://localhost:3030/add or simply "/add"
 * @param {object} data is the data object that contains date , temp , and user feelings these data we will send to server.
 */
const postNewData = async (url = "", data = {}) => {
  //fetch method take url and request options
  const res = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  try {
    const newData = await res.json();
    return newData;
  } catch (e) {
    console.log("error: " + e);
  }
};

/* Function to GET Project Data */
/**
 * @description method to get all project data from our local server.
 * @param {string} url is the url of our local server in our case http://localhost:3030/all or simply "/all"
 * @returns {object} data object of all project data stored in local server.
 */
const getAllData = async function (url = "") {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (e) {
    console.log(Error("error while getting data from server") + e);
  }
};

const getHistoryData = async function (url = "") {
  const res = await fetch(url);
  try {
    const historyData = await res.json();
    return historyData;
  } catch (e) {
    console.log(Error("get history data failed"));
  }
};

/**
 * @description method to show city not found if we have no data for ciy or zip writen by user
 */
function showNotFound() {
  console.log("show not found invoke ");
  asideContentDiv.classList.add("gone");
  mainContentDiv.classList.add("gone");
  document.querySelector(".not-found").classList.remove("gone");
}

//******** start of updat ui ***********//
/**
 * @description method to update ui with the all data from local server.
 */
const updateUI = async function (target) {
  allData = {};
  if (target.id === "generate") {
    //all data updated from current data from server
    allData = await getAllData("/all");
  } else {
    //return array of data objects that hold history data
    const historyData = await getHistoryData("/history");

    //loop through array to get object data which equvilant to city clicked in favorite location
    for (const dataObj of historyData) {
      const city = dataObj["weather-data"].name;
      if (target.id === city) {
        //all data updated from history data array
        allData = dataObj;
      }
    }
  }
  //arrange data in new object (model)
  const model = makeDataModel(allData);

  //add dynamic element for feelings and updat it with data
  feelingsContainer.innerHTML = `
    <div id="content">${model.userFeelings}</div>`;

  //update units and separetor
  celsiusSymbol.innerHTML = `&#8451;`;
  fahrenheitSymbol.innerHTML = `&#8457;`;
  separetorSymbol.innerHTML = `|`;
  //check where is active class now
  let temp = 0;
  if (fahrenheitSymbol.classList.contains("active")) {
    temp = model.tempInFahernheit.toFixed(0);
  } else {
    temp = inCelsius(tempInFahernheit);
  }
  tempDiv.innerText = `${temp > 9 ? temp : "0" + temp}`;

  //update city and date values
  cityDiv.innerText = model.city;
  dateDiv.innerText = model.date;

  //update weather image and wether description
  weatherImage.setAttribute("src", getIconUrl(model.weatherIcon));
  weatherDescriptionDiv.innerText = model.weatherDescription;

  //update favorite or history of city searched
  const frag = new DocumentFragment();
  // console.log(model.favoriteCities);
  for (let i = 0; i < model.favoriteCities.length; i++) {
    let element = document.createElement("div");

    element.classList.add("location");

    element.setAttribute("id", model.favoriteCities[i]);

    element.innerText = model.favoriteCities[i];

    element.addEventListener("click", getCityData);
    //adding to fragment for best performance
    frag.appendChild(element);
  }
  //replace old children with new ones
  document.querySelector(".locations").replaceChildren(...frag.childNodes);
  //adding favorite locaiton pargraph in the top of childrens.
  document
    .querySelector(".locations")
    .insertAdjacentHTML("afterbegin", `<p>Favorite Locations</p>`);

  //update aside content values
  cloudyValueDiv.innerText = `${model.cloudy}%`;
  humidityValueDiv.innerText = `${model.humidity}%`;
  windValueDiv.innerText = `${model.wind}miles/hour`;
  visibilityValueDiv.innerText = `${model.visibility / 1000}miles`;

  //show content after update values
  mainContentDiv.classList.remove("gone");
  asideContentDiv.classList.remove("gone");
  document.querySelector(".not-found").classList.add("gone");

  console.log("UI updated");
};

//******** end of updat ui ***********//

function getCityData(e) {
  console.log(e.target);
  try {
    updateUI(e.target);
  } catch (error) {
    console.log(Error("error" + e));
  }
}

//adding click event to celsuis symoble.
//callback function will conver temp to celsuis.
celsiusSymbol.addEventListener("click", () => {
  // console.log("celsius clicked");
  addActiveClass(celsiusSymbol);
  removeActiveClass(fahrenheitSymbol);
  tempDiv.innerText = inCelsius(tempInFahernheit);
});

//adding click event to fahernheit symoble.
//callback function will conver temp to fahrenheit.
fahrenheitSymbol.addEventListener("click", () => {
  // console.log("fahrenheit clicked");
  addActiveClass(fahrenheitSymbol);
  removeActiveClass(celsiusSymbol);
  tempDiv.innerText = tempInFahernheit.toFixed(0);
});
