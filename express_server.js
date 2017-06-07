"use strict";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var newID = "";
    var stringChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < 6; i++)
        newID += stringChars.charAt(Math.floor(Math.random() * stringChars.length));
    return newID;
};

function displayError(message) {
  alert(message);
};


app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  var templateVars = {
    error: req.query.error
  };
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    const newID = generateRandomString();
    urlDatabase[newID] = req.body['longURL'];
    res.redirect(`/urls/${newID}`);
  } else {
    res.redirect('/urls/new?error=InvalidPath');
  }
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    if (req.body['longURL'].includes('http://')) {
    urlDatabase[req.params.id] = req.body['longURL'];
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.redirect(`/urls/${req.params.id}?error=InvalidPath`);
  }
});

app.get("/urls/:id", (req, res) => {
    let templateVars = {
    urls: urlDatabase[req.params.id],
    shortURL: req.params.id,
    error: req.query.error
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
