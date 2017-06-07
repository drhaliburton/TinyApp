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

app.get("/", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    const newURL = generateRandomString();
    urlDatabase[newURL] = req.body['longURL'];
    res.redirect(`/urls/${newURL}`);
    } else {
    res.render("urls_newError");
  }
});


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.params.id],
    shortURL: req.params.id
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
