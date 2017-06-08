//group gets/posts by function

"use strict";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "666": {
    id: "666",
    email: "el@diablo.hl",
    password: "your-soul"
  },
 "42": {
    id: "42",
    email: "answer@everthing.gal",
    password: "my-towel"
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

app.get('/', (req, res) => {
  res.redirect("/urls");
});

// renders urls_index page (displays all shortened URLS)

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
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
    username: req.cookies["username"],
    error: req.query.error
  }
  res.render("registration", templateVars);
});

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
    res.cookie('username', users[newUserID].email);
    res.redirect("/urls");
  } else {
    res.status(400).redirect('/register?error=400');
  }
});

app.get('/login', (req, res) => {
  var templateVars = {
    username: res.cookie('username', users[newUserID].email),
    error: req.query.error
  };
  res.render("login", templateVars);
  });


app.post("/login", (req, res) => {
  res.cookie('username', users[newUserID].email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//Renders urls_new for users to input a longURL to be shortened

app.get("/urls/new", (req, res) => {
  var templateVars = {
    username: res.cookie('username', users[newUserID].email),
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
    username: res.cookie('username', users[newUserID].email),
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
