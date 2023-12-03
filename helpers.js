//helper function
const getUserByEmail = (emailToFind, usersDatabase) => {
  for (const userKey in usersDatabase) {
    //console.log("userKey:", userKey);
    const currentUser = usersDatabase[userKey];
    if (currentUser.email === emailToFind) {
      return currentUser;
    }
  }
  return null;
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

module.exports = { getUserByEmail, generateRandomString };
