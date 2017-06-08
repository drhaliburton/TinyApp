//group gets/posts by function

"use strict";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userDatabase = require("./services/userDatabase");
//const { find, authenticate } - object destructuring

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user = userDatabase.find(req.cookies.userID);
  next();
});

app.set('view engine', 'ejs');


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

function urlsForUserID(currentID) {
  const userURLS = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID == currentID) {
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
};

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
  console.log(urlsForUserID(res.locals.user));
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


app.get('/register', (req, res) => {
  let templateVars = {
    error: req.query.error
  }
  res.render("registration", templateVars);
});

// Checks if entered email address has already been taken, and if not, if the

app.post("/register", (req, res) => {
  const emailInUse = userDatabase.checkEmail(req.body.email);
  if (emailInUse) {
    res.redirect('/register?error=400');
  } else {
    const newUserID = generateRandomString();
    const userEmail = req.body.email;
    const userPass = req.body.password;
    userDatabase.addNewUser(newUserID, userEmail, userPass);
    res.cookie('userID', newUserID);
    res.redirect("/urls");
  }
});

app.get('/login', (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("login", templateVars);
  });

//checks if email and password are in the users database before redirecting to logged in urls page

app.post('/login', (req, res) => {
  const user = userDatabase.authenticate(req.body.email, req.body.password);
  if (user) {
      res.cookie('userID', user.id);
      res.redirect("/");
    } else {
      res.status(403).redirect('/login?error=403');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect("/login");
});

//Creates a new shortened URL

app.post("/urls/:id", auth, (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    urlDatabase[res.params.id] = {
      longURL: req.body['longURL'],
      userID: res.locals.user
    };
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.redirect(`/urls/${req.params.id}?error=InvalidPath`);
  }
});

//Generates random ID and redirects to shortURL page

app.post("/urls", auth, (req, res) => {

  if (req.body['longURL'].includes('http://')) {
    console.log(urlDatabase);
    const newID = generateRandomString();
    urlDatabase[newID] = {
      longURL: req.body['longURL'],
      userID: res.locals.user
    };
    console.log(urlDatabase);
    res.redirect(`/urls/${newID}`);
  } else {
    res.redirect('/urls/new?error=InvalidPath');
  }
});

// Deletes a shortened URL

app.post("/urls/:id/delete", auth, (req, res) => {
  delete urlDatabase[user];
  res.redirect("/urls");
});

//reroutes shortened URL to original URL

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});
