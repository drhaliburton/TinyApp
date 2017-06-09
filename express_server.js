//group gets/posts by function

"use strict";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const userDatabase = require("./services/userDatabase");
const bcrypt = require('bcrypt');

//Stretch: const { find, authenticate } - object destructuring

//Middleware

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['aslkdjfhaksjhfd918273981723']
}));

app.use((req, res, next) => {
  res.locals.user = userDatabase.find(req.session.userID);
  next();
});

app.set('view engine', 'ejs');

//Databases

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

//Functions

function urlsForUserID(currentID) {
  const userURLS = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === currentID) {
      userURLS.push({
        [key]: urlDatabase[key].longURL});
    }
  }
  return userURLS;
}


function generateRandomString() {
  var newID = "";
  var stringChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    newID += stringChars.charAt(Math.floor(Math.random() * stringChars.length));
  }
  return newID;
}

function auth(req, res, next) {
  if (res.locals.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get('/', (req, res) => {
  res.redirect("/urls");
});

//Renders urls_new for users to input a longURL to be shortened

app.get("/urls/new", auth, (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("urls_new", templateVars);
});

// renders urls_index page (displays all shortened URLS)

app.get("/urls", auth, (req, res) => {
  let templateVars = {
    urls: urlsForUserID(res.locals.user)
  };
  res.render("urls_index", templateVars);
});

//Displays shortURL page for users to view/edit new URL

app.get("/urls/:id", auth, (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params.id],
    shortURL: req.params.id,
    error: req.query.error
  };
  res.render("urls_show", templateVars);
});

//Renders registration page for users to create new account

app.get('/register', (req, res) => {
  let templateVars = {
    error: req.query.error
  };
  res.render("registration", templateVars);
});

// Checks if entered email address has already been taken, and if not, adds the new user to the users Database, sets cookie and logs them in.

app.post("/register", (req, res) => {
  const emailInUse = userDatabase.checkEmail(req.body.email);
  if (emailInUse) {
    res.redirect('/register?error=400');
  } else {
    const newUserID = generateRandomString();
    const userEmail = req.body.email;
    const userPass = bcrypt.hashSync(req.body.password, 10);
    userDatabase.addNewUser(newUserID, userEmail, userPass);
    // res.cookie('userID', newUserID);
    req.session.userID = newUserID;
    res.redirect("/urls");
  }
});

app.get('/login', (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("login", templateVars);
});

//checks if is a valid user, then checks if hashed passwords matched before logging in and setting cookie ID.

app.post('/login', (req, res) => {
  const userID = userDatabase.checkEmail(req.body.email);
  if (!userID) {
    res.redirect('/login?error=403');
  }
  const existingUserPass = userDatabase.find(userID).password;
  const matchedPass = bcrypt.compareSync(req.body.password, existingUserPass);
  const user = userDatabase.authenticate(req.body.email, existingUserPass);
  if (matchedPass) {
    req.session.userID = userID;
    res.redirect("/");
  } else {
    res.redirect('/login?error=403');
  }
});

app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect("/login");
});

//Creates a new shortened URL

app.post("/urls/:id", auth, (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    urlDatabase[req.params.id] = {
      longURL: req.body['longURL'],
      userID: res.locals.user
    };
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.redirect(`/urls/${req.params.id}?error=InvalidPath`);
  }
});

//Generates random ID for new shortURL and redirects to shortURL page

app.post("/urls", auth, (req, res) => {

  if (req.body['longURL'].includes('http://')) {
    const newID = generateRandomString();
    urlDatabase[newID] = {
      longURL: req.body['longURL'],
      userID: res.locals.user
    };
    res.redirect(`/urls/${newID}`);
  } else {
    res.redirect('/urls/new?error=InvalidPath');
  }
});

// Deletes a shortened URL

app.post("/urls/:id/delete", auth, (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//reroutes shortened URL to original URL

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});
