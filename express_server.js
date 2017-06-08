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
  res.locals.user = users[req.cookies.userID];
  next();
});

app.set('view engine', 'ejs');

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
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  var newID = "";
  var stringChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    newID += stringChars.charAt(Math.floor(Math.random() * stringChars.length));
  }
  return newID;
}

function authenticate(email, password) {
  for (const userId in users) {
    if (users[userId].email === email && users[userId].password === password) {
      return users[userId];
    }
  }
  return undefined;
}

app.get('/', (req, res) => {
  res.redirect("/urls");
});

//Renders urls_new for users to input a longURL to be shortened

app.get("/urls/new", (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("urls_new", templateVars);
});

// renders urls_index page (displays all shortened URLS)

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
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


app.get('/register', (req, res) => {
  let templateVars = {
    error: req.query.error
  }
  res.render("registration", templateVars);
});

// Checks if entered email address has already been taken, and if not, if the

app.post("/register", (req, res) => {
 const user = authenticate(req.body.email, req.body.password);
  if (!user) {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body['email'],
      password: req.body['password']
    };
    res.cookie('userID', newUserID);
    res.redirect("/urls");
  } else {
    res.status(400).redirect('/register?error=400');
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
  const user = authenticate(req.body.email, req.body.password);
  if (user) {
      res.cookie('userID', user.id);
      res.redirect("/");
    } else {
      res.status(403).redirect('/login?error=403');
  }
});

// app.post('/login', (req, res) => {
//   const user = userDatabase.authenticate(req.body.email, req.body.password);
//   if (user !== undefined) {
//       res.session.userID = user.id;
//       res.redirect("/");
//     } else {
//       res.status(403).redirect('/login?error=403');
//   }
// });

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect("/login");
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

// Deletes a shortened URL

app.post("/urls/:id/delete", (req, res) => {
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
