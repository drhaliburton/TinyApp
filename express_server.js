//group gets/posts by function

"use strict";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user = req.user = users[req.cookies.username];
  next();
});

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  var newID = "";
  var stringChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    newID += stringChars.charAt(Math.floor(Math.random() * stringChars.length));
  }
  return newID;
}

function validEmail(email) {
  for (var userID in users) {
    if (users[userID].email === email) {
      return users[userID].email;
    } else {
      return undefined;
    }
  }
}

function validPassword(password) {
  for (var userID in users) {
    if (users[userID].password === password) {
      return users[userID].password;
    } else {
      return undefined;
    }
  }
}

app.get('/', (req, res) => {
  res.redirect("/urls");
});

// renders urls_index page (displays all shortened URLS)

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//reroutes shortened URL to original URL

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  let templateVars = {
    error: req.query.error
  }
  res.render("registration", templateVars);
});

// Checks if entered email address has already been taken, and if not, if the

app.post("/register", (req, res) => {
  if (validEmail(req.body['email'])) {
    res.status(400).redirect('/register?error=400');
  }
  if (req.body['email'] && req.body['password']) {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body['email'],
      password: req.body['password']
    };
    console.log(users);
    const parsedID = cookieParser.JSONCookies(users[newUserID]);
    res.cookie('username', parsedID.id);
    res.redirect("/urls");
  } else {
    res.status(400).redirect('/register?error=400');
  }
});

//checks if username and password are in the users database before redirecting to logged in urls page

app.post('/login', (req, res) => {
  for (var keys in users) {
    if (validEmail(req.body['email']) && validPassword(req.body['password'])) {
      const parsedID = cookieParser.JSONCookies(key);
      res.cookie('username', parsedID.id);
    } else {
      res.status(400).redirect('/login?error=400');
    }
  }
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("login", templateVars);
  });

app.post("/logout", (req, res) => {
  res.clearCookie('username', user[req.cookies.username]);
  res.redirect("/urls");
});

//Renders urls_new for users to input a longURL to be shortened

app.get("/urls/new", (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("urls_new", templateVars);
});

//Creates a new shortened URL

app.post("/urls/:id", (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    urlDatabase[req.params.id] = req.body['longURL'];
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.redirect(`/urls/${req.params.id}?error=InvalidPath`);
  }
});

//Generates random ID and redirects to shortURL page

app.post("/urls", (req, res) => {
  // use regEx
  if (req.body['longURL'].includes('http://')) {
    const newID = generateRandomString();
    urlDatabase[newID] = req.body['longURL'];
    res.redirect(`/urls/${newID}`);
  } else {
    res.redirect('/urls/new?error=InvalidPath');
  }
});

//Displays shortURL page for users to view/edit new URL

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.params.id],
    shortURL: req.params.id,
    error: req.query.error
  };
  res.render("urls_show", templateVars);
});

// Deletes a shortened URL

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});
