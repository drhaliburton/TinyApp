
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


console.log(urlsForUserID("userRandomID"));
