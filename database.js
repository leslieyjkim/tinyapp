const objhash = require("object-hash");

const usersDatabase = {}; // {hashedEmail:{email:, password:hashedPassword}}
const urlDatabase = {}; // {hashedEmail:{<shortURL>:<longURL>}}}
// default user,password,urls for testing
const testUser = "test@test.com";
const testPassword = "test";
const testUserHashed = objhash(testUser);

const testUserInfo = {};
testUserInfo["email"]=testUser;
testUserInfo["password"]=objhash(testPassword);
usersDatabase[testUserHashed] = testUserInfo;

const testShortUrlLongUrl = {"_test_":"http://www.google.com", "nothing":"http://www.k4dgalkcadlaga.com"};
urlDatabase[testUserHashed] = testShortUrlLongUrl;
module.exports = {
  usersDatabase,
  urlDatabase,
};
