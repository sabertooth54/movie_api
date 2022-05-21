const express = require("express"),
  morgan = require("morgan");
uuid = require("uuid");

const app = express();
const bodyParser = require("body-parser"),
  methodOverride = require("method-override");

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

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["Breaking Bad"],
  },
];

let movies = [
  {
    Title: "Breaking Bad",
    Actors: "Bryan Cranston, Aaron Paul, Giancarlo Esposito",
    Genre: {
      Name: "Drama",
      Description:
        "Breaking Bad is an American neo-Western crime drama television series created and produced by Vince Gilligan.",
    },
    Director: {
      Name: "Vince Gilligan",
      Bio: "George Vincent Gilligan Jr. is an American writer, producer, and director. He is known for his television work, specifically as creator, head writer, executive producer, and director of AMC's Breaking Bad and its spin-off Better Call Saul.",
      Birth: "February 10, 1967",
    },
  },
  {
    Title: "Queen of the South",
    Actors: "Alice Braga, Hemky Madera, Peter Gadiot",
    Genre: {
      Name: "Drama",
      Description:
        "Teresa flees to the United States after her drug-peddling boyfriend is murdered by a cartel boss. There, she sets out to become a drug lord and vows to avenge her lover's death.",
    },
    Director: {
      Name: "Ryan O'Nan",
      Bio: "Ryan O'Nan is an actor, writer, and director for Queen of the South, and co-produced the third season. He has played King George since Season 2.",
      Birth: "March 25, 1982",
    },
  },
  {
    Title: "Top Boy",
    Actors: "Ashley Walters, Micheal Ward, Little Simz",
    Genre: {
      Name: "Crime",
      Description:
        "Top Boy is a British television crime drama series. Created and written by Ronan Bennett, the series is set on the fictional Summerhouse estate in the London Borough of Hackney.",
    },
    Director: {
      Name: "Yann Demange",
      Bio: "Yann Demange is a French-Algerian film director. After directing the well-received television series Dead Set and Top Boy, he made his directorial film debut with the critically acclaimed independent film '71, for which he received the British Independent Film Award for Best Director.",
      Birth: "November 7, 1977",
    },
  },
];

//Get requests
app.get("/", (req, res) => {
  res.send("Welcome to the next level of watching movies!");
});

//CREATE Allow new users to register
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

//UPDATE Allow users to update their user info (username)

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

//CREATE Allow users to add a movie to their list of favorites

app.post("/users/:id/:moviesTitle", (req, res) => {
  const { id, moviesTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(moviesTitle);
    res.status(200).send("${moviesTitle} has been added to user ${id}'s array");
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE Allow users to remove a movie from their list of favorites

app.delete("/users/:id/:moviesTitle", (req, res) => {
  const { id, moviesTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== moviesTitle
    );
    res
      .status(200)
      .send("${moviesTitle} has been removed from user ${id}'s array");
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE Allow existing users to deregister

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(" user ${id} has been deleted");
  } else {
    res.status(400).send("no such user");
  }
});

//READ Return a list of ALL movies to the user
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//READ Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get("/movies/:Title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

//READ Return data about a genre
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const movie = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

//READ Return data about a director
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

//This code eliminates the need to manually write out individual routes for each static file inside the public folder.
app.use(express.static("public"));

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
