const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
}

function authenticate(email, password) {
  for (const userId in users) {
    if (users[userId].email === email && users[userId].password === password) {
      return users[userId];
    }
  }
  return undefined;
}

function find(id) {
  return users[id];
}

function checkEmail(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return false;
}

function addNewUser(userID, email, password) {
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
}

module.exports = {
  authenticate,
  find,
  checkEmail,
  addNewUser
};
