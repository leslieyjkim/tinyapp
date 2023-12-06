const objhash = require("object-hash");
//helper function
const getUserByEmail = (emailToFind, usersDatabase) => {
  const hashedEmail = objhash(emailToFind);
  if (hashedEmail in usersDatabase) {
    return [usersDatabase[hashedEmail], hashedEmail]; //{email, password], hashedEmail
  } else {
    return [null, null];
  }
};

const generateRandomString = function () {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};
// const generateRandomString = Math.random().toString(36).substring(2, 8);

const urlsForUser = function (hashedemail, urlDatabase) {
  if (urlDatabase[hashedemail]) {
    return urlDatabase[hashedemail]; // {shortURL:longURL,...}
  } else {
    return null;
  }
};
module.exports = { getUserByEmail, generateRandomString, urlsForUser };
