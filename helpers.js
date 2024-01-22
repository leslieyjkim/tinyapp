const objhash = require("object-hash");
//helper function
const getUserByEmail = (emailToFind, _usersDatabase) => {
  //emailToFind는 unhashedEmail이야. 
  const hashedEmail = objhash(emailToFind);
  if (hashedEmail in _usersDatabase) {
    return [_usersDatabase[hashedEmail], hashedEmail]; //[ {email:, hashedPassword}, hashedEmail ]
  } else {
    return [null, null];
  }
};

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

const getUserUrls = function (hashedemail, urlDatabase) {
  if (urlDatabase[hashedemail]) {
    return urlDatabase[hashedemail]; // {shortURL:longURL,...}
  } else {
    return null;
  }
};
module.exports = {
  getUserByEmail,
  generateRandomString,
  getUserUrls,
};