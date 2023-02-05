// Setup empty JS object to act as endpoint for all routes
projectData = {};
favoriteCities = [];
historyData = [];

//Require chalk for Terminal string styling
const chalk = require("chalk");

// Require Express to run server and routes
const express = require("express");

// Start up an instance of app
const app = express();

/* Middleware*/
const bodyParser = require("body-parser");
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require("cors");
app.use(cors());

// Initialize the main project folder
app.use(express.static("website"));

// Setup Server
const port = 3030;

//start the server
app.listen(port, listening);

//server callback function
function listening() {
  console.log(chalk.blue("####################"));
  console.log(
    chalk.bold.yellow("Server Is ") +
      chalk.green.bold("Running") +
      chalk.bold.yellow("...")
  );
  console.log(
    chalk.bold.green.inverse("Server is running at port: ") +
      chalk.red.bold.inverse(` ${port} `) +
      chalk.blue("\n####################")
  );
}

//setup Routes and Callbacks

//GET Route
app.get("/all", getAllDataFromServer);

function getAllDataFromServer(req, res) {
  //add favorite cities to project data
  projectData["favorite-Cities"] = favoriteCities;
  res.send(projectData);
  console.log(projectData);
}
//route node for history data
app.get("/history", getHistoryData);

function getHistoryData(req, res) {
  historyData["favorite-Cities"] = favoriteCities;
  res.send(historyData);
  console.log(historyData);
}

//POST Route
app.post("/add", addNewData);

function addNewData(req, res) {
  projectData = {};
  projectData = req.body;
  favoriteCities.push(projectData["weather-data"]["name"]);
  historyData.push(projectData);
}
