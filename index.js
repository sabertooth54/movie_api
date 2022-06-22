const mongoose = require("mongoose");
Models = require("./models.js");

Movies = Models.Movie;
Users = Models.User;

mongoose.connect("mongodb://localhost:27017/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Morgan’s “common” format, which logs basic data such as IP address
app.use(morgan("common"));

//Get requests
app.get("/", (req, res) => {
  res.send("Welcome to the next level of watching movies!");
});

//CREATE Add a user

app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//READ Get all users

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch(() => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ Get all Movies

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((Movie) => {
        res.status(201).json(Movie);
      })
      .catch(() => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ Get a user by username

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//UPDATE Update User credentials

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//UPDATE Update a user's movie list of fav's

app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//DELETE Delete a user by Username

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//This code eliminates the need to manually write out individual routes for each static file inside the public folder.
app.use(express.static("public"));

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
