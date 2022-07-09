const mongoose = require("mongoose");
Models = require("./models.js");

Movies = Models.Movie;
Users = Models.User;
/*
mongoose.connect("mongodb://localhost:27017/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
*/

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require("express"),
  morgan = require("morgan");
uuid = require("uuid");

const app = express();
const bodyParser = require("body-parser"),
  methodOverride = require("method-override");

const cors = require("cors");
app.use(cors());

const { check, validationResult } = require("express-validator");

//Error handling code using express.
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

//CREATE Add a user.

app.post(
  "/users",
  // Validation logic
  //.not().isEmpty = "is not empty"
  //.isLegnth({min:5}) = minimum of 5 characters is allowed
  [check("Username", "Username is required").isLegnth({ min: 5 }), check("")],

  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with th requuested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
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
  }
);

// this code checks the validation object for errors. For the above code CREATE Add a user
let errors = validationResult(req);

if (!errors.isEmpty()) {
  return res.status(422).json({ errors: errors.array() });
}

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
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
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
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
