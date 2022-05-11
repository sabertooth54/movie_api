const express = require("express"),
  morgan = require("morgan");

const app = express();
const bodyParser = require("body-parser"),
  methodOverride = require("method-overide");

//Error handling code using express
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Morgan’s “common” format, which logs basic data such as IP address
app.use(morgan("common"));

let topMovies = [
  {
    title: "Breaking Bad",
    actors: "Bryan Cranston, Aaron Paul, Giancarlo Esposito",
  },
  {
    title: "Queen of the South",
    actors: "Alice Braga, Hemky Madera, Peter Gadiot",
  },
  {
    title: "Top Boy",
    actors: "Ashley Walters, Micheal Ward, Little Simz",
  },
];

//Get requests
app.get("/", (req, res) => {
  res.send("Welcome to the next level of watching movies!");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

//This code eliminates the need to manually write out individual routes for each static file inside the public folder.
app.use(express.static("public"));

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
